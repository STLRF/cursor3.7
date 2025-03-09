const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证用户Token中间件
const protect = async (req, res, next) => {
  let token;

  // 从请求头或cookies中获取token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 从请求头获取
    token = req.headers.authorization.split(' ')[1];
  }

  // 如果没有token，返回未授权错误
  if (!token) {
    return res.status(401).json({ message: '未授权，请先登录' });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 获取用户信息
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: '用户不存在或token无效' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token无效，请重新登录' });
  }
};

module.exports = { protect }; 