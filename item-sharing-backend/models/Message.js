const mongoose = require('mongoose');

// 消息模型架构
const messageSchema = new mongoose.Schema(
  {
    // 发送者
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 接收者
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 消息内容
    content: {
      type: String,
      required: true,
    },
    // 相关物品(如果有)
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null,
    },
    // 消息类型: 0-普通消息, 1-借用请求, 2-借用确认, 3-归还请求, 4-归还确认
    type: {
      type: Number,
      default: 0,
    },
    // 已读状态
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema); 