/**
 * 身份验证相关功能
 * 处理登录、注册、注销和用户状态管理
 */

class Auth {
  /**
   * 初始化身份验证功能
   */
  static init() {
    // 登录按钮
    const loginBtn = document.getElementById('login-btn');
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const closeLogin = document.getElementById('close-login');
    const loginModal = document.getElementById('login-modal');
    
    // 注册按钮
    const registerBtn = document.getElementById('register-btn');
    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');
    const closeRegister = document.getElementById('close-register');
    const registerModal = document.getElementById('register-modal');
    
    // 切换登录/注册
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    
    // 注销按钮
    const logoutBtn = document.getElementById('logout-btn');
    
    // 用户信息显示元素
    const authButtons = document.querySelector('.auth-buttons');
    const userInfo = document.querySelector('.user-info');
    const userNickname = document.getElementById('user-nickname');
    const userAvatar = document.getElementById('user-avatar');
    
    // 登录按钮点击事件
    loginBtn.addEventListener('click', () => {
      loginModal.style.display = 'block';
    });
    
    // 注册按钮点击事件
    registerBtn.addEventListener('click', () => {
      registerModal.style.display = 'block';
    });
    
    // 关闭模态框
    closeLogin.addEventListener('click', () => {
      loginModal.style.display = 'none';
      loginForm.reset();
      loginMessage.textContent = '';
    });
    
    closeRegister.addEventListener('click', () => {
      registerModal.style.display = 'none';
      registerForm.reset();
      registerMessage.textContent = '';
    });
    
    // 切换到注册
    switchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      loginModal.style.display = 'none';
      registerModal.style.display = 'block';
      loginForm.reset();
      loginMessage.textContent = '';
    });
    
    // 切换到登录
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      registerModal.style.display = 'none';
      loginModal.style.display = 'block';
      registerForm.reset();
      registerMessage.textContent = '';
    });
    
    // 点击模态框背景关闭模态框
    window.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        loginModal.style.display = 'none';
        loginForm.reset();
        loginMessage.textContent = '';
      }
      if (e.target === registerModal) {
        registerModal.style.display = 'none';
        registerForm.reset();
        registerMessage.textContent = '';
      }
    });
    
    // 登录表单提交
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      
      if (!username || !password) {
        loginMessage.textContent = '请填写账号和密码';
        return;
      }
      
      loginMessage.textContent = '登录中...';
      
      try {
        const response = await API.login({ username, password });
        
        // 登录成功，保存token和用户信息
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify({
          _id: response._id,
          nickname: response.nickname,
          username: response.username,
          avatar: response.avatar
        }));
        
        // 更新UI显示
        this.updateUI();
        
        // 关闭模态框
        loginModal.style.display = 'none';
        loginForm.reset();
        
        // 刷新物品列表和用户资料
        await App.refreshContent();
        
      } catch (error) {
        // 登录失败，显示错误信息
        loginMessage.textContent = error.message;
      }
    });
    
    // 注册表单提交
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nickname = document.getElementById('register-nickname').value;
      const username = document.getElementById('register-username').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      if (!nickname || !username || !password || !confirmPassword) {
        registerMessage.textContent = '请填写所有字段';
        return;
      }
      
      if (password !== confirmPassword) {
        registerMessage.textContent = '两次输入的密码不一致';
        return;
      }
      
      registerMessage.textContent = '注册中...';
      
      try {
        const response = await API.register({
          nickname,
          username,
          password,
          confirmPassword
        });
        
        // 注册成功，保存token和用户信息
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify({
          _id: response._id,
          nickname: response.nickname,
          username: response.username,
          avatar: response.avatar
        }));
        
        // 更新UI显示
        this.updateUI();
        
        // 关闭模态框
        registerModal.style.display = 'none';
        registerForm.reset();
        
        // 刷新物品列表和用户资料
        await App.refreshContent();
        
      } catch (error) {
        // 注册失败，显示错误信息
        registerMessage.textContent = error.message;
      }
    });
    
    // 注销按钮点击事件
    logoutBtn.addEventListener('click', () => {
      this.logout();
    });
    
    // 初始化时更新UI
    this.updateUI();
  }
  
  /**
   * 更新UI显示登录状态
   */
  static updateUI() {
    const authButtons = document.querySelector('.auth-buttons');
    const userInfo = document.querySelector('.user-info');
    const userNickname = document.getElementById('user-nickname');
    const userAvatar = document.getElementById('user-avatar');
    
    // 检查是否已登录
    const userInfoStr = localStorage.getItem(USER_INFO_KEY);
    
    if (userInfoStr) {
      // 已登录，显示用户信息
      const userInfo_obj = JSON.parse(userInfoStr);
      
      // 显示用户昵称和头像（添加时间戳避免缓存）
      userNickname.textContent = userInfo_obj.nickname;
      const timestamp = new Date().getTime();
      
      // 清除之前的错误处理器
      userAvatar.onerror = null;
      
      // 如果用户有自定义头像
      if (userInfo_obj.avatar) {
        console.log(`导航栏加载头像: ${UPLOADS_URL}/avatars/${userInfo_obj.avatar}?t=${timestamp}`);
        userAvatar.src = `${UPLOADS_URL}/avatars/${userInfo_obj.avatar}?t=${timestamp}`;
        userAvatar.onerror = () => {
          console.warn(`导航栏头像加载失败: ${userAvatar.src}`);
          userAvatar.src = `${DEFAULT_AVATAR}?t=${timestamp}`;
        };
      } else {
        // 没有自定义头像，使用默认头像
        userAvatar.src = `${DEFAULT_AVATAR}?t=${timestamp}`;
      }
      
      // 隐藏登录/注册按钮，显示用户信息
      authButtons.classList.add('hidden');
      userInfo.classList.remove('hidden');
      
      // 显示发布物品按钮
      document.getElementById('add-item-btn').style.display = 'block';
      
    } else {
      // 未登录，显示登录/注册按钮
      authButtons.classList.remove('hidden');
      userInfo.classList.add('hidden');
      
      // 隐藏发布物品按钮
      document.getElementById('add-item-btn').style.display = 'none';
    }
  }
  
  /**
   * 用户注销
   */
  static logout() {
    // 清除本地存储的token和用户信息
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    
    // 更新UI
    this.updateUI();
    
    // 刷新页面或返回首页
    App.showPage('home');
    App.refreshContent();
  }
  
  /**
   * 获取当前登录用户信息
   * @returns {object|null} 用户信息或null（未登录）
   */
  static getCurrentUser() {
    const userInfoStr = localStorage.getItem(USER_INFO_KEY);
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  }
  
  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  static isLoggedIn() {
    return !!localStorage.getItem(TOKEN_KEY);
  }
  
  /**
   * 显示需要登录的提示
   */
  static showLoginRequired() {
    const loginModal = document.getElementById('login-modal');
    const loginMessage = document.getElementById('login-message');
    
    loginMessage.textContent = '此操作需要登录，请先登录';
    loginModal.style.display = 'block';
  }
} 