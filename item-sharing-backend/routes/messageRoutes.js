const express = require('express');
const {
  getUserMessages,
  getChatWithUser,
  sendMessage,
  markMessageAsRead,
  getUnreadCount
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 所有消息路由都需要登录
router.use(protect);

// 获取用户所有消息
router.get('/', getUserMessages);

// 获取未读消息数量
router.get('/unread-count', getUnreadCount);

// 获取与特定用户的聊天记录
router.get('/chat/:userId', getChatWithUser);

// 发送新消息
router.post('/', sendMessage);

// 标记消息为已读
router.put('/:id/read', markMessageAsRead);

module.exports = router; 