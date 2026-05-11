# Task 2 性能监控 SDK 交接文档

> 目的：供下个会话快速理解当前实现状态，并在此基础上继续开发。
> 范围：仅总结 Task 2（前端性能监控 SDK）相关内容，不包含 Task 1 的 SSE 实现和 Task 3 的可视化页面。

---

## 1. 任务目标（来自原始文档）

本任务原始目标见 `plans/task2-perf-sdk.md`，核心是实现一个轻量级前端性能监控 SDK，覆盖：

1. 编译管线耗时：Babel / TypeScript / Sass / Less / Vue SFC
2. 预览刷新性能：全量重建 vs 增量更新
3. 补全响应延迟：snippet / ts worker / total
4. Web Vitals：LCP / FCP / TTFB 等
5. SSE 流式指标：留待 Task 1 完成后整合

---

## 2. 当前已完成的工作

### 2.1 新增前端 SDK

已新增文件：
- `FeiShu-Codepen-Frontend/src/services/perfSDK.ts`

已实现能力：
- `record(name, value)`：记录单条指标
- `measure(name, fn)`：同步逻辑计时
- `measureAsync(name, fn)`：异步逻辑计时
- `getSummary(name)`：返回 `count / avg / p95 / max`
- `getAllSummaries()`：返回当前所有指标摘要
- 10 秒批量上报到 `/api/metrics`
- `_reset()`：仅供测试使用，清空指标和定时器

当前上报机制：
- 前端每 10 秒聚合一次数据并 `POST /api/metrics`
- 上报失败静默处理，不影响主流程

---

### 2.2 编译链路已接入的指标

文件：
- `FeiShu-Codepen-Frontend/src/services/compilerService.ts`

当前已接入：
- `compile_ts_ms`
- `compile_babel_ms`
- `compile_sass_ms`
- `compile_less_ms`
- `compile_vue_sfc_ms`（函数存在，但是否真正被业务链路触发，见“已知缺口”）

额外实现：
- `compileReact` 已加 50 条上限的内存缓存 `compileCache`
- React / Vue parser / Sass / Less 都使用懒加载或动态加载，避免主 bundle 过大

---

### 2.3 预览刷新指标已接入

文件：
- `FeiShu-Codepen-Frontend/src/components/Preview.tsx`

当前已写入的打点：
- `preview_full_rebuild_ms`
- `preview_incremental_update_ms`

说明：
- `doc.open() / write() / close()` 全量重建路径已打点
- `executeUserCode()` 增量更新路径已打点

但该部分有一个关键缺口：增量更新路径大概率尚未真正生效，详见下文“已知缺口”。

---

### 2.4 补全性能指标已接入一部分

文件：
- `FeiShu-Codepen-Frontend/src/services/completion/completionProvider.ts`

当前实现方式：
- 通过 `wrapWithTiming()` 包裹补全 source
- 已打点：
  - `completion_snippet_ms`
  - `completion_ts_worker_ms`

注意：
- `completion_total_ms` 仍未实现

---

### 2.5 Web Vitals 已激活

文件：
- `FeiShu-Codepen-Frontend/src/index.tsx`

当前行为：
- `reportWebVitals((metric) => ...)` 已启用
- 开发环境下会在控制台输出 Web Vitals
- 同时调用 `perf.record(metric.name.toLowerCase() as any, metric.value)`

注意：
- 这里运行时可记录数据，但类型定义与上报名称之间仍有不完全一致的问题，详见“已知缺口”。

---

### 2.6 后端指标接收接口已新增

新增文件：
- `FeiShu-Codepen-Backend/src/routes/metrics.js`

已注册到：
- `FeiShu-Codepen-Backend/src/index.js`

当前接口：
- `POST /api/metrics`：接收指标摘要
- `GET /api/metrics/summary`：返回最近 10 条上报数据

当前存储方式：
- 进程内内存数组 `metricsStore`
- 最多保留最近 1000 条

说明：
- 当前是开发态实现，不是持久化方案
- 服务重启后数据会丢失

---

## 3. 已补充的测试

### 3.1 前端测试

新增文件：
- `FeiShu-Codepen-Frontend/src/services/__tests__/perfSDK.test.ts`

覆盖内容：
- `record`
- `getSummary`
- `getAllSummaries`
- `measure`
- `measureAsync`
- 自动 flush / 定时器 / fetch 上报 / flush 后清空

最后一次已知结果：
- 17 / 17 通过

运行命令：
```bash
cd FeiShu-Codepen-Frontend
npx react-scripts test --testPathPattern="services/__tests__/perfSDK" --watchAll=false
```

说明：
- 该测试为兼容 CRA 自带 Jest 27 的写法
- 使用了 `_reset()` 清理 SDK 状态

---

### 3.2 后端测试

新增文件：
- `FeiShu-Codepen-Backend/src/__tests__/metrics.test.js`

覆盖内容：
- `POST /api/metrics`
- `GET /api/metrics/summary`
- summary 长度限制

运行命令：
```bash
cd FeiShu-Codepen-Backend
npm test
```

当前依赖状态：
- `package.json` 中 `jest` 版本为 `^30.4.2`
- `supertest` 版本为 `^6.3.4`

注意：
- 若本机仍是 Node 16，则 Jest 30 无法运行
- 建议直接切换到 Node 22 再执行后端测试

---

## 4. 当前实现与原始文档不完全一致的地方（非常重要）

这一节是下一会话最应该优先阅读的内容。

### 4.1 `compile_vue_sfc_ms` 函数已实现，但未接入真实业务路径

现状：
- `compilerService.ts` 内已经有 `compileSFCVue()`，并且会记录 `compile_vue_sfc_ms`
- 但是 `compileJsFramework()` 在 `language === 'vue'` 时，当前返回的是 `compileVue(code)`，不是 `compileSFCVue(code)`

也就是说：
- **Vue SFC 计时函数存在**
- **但当前主业务链路并不会调用它**

影响：
- `compile_vue_sfc_ms` 目前大概率不会产生真实数据

下一步建议：
1. 先确认当前编辑器里的 `vue` 语言到底代表：
   - 单文件组件（SFC）文本？还是
   - 普通 JS + Vue 全局变量模式？
2. 如果目标确实是 SFC，则把 `compileJsFramework()` 的 `vue` 分支改为 `await compileSFCVue(code)`
3. 如果不是 SFC，则应：
   - 删除该指标，或
   - 增加新的 `vue-sfc` 语言类型，而不是复用 `vue`

---

### 4.2 `preview_incremental_update_ms` 已打点，但增量更新路径大概率未真正生效

现状：
- `Preview.tsx` 中是否走增量更新，依赖 `iframeInitializedRef.current === true`
- 当前代码中只定义了：
  - `const iframeInitializedRef = useRef(false);`
- 但没有找到任何地方把它设置为 `true`

影响：
- 增量更新分支条件很可能永远不成立
- 因此 `preview_incremental_update_ms` 大概率不会有真实数据
- 当前预览刷新可能始终走全量重建路径

下一步建议：
1. 在首次完整渲染成功后显式设置：
   - `iframeInitializedRef.current = true`
2. 再手动验证：
   - 首次渲染走 `preview_full_rebuild_ms`
   - 仅修改 JS 时走 `preview_incremental_update_ms`
3. 最好补一个行为验证或至少开发态日志验证

---

### 4.3 `completion_total_ms` 未实现

现状：
- `perfSDK.ts` 的 `MetricName` 里包含 `completion_total_ms`
- 但 `completionProvider.ts` 当前只实现了：
  - `completion_snippet_ms`
  - `completion_ts_worker_ms`
- 没有总耗时指标

影响：
- 当前无法直接知道一次补全请求整体耗时
- 只能看局部阶段耗时

下一步建议：
- 在补全组合入口补上 total 级别的整体计时
- 需要先确认 CodeMirror 当前补全 source 的组合结构，避免重复计时或统计口径混乱

---

### 4.4 Web Vitals 在运行时可用，但类型模型不完整

现状：
- `index.tsx` 里通过 `metric.name.toLowerCase() as any` 记录指标
- 这意味着运行时会记录类似：
  - `lcp`
  - `fcp`
  - `ttfb`
  - 可能还有 `cls` / `inp`
- 但 `perfSDK.ts` 的 `MetricName` 联合类型里并没有这些值

影响：
- 运行时可以工作
- 但类型系统和真实指标集合不一致
- 以后若基于 `MetricName` 做更严格处理，会产生维护问题

下一步建议：
- 二选一：
  1. 把 Web Vitals 指标补进 `MetricName`
  2. 或在 `index.tsx` 里做显式映射，例如：
     - `TTFB -> web_vitals_ttfb_ms`
     - `FCP -> web_vitals_fcp_ms`
     - `LCP -> web_vitals_lcp_ms`

推荐第 2 种：命名更清晰，也不会和 SSE 的 `sse_ttfb_ms` 混淆。

---

### 4.5 SSE 指标尚未实现（按原计划留给 Task 1）

当前状态：
- `sse_ttfb_ms`
- `sse_render_lag_ms`
- `sse_total_ms`

这些名称已经定义在 `perfSDK.ts` 中，但业务侧尚未接入。

这是预期内未完成项，不是 bug。

接入时机：
- Task 1 的 `aiService.ts` SSE 读取循环完成后

---

## 5. 当前可直接使用的能力

即使不继续开发，当前已有实现也能做这些事：

1. 采集 React / TS / SCSS / Less 编译耗时
2. 采集预览全量重建耗时
3. 采集 snippet / ts worker 补全耗时
4. 采集 Web Vitals
5. 每 10 秒自动向后端上报指标
6. 通过后端接口查看最近 10 条聚合上报结果

可用于：
- 先拿一轮真实开发数据
- 验证是否存在明显编译瓶颈
- 支撑后续 Task 3 的性能报告页

---

## 6. 如何在本地继续验证 / 采数

### 启动后端
```bash
cd FeiShu-Codepen-Backend
npm start
```

### 启动前端
```bash
cd FeiShu-Codepen-Frontend
npm start
```

### 触发方式
- 编辑 React / TS / SCSS / Less 代码 → 触发编译指标
- 修改预览相关内容 → 触发预览指标
- 触发代码补全 → 触发补全指标
- 页面加载 → 触发 Web Vitals

### 查看上报结果
```bash
curl http://localhost:3000/api/metrics/summary
```

说明：
- 如果后端不是 3000，请以实际端口为准
- 当前后端 `index.js` 监听 `process.env.PORT || 3000`

---

## 7. 推荐的下一步开发顺序

### 优先级 P0（建议下一会话先做）

1. 修复 `Preview.tsx` 中 `iframeInitializedRef` 未置为 `true` 的问题
2. 确认并修复 `compile_vue_sfc_ms` 的真实接线问题
3. 补上 `completion_total_ms`

### 优先级 P1

4. 规范 Web Vitals 的命名与类型
5. 做一个开发态 `PerfDebugPanel.tsx`
6. 在开发环境中把 `perf` 暴露到 `window.__perf`，便于控制台直接查看

### 优先级 P2

7. Task 1 完成后接入 SSE 指标
8. Task 3 中新增可视化性能报告页面
9. 若需要长期分析，把后端内存存储换成 MongoDB

---

## 8. 建议下个会话先检查的文件

1. `FeiShu-Codepen-Frontend/src/components/Preview.tsx`
   - 重点看 `iframeInitializedRef`
   - 目标：让增量更新路径真正生效

2. `FeiShu-Codepen-Frontend/src/services/compilerService.ts`
   - 重点看 `compileJsFramework()` 与 `compileSFCVue()` 的关系
   - 目标：确认 Vue 指标到底怎么接

3. `FeiShu-Codepen-Frontend/src/services/completion/completionProvider.ts`
   - 重点看 `completion_total_ms` 应该在哪一层统计

4. `FeiShu-Codepen-Frontend/src/index.tsx`
   - 重点看 Web Vitals 命名是否要重构

5. `FeiShu-Codepen-Backend/src/routes/metrics.js`
   - 如果要做持久化或查询增强，从这里开始

---

## 9. 一句话结论

**当前 Task 2 已完成“SDK 主体 + 前后端基础链路 + 测试补充”，可以开始采数；但还存在 3 个核心差异项未收口：Vue SFC 链路未接实、预览增量更新大概率未真正生效、completion_total_ms 未实现。**
