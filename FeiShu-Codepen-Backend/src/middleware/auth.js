const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 从请求头获取 token
    const token = req.header('Authorization');

    // 检查 token 是否存在
    if (!token) {
        return res.status(401).json({ message: '没有 token，授权被拒绝' });
    }

    try {
        const cleanToken = token.replace('Bearer ', '');

        // 检查token是否在黑名单中
        const { blacklistedTokens } = require('../routes/users');
        if (blacklistedTokens && blacklistedTokens.has(cleanToken)) {
            return res.status(401).json({ message: 'Token 已失效，请重新登录' });
        }

        // 验证 token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'your-secret-key');

        // 将用户添加到请求中
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token 无效' });
    }
}; 