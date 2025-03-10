/**
 * 前端配置文件
 */

// API基础URL，根据实际部署情况修改
const API_BASE_URL = 'http://192.168.194.33:5000/api';

// 上传文件URL
const UPLOADS_URL = 'http://192.168.194.33:5000/uploads';

// 默认头像
const DEFAULT_AVATAR = 'http://192.168.194.33:5000/default-avatar.png';

// 存储Token的localStorage键名
const TOKEN_KEY = 'itemSharingToken';

// 存储用户信息的localStorage键名
const USER_INFO_KEY = 'itemSharingUserInfo';

// 图片加载失败处理函数
function handleImageLoadError(img, defaultSrc) {
  img.onerror = null; // 防止循环调用
  img.src = defaultSrc;
  console.warn('图片加载失败，使用默认图片');
}

// 地区映射表
const REGIONS = {
  1: '地区1',
  2: '地区2',
  3: '地区3',
  4: '地区4',
  5: '地区5',
  6: '地区6',
  7: '地区7',
  8: '地区8',
  9: '地区9',
  10: '地区10'
};

// 类别映射表
const CATEGORIES = {
  1: '类别1',
  2: '类别2',
  3: '类别3',
  4: '类别4',
  5: '类别5'
};

// 物品状态映射表
const ITEM_STATUS = {
  0: { text: '可借用', class: 'status-available' },
  1: { text: '已借出', class: 'status-borrowed' },
  2: { text: '已预约', class: 'status-reserved' }
}; 