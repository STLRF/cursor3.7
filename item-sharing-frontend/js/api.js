/**
 * API接口封装文件
 * 处理所有与后端的API请求
 */

class API {
  /**
   * 发送HTTP请求的通用方法
   * @param {string} url - 请求地址
   * @param {string} method - 请求方法(GET, POST, PUT, DELETE)
   * @param {object} data - 请求数据(可选)
   * @param {boolean} auth - 是否需要认证(默认false)
   * @param {boolean} isFormData - 是否为FormData数据(默认false)
   * @returns {Promise} 请求结果
   */
  static async request(url, method, data = null, auth = false, isFormData = false) {
    const headers = {};
    
    // 如果不是FormData，设置Content-Type为application/json
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    // 如果需要认证，添加Authorization头
    if (auth) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        throw new Error('未登录，请先登录');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 构建请求配置
    const config = {
      method,
      headers,
    };
    
    // 添加请求体
    if (data) {
      if (method !== 'GET') {
        if (isFormData) {
          config.body = data;
        } else {
          config.body = JSON.stringify(data);
        }
      } else {
        // 如果是GET请求，将参数添加到URL
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        url = `${url}?${params.toString()}`;
      }
    }
    
    try {
      // 发送请求
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      
      // 解析JSON响应
      const responseData = await response.json();
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(responseData.message || '请求失败');
      }
      
      return responseData;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // 用户相关API
  
  /**
   * 用户注册
   * @param {object} userData - 注册数据
   * @returns {Promise} 注册结果
   */
  static async register(userData) {
    return this.request('/users/register', 'POST', userData);
  }
  
  /**
   * 用户登录
   * @param {object} credentials - 登录凭证
   * @returns {Promise} 登录结果
   */
  static async login(credentials) {
    return this.request('/users/login', 'POST', credentials);
  }
  
  /**
   * 获取当前用户资料
   * @returns {Promise} 用户资料
   */
  static async getCurrentUserProfile() {
    return this.request('/users/profile', 'GET', null, true);
  }
  
  /**
   * 更新用户资料
   * @param {FormData} formData - 表单数据
   * @returns {Promise} 更新结果
   */
  static async updateUserProfile(formData) {
    return this.request('/users/profile', 'PUT', formData, true, true);
  }
  
  /**
   * 获取指定用户资料
   * @param {string} userId - 用户ID
   * @returns {Promise} 用户资料
   */
  static async getUserProfile(userId) {
    return this.request(`/users/${userId}`, 'GET');
  }
  
  // 物品相关API
  
  /**
   * 获取物品列表
   * @param {object} filters - 筛选条件
   * @returns {Promise} 物品列表
   */
  static async getItems(filters = {}) {
    return this.request('/items', 'GET', filters);
  }
  
  /**
   * 获取物品详情
   * @param {string} itemId - 物品ID
   * @returns {Promise} 物品详情
   */
  static async getItemById(itemId) {
    return this.request(`/items/${itemId}`, 'GET');
  }
  
  /**
   * 创建新物品
   * @param {FormData} formData - 表单数据
   * @returns {Promise} 创建结果
   */
  static async createItem(formData) {
    return this.request('/items', 'POST', formData, true, true);
  }
  
  /**
   * 更新物品
   * @param {string} itemId - 物品ID
   * @param {FormData} formData - 表单数据
   * @returns {Promise} 更新结果
   */
  static async updateItem(itemId, formData) {
    return this.request(`/items/${itemId}`, 'PUT', formData, true, true);
  }
  
  /**
   * 删除物品
   * @param {string} itemId - 物品ID
   * @returns {Promise} 删除结果
   */
  static async deleteItem(itemId) {
    return this.request(`/items/${itemId}`, 'DELETE', null, true);
  }
  
  /**
   * 点赞/取消点赞物品
   * @param {string} itemId - 物品ID
   * @returns {Promise} 点赞结果
   */
  static async likeItem(itemId) {
    return this.request(`/items/${itemId}/like`, 'POST', null, true);
  }
  
  /**
   * 评论物品
   * @param {string} itemId - 物品ID
   * @param {string} text - 评论内容
   * @returns {Promise} 评论结果
   */
  static async addItemComment(itemId, text) {
    return this.request(`/items/${itemId}/comments`, 'POST', { text }, true);
  }
  
  /**
   * 申请借用物品
   * @param {string} itemId - 物品ID
   * @returns {Promise} 申请结果
   */
  static async requestBorrow(itemId) {
    return this.request(`/items/${itemId}/borrow`, 'POST', null, true);
  }
  
  /**
   * 确认借出物品
   * @param {string} itemId - 物品ID
   * @param {string} borrowerId - 借用者ID
   * @returns {Promise} 确认结果
   */
  static async confirmLend(itemId, borrowerId) {
    return this.request(`/items/${itemId}/confirm-lend`, 'POST', { borrowerId }, true);
  }
  
  /**
   * 确认收到物品
   * @param {string} itemId - 物品ID
   * @returns {Promise} 确认结果
   */
  static async confirmBorrow(itemId) {
    return this.request(`/items/${itemId}/confirm-borrow`, 'POST', null, true);
  }
  
  /**
   * 申请归还物品
   * @param {string} itemId - 物品ID
   * @returns {Promise} 申请结果
   */
  static async requestReturn(itemId) {
    return this.request(`/items/${itemId}/return`, 'POST', null, true);
  }
  
  /**
   * 确认归还物品
   * @param {string} itemId - 物品ID
   * @returns {Promise} 确认结果
   */
  static async confirmReturn(itemId) {
    return this.request(`/items/${itemId}/confirm-return`, 'POST', null, true);
  }
  
  // 消息相关API
  
  /**
   * 获取所有消息
   * @returns {Promise} 消息列表
   */
  static async getMessages() {
    return this.request('/messages', 'GET', null, true);
  }
  
  /**
   * 获取与特定用户的聊天记录
   * @param {string} userId - 用户ID
   * @returns {Promise} 聊天记录
   */
  static async getChatWithUser(userId) {
    return this.request(`/messages/chat/${userId}`, 'GET', null, true);
  }
  
  /**
   * 发送消息
   * @param {object} messageData - 消息数据
   * @returns {Promise} 发送结果
   */
  static async sendMessage(messageData) {
    return this.request('/messages', 'POST', messageData, true);
  }
  
  /**
   * 标记消息为已读
   * @param {string} messageId - 消息ID
   * @returns {Promise} 标记结果
   */
  static async markMessageAsRead(messageId) {
    return this.request(`/messages/${messageId}/read`, 'PUT', null, true);
  }
  
  /**
   * 获取未读消息数量
   * @returns {Promise} 未读消息数量
   */
  static async getUnreadMessageCount() {
    return this.request('/messages/unread-count', 'GET', null, true);
  }
} 