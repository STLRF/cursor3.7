const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

// 路由导入
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const messageRoutes = require('./routes/messageRoutes');

// 连接数据库
connectDB();

// 创建Express应用
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 允许所有跨域请求
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    // 禁用缓存
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    // 允许跨域访问
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// 添加一个默认头像
app.get('/default-avatar.png', (req, res) => {
  res.redirect('https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y');
});

// 设置API路由
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/messages', messageRoutes);

// 首页路由
app.get('/', (req, res) => {
  res.send('物品借用交换平台 API 正在运行...');
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || '服务器内部错误',
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: '找不到请求的资源' });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 