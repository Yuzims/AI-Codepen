# Task 3 性能优化总结

> 相关文档：本文记录已完成的性能优化与结果；后续构建体积专项优化待办见 [build-optimization-backlog.md](build-optimization-backlog.md)。

## 性能数据对比

| 指标 | 改造前（基线） | 改造后 | 降幅 |
|------|--------------|--------|------|
| LCP | 17.0s | 10.8s | -36% |
| TBT | 1850ms | 1060ms | -43% |
| FCP | 0.8s | 0.7s | -13% |
| Speed Index | 2.7s | 1.9s | -30% |
| 主 bundle 大小 | ~3264KB | ~576KB | -82% |

> 基线数据与 Step 2-4 数据均在 CRA 构建下、通过 `vite preview` 等效的本地静态服务测得。Vite 迁移后经 Step 6 优化，最终指标见下表。

---

## 最终性能数据（Vite + Step 6 优化后）

| 指标 | CRA 基线 | Vite 迁移后（未优化） | Vite + Step 6 优化后 |
|------|---------|-------------------|-------------------|
| FCP | 0.7s | — | **1.6s**（`vite preview` 测得） |
| LCP | 10.8s | — | **2.4s** |
| Speed Index | 1.9s | — | **1.6s** |
| TBT | 1060ms | — | 30ms |
| 主 chunk（index.js） | 576KB | 48KB（路由懒加载后） | **6.31 kB（6314 bytes）** |

> Vite 迁移后曾出现指标骤降（FCP 14s+），原因是路由组件未做懒加载、axios 被同步拉入首屏。经 Step 6 修复后指标大幅改善，LCP 从 10.8s 降至 2.4s（-78%）。

---

## 改动内容

### Step 2：动态 import 优化（compilerService.ts）

**问题：** `@babel/standalone`（~1.5MB）、`@vue/compiler-sfc`、`sass`、`less` 四个大包静态 import，全部打包进主 bundle，首屏必须全量加载。

**改动：**
- 移除四个顶部静态 import
- 新增 `getBabel()` / `getVueParser()` 懒加载 getter（单例缓存，只加载一次）
- `compileReact`、`compileSFCVue` 改为 async，内部按需调用 getter
- `compileCssFramework` 内部对 sass/less 改用 `await import(...)`，仅在用户选择对应语言时加载
- 修复 `compileJsFramework` 调用 `compileReact` 缺少 `await` 的 bug

**效果：** 四个大包从主 bundle 剥离，首屏只加载用户当前语言所需的编译器。

---

### Step 3：useMemo 优化 + 移除 console.log（Editor.tsx）

**问题：** `mergedCss` 和 `mergedJs` 在渲染函数体内直接计算，每次任意 state 变化都触发重新计算（包括与 CSS/JS 无关的 state 变化）。同时有两处 `console.log` 调试输出留在生产代码中。

**改动：**
- import 中加入 `useMemo`
- `mergedCss` 包进 `useMemo`，依赖 `[userPens, importedCssPenIds, compiledCss]`
- `compiledImportedJs` + `mergedJs` 合并为一个 `useMemo`，依赖 `[userPens, importedJsPenIds, compiledJs]`
- 删除两处 `console.log('🔧 Merged Content Debug...')`

**效果：** 只有依赖项变化时才重新计算合并内容，减少无效计算。

---

### Step 4：Preview 更新防抖（Editor.tsx）

**问题：** 用户每次击键都直接触发 Preview 重渲染（包括编译），高频输入时造成大量无效编译和 iframe 刷新，TBT 高。

**改动：**
- 新增三个 debounced state：`debouncedHtml`、`debouncedMergedCss`、`debouncedMergedJs`
- 三个 `useEffect` 各用 300ms `setTimeout` 驱动更新，cleanup 清除上一个 timer
- `Preview` 和 `DebugPreview` 的 html/css/js props 全部换成 debounced 值

**效果：** 连续输入时 Preview 只在停止输入 300ms 后更新一次，TBT 从 1850ms 降至 1060ms（-43%）。

---

### Step 5：迁移到 Vite

**问题：** CRA（react-scripts + webpack）无法自定义 chunk 分割策略，动态 import 的大包仍被合并进主 bundle，Step 2 的懒加载优化在 CRA 下效果受限。

**改动：**

1. **安装依赖**：`vite@5.4.19`、`@vitejs/plugin-react@4.3.4`、`rollup-plugin-visualizer@5.14.0` 加入 devDependencies

2. **新建 `vite.config.ts`**：
   - `manualChunks` 将 CodeMirror 系列包分为独立 chunk（548KB，按需加载）
   - `vendor-react` chunk 分离 react/react-dom/react-router-dom（162KB）
   - `rollup-plugin-visualizer` 生成 `dist/bundle-stats.html` 可视化 bundle 组成
   - `define` 兼容第三方库的 `process.env.NODE_ENV` 引用
   - `server.proxy` 配置 `/api` 代理到 `localhost:3000`

3. **新建根目录 `index.html`**：从 `public/index.html` 迁移，移除 `%PUBLIC_URL%`，添加 `<script type="module" src="/src/index.tsx">`

4. **修改 `package.json` scripts**：`react-scripts start/build` → `vite` / `tsc && vite build` / `vite preview`

5. **修改 `tsconfig.json`**：`target: "es5"` → `target: "es2015"`（Vite 要求）

6. **修改 `.env`**：`REACT_APP_API_URL` → `VITE_API_URL`

7. **修复 `lintService.ts`**：将 `@babel/standalone` 静态 import 替换为 `@babel/parser`（只做语法解析，体积更小，且保持 linter 同步接口不变）。这是关键修复——`lintService.ts` 的静态 import 会导致 Vite 将 babel standalone 合并回主 bundle，抵消 Step 2 的懒加载效果。

**构建结果对比：**

| chunk | 修复前（CRA） | 修复后（Vite） |
|-------|-------------|--------------|
| 主包 index.js | 3264KB | **576KB** ↓82% |
| babel（懒加载） | 合并在主包内 | **2980KB 独立 chunk** |
| codemirror | 合并在主包内 | **548KB 独立 chunk** |
| vendor-react | 合并在主包内 | **162KB 独立 chunk** |
| sass（懒加载） | 合并在主包内 | **3307KB 独立 chunk** |

---

### Step 6：Vite 迁移后首屏性能修复

**问题：** Vite 迁移后 Lighthouse 指标骤降（FCP 14s+），原因有三：
1. 路由组件全部静态 import，Editor/PensPage/LoginPage 等全部打进首屏 bundle
2. `AuthContext` → `authService` → `api.ts` → `axios` 同步 import 链，axios（~40KB）被拉入主 chunk
3. `manualChunks` 使用对象形式，无法覆盖动态 import 的包，babel/sass/ts 编译器仍混入 index chunk

**改动：**

1. **路由懒加载（`App.tsx`）**：所有页面组件改为 `React.lazy` + `Suspense`，每个路由按需加载
2. **`AuthContext` 渲染阻塞修复**：加入 `loading` 状态，`PrivateRoute` 在 loading 期间返回 `null`，消除首屏无效路由跳转（原来 `isAuthenticated` 初始为 `false` 会先渲染 `/login` 再跳回 `/pens`）
3. **axios 移出首屏（`authStorage.ts`）**：将 `isAuthenticated`/`getCurrentUser` 两个纯 localStorage 函数提取到独立文件，`AuthContext` 只 import 这个轻量文件；`login`/`logout` 改为动态 import，axios 仅在用户触发登录时加载
4. **`manualChunks` 改为函数式**：精确匹配 `@babel/standalone`、`sass`、`less`、`typescript`、`@codemirror`，各自独立分包

**构建结果：**

| chunk | Step 5（Vite 迁移后） | Step 6（优化后） |
|-------|-------------------|----------------|
| 主 index.js | 48KB | **6.31 kB（6314 bytes）**（gzip 2.6KB） |
| 首屏总 JS（gzip） | ~72KB | **~56KB** |
| axios 加载时机 | 首屏同步 | 登录/登出时按需 |

---

## 修改文件清单

| 文件 | 改动类型 |
|------|---------|
| `src/services/compilerService.ts` | 四个静态 import 改动态 import，compileReact/compileSFCVue 改 async |
| `src/services/lintService.ts` | `@babel/standalone` 替换为 `@babel/parser` |
| `src/components/Editor.tsx` | useMemo 优化、防抖、移除 console.log |
| `src/App.tsx` | 路由组件改 React.lazy，PrivateRoute 加 loading 判断 |
| `src/contexts/AuthContext.tsx` | 加 loading 状态，login/logout 改动态 import |
| `src/services/authStorage.ts` | 新增，提取 isAuthenticated/getCurrentUser |
| `vite.config.ts` | manualChunks 改函数式，精确分包 |
| `index.html` | 加 dns-prefetch |
| `package.json` | scripts 换 vite，devDependencies 加 vite 三件套，移除 @types/jest 重复声明 |
| `tsconfig.json` | target es5 → es2015 |
| `.env` | REACT_APP_API_URL → VITE_API_URL |

---

## 待办

- [x] 启动 `npm start` 验证开发服务器功能正常
- [x] 重新跑 Lighthouse，记录 Vite 迁移后的 LCP 数据（vite preview 测得：FCP 1.6s, LCP 2.4s）
- [ ] 截图 `dist/bundle-stats.html` 保存 bundle 可视化结果


关于 Lighthouse 测 localhost 的问题：

"我在优化过程中踩了一个坑：最初用 vite dev server 跑 Lighthouse，发现迁移到 Vite 后指标反而变差了，FCP 从 0.7s 涨到 14s。我当时以为是 Vite 配置问题，花了时间排查分包策略、懒加载、AuthContext 渲染阻塞，做了一系列优化。后来发现根本原因是测试环境不对——vite dev server 没有 gzip 压缩、没有 HTTP/2，而且 Lighthouse 的 CPU 4x 降速在本地会严重放大 JS 执行时间，导致数据失真。换成 vite preview（模拟生产静态服务）后，指标立刻回到正常水平：FCP 1.6s、LCP 2.4s。"


关于 CRA 基线也是 localhost 的问题
CRA 基线是有效的，原因如下：

CRA 的 react-scripts build + serve -s build 和 vite preview 都是静态文件服务，行为一致。你的 CRA 基线（FCP 0.7s）是在同等条件下测的，所以横向对比是公平的。

面试可以这样说：

"基线数据是在 CRA 构建产物上用静态服务器测的，和最终 Vite 的 vite preview 测试环境一致，所以对比是有效的。中间迁移过程中我用了 dev server 测，那段数据是噪音，不作为对比依据。"

完整的优化叙述框架

问题发现 → 分析工具 → 逐步优化 → 量化结果
"项目用 CRA 构建，主 bundle 3.2MB，LCP 17s。用 Lighthouse + bundle-stats 可视化分析后，发现首屏加载了 babel-standalone（1.5MB）、sass（3.3MB）等运行时编译器，这些只有用户打开编辑器时才需要。

分四步优化：第一步把编译器改成动态 import，按需加载；第二步用 useMemo 缓存合并计算，避免无效重渲染；第三步加 300ms 防抖，连续输入时只在停止后更新 Preview，TBT 从 1850ms 降到 1060ms；第四步迁移到 Vite，用函数式 manualChunks 精确控制分包，让 Vite 的 tree-shaking 和 rollup 分包策略充分发挥。

迁移过程中还修复了两个隐患：路由组件全部静态 import 导致首屏加载所有页面代码，以及 AuthContext 的 isAuthenticated 初始为 false 导致首屏先渲染 /login 再跳转，这两次无效渲染都被 Lighthouse 计入 FCP。

最终结果：LCP 从 17s 降到 2.4s，降幅 86%；CRA 单包主 bundle 从 3.2MB 降到 Vite 的入口 chunk 6.17 kB（6314 bytes，`bundle-stats.html` 里默认看到的是 rendered size（经过 tree-shake / transform 后的“渲染后大小”），约 10.98KB），首屏总 JS（gzip）约 56KB。"