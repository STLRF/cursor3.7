const Message = require('../models/Message');

// @desc    获取用户所有消息
// @route   GET /api/messages
// @access  Private
const getUserMessages = async (req, res) => {
  try {
    // 查找用户接收的消息
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'nickname avatar')
      .populate('receiver', 'nickname avatar')
      .populate('item', 'title images')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('获取消息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取与特定用户的聊天记录
// @route   GET /api/messages/chat/:userId
// @access  Private
const getChatWithUser = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    // 查找两个用户之间的消息
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'nickname avatar')
      .populate('receiver', 'nickname avatar')
      .populate('item', 'title images')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('获取聊天记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    发送新消息
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiver, content, item, type } = req.body;

    if (!receiver || !content) {
      return res.status(400).json({ message: '接收者和消息内容不能为空' });
    }

    // 创建新消息
    const newMessage = await Message.create({
      sender: req.user._id,
      receiver,
      content,
      item: item || null,
      type: type || 0,
    });

    // 获取填充了用户信息的消息
    const message = await Message.findById(newMessage._id)
      .populate('sender', 'nickname avatar')
      .populate('receiver', 'nickname avatar')
      .populate('item', 'title images');

    res.status(201).json(message);
  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    将消息标记为已读
// @route   PUT /api/messages/:id/read
// @access  Private
const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: '消息不存在' });
    }

    // 验证消息接收者
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '只有消息接收者才能标记消息为已读' });
    }

    // 更新已读状态
    message.isRead = true;
    await message.save();

    res.json({ message: '消息已标记为已读', messageId: message._id });
  } catch (error) {
    console.error('标记消息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取用户的未读消息数量
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    console.error('获取未读消息数量错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getUserMessages,
  getChatWithUser,
  sendMessage,
  markMessageAsRead,
  getUnreadCount,
}; 