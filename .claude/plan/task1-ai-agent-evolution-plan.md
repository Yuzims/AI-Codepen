# Task 1：从阶段 1 升级到真正 Agent 架构的落地方案

> 本文档替代原 `plans/task1-ai-integration.md` 中的后续方向。
>
> 结论：**不再继续原阶段 2（AI 对话助手）和阶段 3（AI 错误修复）**，而是以已经落地的阶段 1（AI 代码生成）为起点，演进为一个适用于在线代码编辑器场景的 **受控型 AI Agent**。

---

## 一、目标定义

当前项目已经具备基础 AI 生成功能：

- 前端输入 prompt
- 后端调用 LLM
- 以 SSE 流式返回结构化代码
- 前端创建新 Pen 并跳转编辑器

这条链路已经证明“模型接入”和“流式生成”可行，但它仍然只是 **LLM 功能接入**，不是 **真正的 Agent 架构**。

本次升级的目标不是“再加一个聊天框”，而是把当前能力演进为一个围绕 **当前 Pen 工作** 的 Agent 系统：

- 读取当前 Pen 内容
- 理解用户需求或问题
- 先给出计划，再生成改动提案
- 以 patch / diff 形式展示修改
- 用户确认后应用改动
- 支持撤销 / 回滚
- 全链路可观测、可审计、可限制

最终形成如下工作闭环：

```text
读取当前 Pen
-> 分析目标 / 问题
-> 生成执行计划
-> 生成结构化 patch
-> 用户确认应用
-> 重新检查结果
-> 支持回滚与记录
```

---

## 二、现状分析

### 2.1 当前阶段 1 为什么不算 Agent

当前已实现的阶段 1 更像：

```text
prompt -> LLM -> { title, html, css, js }
```

它不算真正 Agent，原因如下：

1. **没有显式规划阶段**
   - 目前接口直接从用户描述生成最终代码结果。
   - 模型没有先输出“准备怎么做”。

2. **没有工具调用闭环**
   - 模型不能主动读取当前 Pen、错误信息、选区、运行状态。
   - 所有上下文都靠一次性请求体注入。

3. **没有结构化执行动作**
   - 当前返回的是完整代码块，不是可审阅、可限制的 patch。
   - 更适合“创建新 Pen”，不适合“改现有 Pen”。

4. **没有用户确认执行机制**
   - 现有流程是“生成 -> 创建”。
   - Agent 应该是“计划 -> patch -> 确认 -> 应用”。

5. **没有回滚与审计**
   - 不能回答“AI 改了什么、为什么改、怎么恢复”。

6. **没有安全边界**
   - 还没有明确限制单次改动范围、可改区域、最大步数、最大 patch 规模。

### 2.2 当前阶段 1 已具备的可复用基础

当前代码并不是要推翻重做，以下能力都可以直接复用：

#### 后端
- `FeiShu-Codepen-Backend/src/routes/ai.js`
  - 已有 Anthropic SDK 接入
  - 已有 SSE 流式输出
  - 已有鉴权与错误处理基础

#### 前端
- `FeiShu-Codepen-Frontend/src/services/aiService.ts`
  - 已有 SSE 消费与流式解析能力
- `FeiShu-Codepen-Frontend/src/components/AIGenerateModal.tsx`
  - 已有 AI 交互基础 UI
- `FeiShu-Codepen-Frontend/src/components/Editor.tsx`
  - 已持有当前 Pen 的核心状态
- `FeiShu-Codepen-Frontend/src/services/lintService.ts`
  - 已能提供错误/警告信息

#### 产品流程
- 已有创建 Pen、保存 Pen、编辑 Pen、预览、错误展示链路
- 已有登录态与权限基础

结论：**升级重点不是“重新接模型”，而是把当前单轮生成能力升级为可计划、可执行、可回滚的 Agent 流程。**

---

## 三、目标架构

## 3.1 Agent 的最小定义

在这个项目里，真正的 Agent 不等于“无限制自动化”，而是一个 **受控型 Agent**，满足以下条件：

1. **感知上下文**
   - 读取当前 Pen 的 html / css / js
   - 读取语言配置、错误摘要、用户选区

2. **显式规划**
   - 在改代码前先告诉用户准备怎么改

3. **结构化执行**
   - 输出 patch / operation，而不是整段黑盒文本

4. **用户确认后写入**
   - 所有代码变更先预览，再应用

5. **支持回滚**
   - 每次 AI 应用都形成可恢复点

6. **可观测与可限制**
   - 记录会话、步骤、耗时、结果
   - 限制改动范围和执行能力

---

## 3.2 目标架构分层

### A. Context Builder（上下文构建层）
负责从前端编辑器状态中提取 Agent 所需的事实：

- 当前 Pen id / title
- html / css / js
- cssLanguage / jsLanguage
- 当前选区
- lint 错误摘要
- 最近一次运行 / 预览错误摘要
- 用户输入的任务描述

### B. Planning Layer（计划层）
负责先输出计划，而不是直接给改动：

- 目标是什么
- 影响 html / css / js 哪些区域
- 准备分几步做
- 有哪些风险
- 是否建议先修错误再做功能

### C. Patch Proposal Layer（改动提案层）
负责生成结构化 patch：

- 改动目标：html / css / js
- 改动类型：replace / append / prepend / range replace
- 改动原因
- 改动前后对比

### D. Apply & Rollback Layer（应用与回滚层）
负责：

- 用户确认后应用 patch
- 记录应用前快照
- 支持撤销上一次 AI 修改

### E. Observability & Guardrails（可观测与安全边界层）
负责：

- trace id
- step 日志
- 请求耗时
- patch 大小统计
- 最大改动范围限制
- 可修改区域限制

---

## 四、推荐的演进策略

原则：**渐进式演进，不推翻阶段 1。**

### 保留的能力
- 保留现有 `/api/ai/generate`
- 保留现有 AI 生成新 Pen 的入口
- 保留现有 SSE 链路

### 不再继续的旧方向
- 不再单独实现“聊天助手面板”作为阶段 2
- 不再单独实现“AI Fix 按钮 + /fix 接口”作为阶段 3

### 新方向
所有后续 AI 能力统一并入 **Agent 主路径**：

- 功能修改
- 样式优化
- 问题定位
- 错误修复
- 增量重构

统一走：

```text
Agent Plan -> Agent Patch -> Confirm -> Apply -> Rollback
```

---

## 五、实施方案分阶段拆解

# Phase A：单轮 Agent MVP（计划优先）

## 目标
把当前“代码生成器”升级为“可读取当前 Pen 并先输出计划”的单轮 Agent MVP。

## 核心结果
用户在编辑器中输入一句需求后，不再直接得到一大段代码，而是先得到：

- 要做什么
- 会修改哪些区块
- 风险是什么
- 下一步是否生成 patch

## 后端改动
### 新增能力
建议从 `src/routes/ai.js` 中拆出 Agent 路由，新增：

- `POST /api/ai/agent/plan`

### 建议新增文件
- `FeiShu-Codepen-Backend/src/routes/agent.js`
- `FeiShu-Codepen-Backend/src/services/agentService.js`
- `FeiShu-Codepen-Backend/src/services/agentPromptService.js`

### 输入结构建议
```ts
interface AgentContext {
  penId?: string;
  title?: string;
  html: string;
  css: string;
  js: string;
  cssLanguage?: string;
  jsLanguage?: string;
  selection?: {
    target: 'html' | 'css' | 'js';
    from: number;
    to: number;
    text: string;
  } | null;
  errors?: Array<{
    target: 'html' | 'css' | 'js';
    severity: 'error' | 'warning';
    message: string;
    line?: number;
    column?: number;
  }>;
  userInstruction: string;
}
```

### 输出结构建议
```ts
interface AgentPlan {
  summary: string;
  goal: string;
  targets: Array<'html' | 'css' | 'js'>;
  steps: string[];
  risks: string[];
  requiresConfirmation: boolean;
}
```

## 前端改动
### 新增能力
在编辑器页面提供 Agent 入口，而不是复用“新建 Pen”弹窗。

### 建议新增文件
- `FeiShu-Codepen-Frontend/src/services/agentService.ts`
- `FeiShu-Codepen-Frontend/src/components/AIAgentPanel.tsx`
- `FeiShu-Codepen-Frontend/src/services/agentContextBuilder.ts`

### 编辑器接入点
修改：
- `FeiShu-Codepen-Frontend/src/components/Editor.tsx`

### MVP UI 建议
Agent Panel 至少包含：
- 指令输入框
- 当前计划展示
- 风险提示
- “生成改动提案”按钮

## 验收标准
- 用户可在编辑器内发起 Agent 请求
- Agent 能读取当前 Pen，而不是只看一句 prompt
- Agent 首先返回计划，不直接覆写代码
- 计划明确列出目标区块与风险

## 风险
- 计划过于空泛，缺乏执行价值
- `Editor.tsx` 状态耦合增加

---

# Phase B：Patch 提案与用户确认应用

## 目标
让 Agent 从“会分析”变成“会提出结构化改动方案”，并支持用户确认后应用。

## 核心结果
用户可以看到 AI 建议改哪里、怎么改、改前改后对比，并决定是否应用。

## 后端改动
### 新增接口
- `POST /api/ai/agent/patch`

### 建议新增输出结构
```ts
interface PatchOperation {
  target: 'html' | 'css' | 'js';
  type: 'replace_full' | 'append' | 'prepend' | 'replace_range';
  before?: string;
  after: string;
  reason: string;
}

interface AgentPatchProposal {
  summary: string;
  operations: PatchOperation[];
  expectedOutcome: string;
  warnings: string[];
}
```

## 前端改动
### 新增能力
- patch 预览
- diff / before-after 展示
- 用户确认应用

### 建议新增文件
- `FeiShu-Codepen-Frontend/src/services/patchService.ts`
- `FeiShu-Codepen-Frontend/src/components/AIPatchPreview.tsx`

### 应用策略
MVP 推荐先使用 **整块替换策略**：
- `target = html | css | js`
- `type = replace_full`

先保证：
- 稳定
- 易预览
- 易回滚

后续再增强为局部 patch。

## 验收标准
- 用户能看到 AI 改动提案
- 用户确认后，编辑器内容才发生变化
- 应用后预览与错误状态自动刷新

## 风险
- 一开始就做 range patch 会把复杂度拉太高
- diff 渲染与编辑器状态同步可能较复杂

---

# Phase C：回滚、历史、错误修复并入 Agent 主路径

## 目标
把 AI 改动变成“可撤销、可追踪”的正式工作流，并把错误修复纳入 Agent，而不是独立功能线。

## 核心结果
- 应用前自动生成快照
- 支持撤销上一次 AI 改动
- 错误修复不再是独立按钮，而是 Agent 的一种任务类型

## 后端改动
### 建议新增模型
- `FeiShu-Codepen-Backend/src/models/PenRevision.js`
- `FeiShu-Codepen-Backend/src/models/AgentSession.js`

### 建议新增接口
- `POST /api/ai/agent/apply`
- `GET /api/ai/agent/sessions/:id`
- `POST /api/pens/:id/revisions/:revisionId/rollback`

## 前端改动
### 新增能力
- “撤销上一次 AI 修改”
- 显示最近一次 Agent 改动摘要
- 将 lint / runtime error 摘要注入 AgentContext

### 不再单独实现
- 不再做旧方案中的 `/api/ai/fix`
- 不再在 tooltip 中单独开辟一条 AI Fix 功能线

### 新的错误修复路径
错误修复统一变成：

```text
读取错误摘要
-> Agent 计划
-> patch 提案
-> 用户确认应用
-> 重新 lint / 预览
```

## 验收标准
- 每次 AI 应用前都有快照
- 至少支持“撤销上一次 AI 应用”
- Agent 能读取错误摘要并把它纳入计划

## 风险
- revision 持久化引入新的数据结构复杂度
- 错误摘要格式如果不稳定，会影响 Agent 推理质量

---

# Phase D：受限工具调用与真正的 Agent 闭环

## 目标
把 Agent 从“带计划的 patch 生成器”升级为“具备受限工具调用能力的编辑器 Agent”。

## 核心结果
模型不再只吃一坨 prompt，而是通过受限工具读取事实，再输出决策与 patch。

## 后端改动
### 建议新增文件
- `FeiShu-Codepen-Backend/src/services/agentOrchestrator.js`
- `FeiShu-Codepen-Backend/src/services/agentTools.js`
- `FeiShu-Codepen-Backend/src/services/agentGuardrails.js`

### 工具集建议
MVP 工具集：
- `get_current_pen`
- `get_pen_errors`
- `get_user_selection`
- `get_pen_languages`
- `propose_patch`

### 明确禁止的能力
- 任意 shell 执行
- 任意网络访问
- 任意数据库写入
- 未确认自动覆盖当前 Pen
- 访问其他用户数据

## 前端改动
### 新增能力
- 展示 Agent steps
- 展示每一步工具读取结果摘要
- 展示 patch 风险等级

## 验收标准
- 一次 Agent 会话可以记录“读取了什么、计划了什么、提议了什么、应用了什么”
- 所有写入型动作都经过用户确认
- 工具能力受限且可审计

## 风险
- 工具编排会显著提高后端复杂度
- 不做限制很容易演化成不可控系统

---

## 六、MVP 与后续增强的边界

## 6.1 MVP 必须做的内容
以下建议作为第一批落地范围：

1. 编辑器内 Agent 入口
2. AgentContext 构建
3. `agent/plan` 接口
4. `agent/patch` 接口
5. patch 预览
6. 用户确认应用
7. 撤销上一次 AI 修改
8. 基础 trace / 耗时记录
9. 错误摘要纳入 Agent 上下文

## 6.2 暂不进入 MVP 的内容
以下内容放到后续增强：

1. 完整多轮会话记忆
2. 跨 Pen 上下文引用
3. 精细化 range patch 自动合并
4. 自动失败恢复
5. 团队协作式 AI 审阅
6. 自动保存 / 自动提交

---

## 七、推荐的技术决策

为了降低第一版复杂度，建议直接采用以下决策：

### 7.1 patch 粒度
**MVP 先做整块级 patch，不先做 range patch。**

理由：
- 实现更稳
- 更容易预览
- 更容易回滚
- 更适合当前项目先验证 Agent 工作流

### 7.2 回滚策略
**MVP 先做前端内存级回滚，再补后端持久化 revision。**

理由：
- 更快验证体验
- 不会阻塞前端 Agent 主流程

### 7.3 Agent 入口位置
**Agent 主入口放在 `Editor.tsx` 顶部工具栏，右侧打开固定面板。**

理由：
- 不破坏当前页面结构
- 适合长期演进成工作区

### 7.4 错误修复能力
**错误修复不再单独做一条功能线，而是并入 Agent 的通用计划/patch 流程。**

理由：
- 更统一
- 更接近真正 Agent
- 后续不容易维护两套 AI 逻辑

---

## 八、可观测性与安全边界

## 8.1 需要记录的指标
- plan 请求数
- patch 请求数
- patch 应用成功率
- patch 回滚率
- 平均 plan 耗时
- 平均 patch 生成耗时
- 用户确认率
- 用户拒绝率
- 平均改动大小

## 8.2 需要记录的事件
- `agent_request_started`
- `agent_plan_generated`
- `agent_patch_generated`
- `agent_patch_confirmed`
- `agent_patch_applied`
- `agent_patch_rolled_back`
- `agent_request_failed`

## 8.3 必须设置的安全边界
- 只允许修改当前 Pen 的 html / css / js
- 限制单次 patch 最大字符数
- 限制单次可修改区块数
- 大改动必须二次确认
- 禁止未确认直接保存
- 禁止访问其他用户 Pen 数据

---

## 九、文件级落地建议

## 后端建议新增/调整
### 新增文件
- `FeiShu-Codepen-Backend/src/routes/agent.js`
- `FeiShu-Codepen-Backend/src/services/agentService.js`
- `FeiShu-Codepen-Backend/src/services/agentPromptService.js`
- `FeiShu-Codepen-Backend/src/services/agentOrchestrator.js`
- `FeiShu-Codepen-Backend/src/services/agentTools.js`
- `FeiShu-Codepen-Backend/src/services/agentGuardrails.js`
- `FeiShu-Codepen-Backend/src/models/AgentSession.js`
- `FeiShu-Codepen-Backend/src/models/PenRevision.js`

### 修改文件
- `FeiShu-Codepen-Backend/src/index.js`
- `FeiShu-Codepen-Backend/src/routes/ai.js`

## 前端建议新增/调整
### 新增文件
- `FeiShu-Codepen-Frontend/src/services/agentService.ts`
- `FeiShu-Codepen-Frontend/src/services/agentContextBuilder.ts`
- `FeiShu-Codepen-Frontend/src/services/patchService.ts`
- `FeiShu-Codepen-Frontend/src/components/AIAgentPanel.tsx`
- `FeiShu-Codepen-Frontend/src/components/AIPatchPreview.tsx`
- `FeiShu-Codepen-Frontend/src/components/AIPlanCard.tsx`

### 修改文件
- `FeiShu-Codepen-Frontend/src/components/Editor.tsx`
- `FeiShu-Codepen-Frontend/src/services/aiService.ts`
- `FeiShu-Codepen-Frontend/src/services/lintService.ts`

---

## 十、验收标准

## 功能验收
- 编辑器页可直接唤起 Agent
- Agent 能读取当前 Pen
- Agent 首先输出计划
- Agent 能生成 patch 提案
- 用户确认后才应用 patch
- 支持撤销上一次 AI 修改
- 错误修复纳入 Agent 主流程

## 质量验收
- 不破坏现有 AI 生成新 Pen 功能
- 不破坏现有保存 / 加载 / 分享 / 导入 Pen 流程
- patch 应用失败时有明确错误提示
- 大改动不会静默执行

## 产品体验验收
- 用户能理解 Agent 的下一步动作
- 改动是可看见、可确认、可撤销的
- 产品形态更像 IDE 内协作 Agent，而不是聊天机器人

---

## 十一、最终结论

这次调整后的方向可以概括为一句话：

**不再做“阶段 2 聊天助手”和“阶段 3 独立错误修复”，而是统一升级为一个围绕当前 Pen 运作的受控型 AI Agent。**

它的核心不是“能聊天”，而是：

- **能读上下文**
- **能先规划**
- **能提 patch**
- **能让用户确认**
- **能回滚**
- **能被观测与限制**

这条路线比原来的阶段 2 / 3 更统一，也更接近真正的 Agent 项目形态。