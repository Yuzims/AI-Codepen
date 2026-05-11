# 代码补全架构重构方案

## 1. 当前痛点分析

你现有的补全系统主要依赖 [`autocompleteService.ts`](../FeiShu-Codepen-Frontend/src/services/autocompleteService.ts) 中的**硬编码字典**：

- HTML 标签/属性：手动维护 `htmlTags[]`、`commonAttributes[]`
- CSS 属性/值：手动维护 `cssProperties[]`、`propertyValues{}`
- JS/React/Vue/TS：手动维护 `jsSnippets[]`、`reactSnippets[]` 等

**问题**：
1. **扩展成本高**：新增 Angular/Svelte/SolidJS 需要重新手写一套 snippet 字典
2. **维护滞后**：语言标准更新（如 CSS 新属性、React 新 API）需要人工同步
3. **数据不完整**：手写字典只能覆盖常见 API，无法覆盖整个标准库或第三方库
4. **无语义补全**：当前 AST 分析是轻量级正则，无法提供真正的类型推断和跨文件补全

---

## 2. 目标架构：三层模型

采用 **"标准化语言数据层 + 统一适配层 + 动态加载层"** 的分层设计：

```mermaid
flowchart TD
    subgraph Layer1["Layer 1: 标准化语言数据层"]
        A1[CodeMirror 官方 language packages<br/>@codemirror/lang-*]
        A2[VS Code Snippet 仓库<br/>e.g. vscode-snippet]
        A3[TypeScript Language Server<br/>tsserver / @volar/*]
        A4[MDN Data / CanIUse Data<br/>@mdn/browser-compat-data]
    end

    subgraph Layer2["Layer 2: 统一适配层"]
        B1[CompletionProviderRegistry<br/>语言注册中心]
        B2[SnippetLoader<br/>JSON Snippet 加载器]
        B3[LSPAdapter<br/>LSP 消息适配器]
    end

    subgraph Layer3["Layer 3: CodeMirror 编辑器"]
        C1[EditorView]
        C2[动态组合 CompletionSource]
    end

    Layer1 -->|官方 CompletionSource| B1
    Layer1 -->|JSON 格式 Snippet| B2
    Layer1 -->|LSP 协议消息| B3
    B1 & B2 & B3 -->|返回统一的 CompletionSource[]| C2
    C2 --> C1
```

---

## 3. 具体技术选型与实现策略

### 3.1 HTML / CSS：用官方语言包 + MDN Data 替代手写字典

**现状**：你已经在用 `@codemirror/lang-html` 和 `@codemirror/lang-css`，但只是作为语法高亮，没有充分发挥它们内置的补全能力。

**改进**：
- CodeMirror 6 的 `@codemirror/lang-html` 和 `@codemirror/lang-css` **本身就带有基于标准规范的 completion source**。你应该优先使用它们，而不是自己重写一套标签/属性字典。
- 如果需要更丰富的 CSS 属性文档（如兼容性提示），可以引入 [`@mdn/browser-compat-data`](https://www.npmjs.com/package/@mdn/browser-compat-data) 动态生成 completion items。

**优势**：
- 不需要手动维护 HTML5 标签列表
- CSS 新属性自动随 `@codemirror/lang-css` 版本更新
- 可以直接获得浏览器兼容性提示

### 3.2 JavaScript / TypeScript：引入 TypeScript Language Service

**现状**：[`astCompletionService.ts`](../FeiShu-Codepen-Frontend/src/services/astCompletionService.ts) 使用正则提取变量，只能提供非常基础的属性补全。

**推荐方案 A（轻量级）**：使用 CodeMirror 官方 `@codemirror/lang-javascript` 的 `localCompletionSource` + `snippets`
- 它已经内置了 JS 关键字、全局对象、标准库方法的补全
- 不需要手写 `keywordCompletions[]`

**推荐方案 B（重量级，效果接近 VS Code）**：集成 TypeScript Language Server
- 使用 [`typescript`](https://www.npmjs.com/package/typescript) 的 `createLanguageService` 在内存中运行
- 或使用社区方案 [`@codemirror/lang-javascript`](https://codemirror.net/try/?example=Lang%20:%20TypeScript) 的 TypeScript 支持，它底层已经调用了 TS Compiler API

**对于 React / Vue / Angular**：
- 如果你有 TS Language Service，只要安装了对应的 `.d.ts` 类型定义文件（如 `@types/react`、`vue`、`@angular/core`），**补全会自动出现**，完全不需要手动维护 `reactSnippets[]`。
- Snippet（如 `useState` 的代码模板）可以单独保留，但从 VS Code snippet 仓库动态加载 JSON，而不是硬编码在 TS 文件中。

### 3.3 Snippet 管理：从 VS Code Snippet 生态加载

VS Code 社区维护了大量框架 snippet，格式是标准 JSON。

**推荐方式**：
1. 在构建时或运行时，将 VS Code snippet JSON 转换为你自己的 `SnippetDefinition[]`
2. 通过 `snippetCompletion()` 批量注册到 CodeMirror

**示例数据源**：
- [johnpapa/vscode-angular-snippets](https://github.com/johnpapa/vscode-angular-snippets)
- [dsznajder/vscode-es7-javascript-react-snippets](https://github.com/dsznajder/vscode-es7-javascript-react-snippets)
- [sdras/vue-vscode-snippets](https://github.com/sdras/vue-vscode-snippets)

**新增 Angular 时的工作量**：
> 只需新增一个 JSON 文件（或安装一个 npm 包），在配置里注册 `"angular": "@your-org/angular-snippets.json"`，无需改一行代码。

### 3.4 统一适配层设计

建议新建一个 `completionProvider.ts`，取代 `Editor.tsx` 中硬编码的 switch-case：

```typescript
// 伪代码
export class CompletionProvider {
  getSources(languageId: string): CompletionSource[] {
    const base = this.getBaseLanguageCompletion(languageId); // CodeMirror 官方
    const snippets = this.snippetLoader.load(languageId);    // 动态 JSON
    const lsp = this.lspAdapter.getSource(languageId);       // TS/JS 语义补全
    return [lsp, ...base, ...snippets].filter(Boolean);
  }
}
```

这样 `Editor.tsx` 里只需要一行：
```typescript
const jsAutocompleteExt = autocompletion({
  override: completionProvider.getSources(jsLanguage)
});
```

---

## 4. 迁移路径建议

### Phase 1: 替换 HTML/CSS 硬编码字典（低风险，立竿见影）
- **操作**：删除 `autocompleteService.ts` 中手写的 `htmlTags[]` 和 `cssProperties[]`，改用 `@codemirror/lang-html` / `@codemirror/lang-css` 自带的 completion source
- **保留**：你自定义的 snippet（如 `html5` 文档模板、`table` 结构片段），这些很有价值
- **收益**：HTML/CSS 补全数据自动随依赖更新

### Phase 2: 引入 TypeScript Language Service（高收益）
- **操作**：在 Web Worker 中运行 TS Language Service，通过 LSP 消息与 CodeMirror 通信
- **库选型**：
  - 轻量：[`@volar/cdn`](https://www.npmjs.com/package/@volar/cdn) + `@volar/monaco`（如果将来切 Monaco）
  - 纯 CodeMirror：[`@codemirror/lang-javascript`](https://codemirror.net/docs/ref/#lang-javascript) 的 TypeScript 模式已经提供了相当不错的类型补全
- **收益**：React/Vue/Angular 的类型定义补全全自动，无需手写框架 API

### Phase 3: Snippet 外部化（长期维护）
- **操作**：将 `jsSnippets[]`、`reactSnippets[]` 等提取为独立的 JSON 文件
- **结构示例**：
  ```json
  {
    "useState": {
      "prefix": "useState",
      "body": "const [$1, set$1] = useState($2);",
      "description": "React useState hook"
    }
  }
  ```
- **收益**：新增语言时，文案/产品同学可以直接维护 JSON，不需要动前端代码

---

## 5. 关键代码改造示意

### 5.1 替换 HTML 补全源

```typescript
// 之前：override: [htmlTagCompletionSource, htmlCompletionSource]
// 之后：优先使用 CodeMirror 原生，只保留自定义 snippet
export const htmlAutocomplete = autocompletion({
  override: [
    htmlCompletionSource, // 这是 @codemirror/lang-html 自带的，覆盖所有标准标签和属性
    htmlCustomSnippetSource // 只保留你项目特有的 snippet（如 html5 模板）
  ],
  defaultKeymap: true,
  activateOnTyping: true
});
```

### 5.2 动态 Snippet 加载器

```typescript
// services/snippetLoader.ts
import { snippetCompletion } from '@codemirror/autocomplete';

export async function loadSnippets(languageId: string) {
  const module = await import(`../snippets/${languageId}.json`);
  const snippets = module.default || module;

  return Object.entries(snippets).map(([name, data]: [string, any]) =>
    snippetCompletion(data.body, {
      label: data.prefix,
      detail: data.description,
      type: 'snippet'
    })
  );
}
```

### 5.3 统一 Provider 入口

```typescript
// services/completionProvider.ts
import { htmlCompletionSource } from '@codemirror/lang-html';
import { cssCompletionSource } from '@codemirror/lang-css';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { CompletionSource } from '@codemirror/autocomplete';
import { loadSnippets } from './snippetLoader';

const BASE_SOURCES: Record<string, CompletionSource[]> = {
  html: [htmlCompletionSource],
  css: [cssCompletionSource],
  js: [javascriptLanguage.data.of({ autocomplete: javascriptLanguage.data.autocomplete })],
  // ...
};

export async function getCompletionSources(languageId: string): Promise<CompletionSource[]> {
  const base = BASE_SOURCES[languageId] || [];
  const snippets = await loadSnippets(languageId).catch(() => []);
  return [...base, ...snippets];
}
```

---

## 6. 风险与注意事项

| 风险 | 说明 | 缓解措施 |
|---|---|---|
| **包体积增加** | 引入 TS Language Service 或大量 d.ts 文件会增加 bundle 体积 | 将 TS Server 放在 Web Worker 中，按需加载；d.ts 文件走 CDN |
| **性能问题** | AST/LSP 解析在大文件下可能卡顿 | Web Worker 隔离计算；增加补全缓存和 debounce |
| **离线场景** | 如果 d.ts 走 CDN，断网时语义补全会失效 | 预缓存核心类型的 d.ts（如 `@types/react`）；降级到本地 snippet |
| **CodeMirror 版本兼容性** | `@codemirror/lang-*` 不同版本 API 可能有差异 | 统一升级 CodeMirror 到 v6 最新稳定版 |

---

## 7. 总结

你当前项目的补全系统功能已经比较丰富，但**数据层和适配层耦合过深**。推荐的演进方向是：

1. **HTML/CSS**：彻底放弃手写字典，全面使用 `@codemirror/lang-html` / `@codemirror/lang-css` 的原生补全 + MDN Data
2. **JS/TS/框架**：引入 TypeScript Language Service，让 React/Vue/Angular 的补全从类型定义自动生成
3. **Snippet**：外部化为 JSON，支持动态加载和扩展
4. **架构**：建立统一的 `CompletionProvider`，新增语言时只需改配置，不需要改核心代码

这样做之后，新增 Angular 支持的工作量将从**"手写数百条 API 提示词"**降低为**"安装一个 npm 类型包 + 配置一个 JSON snippet 文件"**。

## 7. 任务排期
阶段核心任务预计耗时交付产物
Phase 1：基建与低垂果实搭建统一适配层 CompletionProvider；接入官方 @codemirror/lang-html/css；清理废弃的 HTML/CSS 硬编码字典。
成果：HTML/CSS 补全不再依赖手动维护；编辑器初始化逻辑完成解耦。
Phase 2：Snippet 配置化实现 SnippetLoader 动态加载机制；引入/转换 VS Code 格式的 Snippet JSON；迁移现有的 React/Vue 等框架模板。
成果：新增框架语言时只需配置 JSON 文件，前端无需发版；大幅缩减 JS bundle 体积。
Phase 3：语义分析与 LSP配置 Web Worker 运行环境；基于官方 @codemirror/lsp-client，通过 WebSocket 与后端 Node.js 进行全双工通信。在前端，需要实现一个符合 @codemirror/lsp-client 要求的 Transport 接口。后端 (Node.js)：接收前端的 JSON-RPC 消息。利用 child_process.spawn 启动语言服务器进程（例如 pyright、typescript-language-server、clangd 等）。负责将前端的消息转发给 LSP 进程，并将 LSP 进程的响应回传给前端。
引入 TS Language Server 或核心编译器 API；实现基础的 JS/TS 智能提示与语法检查。
成果：真正具备上下文感知的 JS/TS 代码补全；抛弃旧版低效的正则 AST 补全。
Phase 4：类型补全与调优实现自动类型获取（ATA，动态拉取 d.ts）；处理断网降级逻辑与补全缓存（Debounce）；全链路性能压测与内存泄漏排查。
成果：React/Vue 等第三方库的 API 参数完美提示；大文件补全输入不卡顿。