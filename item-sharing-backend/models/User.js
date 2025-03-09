const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 用户模型架构
const userSchema = new mongoose.Schema(
  {
    nickname: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: 'default-avatar.png', // 默认头像
    },
    bio: {
      type: String,
      default: '这个人很懒，还没有写简介',
    },
    // 用户发布的物品
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
      },
    ],
    // 用户收到的消息
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    // 用户借到的物品
    borrowedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
      },
    ],
  },
  { timestamps: true }
);

// 密码加密中间件
userSchema.pre('save', async function (next) {
  // 只有密码被修改时才重新加密
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // 生成盐值并哈希密码
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密码比对方法
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 