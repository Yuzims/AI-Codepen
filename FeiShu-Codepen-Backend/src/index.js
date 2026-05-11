const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 中间件
app.use(cors({
    origin: ['http://localhost:8888', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:4173'],
    credentials: true
}));
app.use(express.json());

// 调试中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    next();
});

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://2967639290:wx126324@cluster0.ktitgo0.mongodb.net/';
console.log('Connecting to MongoDB:', MONGODB_URI);

// 测试MongoDB连接
const testConnection = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');

        // 测试数据库操作
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

testConnection();

// 路由
app.use('/api/pens', require('./routes/pens'));
app.use('/api/users', require('./routes/users'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/ai', require('./routes/ai'));

// 404 处理
app.use((req, res) => {
    console.log(`404 - Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Not Found' });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});
