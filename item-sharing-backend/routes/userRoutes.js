const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  getUserById 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// 注册和登录路由
router.post('/register', registerUser);
router.post('/login', loginUser);

// 个人资料路由
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

// 获取其他用户资料
router.get('/:id', getUserById);

module.exports = router; 