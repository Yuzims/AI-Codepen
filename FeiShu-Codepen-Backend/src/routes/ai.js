const express = require('express');
const AnthropicModule = require('@anthropic-ai/sdk');
const auth = require('../middleware/auth');

const Anthropic = AnthropicModule.default || AnthropicModule.Anthropic || AnthropicModule;
const router = express.Router();
const client = new Anthropic();

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

const writeSse = (res, payload) => {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    res.write(`data: ${data}\n\n`);
};

router.post('/generate', auth, async (req, res) => {
    const prompt = typeof req.body.prompt === 'string' ? req.body.prompt.trim() : '';

    if (!prompt) {
        return res.status(400).json({ message: '请输入生成描述' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ message: '服务端未配置 ANTHROPIC_API_KEY' });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const stream = client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: [
            {
                type: 'text',
                text: GENERATE_SYSTEM_PROMPT,
                cache_control: { type: 'ephemeral', ttl: '5m' }
            }
        ],
        messages: [{ role: 'user', content: prompt }]
    });

    let clientDisconnected = false;

    const handleDisconnect = () => {
        if (!res.writableEnded) {
            clientDisconnected = true;
            stream.abort();
        }
    };

    res.on('close', handleDisconnect);

    try {
        stream.on('text', (text) => {
            if (!res.writableEnded) {
                writeSse(res, { delta: text });
            }
        });

        await stream.finalMessage();

        if (!res.writableEnded) {
            writeSse(res, '[DONE]');
            res.end();
        }
    } catch (error) {
        if (clientDisconnected) {
            return;
        }

        console.error('AI generate error:', error);
        if (!res.writableEnded) {
            writeSse(res, {
                error: error instanceof Error ? error.message : 'AI 生成失败'
            });
            res.end();
        }
    } finally {
        res.off('close', handleDisconnect);
    }
});

module.exports = router;
