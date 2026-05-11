# 性能基线记录

> 改造前数据，所有优化的对比基准。测试页面：`localhost:8888/pens`

---

## Lighthouse 基线（改造前）

测试时间：2026-05-10  
测试页面：`/pens`（Pen 列表页）  
测试环境：本地开发服务器 localhost:8888

| 指标 | 数值 | 评级 |
|------|------|------|
| Performance 总分 | **47** | 🔴 差 |
| First Contentful Paint (FCP) | **0.8s** | 🟢 好 |
| Largest Contentful Paint (LCP) | **17.0s** | 🔴 极差 |
| Total Blocking Time (TBT) | **1,850ms** | 🔴 极差 |
| Cumulative Layout Shift (CLS) | **0** | 🟢 好 |
| Speed Index | **2.7s** | 🟢 好 |

> 注：之前用户提到 LCP 3.44s，截图显示实际为 17.0s，以截图数据为准。
> FCP 0.8s 说明 HTML/CSS 加载很快，LCP 17.0s 说明最大内容元素（很可能是编辑器或某个大组件）
> 被 JS 长任务阻塞，TBT 1,850ms 印证了这一点——主线程被大量同步 JS 占用。

---

## 根因分析

TBT 1,850ms 是核心问题，直接导致 LCP 17.0s。主线程长任务来源（推断）：

1. `@babel/standalone`（~1.5MB）在主 bundle 中同步解析执行
2. `@vue/compiler-sfc` 静态 import，打包进主 bundle
3. `sass` / `less` 静态 import，打包进主 bundle
4. CodeMirror 全量扩展初始化

---

## 优化目标

| 指标 | 当前 | 目标 | 优化手段 |
|------|------|------|----------|
| Performance 总分 | 47 | 80+ | 综合优化 |
| LCP | 17.0s | < 2.5s | 动态 import 拆包 + Vite 迁移 |
| TBT | 1,850ms | < 200ms | 消除主线程长任务（懒加载大包） |
| FCP | 0.8s | 保持 < 1s | 不回退 |
| CLS | 0 | 保持 0 | 不回退 |

---

## 待补充数据（需手动测量）

- [ ] Network 面板：主 bundle 大小（`npm run build` 后）
- [ ] Coverage 面板：主 bundle 未使用 JS 百分比
- [ ] Performance 面板：Long Tasks 截图
- [ ] 编译耗时：Babel/TS/Sass 各链路（临时 console.time 测量）
- [ ] 开发启动时间（CRA）：终端输出截图（迁移 Vite 后对比用）
