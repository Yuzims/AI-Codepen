# Task 0: 错误 UI 改造 （已完成）

步骤	内容	状态
Step 1	防抖延迟 100ms → 500ms	✅
Step 2	移除旧的 ErrorMessageWidget（block decoration），改为 ErrorGutterMarker（行号左侧红点/黄三角）+ hoverTooltip（悬停显示错误信息）	✅
Step 3	新增 errorInfoField（存储错误列表）、errorDecorationField（波浪线 mark decoration）、errorGutterExtension、errorTooltipExtension	✅
Step 4	新建 ErrorStatusBar.tsx（底部状态栏，显示错误/警告计数，点击跳转到下一个错误）	✅
Step 5	新建 errorFormatter.ts（去除 SyntaxError 前缀、截断超长消息）	✅
Step 6	Editor.tsx 接入 ErrorStatusBar，移除重复的 runtimeErrorExtension，JS 编辑器只用 jsLint（已内含所有扩展）	✅
CSS	index.css 添加 .cm-error-underline / .cm-warning-underline 波浪线样式	✅

# Task 1: AI 集成开发文档

> 独立开发，不依赖 Task 2/3。与 Task 2/3 的整合点见文末。

---

## 目标

按顺序实现三个 AI 功能：
1. **方案三：AI 代码生成**（从自然语言生成完整 Pen）
2. **方案一：AI 对话助手**（在编辑器内对话修改代码）
3. **方案二：AI 错误修复**（在实现前先改造错误检测 UI）

---

## 阶段 0：错误检测 UI 改造（方案二的前置工作）

### 现状问题

- `lintService.ts` 的 `ErrorMessageWidget` 以 block decoration 插入行末，用户每次输入都触发（防抖仅 100ms），体验差
- 错误信息直接展示原始 Babel/DOMParser 报错，不够直观
- 没有错误数量汇总，没有跳转导航

### 目标效果（对标 VSCode）

- **Gutter 图标**：行号左侧显示红色 ● / 黄色 ▲，hover 显示 tooltip
- **波浪线下划线**：错误代码段显示红色波浪线（warning 显示黄色）
- **底部状态栏**：显示 `✗ 2  ⚠ 1` 错误计数，点击跳转到下一个错误
- **防抖延迟**：从 100ms 提升到 500ms，避免连续输入时频繁弹出
- **错误信息格式化**：清理 Babel 错误中的冗余前缀，只保留核心描述

### 实现步骤

#### Step 1：修改防抖延迟

文件：`src/services/lintService.ts`，约第 968 行

```typescript
// 改造前
const debouncedLinter = debounce((view: EditorView) => { ... }, 100);

// 改造后
const debouncedLinter = debounce((view: EditorView) => { ... }, 500);
```

#### Step 2：改造 ErrorMessageWidget 为 tooltip 模式

文件：`src/services/lintService.ts`，第 20-92 行

将 block decoration（行末插入 DOM）改为 CodeMirror 原生 `hoverTooltip`：

```typescript
import { hoverTooltip } from '@codemirror/view';

// 新增：hover tooltip 扩展
export const errorTooltipExtension = hoverTooltip((view, pos) => {
  // 查找 pos 位置是否有错误 decoration
  // 有则返回 tooltip DOM，无则返回 null
});
```

保留 gutter marker（行号区域的红点），移除行末 block widget。

#### Step 3：添加波浪线下划线

使用 CodeMirror `Decoration.mark` 替代 `Decoration.widget`：

```typescript
// 对错误所在行的 token 范围添加 mark decoration
Decoration.mark({
  class: 'cm-error-underline',  // CSS: text-decoration: wavy underline red
  inclusive: false
})
```

CSS（添加到全局样式）：
```css
.cm-error-underline { text-decoration: underline wavy red; }
.cm-warning-underline { text-decoration: underline wavy #f0a500; }
```

#### Step 4：底部错误状态栏组件

新建 `src/components/ErrorStatusBar.tsx`：

```typescript
interface ErrorStatusBarProps {
  errorCount: number;
  warningCount: number;
  onNavigateNext: () => void;
}
```

在 `Editor.tsx` 底部渲染，读取 `errorDecorationField` 的 size 计算数量。

#### Step 5：错误信息格式化

新建 `src/services/errorFormatter.ts`：

```typescript
export function formatErrorMessage(raw: string, source: 'babel' | 'ts' | 'css' | 'html'): string {
  // Babel: 去掉 "unknown: " 前缀，去掉行列信息（已有行内定位）
  // TS: 去掉 "error TS1234: " 前缀
  // 截断超过 120 字符的消息
}
```

---

## 阶段 1：AI 代码生成（方案三）

### 后端改动

新增文件：`FeiShu-Codepen-Backend/src/routes/ai.js`

```javascript
const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic(); // 读取 ANTHROPIC_API_KEY 环境变量

// POST /api/ai/generate
router.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  // 设置 SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: GENERATE_SYSTEM_PROMPT,  // 见下方
    messages: [{ role: 'user', content: prompt }],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      res.write(`data: ${JSON.stringify({ delta: chunk.delta.text })}\n\n`);
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();
});
```

System Prompt（使用 prompt cache 减少 token 消耗）：

```javascript
const GENERATE_SYSTEM_PROMPT = `你是一个前端代码生成助手。根据用户描述，生成可运行的 HTML/CSS/JS 代码。

严格按照以下 JSON 格式返回，不要有任何其他文字：
{
  "title": "Pen 标题（简短）",
  "html": "HTML 代码",
  "css": "CSS 代码",
  "js": "JS 代码"
}

要求：
- HTML 只写 body 内的内容，不需要 <!DOCTYPE> 和 <html> 标签
- CSS 直接写样式规则
- JS 直接写逻辑代码
- 代码要完整可运行`;
```

在 `src/index.js` 注册路由：
```javascript
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);
```

安装依赖：
```bash
npm install @anthropic-ai/sdk
```

### 前端改动

#### 新建 `src/services/aiService.ts`

```typescript
export interface GenerateResult {
  title: string;
  html: string;
  css: string;
  js: string;
}

export async function generateCode(
  prompt: string,
  onChunk: (text: string) => void
): Promise<GenerateResult> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ prompt }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // 解析 SSE，调用 onChunk
  }

  return JSON.parse(buffer); // 最终解析完整 JSON
}
```

#### 修改 `src/pages/PensPage.tsx`

在"新建 Pen"按钮旁边加"AI 生成"按钮，点击弹出 `AIGenerateModal`。

新建 `src/components/AIGenerateModal.tsx`：
- 输入框：描述想要的效果
- 实时展示流式返回的代码预览
- 确认后调用 `penService.createPen()` 并跳转编辑器

---

## 阶段 2：AI 对话助手（方案一）

### 后端改动

新增接口 `POST /api/ai/chat`：

```javascript
router.post('/chat', authMiddleware, async (req, res) => {
  const { message, context } = req.body;
  // context = { html, css, js, jsLanguage }

  // SSE 流式返回
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: CHAT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `当前代码：\n\`\`\`html\n${context.html}\n\`\`\`\n\`\`\`css\n${context.css}\n\`\`\`\n\`\`\`js\n${context.js}\n\`\`\`\n\n用户请求：${message}`
      }
    ]
  });
  // ... 流式返回
});
```

### 前端改动

新建 `src/components/AIChatPanel.tsx`：
- 右侧抽屉面板，宽 320px
- 对话历史列表
- 底部输入框 + 发送按钮
- AI 返回代码时，展示 diff 预览，用户点"应用"后更新编辑器

在 `Editor.tsx` 中：
- 顶部工具栏加"AI 助手"按钮，控制面板显隐
- 将 `htmlCode/cssCode/jsCode` 作为 context 传给 `AIChatPanel`
- `AIChatPanel` 通过回调 `onApplyCode({ html, css, js })` 更新编辑器状态

---

## 阶段 3：AI 错误修复（方案二）

依赖阶段 0 的错误 UI 改造完成。

### 后端改动

新增接口 `POST /api/ai/fix`：

```javascript
router.post('/fix', authMiddleware, async (req, res) => {
  const { error, code, language } = req.body;
  // 返回修复后的代码（非流式，错误修复通常较短）
});
```

### 前端改动

在 `lintService.ts` 的 gutter marker hover tooltip 中加"AI 修复"按钮：

```typescript
// tooltip DOM 中添加按钮
const fixBtn = document.createElement('button');
fixBtn.textContent = 'AI Fix';
fixBtn.onclick = () => triggerAIFix(error, view);
```

`triggerAIFix` 调用 `/api/ai/fix`，返回修复代码后展示 diff，用户确认后应用。

---

## 与 Task 2/3 的整合点

| 整合项 | 时机 | 说明 |
|--------|------|------|
| SSE 性能指标 | 阶段 1 完成后 | Task 2 的 `perfSDK` 需要在 `aiService.ts` 的 SSE 读取循环中打点 |
| AI 生成耗时上报 | 阶段 1 完成后 | 将 `sse_ttfb_ms`、`sse_total_ms` 上报到 Task 3 的后端接口 |
| 错误修复按钮样式 | 阶段 0 完成后 | Task 2 的 perfSDK 可以监控 AI Fix 的响应延迟 |

---

## 文件变更清单

### 新增文件
- `FeiShu-Codepen-Backend/src/routes/ai.js`
- `FeiShu-Codepen-Frontend/src/services/aiService.ts`
- `FeiShu-Codepen-Frontend/src/services/errorFormatter.ts`
- `FeiShu-Codepen-Frontend/src/components/AIGenerateModal.tsx`
- `FeiShu-Codepen-Frontend/src/components/AIChatPanel.tsx`
- `FeiShu-Codepen-Frontend/src/components/ErrorStatusBar.tsx`

### 修改文件
- `FeiShu-Codepen-Backend/src/index.js`（注册 ai 路由）
- `FeiShu-Codepen-Backend/package.json`（添加 @anthropic-ai/sdk）
- `FeiShu-Codepen-Frontend/src/services/lintService.ts`（防抖延迟、widget 改造）
- `FeiShu-Codepen-Frontend/src/components/Editor.tsx`（接入 AIChatPanel、ErrorStatusBar）
- `FeiShu-Codepen-Frontend/src/pages/PensPage.tsx`（添加 AI 生成入口）
