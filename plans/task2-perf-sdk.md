# Task 2: 前端性能监控 SDK 开发文档

> 独立开发，不依赖 Task 1/3。与 Task 1/3 的整合点见文末。

---

## 目标

实现一个轻量级前端性能监控 SDK（`perfSDK.ts`），覆盖以下场景：
1. **编译管线耗时**：Babel/TS/Sass/Vue SFC 四条链路
2. **预览刷新性能**：全量重建 vs 增量更新的耗时对比
3. **补全响应延迟**：三层补全的分层计时
4. **Web Vitals**：激活现有的 LCP/FCP/TTFB 采集
5. **SSE 流式指标**（整合阶段接入，Task 1 完成后）

---

## SDK 设计

### 新建 `src/services/perfSDK.ts`

```typescript
type MetricName =
  | 'compile_babel_ms'
  | 'compile_ts_ms'
  | 'compile_sass_ms'
  | 'compile_less_ms'
  | 'compile_vue_sfc_ms'
  | 'preview_full_rebuild_ms'
  | 'preview_incremental_update_ms'
  | 'completion_snippet_ms'
  | 'completion_ts_worker_ms'
  | 'completion_total_ms'
  | 'sse_ttfb_ms'
  | 'sse_render_lag_ms'
  | 'sse_total_ms';

interface MetricEntry {
  value: number;
  timestamp: number;
}

class PerfSDK {
  private metrics = new Map<MetricName, MetricEntry[]>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly FLUSH_INTERVAL = 10_000; // 10s 批量上报

  record(name: MetricName, value: number): void {
    if (!this.metrics.has(name)) this.metrics.set(name, []);
    this.metrics.get(name)!.push({ value, timestamp: Date.now() });
    this.scheduleFlush();
  }

  measure<T>(name: MetricName, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    this.record(name, performance.now() - start);
    return result;
  }

  async measureAsync<T>(name: MetricName, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    this.record(name, performance.now() - start);
    return result;
  }

  // 获取某指标的统计摘要
  getSummary(name: MetricName): { count: number; avg: number; p95: number; max: number } | null {
    const entries = this.metrics.get(name);
    if (!entries || entries.length === 0) return null;
    const values = entries.map(e => e.value).sort((a, b) => a - b);
    return {
      count: values.length,
      avg: values.reduce((s, v) => s + v, 0) / values.length,
      p95: values[Math.floor(values.length * 0.95)],
      max: values[values.length - 1],
    };
  }

  // 获取所有指标摘要（用于上报）
  getAllSummaries() {
    const result: Record<string, ReturnType<PerfSDK['getSummary']>> = {};
    for (const [name] of this.metrics) {
      result[name] = this.getSummary(name);
    }
    return result;
  }

  private scheduleFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flush();
      this.flushTimer = null;
    }, this.FLUSH_INTERVAL);
  }

  private async flush() {
    const summaries = this.getAllSummaries();
    if (Object.keys(summaries).length === 0) return;
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: summaries, userAgent: navigator.userAgent }),
        keepalive: true,
      });
    } catch {
      // 上报失败静默处理，不影响主流程
    }
    this.metrics.clear();
  }
}

export const perf = new PerfSDK();
```

---

## 接入点 1：编译管线计时

文件：`src/services/compilerService.ts`

改动方式：在每个编译函数内用 `perf.measure` 包裹核心逻辑。

```typescript
import { perf } from './perfSDK';

// compileReact（第 73 行）
export const compileReact = (code: string): CompilationResult => {
  return perf.measure('compile_babel_ms', () => {
    try {
      const result = Babel.transform(code, { presets: [["react", { runtime: "classic" }]] });
      return { code: result.code || "" };
    } catch (error) {
      return { code: "", error: error instanceof Error ? error.message : "Unknown", errorDetails: error };
    }
  });
};

// compileTypeScript（第 16 行）—— 异步版本
export const compileTypeScript = async (code: string): Promise<CompilationResult> => {
  return perf.measureAsync('compile_ts_ms', async () => {
    // ... 原有逻辑不变
  });
};

// compileCssFramework（第 216 行）—— 区分 scss/less
export const compileCssFramework = async (code: string, language: 'css' | 'scss' | 'less') => {
  const metricName = language === 'scss' ? 'compile_sass_ms' : 'compile_less_ms';
  if (language === 'css') return { code };
  return perf.measureAsync(metricName, async () => {
    // ... 原有逻辑不变
  });
};

// compileSFCVue（第 96 行）
export const compileSFCVue = (code: string): CompilationResult => {
  return perf.measure('compile_vue_sfc_ms', () => {
    // ... 原有逻辑不变
  });
};
```

**改动量：** 4 处，每处增加 1-2 行包裹代码，不改变任何业务逻辑。

---

## 接入点 2：预览刷新计时

文件：`src/components/Preview.tsx`

需要在两条更新路径分别打点。

```typescript
import { perf } from '../services/perfSDK';

// 全量重建路径（找到 doc.open() 调用处）
const rebuildStart = performance.now();
doc.open();
doc.write(htmlContent);
doc.close();
perf.record('preview_full_rebuild_ms', performance.now() - rebuildStart);

// 增量更新路径（找到 window.executeUserCode 调用处）
const incrStart = performance.now();
iframeWindow.executeUserCode(newCode);
perf.record('preview_incremental_update_ms', performance.now() - incrStart);
```

**改动量：** 2 处，各增加 2 行。

---

## 接入点 3：补全响应计时

文件：`src/services/completion/completionProvider.ts`

在补全函数入口和出口打点：

```typescript
import { perf } from '../perfSDK';

// 在 completionSource 函数内
const start = performance.now();
const snippetResults = await snippetCompletion(context);
perf.record('completion_snippet_ms', performance.now() - start);

const tsStart = performance.now();
const tsResults = await tsWorkerCompletion(context);
perf.record('completion_ts_worker_ms', performance.now() - tsStart);

perf.record('completion_total_ms', performance.now() - start);
```

---

## 接入点 4：激活 Web Vitals

文件：`src/index.tsx`（第 16 行）

```typescript
// 改造前
reportWebVitals();

// 改造后
reportWebVitals((metric) => {
  perf.record(metric.name.toLowerCase() as any, metric.value);
  // 同时打印到控制台，方便开发阶段观察
  if (process.env.NODE_ENV === 'development') {
    console.log(`[WebVitals] ${metric.name}: ${metric.value.toFixed(1)}ms`);
  }
});
```

---

## 接入点 5：SSE 流式指标（整合阶段）

Task 1 的 `aiService.ts` 完成后，在 SSE 读取循环中接入：

```typescript
import { perf } from './perfSDK';

export async function generateCode(prompt: string, onChunk: (text: string) => void) {
  const requestStart = performance.now();
  let firstChunkReceived = false;
  let lastChunkTime = requestStart;

  const response = await fetch('/api/ai/generate', { ... });
  const reader = response.body!.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const now = performance.now();

    if (!firstChunkReceived) {
      perf.record('sse_ttfb_ms', now - requestStart);  // 首字节时间
      firstChunkReceived = true;
    }

    // 解析 chunk，调用 onChunk
    const chunkStart = performance.now();
    onChunk(parseChunk(value));
    perf.record('sse_render_lag_ms', performance.now() - chunkStart);  // 渲染延迟

    lastChunkTime = now;
  }

  perf.record('sse_total_ms', lastChunkTime - requestStart);  // 总耗时
}
```

---

## 后端：指标接收接口

文件：`FeiShu-Codepen-Backend/src/routes/metrics.js`（新增）

```javascript
const express = require('express');
const router = express.Router();

// 内存存储（生产环境可替换为 MongoDB）
const metricsStore = [];

router.post('/', (req, res) => {
  const { metrics, userAgent } = req.body;
  metricsStore.push({ metrics, userAgent, receivedAt: new Date() });
  // 只保留最近 1000 条
  if (metricsStore.length > 1000) metricsStore.shift();
  res.json({ ok: true });
});

// 查询接口（开发调试用）
router.get('/summary', (req, res) => {
  res.json(metricsStore.slice(-10));
});

module.exports = router;
```

在 `src/index.js` 注册：
```javascript
app.use('/api/metrics', require('./routes/metrics'));
```

---

## 编译缓存优化（可量化的性能提升）

在 `compilerService.ts` 中加入 Map 缓存，这是最容易量化的优化：

```typescript
const compileCache = new Map<string, CompilationResult>();

export const compileReact = (code: string): CompilationResult => {
  const cacheKey = `babel:${code}`;
  if (compileCache.has(cacheKey)) {
    perf.record('compile_babel_ms', 0); // 缓存命中，耗时为 0
    return compileCache.get(cacheKey)!;
  }
  const result = perf.measure('compile_babel_ms', () => { /* 原有逻辑 */ });
  compileCache.set(cacheKey, result);
  // 防止缓存无限增长
  if (compileCache.size > 50) {
    const firstKey = compileCache.keys().next().value;
    compileCache.delete(firstKey);
  }
  return result;
};
```

**量化方式：** 统计缓存命中次数 / 总编译次数 = 命中率，对比有无缓存的平均编译耗时。

---

## 开发调试面板（可选）

新建 `src/components/PerfDebugPanel.tsx`（仅 development 环境显示）：

```typescript
// 悬浮在右下角，显示实时指标
// 快捷键 Ctrl+Shift+P 切换显示
```

---

## 与 Task 1/3 的整合点

| 整合项 | 时机 | 说明 |
|--------|------|------|
| SSE 指标接入 | Task 1 阶段 1 完成后 | 在 `aiService.ts` 的 SSE 读取循环中调用 `perf.record` |
| 指标数据展示 | Task 3 完成后 | Task 3 的性能报告页面读取 `/api/metrics/summary` |
| LCP 优化验证 | Task 3 完成后 | Web Vitals 数据作为 Task 3 优化效果的量化依据 |

---

## 文件变更清单

### 新增文件
- `FeiShu-Codepen-Frontend/src/services/perfSDK.ts`
- `FeiShu-Codepen-Backend/src/routes/metrics.js`

### 修改文件
- `FeiShu-Codepen-Frontend/src/services/compilerService.ts`（4 处，各 +2 行）
- `FeiShu-Codepen-Frontend/src/components/Preview.tsx`（2 处，各 +2 行）
- `FeiShu-Codepen-Frontend/src/services/completion/completionProvider.ts`（+6 行）
- `FeiShu-Codepen-Frontend/src/index.tsx`（第 16 行，修改 reportWebVitals 调用）
- `FeiShu-Codepen-Backend/src/index.js`（注册 metrics 路由）
