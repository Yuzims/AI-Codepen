# Task 1 - Phase A：单轮 Agent MVP 可直接开发任务清单

> 本文档是 `task1-ai-agent-evolution-plan.md` 的 Phase A 细化版。
>
> 目标：供下个会话直接读取后进入开发，不再重复做需求分析。

---

## 一、已明确决策

- 本次只实现 **Phase A：单轮 Agent MVP（计划优先）**。
- Phase A 产品形态固定为：
  - 在 `Editor` 页面内打开 Agent 面板
  - 用户输入指令
  - Agent 读取当前 Pen 上下文
  - 后端返回结构化计划
  - 前端展示计划
  - **不直接改代码**
- Phase A 输出结果固定为：
  - `summary`
  - `goal`
  - `targets`
  - `steps`
  - `risks`
- 当前阶段 **不做**：
  - patch 生成
  - patch 应用
  - 回滚
  - 多轮会话
  - 独立 AI 修错功能线
  - Agent session 持久化
  - SSE 版计划流式展示
- 当前已有 AI 生成链路必须保留，不能破坏：
  - 后端 [src/routes/ai.js](../../FeiShu-Codepen-Backend/src/routes/ai.js)
  - 前端 [src/services/aiService.ts](../../FeiShu-Codepen-Frontend/src/services/aiService.ts)
- 推荐本阶段 `agent/plan` 使用 **普通 JSON 返回**，不使用 SSE。
- 推荐切换 Pen 后 **清空当前 Agent 计划结果**。
- 推荐错误摘要在首版 **先只传 JS 错误**，HTML/CSS 后续再补。

---

## 二、Phase A 目标边界

## 2.1 本阶段要做什么

实现一个最小可用的“编辑器内 Agent 计划能力”：

1. 在编辑器页增加 Agent 按钮。
2. 点击后打开右侧 Agent 面板。
3. 用户输入一句指令。
4. 前端读取当前 Pen 上下文：
   - `title`
   - `penId`
   - `html`
   - `css`
   - `js`
   - `cssLanguage`
   - `jsLanguage`
   - `selection`（可为空）
   - `errors`（首版先传 JS 错误摘要）
5. 后端返回结构化计划。
6. 前端展示计划内容。
7. 整个流程 **不会修改当前代码**。

## 2.2 本阶段明确不做什么

- 不生成 patch
- 不应用 patch
- 不保存 Agent 会话
- 不保存 Agent 计划到数据库
- 不在编辑器中自动写入任何内容
- 不实现回滚
- 不实现多轮上下文
- 不实现独立 `/fix` 接口
- 不实现独立聊天助手模式
- 不接入任意工具调用编排
- 不要求读取 HTML/CSS 全量错误上下文

## 2.3 完成标志

当以下条件全部满足时，Phase A 可视为完成：

- 用户可在编辑器页面打开 Agent 面板。
- 提交指令后，后端能收到当前 Pen 上下文。
- 后端返回结构化计划而不是代码。
- 前端成功展示 `summary / goal / targets / steps / risks`。
- 发起 Agent 请求后，当前 `html/css/js` 内容不发生变化。
- 原有 AI 生成新 Pen 功能不受影响。

---

## 三、接口契约

## 3.1 请求路径

```http
POST /api/ai/agent/plan
Authorization: Bearer <token>
Content-Type: application/json
```

## 3.2 请求体

```ts
export interface AgentPlanRequest {
  penId?: string;
  title?: string;
  html: string;
  css: string;
  js: string;
  cssLanguage?: 'css' | 'scss' | 'less';
  jsLanguage?: 'js' | 'react' | 'vue' | 'ts';
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

## 3.3 响应体

```ts
export interface AgentPlanResponse {
  traceId: string;
  plan: {
    summary: string;
    goal: string;
    targets: Array<'html' | 'css' | 'js'>;
    steps: string[];
    risks: string[];
  };
}
```

## 3.4 错误响应

```ts
export interface ErrorResponse {
  message: string;
  traceId?: string;
}
```

## 3.5 字段约束

- `userInstruction`：必填，`trim()` 后不能为空，建议最大 1000 字符
- `html/css/js`：允许为空字符串，但必须是字符串
- `errors`：最多传前 20 条
- `selection`：允许为 `null`
- `targets`：只允许 `html | css | js`
- `steps`：建议 3~6 条
- `risks`：建议 1~4 条

---

## 四、建议新增 / 修改文件

## 4.1 后端新增

- [src/routes/agent.js](../../FeiShu-Codepen-Backend/src/routes/agent.js)
- [src/services/agentService.js](../../FeiShu-Codepen-Backend/src/services/agentService.js)
- [src/services/agentPromptService.js](../../FeiShu-Codepen-Backend/src/services/agentPromptService.js)

## 4.2 后端修改

- [src/index.js](../../FeiShu-Codepen-Backend/src/index.js)

## 4.3 前端新增

- [src/services/agentService.ts](../../FeiShu-Codepen-Frontend/src/services/agentService.ts)
- [src/services/agentContextBuilder.ts](../../FeiShu-Codepen-Frontend/src/services/agentContextBuilder.ts)
- [src/components/AIAgentPanel.tsx](../../FeiShu-Codepen-Frontend/src/components/AIAgentPanel.tsx)

## 4.4 前端修改

- [src/components/Editor.tsx](../../FeiShu-Codepen-Frontend/src/components/Editor.tsx)

## 4.5 本阶段暂不新增

以下文件属于后续阶段，不要在 Phase A 里展开：

- `agentOrchestrator.js`
- `agentTools.js`
- `agentGuardrails.js`
- `patchService.ts`
- `AIPatchPreview.tsx`
- `PenRevision.js`
- `AgentSession.js`

---

## 五、可直接开发的任务清单

# A1：后端新增 `/api/ai/agent/plan` 路由

## 目标
建立独立 Agent 计划接口，不污染现有 `/api/ai/generate`。

## 改动文件
- 新增：[src/routes/agent.js](../../FeiShu-Codepen-Backend/src/routes/agent.js)
- 修改：[src/index.js](../../FeiShu-Codepen-Backend/src/index.js)

## 具体改动点

1. 在 `src/routes/agent.js` 中：
   - 引入 `express`
   - 引入现有鉴权中间件 `auth`
   - 引入 `agentService`
   - 定义 `POST /plan`

2. 基础参数校验：
   - `userInstruction` 必填
   - `html/css/js` 必须为字符串
   - `selection` / `errors` 如果存在，要校验结构

3. 生成 `traceId`
   - 推荐格式：`agent-plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

4. 调用 `agentService.generatePlan()`

5. 返回标准 JSON：
   ```json
   {
     "traceId": "...",
     "plan": {
       "summary": "...",
       "goal": "...",
       "targets": ["html"],
       "steps": ["..."],
       "risks": ["..."]
     }
   }
   ```

6. `src/index.js` 中挂载：
   ```js
   app.use('/api/ai/agent', require('./routes/agent'));
   ```

## 验收标准
- `/api/ai/agent/plan` 可访问
- 鉴权有效
- 非法请求返回 400
- 成功返回 `traceId + plan`
- 不影响现有 `/api/ai/generate`

---

# A2：后端新增 Agent 服务层与 Prompt 层

## 目标
把路由层、Prompt 拼装、模型调用、结果解析拆开，方便后续扩展。

## 改动文件
- 新增：[src/services/agentService.js](../../FeiShu-Codepen-Backend/src/services/agentService.js)
- 新增：[src/services/agentPromptService.js](../../FeiShu-Codepen-Backend/src/services/agentPromptService.js)

## 具体改动点

### `agentPromptService.js`
负责：
- 生成 system prompt
- 拼装 user 内容
- 强约束模型只输出计划 JSON

### prompt 约束重点
必须明确告诉模型：
- 你是在线代码编辑器里的单轮 Agent 规划助手
- 你只能输出 **计划**，不能输出 patch，不能输出完整代码
- 只能返回 JSON
- `targets` 只能从 `html/css/js` 中选
- `steps` 是“准备怎么做”，不是“已经做了什么”
- `risks` 要具体，不要泛泛而谈

### 建议输出 JSON 结构
```json
{
  "summary": "一句话总结",
  "goal": "明确目标",
  "targets": ["html", "js"],
  "steps": ["步骤1", "步骤2", "步骤3"],
  "risks": ["风险1", "风险2"]
}
```

### `agentService.js`
负责：
- 调用 Anthropic SDK
- 读取 `ANTHROPIC_API_KEY`
- 发送请求
- 解析模型输出 JSON
- 校验返回字段
- 输出标准结构

### 兜底策略
- 模型返回非 JSON -> 抛出标准错误
- 缺字段 -> 抛出标准错误
- `targets` 不合法 -> 抛出标准错误

## 验收标准
- service 层可独立复用
- 路由层不包含大段 prompt
- 输出字段稳定
- 模型异常时能给出明确错误

---

# A3：后端增加最小可观测性与保护

## 目标
确保联调期能快速定位问题，并避免请求体无限膨胀。

## 改动文件
- 修改：[src/routes/agent.js](../../FeiShu-Codepen-Backend/src/routes/agent.js)
- 修改：[src/services/agentService.js](../../FeiShu-Codepen-Backend/src/services/agentService.js)

## 具体改动点

1. 记录最小日志：
   - `traceId`
   - `penId`
   - `title`
   - `userInstruction.length`
   - `html/css/js` 长度
   - `errors.length`

2. 增加限制：
   - `userInstruction` 长度上限
   - `html/css/js` 总长度上限
   - `errors` 数量上限

3. 错误响应带回 `traceId`

## 验收标准
- 后端报错可定位到 `traceId`
- 超长输入被拒绝
- 错误提示对联调有帮助

---

# A4：前端新增 `agentService.ts`

## 目标
把 Agent plan 请求封装成独立服务，避免请求细节堆进 `Editor.tsx`。

## 改动文件
- 新增：[src/services/agentService.ts](../../FeiShu-Codepen-Frontend/src/services/agentService.ts)

## 具体改动点

1. 参考 [src/services/aiService.ts](../../FeiShu-Codepen-Frontend/src/services/aiService.ts) 现有方式：
   - 获取 baseURL
   - 读取 token
   - 发起 fetch

2. 新增方法：
   ```ts
   requestAgentPlan(payload, signal?)
   ```

3. 统一处理：
   - 非 2xx 响应
   - 标准 `message` 提取
   - JSON 解析

4. 当前不使用 SSE

## 验收标准
- 可正常请求 `/api/ai/agent/plan`
- 失败 message 能正确展示
- 与现有 `aiService.ts` 职责分开

---

# A5：前端新增 `agentContextBuilder.ts`

## 目标
把当前编辑器状态整理成稳定请求体，避免 `Editor.tsx` 里手写拼装逻辑。

## 改动文件
- 新增：[src/services/agentContextBuilder.ts](../../FeiShu-Codepen-Frontend/src/services/agentContextBuilder.ts)

## 具体改动点

1. 输入参数建议包含：
   - `currentPen`
   - `title`
   - `htmlCode`
   - `cssCode`
   - `jsCode`
   - `cssLanguage`
   - `jsLanguage`
   - 当前编辑器实例 / 选区信息
   - 错误摘要
   - `userInstruction`

2. 输出 `AgentPlanRequest`

3. 首版选区策略：
   - 能拿到就传
   - 拿不到就传 `selection: null`
   - 不因选区阻塞 Phase A

4. 首版错误摘要策略：
   - 先只传 JS 错误
   - 最多前 10~20 条
   - 只保留必要字段

5. 长文本保护：
   - 对非常长的字段做截断或条数限制

## 验收标准
- 能稳定生成请求体
- 没有强依赖 patch / 回滚逻辑
- 选区拿不到时仍能请求成功

---

# A6：前端新增 `AIAgentPanel.tsx`

## 目标
提供最小可用的 Agent 面板 UI。

## 改动文件
- 新增：[src/components/AIAgentPanel.tsx](../../FeiShu-Codepen-Frontend/src/components/AIAgentPanel.tsx)

## 具体改动点

1. 面板至少包含：
   - 标题区
   - 指令输入框
   - 提交按钮
   - loading 状态
   - 错误提示区
   - 计划展示区

2. 计划展示区渲染字段：
   - `summary`
   - `goal`
   - `targets`
   - `steps`
   - `risks`

3. 空状态提示：
   - 提示用户输入一个修改目标或问题描述

4. loading 文案：
   - `正在生成计划...`

5. 固定提示：
   - `本阶段仅生成计划，不会直接修改代码`

## 推荐组件状态
```ts
type AgentPanelState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: AgentPlanResponse }
  | { status: 'error'; message: string };
```

## 验收标准
- 支持 idle / loading / success / error 四态
- UI 能清楚传达“只做计划，不改代码”
- 结果区域结构清晰可读

---

# A7：在 `Editor.tsx` 接入 Agent 面板

## 目标
打通从编辑器状态到 Agent 计划展示的完整主流程。

## 改动文件
- 修改：[src/components/Editor.tsx](../../FeiShu-Codepen-Frontend/src/components/Editor.tsx)

## 具体改动点

1. 新增状态：
   - `isAgentPanelOpen`
   - `agentPlanState`

2. 顶部工具栏增加 Agent 按钮

3. 点击按钮打开右侧面板

4. 提交时流程：
   - 用 `agentContextBuilder` 组装请求体
   - 调用 `requestAgentPlan`
   - 写入 `agentPlanState`

5. 明确禁止本阶段做的事：
   - 不修改 `htmlCode/cssCode/jsCode`
   - 不触发保存
   - 不创建新 Pen

6. 切换 Pen 时：
   - 清空当前 Agent 结果

## 验收标准
- 在 Editor 页面能打开 Agent 面板
- 输入指令后能请求并展示计划
- 切换 Pen 后不会残留旧结果
- 不影响原编辑器主流程

---

# A8：联调与收口

## 目标
让下个会话开发助手能按顺序推进，不在联调时反复返工。

## 联调顺序

1. 后端先返回 mock plan，验证接口结构
2. 前端完成 `agentService.ts`
3. 前端完成 `agentContextBuilder.ts`
4. 前端完成 `AIAgentPanel.tsx`
5. `Editor.tsx` 接入面板与按钮
6. 后端从 mock 切到真实模型
7. 调整 prompt 与解析兜底
8. 做回归测试

## 验收标准
- mock -> 真模型切换顺利
- 计划结构稳定
- 原有 AI 生成功能仍正常

---

## 六、最小 mock 数据

## 6.1 mock request

```ts
const mockAgentPlanRequest = {
  penId: 'pen_001',
  title: 'Todo Demo',
  html: '<div id="app"><button id="add-btn">Add</button><ul id="list"></ul></div>',
  css: 'body { font-family: sans-serif; }',
  js: 'document.getElementById("add-btn").addEventListener("click", () => console.log("click"))',
  cssLanguage: 'css',
  jsLanguage: 'js',
  selection: null,
  errors: [
    {
      target: 'js',
      severity: 'warning',
      message: '建议补充空列表提示逻辑',
      line: 1,
      column: 1
    }
  ],
  userInstruction: '帮我规划一下，给这个页面加一个输入框，支持新增待办项，但先不要直接改代码'
};
```

## 6.2 mock response

```ts
const mockAgentPlanResponse = {
  traceId: 'agent-plan-local-001',
  plan: {
    summary: '准备将当前页面扩展为一个最小可用的待办录入界面。',
    goal: '在保留现有按钮和列表结构的前提下，增加输入能力并规划新增待办项的交互流程。',
    targets: ['html', 'js', 'css'],
    steps: [
      '确认输入框应插入在按钮前还是按钮后，并保持当前容器结构清晰。',
      '补充一个文本输入框和必要的占位提示，用于录入待办内容。',
      '调整按钮点击逻辑，使其在输入内容有效时向列表追加新项目。',
      '补充基础样式，保证输入框、按钮和列表之间有可读的间距。'
    ],
    risks: [
      '当前 JS 逻辑较简略，新增列表追加逻辑时可能需要重构事件处理方式。',
      '如果不处理空输入，后续生成 patch 时容易出现无效待办项。'
    ]
  }
};
```

---

## 七、测试建议

## 7.1 后端测试

- `userInstruction` 为空 -> 400
- `html/css/js` 非字符串 -> 400
- 成功响应是否包含 `traceId`
- 成功响应是否包含完整 `plan`
- 模型非 JSON 输出 -> 明确报错
- 模型缺字段 -> 明确报错

## 7.2 前端测试

### `agentContextBuilder`
- 最小上下文生成正确
- `errors` 截断正确
- `selection: null` 可接受

### `agentService`
- 200 响应解析正确
- 4xx/5xx `message` 解析正确

### `AIAgentPanel`
- idle / loading / success / error 四态正确

### `Editor`
- 可打开面板
- 可提交请求
- 可展示计划
- 不修改当前代码内容

## 7.3 回归测试

- 原 AI 生成新 Pen 功能正常
- 保存功能正常
- 预览功能正常
- 语言切换正常
- 切换 Pen 正常

---

## 八、手动验证路径

## 路径 1：基础计划生成
1. 打开任意已有 Pen 编辑器页
2. 点击 Agent 按钮
3. 输入：
   `帮我规划一下，给页面增加一个更明显的标题和一个点击按钮，但先不要改代码`
4. 提交后检查：
   - 是否显示 loading
   - 是否展示计划结构
   - 是否没有改动当前代码

## 路径 2：空指令校验
1. 打开 Agent 面板
2. 不输入内容直接提交
3. 检查是否提示错误

## 路径 3：带错误上下文生成计划
1. 在 JS 编辑器中故意写一个错误
2. 输入：
   `请先分析当前代码的主要问题，并规划下一步应该怎么修改，但不要直接改代码`
3. 检查 risks 是否体现错误风险

## 路径 4：不改代码保证
1. 多次发起 Agent 请求
2. 检查 `html/css/js` 内容是否完全不变
3. 检查预览未被自动修改

## 路径 5：切换 Pen 隔离性
1. 在 Pen A 生成计划
2. 切换到 Pen B
3. 检查旧计划是否被清空

---

## 九、实现注意事项

### 9.1 `Editor.tsx` 不要继续堆逻辑
- 请求放 `agentService.ts`
- 请求体拼装放 `agentContextBuilder.ts`
- UI 渲染拆到 `AIAgentPanel.tsx`

### 9.2 选区获取不要阻塞 Phase A
- 拿不到选区时传 `selection: null`
- 先保证整个 Pen 上下文可用

### 9.3 错误摘要先轻量化
- 首版只传 JS 错误
- 限制条数
- 不追求完整错误系统整合

### 9.4 后端 JSON 解析要做硬校验
- 模型输出不稳定是高概率事件
- 一定要做字段校验和兜底错误提示

### 9.5 Agent 与原 AI 生成功能必须解耦
- `/api/ai/generate` 继续负责新 Pen 生成
- `/api/ai/agent/plan` 只负责当前 Pen 计划
- 前端入口和状态不要混用

---

## 十、下个会话开发顺序建议

下个会话读取本文件后，按下面顺序直接开发：

1. A1：后端路由
2. A2：后端 service + prompt
3. A3：后端保护与日志
4. A4：前端 `agentService.ts`
5. A5：前端 `agentContextBuilder.ts`
6. A6：前端 `AIAgentPanel.tsx`
7. A7：`Editor.tsx` 接入
8. A8：联调、测试、回归

如果中途需要缩 scope，优先保留：
- `/api/ai/agent/plan`
- `agentContextBuilder.ts`
- `AIAgentPanel.tsx`
- `Editor.tsx` 接入

可以延后但不取消的有：
- 更完整的错误摘要
- 更好的面板样式
- 更细的日志字段

---

## 十一、文档用途说明

本文件就是下个会话的直接开发依据。

下个会话开始时应优先读取：
1. [task1-phase-a-agent-mvp-todo.md](task1-phase-a-agent-mvp-todo.md)
2. [task1-ai-agent-evolution-plan.md](task1-ai-agent-evolution-plan.md)
3. 后端现有 [src/routes/ai.js](../../FeiShu-Codepen-Backend/src/routes/ai.js)
4. 前端现有 [src/components/Editor.tsx](../../FeiShu-Codepen-Frontend/src/components/Editor.tsx)
5. 前端现有 [src/services/aiService.ts](../../FeiShu-Codepen-Frontend/src/services/aiService.ts)

读取后即可直接进入开发，不需要重新讨论需求方向。