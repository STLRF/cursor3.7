const express = require('express');
const {
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
  confirmReturn
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// 公开路由
router.get('/', getItems);
router.get('/:id', getItemById);

// 需要登录的路由
router.post('/', protect, upload.array('images', 10), createItem);
router.put('/:id', protect, upload.array('images', 10), updateItem);
router.delete('/:id', protect, deleteItem);

// 点赞和评论路由
router.post('/:id/like', protect, likeItem);
router.post('/:id/comments', protect, addItemComment);

// 借用和归还相关路由
router.post('/:id/borrow', protect, requestBorrow);
router.post('/:id/confirm-lend', protect, confirmLend);
router.post('/:id/confirm-borrow', protect, confirmBorrow);
router.post('/:id/return', protect, requestReturn);
router.post('/:id/confirm-return', protect, confirmReturn);

module.exports = router; 