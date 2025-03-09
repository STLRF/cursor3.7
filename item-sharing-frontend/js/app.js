/**
 * 应用主文件
 * 初始化和协调各个功能组件
 */

class App {
  /**
   * 初始化应用
   */
  static init() {
    // 页面导航
    const navLinks = document.querySelectorAll('.nav-item');
    
    // 搜索框和按钮
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    // 导航链接点击事件
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 获取页面ID
        const pageId = link.dataset.page;
        
        // 显示对应页面
        this.showPage(pageId);
        
        // 如果是个人中心页面并且已登录，加载个人资料
        if (pageId === 'profile' && Auth.isLoggedIn()) {
          Profile.loadCurrentUserProfile();
        }
      });
    });
    
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', () => {
      const searchTerm = searchInput.value.trim();
      
      if (searchTerm) {
        // 显示首页
        this.showPage('home');
        
        // 加载搜索结果
        Items.loadItems({ search: searchTerm });
      }
    });
    
    // 搜索输入框按Enter键搜索
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm) {
          // 显示首页
          this.showPage('home');
          
          // 加载搜索结果
          Items.loadItems({ search: searchTerm });
        }
      }
    });
    
    // 初始化身份验证功能
    Auth.init();
    
    // 初始化物品功能
    Items.init();
    
    // 初始化个人资料功能
    Profile.init();
    
    // 初始化消息功能
    Messages.init();
    
    // 默认显示首页
    this.showPage('home');
    
    // 如果已登录，检查未读消息
    if (Auth.isLoggedIn()) {
      Messages.checkUnreadMessages();
    }
  }
  
  /**
   * 显示指定页面
   * @param {string} pageId - 页面ID
   */
  static showPage(pageId) {
    // 获取所有页面
    const pages = document.querySelectorAll('.page');
    
    // 获取所有导航链接
    const navLinks = document.querySelectorAll('.nav-item');
    
    // 隐藏所有页面
    pages.forEach(page => {
      page.classList.remove('active');
    });
    
    // 移除所有导航链接的active类
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // 显示指定页面
    document.getElementById(`${pageId}-page`).classList.add('active');
    
    // 添加对应导航链接的active类
    document.querySelector(`.nav-item[data-page="${pageId}"]`).classList.add('active');
    
    // 如果是个人中心页面且未登录，提示登录
    if (pageId === 'profile' && !Auth.isLoggedIn()) {
      Auth.showLoginRequired();
      // 切回首页
      this.showPage('home');
    }
  }
  
  /**
   * 刷新内容
   */
  static refreshContent() {
    // 刷新物品列表
    Items.loadItems();
    
    // 如果已登录，刷新个人资料
    if (Auth.isLoggedIn()) {
      Profile.loadCurrentUserProfile();
      Messages.loadMessages();
    }
  }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  
  // 创建一个占位图片文件，避免图片加载错误
  const img = new Image();
  img.src = '../images/placeholder.jpg';
  img.onload = () => {
    console.log('占位图片加载成功');
  };
  img.onerror = () => {
    console.warn('占位图片不存在，请在项目根目录的images目录下添加placeholder.jpg图片');
  };
}); 