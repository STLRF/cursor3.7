# 物品借用交换平台

一个前后端分离的闲置物品借用/交换Web应用，类似闲鱼但不涉及支付功能。

## 技术栈

### 后端
- Node.js
- Express.js
- MongoDB (通过Mongoose)
- JWT认证
- Multer (文件上传)

### 前端
- HTML5
- CSS3
- JavaScript (原生)
- 响应式设计

## 功能特点

- 用户注册和登录
- 物品发布、筛选和搜索
- 物品详情查看
- 物品点赞和评论
- 物品借用和归还流程
- 用户私信聊天
- 用户个人资料管理

## 项目结构

```
物品借用交换平台/
│
├── item-sharing-backend/    # 后端项目
│   ├── config/              # 配置文件
│   ├── controllers/         # 控制器
│   ├── middleware/          # 中间件
│   ├── models/              # 数据模型
│   ├── routes/              # 路由
│   ├── uploads/             # 上传文件目录
│   │   ├── avatars/         # 用户头像
│   │   └── images/          # 物品图片
│   ├── .env                 # 环境变量
│   ├── package.json         # 依赖配置
│   └── server.js            # 入口文件
│
└── item-sharing-frontend/   # 前端项目
    ├── css/                 # 样式文件
    ├── js/                  # JavaScript文件
    ├── images/              # 静态图片
    └── index.html           # 入口HTML文件
```

## 安装和部署

### 前提条件

- Node.js (v14+)
- MongoDB (v4+)
- npm或yarn

### 后端部署

1. 进入后端目录:
   ```bash
   cd item-sharing-backend
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 创建`.env`文件（如果尚未创建）:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/item-sharing
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   ```

4. 创建`uploads/avatars`和`uploads/images`目录（如果尚未创建）:
   ```bash
   mkdir -p uploads/avatars uploads/images
   ```

5. 启动开发服务器:
   ```bash
   npm run dev
   ```
   或启动生产服务器:
   ```bash
   npm start
   ```

### 前端部署

1. 进入前端目录:
   ```bash
   cd item-sharing-frontend
   ```

2. 如果你有本地Web服务器（如Apache或Nginx），将前端文件放在其根目录。

   或者使用简单的HTTP服务器（如live-server）:
   ```bash
   # 安装live-server
   npm install -g live-server
   
   # 启动服务器
   live-server
   ```

3. 如果需要，修改`js/config.js`中的API地址以匹配后端服务器地址:
   ```javascript
   const API_BASE_URL = 'http://你的后端IP:5000/api';
   const UPLOADS_URL = 'http://你的后端IP:5000/uploads';
   const DEFAULT_AVATAR = 'http://你的后端IP:5000/default-avatar.png';
   ```

## 使用说明

1. 打开浏览器访问前端应用（例如：`http://localhost:8080`）

2. 主页面展示所有已发布的物品，可进行筛选和搜索

3. 注册/登录后可以:
   - 发布新物品
   - 点赞和评论物品
   - 申请借用物品
   - 发送私信
   - 管理个人资料
   - 处理物品借用/归还流程

## 数据库设计

### 用户表
- _id: ObjectID
- nickname: 昵称（唯一）
- username: 账号（唯一）
- password: 密码（加密存储）
- avatar: 头像
- bio: 个人简介
- items: 关联的物品列表
- messages: 关联的消息列表
- borrowedItems: 借用的物品列表

### 物品表
- _id: ObjectID
- title: 标题
- description: 详细描述
- images: 图片列表
- region: 地区（1-10）
- category: 类别（1-5）
- status: 状态（0-可借用,1-已借出,2-已预约）
- owner: 所有者ID
- borrower: 借用者ID
- likes: 点赞用户列表
- comments: 评论列表

### 消息表
- _id: ObjectID
- sender: 发送者ID
- receiver: 接收者ID
- content: 消息内容
- item: 相关物品ID
- type: 消息类型（0-普通,1-借用请求,2-借用确认,3-归还请求,4-归还确认）
- isRead: 是否已读

## 开发团队

- 团队成员1
- 团队成员2
- 团队成员3

## 注意事项

1. 本项目仅供学习使用
2. 前后端分离部署时需注意CORS配置
3. 实际生产环境中应加强安全措施，如HTTPS加密等 