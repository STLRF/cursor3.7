const Item = require('../models/Item');
const User = require('../models/User');

// @desc    获取所有物品
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    // 构建查询条件
    const queryObj = {};

    // 根据地区筛选
    if (req.query.region) {
      queryObj.region = Number(req.query.region);
    }

    // 根据类别筛选
    if (req.query.category) {
      queryObj.category = Number(req.query.category);
    }

    // 根据标题或描述搜索
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryObj.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    // 执行查询并填充所有者信息
    const items = await Item.find(queryObj)
      .populate('owner', 'nickname avatar')
      .sort({ createdAt: -1 }); // 按创建时间倒序排列

    res.json(items);
  } catch (error) {
    console.error('获取物品列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取单个物品详情
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'nickname avatar bio')
      .populate('comments.user', 'nickname avatar');

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: '物品不存在' });
    }
  } catch (error) {
    console.error('获取物品详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    创建新物品
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { title, description, region, category } = req.body;

    // 验证必填字段
    if (!title || !description || !region || !category) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    // 验证至少有一张图片
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '请至少上传一张图片' });
    }

    // 准备图片路径数组
    const images = req.files.map((file) => file.filename);

    // 创建新物品
    const item = await Item.create({
      title,
      description,
      images,
      region: Number(region),
      category: Number(category),
      owner: req.user._id,
    });

    // 将物品添加到用户的物品列表
    await User.findByIdAndUpdate(req.user._id, {
      $push: { items: item._id },
    });

    // 返回创建的物品
    res.status(201).json(item);
  } catch (error) {
    console.error('创建物品错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    更新物品
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const { title, description, region, category } = req.body;

    // 查找物品
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: '物品不存在' });
    }

    // 验证物品所有者
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '只有物品所有者才能更新物品' });
    }

    // 更新物品信息
    item.title = title || item.title;
    item.description = description || item.description;
    item.region = region ? Number(region) : item.region;
    item.category = category ? Number(category) : item.category;

    // 如果上传了新图片
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.filename);
      item.images = [...item.images, ...newImages];
    }

    // 保存更新
    const updatedItem = await item.save();

    res.json(updatedItem);
  } catch (error) {
    console.error('更新物品错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    删除物品
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    // 查找物品
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: '物品不存在' });
    }

    // 验证物品所有者
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '只有物品所有者才能删除物品' });
    }

    // 从数据库中删除物品
    await item.remove();

    // 从用户的物品列表中移除该物品
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { items: req.params.id },
    });

    res.json({ message: '物品已删除' });
  } catch (error) {
    console.error('删除物品错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    给物品点赞或取消点赞
// @route   POST /api/items/:id/like
// @access  Private
const likeItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: '物品不存在' });
    }

    // 检查用户是否已点赞
    const alreadyLiked = item.likes.includes(req.user._id);

    if (alreadyLiked) {
      // 取消点赞
      await Item.findByIdAndUpdate(req.params.id, {
        $pull: { likes: req.user._id },
      });
      return res.json({ message: '取消点赞成功', liked: false });
    } else {
      // 添加点赞
      await Item.findByIdAndUpdate(req.params.id, {
        $push: { likes: req.user._id },
      });
      return res.json({ message: '点赞成功', liked: true });
    }
  } catch (error) {
    console.error('点赞错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    给物品添加评论
// @route   POST /api/items/:id/comments
// @access  Private
const addItemComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: '评论内容不能为空' });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: '物品不存在' });
    }

    // 创建新评论
    const newComment = {
      user: req.user._id,
      text,
      date: Date.now(),
    };

    // 添加评论到物品
    item.comments.push(newComment);

    // 保存物品
    await item.save();

    // 获取包含用户信息的更新后的物品
    const updatedItem = await Item.findById(req.params.id).populate(
      'comments.user',
      'nickname avatar'
    );

    res.json(updatedItem.comments);
  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    申请借用物品
// @route   POST /api/items/:id/borrow
// @access  Private
const requestBorrow = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: '物品不存在' });
    }

    // 检查物品是否可借用
    if (item.status !== 0) {
      return res.status(400).json({ message: '该物品当前不可借用' });
    }

    // 检查用户是否为物品所有者
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: '不能借用自己的物品' });
    }

    // 更新物品状态为已预约
    item.status = 2;
    await item.save();

    // 创建借用请求消息
    const Message = require('../models/Message');
    await Message.create({
      sender: req.user._id,
      receiver: item.owner,
      content: `我想借用您的"${item.title}"`,
      item: item._id,
      type: 1, // 借用请求
    });

    res.json({ message: '已发送借用请求', item });
  } catch (error) {
    console.error('请求借用错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    确认借出物品
// @route   POST /api/items/:id/confirm-lend
// @access  Private
const confirmLend = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: '物品不存在' });
    }

    // 检查是否为物品所有者
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '只有物品所有者才能确认借出' });
    }

    // 检查物品状态
    if (item.status !== 2) {
      return res.status(400).json({ message: '物品状态不正确' });
    }

    // 更新物品状态为已借出，并设置借用者
    const { borrowerId } = req.body;
    item.status = 1; // 已借出
    item.borrower = borrowerId;
    await item.save();

    // 给借用者添加到已借物品列表
    await User.findByIdAndUpdate(borrowerId, {
      $push: { borrowedItems: item._id },
    });

    res.json({ message: '物品已确认借出', item });
  } catch (error) {
    console.error('确认借出错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    确认收到物品
// @route   POST /api/items/:id/confirm-borrow
// @access  Private
const confirmBorrow = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: '物品不存在' });
    }

    // 检查是否为借用者
    if (!item.borrower || item.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '只有借用者才能确认收到物品' });
    }

    res.json({ message: '已确认收到物品', item });
  } catch (error) {
    console.error('确认借用错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    申请归还物品
// @route   POST /api/items/:id/return
// @access  Private
const requestReturn = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: '物品不存在' });
    }

    // 检查是否为借用者
    if (!item.borrower || item.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '只有借用者才能申请归还物品' });
    }

    // 创建归还请求消息
    const Message = require('../models/Message');
    await Message.create({
      sender: req.user._id,
      receiver: item.owner,
      content: `我想归还您的"${item.title}"`,
      item: item._id,
      type: 3, // 归还请求
    });

    res.json({ message: '已发送归还请求', item });
  } catch (error) {
    console.error('请求归还错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    确认归还物品
// @route   POST /api/items/:id/confirm-return
// @access  Private
const confirmReturn = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: '物品不存在' });
    }

    // 检查是否为物品所有者
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '只有物品所有者才能确认归还' });
    }

    // 检查物品状态
    if (item.status !== 1) {
      return res.status(400).json({ message: '物品状态不正确' });
    }

    // 保存借用者ID以便后续操作
    const borrowerId = item.borrower;

    // 重置物品状态
    item.status = 0; // 可借用
    item.borrower = null;
    await item.save();

    // 从借用者的已借物品列表中移除
    await User.findByIdAndUpdate(borrowerId, {
      $pull: { borrowedItems: item._id },
    });

    res.json({ message: '物品已确认归还', item });
  } catch (error) {
    console.error('确认归还错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  likeItem,
  addItemComment,
  requestBorrow,
  confirmLend,
  confirmBorrow,
  requestReturn,
  confirmReturn,
}; 