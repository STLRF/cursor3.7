const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 生成JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    注册新用户
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { nickname, username, password, confirmPassword } = req.body;

    // 验证所有字段是否存在
    if (!nickname || !username || !password || !confirmPassword) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    // 验证两次密码是否一致
    if (password !== confirmPassword) {
      return res.status(400).json({ message: '两次输入的密码不一致' });
    }

    // 检查用户名是否已存在
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: '该账号已被注册' });
    }

    // 检查昵称是否已存在
    const nicknameExists = await User.findOne({ nickname });
    if (nicknameExists) {
      return res.status(400).json({ message: '该昵称已被使用' });
    }

    // 创建新用户
    const user = await User.create({
      nickname,
      username,
      password,
    });

    if (user) {
      // 生成JWT
      const token = generateToken(user._id);

      // 返回用户信息
      res.status(201).json({
        _id: user._id,
        nickname: user.nickname,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        token,
      });
    } else {
      res.status(400).json({ message: '用户创建失败' });
    }
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    用户登录
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 检查用户是否存在
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: '账号未注册' });
    }

    // 验证密码
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: '密码错误' });
    }

    // 生成JWT
    const token = generateToken(user._id);

    // 返回用户信息
    res.json({
      _id: user._id,
      nickname: user.nickname,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      token,
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取用户个人资料
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // req.user由auth中间件添加
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('items');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: '用户不存在' });
    }
  } catch (error) {
    console.error('获取用户资料错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    更新用户个人资料
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // 更新用户信息
      user.nickname = req.body.nickname || user.nickname;
      user.bio = req.body.bio || user.bio;

      // 如果上传了头像
      if (req.file) {
        user.avatar = req.file.filename;
      }

      // 如果提供了新密码
      if (req.body.password) {
        user.password = req.body.password;
      }

      // 保存更新
      const updatedUser = await user.save();

      // 生成新的JWT
      const token = generateToken(updatedUser._id);

      // 返回更新后的用户信息
      res.json({
        _id: updatedUser._id,
        nickname: updatedUser.nickname,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        token,
      });
    } else {
      res.status(404).json({ message: '用户不存在' });
    }
  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取其他用户资料
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('items');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: '用户不存在' });
    }
  } catch (error) {
    console.error('获取用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserById,
}; 