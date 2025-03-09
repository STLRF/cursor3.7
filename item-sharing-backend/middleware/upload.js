const multer = require('multer');
const path = require('path');

// 定义存储引擎
const storage = multer.diskStorage({
  // 指定上传目录
  destination: (req, file, cb) => {
    if (file.fieldname === 'avatar') {
      cb(null, path.join(__dirname, '../uploads/avatars'));
    } else {
      cb(null, path.join(__dirname, '../uploads/images'));
    }
  },
  // 定义文件名
  filename: (req, file, cb) => {
    // 为文件名添加时间戳，避免重名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只允许上传图片文件
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件！'));
  }
};

// 配置multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制文件大小为5MB
  }
});

module.exports = upload; 