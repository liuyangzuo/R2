const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const imageRoutes = require('./routes/imageRoutes');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/api/images', imageRoutes);

// 首页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('应用错误:', err.stack);
  res.status(500).json({
    error: '服务器错误',
    message: process.env.NODE_ENV === 'production' ? '发生内部错误' : err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 