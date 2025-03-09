/**
 * 消息相关功能
 * 处理消息列表、聊天等功能
 */

class Messages {
  // 存储当前聊天的用户ID
  static currentChatUserId = null;
  
  // 存储当前聊天的用户昵称
  static currentChatUserName = null;
  
  /**
   * 初始化消息相关功能
   */
  static init() {
    // 返回消息列表按钮
    const backToMessagesBtn = document.getElementById('back-to-messages-btn');
    
    // 发送消息按钮
    const sendMessageBtn = document.getElementById('send-message-btn');
    const chatMessageInput = document.getElementById('chat-message-input');
    
    // 返回消息列表按钮点击事件
    backToMessagesBtn.addEventListener('click', () => {
      // 隐藏聊天框，显示消息列表
      document.getElementById('chat-container').classList.add('hidden');
      document.getElementById('message-list').classList.remove('hidden');
      
      // 清空当前聊天用户ID
      this.currentChatUserId = null;
      this.currentChatUserName = null;
    });
    
    // 发送消息按钮点击事件
    sendMessageBtn.addEventListener('click', () => {
      this.sendMessage();
    });
    
    // 消息输入框按Enter键发送
    chatMessageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // 加载消息列表
    this.loadMessages();
    
    // 设置定时刷新消息
    setInterval(() => {
      if (Auth.isLoggedIn()) {
        // 检查未读消息数量
        this.checkUnreadMessages();
        
        // 如果当前正在聊天，刷新聊天记录
        if (this.currentChatUserId) {
          this.loadChatWithUser(this.currentChatUserId, this.currentChatUserName, false);
        }
      }
    }, 10000); // 每10秒刷新一次
  }
  
  /**
   * 加载消息列表
   */
  static async loadMessages() {
    // 检查是否已登录
    if (!Auth.isLoggedIn()) {
      return;
    }
    
    const messageList = document.getElementById('message-list');
    
    try {
      // 显示加载中提示
      messageList.innerHTML = '<div class="loading">加载中...</div>';
      
      // 获取消息列表
      const messages = await API.getMessages();
      
      // 清空容器
      messageList.innerHTML = '';
      
      if (messages.length === 0) {
        // 没有消息
        messageList.innerHTML = '<div class="no-messages">暂无消息</div>';
        return;
      }
      
      // 获取当前用户ID
      const currentUser = Auth.getCurrentUser();
      const currentUserId = currentUser._id;
      
      // 按用户分组消息
      const chatsByUser = this.groupMessagesByUser(messages, currentUserId);
      
      // 遍历聊天列表，创建聊天项
      Object.values(chatsByUser).forEach(chat => {
        const chatItem = this.createChatItem(chat, currentUserId);
        messageList.appendChild(chatItem);
      });
      
    } catch (error) {
      // 加载失败，显示错误信息
      messageList.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
    }
  }
  
  /**
   * 按用户分组消息
   * @param {Array} messages - 消息列表
   * @param {string} currentUserId - 当前用户ID
   * @returns {Object} 按用户分组的消息
   */
  static groupMessagesByUser(messages, currentUserId) {
    const chatsByUser = {};
    
    messages.forEach(message => {
      // 确定聊天对象（发送者或接收者，但不是当前用户）
      const isReceived = message.sender._id !== currentUserId;
      const chatUserId = isReceived ? message.sender._id : message.receiver._id;
      const chatUserName = isReceived ? message.sender.nickname : message.receiver.nickname;
      const chatUserAvatar = isReceived ? message.sender.avatar : message.receiver.avatar;
      
      // 如果这个用户的聊天记录不存在，创建一个
      if (!chatsByUser[chatUserId]) {
        chatsByUser[chatUserId] = {
          userId: chatUserId,
          userName: chatUserName,
          userAvatar: chatUserAvatar,
          lastMessage: message,
          unreadCount: 0,
          messages: []
        };
      }
      
      // 更新最后一条消息
      if (message.createdAt > chatsByUser[chatUserId].lastMessage.createdAt) {
        chatsByUser[chatUserId].lastMessage = message;
      }
      
      // 统计未读消息数量
      if (isReceived && !message.isRead) {
        chatsByUser[chatUserId].unreadCount++;
      }
      
      // 添加消息到列表
      chatsByUser[chatUserId].messages.push(message);
    });
    
    return chatsByUser;
  }
  
  /**
   * 创建聊天项元素
   * @param {object} chat - 聊天数据
   * @param {string} currentUserId - 当前用户ID
   * @returns {HTMLElement} 聊天项元素
   */
  static createChatItem(chat, currentUserId) {
    // 创建聊天项容器
    const item = document.createElement('div');
    item.classList.add('message-item');
    
    // 如果有未读消息，添加未读样式
    if (chat.unreadCount > 0) {
      item.classList.add('unread-message');
    }
    
    // 获取最后一条消息
    const lastMessage = chat.lastMessage;
    
    // 检查是否为接收的消息
    const isReceived = lastMessage.sender._id !== currentUserId;
    
    // 格式化时间
    const messageTime = new Date(lastMessage.createdAt).toLocaleString();
    
    // 创建HTML内容
    const timestamp = new Date().getTime();
    let avatarHtml = '';
    
    if (chat.userAvatar) {
      avatarHtml = `<img src="${UPLOADS_URL}/avatars/${chat.userAvatar}?t=${timestamp}" 
                        alt="${chat.userName}" 
                        class="message-avatar"
                        onerror="this.onerror=null; this.src='${DEFAULT_AVATAR}?t=${timestamp}';">`;
    } else {
      avatarHtml = `<img src="${DEFAULT_AVATAR}?t=${timestamp}" 
                        alt="${chat.userName}" 
                        class="message-avatar">`;
    }
    
    item.innerHTML = `
      ${avatarHtml}
      <div class="message-info">
        <div class="message-header">
          <span class="message-username">${chat.userName}</span>
          <span class="message-time">${messageTime}</span>
        </div>
        <div class="message-preview">
          ${isReceived ? '' : '你: '}${lastMessage.content}
        </div>
      </div>
      ${chat.unreadCount > 0 ? '<div class="unread-indicator"></div>' : ''}
    `;
    
    // 添加点击事件，显示聊天
    item.addEventListener('click', () => {
      this.loadChatWithUser(chat.userId, chat.userName);
    });
    
    return item;
  }
  
  /**
   * 加载与用户的聊天记录
   * @param {string} userId - 用户ID
   * @param {string} userName - 用户昵称
   * @param {boolean} showChat - 是否显示聊天框（默认为true）
   */
  static async loadChatWithUser(userId, userName, showChat = true) {
    // 检查是否已登录
    if (!Auth.isLoggedIn()) {
      Auth.showLoginRequired();
      return;
    }
    
    // 保存当前聊天的用户ID和昵称
    this.currentChatUserId = userId;
    this.currentChatUserName = userName;
    
    // 如果需要显示聊天框
    if (showChat) {
      // 隐藏消息列表，显示聊天框
      document.getElementById('message-list').classList.add('hidden');
      document.getElementById('chat-container').classList.remove('hidden');
      
      // 设置聊天对象名称
      document.getElementById('chat-user-name').textContent = userName;
    }
    
    const chatMessages = document.getElementById('chat-messages');
    
    try {
      // 如果是首次加载，显示加载中提示
      if (showChat) {
        chatMessages.innerHTML = '<div class="loading">加载中...</div>';
      }
      
      // 获取聊天记录
      const messages = await API.getChatWithUser(userId);
      
      // 清空容器（仅当首次加载时）
      if (showChat) {
        chatMessages.innerHTML = '';
      }
      
      if (messages.length === 0 && showChat) {
        // 没有消息
        chatMessages.innerHTML = '<div class="no-messages">暂无消息，发送第一条消息开始聊天吧</div>';
        return;
      }
      
      // 如果不是首次加载且消息数量没变，不刷新
      if (!showChat && chatMessages.childElementCount === messages.length) {
        return;
      }
      
      // 如果不是首次加载，清空容器
      if (!showChat) {
        chatMessages.innerHTML = '';
      }
      
      // 获取当前用户ID
      const currentUser = Auth.getCurrentUser();
      const currentUserId = currentUser._id;
      
      // 遍历消息列表，创建消息气泡
      messages.forEach(message => {
        const isSent = message.sender._id === currentUserId;
        const messageBubble = this.createMessageBubble(message, isSent);
        chatMessages.appendChild(messageBubble);
      });
      
      // 滚动到底部
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // 标记未读消息为已读
      this.markMessagesAsRead(messages, currentUserId);
      
    } catch (error) {
      // 加载失败，显示错误信息（仅当首次加载时）
      if (showChat) {
        chatMessages.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
      }
    }
  }
  
  /**
   * 创建消息气泡元素
   * @param {object} message - 消息数据
   * @param {boolean} isSent - 是否为发送的消息
   * @returns {HTMLElement} 消息气泡元素
   */
  static createMessageBubble(message, isSent) {
    // 创建消息气泡容器
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    bubble.classList.add(isSent ? 'message-sent' : 'message-received');
    
    // 格式化时间
    const messageTime = new Date(message.createdAt).toLocaleString();
    
    // 创建HTML内容
    bubble.innerHTML = `
      <div class="message-text">${message.content}</div>
      <div class="message-time-small">${messageTime}</div>
    `;
    
    return bubble;
  }
  
  /**
   * 发送消息
   */
  static async sendMessage() {
    // 检查是否已登录
    if (!Auth.isLoggedIn()) {
      Auth.showLoginRequired();
      return;
    }
    
    // 检查是否有聊天对象
    if (!this.currentChatUserId) {
      return;
    }
    
    const chatMessageInput = document.getElementById('chat-message-input');
    const content = chatMessageInput.value.trim();
    
    if (!content) {
      return;
    }
    
    try {
      // 发送消息
      await API.sendMessage({
        receiver: this.currentChatUserId,
        content: content
      });
      
      // 清空输入框
      chatMessageInput.value = '';
      
      // 刷新聊天记录
      this.loadChatWithUser(this.currentChatUserId, this.currentChatUserName);
      
    } catch (error) {
      alert(`发送失败: ${error.message}`);
    }
  }
  
  /**
   * 标记消息为已读
   * @param {Array} messages - 消息列表
   * @param {string} currentUserId - 当前用户ID
   */
  static async markMessagesAsRead(messages, currentUserId) {
    // 过滤出未读且是接收的消息
    const unreadMessages = messages.filter(
      message => !message.isRead && message.receiver._id === currentUserId
    );
    
    // 遍历未读消息，标记为已读
    for (const message of unreadMessages) {
      try {
        await API.markMessageAsRead(message._id);
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }
    
    // 如果有未读消息，刷新消息列表
    if (unreadMessages.length > 0) {
      this.loadMessages();
      this.checkUnreadMessages();
    }
  }
  
  /**
   * 检查未读消息数量
   */
  static async checkUnreadMessages() {
    // 检查是否已登录
    if (!Auth.isLoggedIn()) {
      return;
    }
    
    try {
      // 获取未读消息数量
      const result = await API.getUnreadMessageCount();
      const count = result.count;
      
      // 获取通知徽章元素
      const badge = document.getElementById('notification-badge');
      
      if (count > 0) {
        // 显示徽章
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.remove('hidden');
      } else {
        // 隐藏徽章
        badge.classList.add('hidden');
      }
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
    }
  }
} 