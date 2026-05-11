const express = require('express');
const request = require('supertest');

const mockAuth = jest.fn((req, res, next) => {
  req.user = { id: 'user-1', username: 'tester' };
  next();
});

const mockStream = {
  on: jest.fn(),
  finalMessage: jest.fn(),
  abort: jest.fn(),
};

const mockMessagesStream = jest.fn(() => mockStream);
const mockAnthropic = jest.fn(() => ({
  messages: {
    stream: mockMessagesStream,
  },
}));

jest.mock('../middleware/auth', () => mockAuth);
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: mockAnthropic,
  Anthropic: mockAnthropic,
}));

function buildApp() {
  let aiRouter;
  jest.isolateModules(() => {
    aiRouter = require('../routes/ai');
  });

  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRouter);
  return app;
}

describe('POST /api/ai/generate', () => {
  const originalApiKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    jest.clearAllMocks();
    mockStream.__aborted = false;
    mockStream.__textHandler = undefined;
    mockStream.on.mockImplementation((event, handler) => {
      if (event === 'text') {
        mockStream.__textHandler = handler;
      }
      return mockStream;
    });
    mockStream.abort.mockImplementation(() => {
      mockStream.__aborted = true;
    });
    mockStream.finalMessage.mockImplementation(async () => {
      if (mockStream.__aborted) {
        throw new Error('Request was aborted.');
      }
      if (mockStream.__textHandler) {
        mockStream.__textHandler('{"title":"Todo Demo",');
        mockStream.__textHandler('"html":"<div>demo</div>","css":"body{}","js":"console.log(1)"}');
      }
      return { content: [] };
    });
  });

  afterAll(() => {
    if (originalApiKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
      return;
    }
    process.env.ANTHROPIC_API_KEY = originalApiKey;
  });

  it('缺少 prompt 时返回 400', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/ai/generate').send({ prompt: '   ' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: '请输入生成描述' });
    expect(mockMessagesStream).not.toHaveBeenCalled();
  });

  it('未配置 ANTHROPIC_API_KEY 时返回 500', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const app = buildApp();
    const res = await request(app).post('/api/ai/generate').send({ prompt: '生成一个待办应用' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: '服务端未配置 ANTHROPIC_API_KEY' });
    expect(mockMessagesStream).not.toHaveBeenCalled();
  });

  it('成功时按 SSE 返回 delta 和 DONE', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/ai/generate').send({ prompt: '生成一个待办应用' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.text).toContain('data: {"delta":"{');
    expect(res.text).toContain('Todo Demo');
    expect(res.text).toContain('data: [DONE]');
    expect(mockStream.abort).not.toHaveBeenCalled();
    expect(mockMessagesStream).toHaveBeenCalledWith(expect.objectContaining({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: '生成一个待办应用' }],
    }));
  });

  it('流式生成失败时返回 SSE error 事件', async () => {
    mockStream.finalMessage.mockRejectedValueOnce(new Error('anthropic failed'));
    const app = buildApp();
    const res = await request(app).post('/api/ai/generate').send({ prompt: '生成一个待办应用' });

    expect(res.status).toBe(200);
    expect(res.text).toContain('anthropic failed');
    expect(res.text).toContain('data: {"error":"anthropic failed"}');
  });
});
