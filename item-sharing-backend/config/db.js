const mongoose = require('mongoose');
require('dotenv').config();

// 连接到MongoDB数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB连接成功');
  } catch (err) {
    console.error('MongoDB连接失败:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB; 