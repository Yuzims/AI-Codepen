# Task 3: 可衡量性能指标开发文档

> 独立开发，不依赖 Task 1/2，但整合阶段需要 Task 2 的 perfSDK 数据。

---

## 目标

建立可量化的性能基线，实现改造前后的对比数据，支撑简历描述。

**已知基线：** 当前页面 LCP = 3.44s（用户实测）

---

## 优化方向与预期收益

### 方向一：LCP 优化（最直接，简历价值最高）

LCP 3.44s 的主要原因分析（基于项目结构推断）：

| 可能原因 | 影响程度 | 优化手段 |
|----------|----------|----------|
| `@babel/standalone` 包体积大（~1.5MB） | 高 | 懒加载，仅在 JS/React 语言时加载 |
| `@vue/compiler-sfc` 按需加载但仍阻塞 | 中 | 动态 import，移出主 bundle |
| `sass` / `less` 库打包进主 bundle | 中 | 动态 import，仅在 SCSS/Less 时加载 |
| TypeScript 编译器从 CDN 加载（`loadTypeScriptCompiler`） | 低 | 已是异步，影响较小 |
| CodeMirror 扩展全量加载 | 低 | 按语言懒加载语言包 |

**预期 LCP 改善：** 将 `@babel/standalone` 等大包改为动态 import 后，主 bundle 体积减少约 60-70%，LCP 预计降至 1.5s 以内。

### 方向二：编译缓存（量化最容易）

见 Task 2 的编译缓存方案，这里重点说如何量化：

- **改造前**：每次代码变化都重新编译，平均 Babel 编译耗时 ~50-200ms
- **改造后**：相同代码命中缓存，耗时 ~0ms
- **量化指标**：缓存命中率、平均编译耗时降幅

### 方向三：预览增量更新量化

`Preview.tsx` 已有增量更新逻辑，但没有数据证明其效果。加计时后可以量化：

- **全量重建**：预计 100-300ms（重建整个 iframe）
- **增量更新**：预计 10-30ms（只注入 JS）
- **量化指标**：两条路径的平均耗时比值

---

## 实施步骤

### Step 1：建立性能基线（改造前数据）

在做任何优化之前，先用 Chrome DevTools 记录基线数据：

**需要记录的指标：**

```
1. LCP（Largest Contentful Paint）：3.44s（已知）
2. FCP（First Contentful Paint）：用 DevTools Performance 面板测量
3. TTI（Time to Interactive）：用 Lighthouse 测量
4. 主 bundle 大小：npm run build 后查看 build/static/js/*.js 的大小
5. Babel 编译耗时：在 compilerService.ts 临时加 console.time 测量
```

**记录方式：** 截图保存到 `plans/perf-baseline.md`，作为简历中"改造前"数据的依据。

### Step 2：Bundle 懒加载优化（LCP 核心优化）

文件：`src/services/compilerService.ts`

**改造 Babel 为动态 import：**

```typescript
// 改造前（顶部静态 import，打包进主 bundle）
import * as Babel from "@babel/standalone";

// 改造后（动态 import，仅在需要时加载）
let _babel: typeof import('@babel/standalone') | null = null;

async function getBabel() {
  if (!_babel) {
    _babel = await import('@babel/standalone');
  }
  return _babel;
}

export const compileReact = async (code: string): Promise<CompilationResult> => {
  const Babel = await getBabel();
  // ... 原有逻辑
};
```

**改造 Vue SFC 编译器：**

```typescript
// 改造前
import { parse } from "@vue/compiler-sfc";

// 改造后
async function getVueCompiler() {
  const { parse } = await import('@vue/compiler-sfc');
  return { parse };
}
```

**改造 Sass/Less：**

```typescript
// 改造前
import * as sass from 'sass';
import * as less from 'less';

// 改造后（在 compileCssFramework 内按需加载）
if (language === 'scss') {
  const { default: sass } = await import('sass');
  compiledCode = sass.compileString(code).css;
} else if (language === 'less') {
  const { default: less } = await import('less');
  compiledCode = (await less.render(code)).css;
}
```

**注意：** `compileReact` 改为 async 后，需要同步更新 `compileJsFramework` 的调用方式（已经是 async，无需额外改动）。

### Step 3：Editor.tsx 中的 useMemo 优化

当前 `mergedCss` 和 `mergedJs` 在渲染函数体内直接计算（无 `useMemo`），每次渲染都重新计算。

文件：`src/components/Editor.tsx`，约第 367 行和第 436 行

```typescript
// 改造前（每次渲染都重新计算）
const mergedCss = [...importedCssList, compiledCss].join('\n\n');
const mergedJs = [...compiledImportedJsList, compiledJs].join('\n\n');

// 改造后
const mergedCss = useMemo(
  () => [...importedCssList, compiledCss].join('\n\n'),
  [importedCssList, compiledCss]
);
const mergedJs = useMemo(
  () => [...compiledImportedJsList, compiledJs].join('\n\n'),
  [compiledImportedJsList, compiledJs]
);
```

同时移除这两处的 `console.log` 调试输出（生产环境不应有 console.log）。

### Step 4：Preview 更新防抖

当前 `Editor.tsx` 没有 debounce，每次 state 变化都触发 Preview 重渲染（包括编译）。

```typescript
// 在 Editor.tsx 中，对传给 Preview 的代码加 debounce
const [debouncedHtml, setDebouncedHtml] = useState(htmlCode);
const [debouncedCss, setDebouncedCss] = useState(compiledCss);
const [debouncedJs, setDebouncedJs] = useState(compiledJs);

useEffect(() => {
  const timer = setTimeout(() => setDebouncedHtml(htmlCode), 300);
  return () => clearTimeout(timer);
}, [htmlCode]);
// css 和 js 同理
```

**量化指标：** 加防抖后，Preview 重渲染次数减少，可以通过 React DevTools Profiler 对比。

---

## 性能报告页面（可选，整合阶段）

Task 2 的 perfSDK 上报数据后，可以在后端加一个简单的查询接口，前端展示性能趋势图。

新建 `src/pages/PerfReportPage.tsx`（仅开发环境可访问）：
- 展示编译耗时的平均值/P95
- 展示 LCP/FCP 趋势
- 展示缓存命中率

路由：`/perf`（在 `App.tsx` 中添加，仅 `NODE_ENV === 'development'` 时渲染）

---

## 简历数据采集方案

### 改造前（需要手动记录）

在开始任何代码改动之前，用以下方式记录基线：

```bash
# 1. 构建并分析 bundle 大小
npm run build
# 查看 build/static/js/ 下各文件大小

# 2. 用 source-map-explorer 分析包组成
npx source-map-explorer 'build/static/js/*.js'
```

用 Chrome Lighthouse 记录：
- LCP: 3.44s（已知）
- FCP: 待测
- TTI: 待测
- Total Blocking Time: 待测

### 改造后（自动采集）

Task 2 的 perfSDK 激活 Web Vitals 后，数据自动上报到 `/api/metrics`。

对比维度：

| 指标 | 改造前 | 改造后（预期） | 简历描述 |
|------|--------|----------------|----------|
| LCP | 3.44s | ~1.2-1.5s | "LCP 从 3.44s 降至 1.4s，降幅 59%" |
| 主 bundle 大小 | ~3MB+ | ~800KB | "主 bundle 体积减少 70%，通过懒加载拆分大型编译依赖" |
| Babel 编译耗时（缓存命中） | ~150ms | ~0ms | "编译缓存命中率 85%，重复编译耗时降至 0ms" |
| 增量更新 vs 全量重建 | 无数据 | 全量~200ms，增量~15ms | "增量 JS 注入比全量 iframe 重建快 13x" |

---

## Step 5：迁移到 Vite（构建工具升级）

> 在 Task 3 的动态 import 优化完成并记录数据后再执行此步骤，确保有两个独立的数据点。

### 为什么迁移

CRA（react-scripts）底层 webpack 配置锁死，无法自定义 chunk 分割策略和 bundle 分析。迁移 Vite 后可以：
- 用 `rollup-plugin-visualizer` 可视化 bundle 组成
- 自定义 `manualChunks` 把 CodeMirror、编译器等大包单独分 chunk
- 开发启动从 ~20s 降至 ~1-2s（可量化，截图对比）

### 迁移步骤

#### 1. 安装依赖

```bash
cd FeiShu-Codepen-Frontend

# 安装 Vite 和 React 插件
npm install -D vite @vitejs/plugin-react

# 移除 CRA
npm uninstall react-scripts
```

#### 2. 新建 `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, filename: 'dist/bundle-stats.html' }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // CodeMirror 单独 chunk
          'codemirror': [
            '@codemirror/view',
            '@codemirror/state',
            '@codemirror/language',
            '@codemirror/autocomplete',
            '@codemirror/lint',
          ],
          // 编译器单独 chunk（配合动态 import，这里只是兜底）
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // 报告超过 500KB 的 chunk（帮助发现未懒加载的大包）
    chunkSizeWarningLimit: 500,
  },
  // 环境变量前缀从 REACT_APP_ 改为 VITE_
  envPrefix: 'VITE_',
});
```

#### 3. 移动 `index.html` 到项目根目录

```bash
mv public/index.html ./index.html
```

修改 `index.html`：
- 删除 `%PUBLIC_URL%` 前缀（Vite 不需要）
- 在 `</body>` 前添加入口脚本引用：

```html
<script type="module" src="/src/index.tsx"></script>
```

#### 4. 修改 `package.json` 脚本

```json
"scripts": {
  "start": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest"
}
```

#### 5. 处理环境变量

全局搜索 `REACT_APP_`，替换为 `VITE_`：

```bash
grep -r "REACT_APP_" src/
```

访问方式从 `process.env.REACT_APP_X` 改为 `import.meta.env.VITE_X`。

#### 6. 处理 Web Worker

`src/workers/tsWorker.ts` 在 Vite 中引用方式需要修改：

```typescript
// 改造前（CRA 方式）
const worker = new Worker(new URL('../workers/tsWorker.ts', import.meta.url));

// Vite 方式（在引用处修改）
import TsWorker from '../workers/tsWorker.ts?worker';
const worker = new TsWorker();
```

#### 7. 处理 `process.env.NODE_ENV`

Vite 中用 `import.meta.env.MODE` 替代：

```typescript
// 改造前
if (process.env.NODE_ENV === 'development')

// 改造后
if (import.meta.env.DEV)
```

#### 8. 验证迁移结果

```bash
npm run start   # 验证开发服务器正常启动
npm run build   # 验证生产构建无报错
```

构建完成后 `dist/bundle-stats.html` 自动打开，可视化查看各 chunk 大小。

### 迁移后需要记录的数据

| 指标 | 记录方式 |
|------|----------|
| 开发冷启动时间 | 终端输出的 `ready in Xms` |
| HMR 速度 | 修改一行代码后终端输出的 `hmr update` 时间 |
| build 时间 | `npm run build` 的总耗时 |
| bundle 大小 | `dist/bundle-stats.html` 截图 |
| LCP（迁移后） | 再次跑 Lighthouse |

### 潜在风险

| 风险点 | 处理方式 |
|--------|----------|
| `@babel/standalone` 类型声明 | `src/types/babel__standalone.d.ts` 已存在，Vite 会自动识别 |
| `sass` 编译器 | Vite 内置 sass 支持，但项目里 sass 是在 JS 中调用的（非 CSS 文件），动态 import 方式不变 |
| CRA 的 `PUBLIC_URL` | 改为 Vite 的 `base` 配置项 |
| Jest 测试 | 迁移到 `vitest`（API 兼容 Jest，改动极小） |

---

## 与 Task 1/2 的整合点

| 整合项 | 时机 | 说明 |
|--------|------|------|
| perfSDK 数据消费 | Task 2 完成后 | 本 Task 的性能报告页面读取 Task 2 上报的数据 |
| SSE 优化量化 | Task 1 + Task 2 完成后 | SSE render_lag 优化（批量写入）的 before/after 数据 |
| AI 生成 LCP 影响 | Task 1 完成后 | AI 功能引入新依赖后，需重新测量 LCP，确保不回退 |

---

## 文件变更清单

### 新增文件
- `FeiShu-Codepen-Frontend/src/pages/PerfReportPage.tsx`（可选）
- `plans/perf-baseline.md`（手动记录基线数据，非代码文件）

### 修改文件
- `FeiShu-Codepen-Frontend/src/services/compilerService.ts`（静态 import 改动态 import）
- `FeiShu-Codepen-Frontend/src/components/Editor.tsx`（添加 useMemo、Preview 防抖）
- `FeiShu-Codepen-Frontend/src/App.tsx`（添加 /perf 路由，可选）

---

## 注意事项

1. **先记录基线再改代码**：LCP 3.44s 是当前基线，改代码前必须先截图/记录，否则无法对比
2. **动态 import 的类型问题**：`@babel/standalone` 的类型声明在 `src/types/babel__standalone.d.ts`，动态 import 后需要确认类型推断正确
3. **compileReact 改为 async 的影响**：需要检查所有调用 `compileReact` 的地方，确保都用 `await`（目前只有 `compileJsFramework` 调用，已经是 async）
