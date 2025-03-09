/**
 * 个人资料相关功能
 * 处理用户个人资料查看和编辑
 */

class Profile {
  /**
   * 初始化个人资料相关功能
   */
  static init() {
    // 资料选项卡切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    // 编辑资料模态框
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileForm = document.getElementById('edit-profile-form');
    const closeEditProfile = document.getElementById('close-edit-profile');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const editProfileMessage = document.getElementById('edit-profile-message');
    
    // 选项卡切换事件
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // 移除所有选项卡的active类
        tabBtns.forEach(b => b.classList.remove('active'));
        // 添加当前选项卡的active类
        btn.classList.add('active');
        
        // 获取对应的内容ID
        const tabId = btn.dataset.tab;
        
        // 隐藏所有内容
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // 显示当前选项卡对应的内容
        document.getElementById(`${tabId}-content`).classList.add('active');
      });
    });
    
    // 编辑资料按钮点击事件
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => {
        // 获取当前用户信息
        const currentUser = Auth.getCurrentUser();
        
        if (!currentUser) {
          return;
        }
        
        // 填充表单
        document.getElementById('edit-nickname').value = currentUser.nickname || '';
        document.getElementById('edit-bio').value = ''; // 需要从API获取
        document.getElementById('edit-password').value = '';
        
        // 显示模态框
        editProfileModal.style.display = 'block';
      });
    }
    
    // 关闭编辑资料模态框
    closeEditProfile.addEventListener('click', () => {
      editProfileModal.style.display = 'none';
      editProfileForm.reset();
      editProfileMessage.textContent = '';
    });
    
    // 点击模态框背景关闭模态框
    window.addEventListener('click', (e) => {
      if (e.target === editProfileModal) {
        editProfileModal.style.display = 'none';
        editProfileForm.reset();
        editProfileMessage.textContent = '';
      }
    });
    
    // 头像上传预览
    const avatarUpload = document.getElementById('avatar-upload');
    
    if (avatarUpload) {
      avatarUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          const reader = new FileReader();
          
          reader.onload = function(event) {
            // 预览头像
            document.getElementById('profile-avatar-img').src = event.target.result;
          };
          
          reader.readAsDataURL(file);
          
          // 自动提交表单
          this.updateAvatar(file);
        }
      });
    }
    
    // 编辑资料表单提交
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nickname = document.getElementById('edit-nickname').value;
      const bio = document.getElementById('edit-bio').value;
      const password = document.getElementById('edit-password').value;
      
      if (!nickname) {
        editProfileMessage.textContent = '昵称不能为空';
        return;
      }
      
      editProfileMessage.textContent = '更新中...';
      
      try {
        // 创建FormData
        const formData = new FormData();
        formData.append('nickname', nickname);
        formData.append('bio', bio);
        
        if (password) {
          formData.append('password', password);
        }
        
        // 发送请求
        const response = await API.updateUserProfile(formData);
        
        // 更新本地存储的用户信息
        localStorage.setItem(USER_INFO_KEY, JSON.stringify({
          _id: response._id,
          nickname: response.nickname,
          username: response.username,
          avatar: response.avatar
        }));
        
        // 更新UI
        Auth.updateUI();
        
        // 关闭模态框
        editProfileModal.style.display = 'none';
        editProfileForm.reset();
        
        // 刷新个人资料
        this.loadCurrentUserProfile();
        
      } catch (error) {
        // 更新失败，显示错误信息
        editProfileMessage.textContent = error.message;
      }
    });
  }
  
  /**
   * 加载当前登录用户的个人资料
   */
  static async loadCurrentUserProfile() {
    // 检查是否已登录
    if (!Auth.isLoggedIn()) {
      return;
    }
    
    try {
      // 获取当前用户资料
      const userProfile = await API.getCurrentUserProfile();
      
      // 显示资料
      this.displayUserProfile(userProfile, true);
      
      // 加载用户发布的物品
      this.loadUserItems(userProfile._id);
      
      // 加载用户借到的物品
      this.loadBorrowedItems();
      
    } catch (error) {
      console.error('加载个人资料失败:', error);
      // 显示错误提示
      document.querySelector('.profile-header').innerHTML = `<div class="error">加载个人资料失败: ${error.message}</div>`;
    }
  }
  
  /**
   * 加载其他用户的个人资料
   * @param {string} userId - 用户ID
   */
  static async loadUserProfile(userId) {
    try {
      // 获取用户资料
      const userProfile = await API.getUserProfile(userId);
      
      // 显示资料
      this.displayUserProfile(userProfile, false);
      
      // 加载用户发布的物品
      this.loadUserItems(userId);
      
    } catch (error) {
      console.error('加载用户资料失败:', error);
      // 显示错误提示
      document.querySelector('.profile-header').innerHTML = `<div class="error">加载用户资料失败: ${error.message}</div>`;
    }
  }
  
  /**
   * 显示用户资料
   * @param {object} userProfile - 用户资料数据
   * @param {boolean} isCurrentUser - 是否为当前登录用户
   */
  static displayUserProfile(userProfile, isCurrentUser) {
    const profileNickname = document.getElementById('profile-nickname');
    const profileUsername = document.getElementById('profile-username');
    const profileBio = document.getElementById('profile-bio');
    const profileAvatarImg = document.getElementById('profile-avatar-img');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const chatWithUserBtn = document.getElementById('chat-with-user-btn');
    const avatarEdit = document.getElementById('avatar-edit');
    
    // 显示用户昵称和账号
    profileNickname.textContent = userProfile.nickname;
    profileUsername.textContent = `@${userProfile.username}`;
    profileBio.textContent = userProfile.bio || '这个人很懒，还没有写简介';
    
    // 显示头像 (添加时间戳和错误处理)
    const timestamp = new Date().getTime();
    
    // 确保先清除之前的错误处理器
    profileAvatarImg.onerror = null;
    
    // 如果用户有自定义头像
    if (userProfile.avatar) {
      console.log(`加载头像: ${UPLOADS_URL}/avatars/${userProfile.avatar}?t=${timestamp}`);
      profileAvatarImg.src = `${UPLOADS_URL}/avatars/${userProfile.avatar}?t=${timestamp}`;
      profileAvatarImg.onerror = () => {
        console.warn(`头像加载失败: ${profileAvatarImg.src}`);
        profileAvatarImg.src = `${DEFAULT_AVATAR}?t=${timestamp}`;
      };
    } else {
      // 没有自定义头像，使用默认头像
      profileAvatarImg.src = `${DEFAULT_AVATAR}?t=${timestamp}`;
    }
    
    // 根据是否为当前用户显示编辑按钮或聊天按钮
    if (isCurrentUser) {
      editProfileBtn.classList.remove('hidden');
      chatWithUserBtn.classList.add('hidden');
      avatarEdit.classList.remove('hidden');
      
      // 隐藏借到的物品选项卡
      document.querySelector('[data-tab="borrowed-items"]').style.display = 'block';
      
      // 显示消息选项卡
      document.querySelector('[data-tab="messages"]').style.display = 'block';
    } else {
      editProfileBtn.classList.add('hidden');
      chatWithUserBtn.classList.remove('hidden');
      avatarEdit.classList.add('hidden');
      
      // 隐藏借到的物品和消息选项卡
      document.querySelector('[data-tab="borrowed-items"]').style.display = 'none';
      document.querySelector('[data-tab="messages"]').style.display = 'none';
      
      // 添加聊天按钮点击事件
      chatWithUserBtn.onclick = () => {
        this.startChatWithUser(userProfile._id, userProfile.nickname);
      };
    }
  }
  
  /**
   * 加载用户发布的物品
   * @param {string} userId - 用户ID
   */
  static async loadUserItems(userId) {
    const userItemsContainer = document.getElementById('user-items-container');
    
    try {
      // 显示加载中提示
      userItemsContainer.innerHTML = '<div class="loading">加载中...</div>';
      
      // 获取用户物品列表
      const user = await API.getUserProfile(userId);
      const items = user.items || [];
      
      // 清空容器
      userItemsContainer.innerHTML = '';
      
      if (items.length === 0) {
        // 没有物品
        userItemsContainer.innerHTML = '<div class="no-items">暂无发布的物品</div>';
        return;
      }
      
      // 遍历物品列表，创建物品卡片
      items.forEach(item => {
        const itemCard = Items.createItemCard(item);
        userItemsContainer.appendChild(itemCard);
      });
      
    } catch (error) {
      // 加载失败，显示错误信息
      userItemsContainer.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
    }
  }
  
  /**
   * 加载当前用户借到的物品
   */
  static async loadBorrowedItems() {
    const borrowedItemsContainer = document.getElementById('borrowed-items-container');
    
    try {
      // 显示加载中提示
      borrowedItemsContainer.innerHTML = '<div class="loading">加载中...</div>';
      
      // 获取用户资料，包含借到的物品
      const user = await API.getCurrentUserProfile();
      const items = user.borrowedItems || [];
      
      // 清空容器
      borrowedItemsContainer.innerHTML = '';
      
      if (items.length === 0) {
        // 没有物品
        borrowedItemsContainer.innerHTML = '<div class="no-items">暂无借到的物品</div>';
        return;
      }
      
      // 遍历物品列表，创建物品卡片
      items.forEach(item => {
        const itemCard = Items.createItemCard(item);
        borrowedItemsContainer.appendChild(itemCard);
      });
      
    } catch (error) {
      // 加载失败，显示错误信息
      borrowedItemsContainer.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
    }
  }
  
  /**
   * 更新用户头像
   * @param {File} file - 头像文件
   */
  static async updateAvatar(file) {
    try {
      // 创建FormData
      const formData = new FormData();
      formData.append('avatar', file);
      
      // 发送请求
      const response = await API.updateUserProfile(formData);
      
      // 更新本地存储的用户信息
      localStorage.setItem(USER_INFO_KEY, JSON.stringify({
        _id: response._id,
        nickname: response.nickname,
        username: response.username,
        avatar: response.avatar
      }));
      
      // 更新UI
      Auth.updateUI();
      
      // 强制刷新当前用户资料页面
      this.loadCurrentUserProfile();
      
    } catch (error) {
      console.error('更新头像失败:', error);
      alert(`更新头像失败: ${error.message}`);
    }
  }
  
  /**
   * 开始与用户聊天
   * @param {string} userId - 用户ID
   * @param {string} nickname - 用户昵称
   */
  static startChatWithUser(userId, nickname) {
    // 检查是否已登录
    if (!Auth.isLoggedIn()) {
      Auth.showLoginRequired();
      return;
    }
    
    // 显示个人中心页面
    App.showPage('profile');
    
    // 切换到消息选项卡
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === 'messages') {
        btn.classList.add('active');
      }
    });
    
    // 显示消息内容
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById('messages-content').classList.add('active');
    
    // 显示聊天框
    document.getElementById('message-list').classList.add('hidden');
    document.getElementById('chat-container').classList.remove('hidden');
    
    // 设置聊天对象
    document.getElementById('chat-user-name').textContent = nickname;
    
    // 加载聊天记录
    Messages.loadChatWithUser(userId, nickname);
  }
} 