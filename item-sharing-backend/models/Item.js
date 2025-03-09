const mongoose = require('mongoose');

// 物品模型架构
const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    // 物品图片，至少一张
    images: [
      {
        type: String,
        required: true,
      },
    ],
    // 地区，使用数字编码，1-10表示不同地区
    region: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    // 类别，使用数字编码，1-5表示不同类别
    category: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // 物品状态: 0-可借用, 1-已借出, 2-已预约
    status: {
      type: Number,
      default: 0,
    },
    // 物品所有者
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 当前借用者
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // 点赞的用户
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // 物品评论
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema); 