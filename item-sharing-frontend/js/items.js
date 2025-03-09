/**
 * 物品相关功能
 * 处理物品列表、详情、发布、编辑等功能
 */

class Items {
  /**
   * 初始化物品相关功能
   */
  static init() {
    // 筛选按钮
    const filterBtn = document.getElementById('filter-btn');
    
    // 发布物品按钮
    const addItemBtn = document.getElementById('add-item-btn');
    const addItemForm = document.getElementById('add-item-form');
    const closeAddItem = document.getElementById('close-add-item');
    const addItemModal = document.getElementById('add-item-modal');
    const addItemMessage = document.getElementById('add-item-message');
    
    // 物品详情模态框
    const itemDetailModal = document.getElementById('item-detail-modal');
    const closeItemDetail = document.getElementById('close-item-detail');
    
    // 图片预览
    const itemImagesInput = document.getElementById('item-images');
    const imagePreview = document.getElementById('image-preview');
    
    // 筛选按钮点击事件
    filterBtn.addEventListener('click', () => {
      this.filterItems();
    });
    
    // 发布物品按钮点击事件
    addItemBtn.addEventListener('click', () => {
      if (!Auth.isLoggedIn()) {
        // 未登录，显示登录提示
        Auth.showLoginRequired();
        return;
      }
      
      // 显示发布物品模态框
      addItemModal.style.display = 'block';
    });
    
    // 关闭发布物品模态框
    closeAddItem.addEventListener('click', () => {
      addItemModal.style.display = 'none';
      addItemForm.reset();
      addItemMessage.textContent = '';
      imagePreview.innerHTML = '';
    });
    
    // 关闭物品详情模态框
    closeItemDetail.addEventListener('click', () => {
      itemDetailModal.style.display = 'none';
    });
    
    // 点击模态框背景关闭模态框
    window.addEventListener('click', (e) => {
      if (e.target === addItemModal) {
        addItemModal.style.display = 'none';
        addItemForm.reset();
        addItemMessage.textContent = '';
        imagePreview.innerHTML = '';
      }
      if (e.target === itemDetailModal) {
        itemDetailModal.style.display = 'none';
      }
    });
    
    // 图片选择预览
    itemImagesInput.addEventListener('change', (e) => {
      imagePreview.innerHTML = '';
      
      if (e.target.files.length > 0) {
        for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          const reader = new FileReader();
          
          reader.onload = function(event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.classList.add('preview-image');
            imagePreview.appendChild(img);
          };
          
          reader.readAsDataURL(file);
        }
      }
    });
    
    // 发布物品表单提交
    addItemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = document.getElementById('item-title').value;
      const description = document.getElementById('item-description').value;
      const region = document.getElementById('item-region').value;
      const category = document.getElementById('item-category').value;
      const images = document.getElementById('item-images').files;
      
      if (!title || !description || !region || !category || images.length === 0) {
        addItemMessage.textContent = '请填写所有字段并上传至少一张图片';
        return;
      }
      
      addItemMessage.textContent = '发布中...';
      
      try {
        // 创建FormData
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('region', region);
        formData.append('category', category);
        
        // 添加图片
        for (let i = 0; i < images.length; i++) {
          formData.append('images', images[i]);
        }
        
        // 发送请求
        await API.createItem(formData);
        
        // 关闭模态框
        addItemModal.style.display = 'none';
        addItemForm.reset();
        imagePreview.innerHTML = '';
        
        // 刷新物品列表
        this.loadItems();
        
      } catch (error) {
        // 发布失败，显示错误信息
        addItemMessage.textContent = error.message;
      }
    });
    
    // 加载物品列表
    this.loadItems();
  }
  
  /**
   * 加载物品列表
   * @param {object} filters - 筛选条件
   */
  static async loadItems(filters = {}) {
    const itemsContainer = document.getElementById('items-container');
    
    try {
      // 显示加载中提示
      itemsContainer.innerHTML = '<div class="loading">加载中...</div>';
      
      // 获取物品列表
      const items = await API.getItems(filters);
      
      // 清空容器
      itemsContainer.innerHTML = '';
      
      if (items.length === 0) {
        // 没有物品
        itemsContainer.innerHTML = '<div class="no-items">暂无符合条件的物品</div>';
        return;
      }
      
      // 遍历物品列表，创建物品卡片
      items.forEach(item => {
        const itemCard = this.createItemCard(item);
        itemsContainer.appendChild(itemCard);
      });
      
    } catch (error) {
      // 加载失败，显示错误信息
      itemsContainer.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
    }
  }
  
  /**
   * 创建物品卡片元素
   * @param {object} item - 物品数据
   * @returns {HTMLElement} 物品卡片元素
   */
  static createItemCard(item) {
    // 创建卡片容器
    const card = document.createElement('div');
    card.classList.add('item-card');
    card.dataset.id = item._id;
    
    // 添加点击事件，显示物品详情
    card.addEventListener('click', () => {
      this.showItemDetail(item._id);
    });
    
    // 物品图片
    const img = document.createElement('img');
    img.classList.add('item-image');
    const timestamp = new Date().getTime();
    
    // 清除之前的错误处理器
    img.onerror = null;
    
    // 如果物品有图片
    if (item.images && item.images.length > 0) {
      console.log(`加载物品图片: ${UPLOADS_URL}/images/${item.images[0]}?t=${timestamp}`);
      img.src = `${UPLOADS_URL}/images/${item.images[0]}?t=${timestamp}`;
      img.onerror = () => {
        console.warn(`物品图片加载失败: ${img.src}`);
        img.src = `../images/placeholder.jpg?t=${timestamp}`;
      };
    } else {
      img.src = `../images/placeholder.jpg?t=${timestamp}`;
    }
    img.alt = item.title;
    
    // 物品信息
    const info = document.createElement('div');
    info.classList.add('item-info');
    
    // 物品标题
    const title = document.createElement('h3');
    title.classList.add('item-title');
    title.textContent = item.title;
    
    // 物品状态
    const status = document.createElement('span');
    status.classList.add('item-status');
    const statusInfo = ITEM_STATUS[item.status] || ITEM_STATUS[0];
    status.classList.add(statusInfo.class);
    status.textContent = statusInfo.text;
    
    // 物品所有者信息
    const owner = document.createElement('div');
    owner.classList.add('item-owner');
    
    // 所有者头像
    const ownerAvatar = document.createElement('img');
    ownerAvatar.classList.add('owner-avatar');
    ownerAvatar.src = item.owner && item.owner.avatar ? 
      `${UPLOADS_URL}/${item.owner.avatar}` : DEFAULT_AVATAR;
    ownerAvatar.alt = item.owner ? item.owner.nickname : '用户';
    ownerAvatar.onerror = () => {
      ownerAvatar.src = DEFAULT_AVATAR;
    };
    
    // 所有者昵称
    const ownerName = document.createElement('span');
    ownerName.classList.add('owner-name');
    ownerName.textContent = item.owner ? item.owner.nickname : '未知用户';
    
    // 组装元素
    owner.appendChild(ownerAvatar);
    owner.appendChild(ownerName);
    
    info.appendChild(title);
    info.appendChild(status);
    info.appendChild(owner);
    
    card.appendChild(img);
    card.appendChild(info);
    
    return card;
  }
  
  /**
   * 显示物品详情
   * @param {string} itemId - 物品ID
   */
  static async showItemDetail(itemId) {
    const itemDetailContainer = document.getElementById('item-detail-container');
    const itemDetailModal = document.getElementById('item-detail-modal');
    
    try {
      // 显示加载中提示
      itemDetailContainer.innerHTML = '<div class="loading">加载中...</div>';
      itemDetailModal.style.display = 'block';
      
      // 获取物品详情
      const item = await API.getItemById(itemId);
      
      // 构建物品详情HTML
      let html = `
        <div class="detail-images">`;
        
      // 添加物品图片
      if (item.images && item.images.length > 0) {
        const timestamp = new Date().getTime();
        html += item.images.map(image => 
          `<img src="${UPLOADS_URL}/images/${image}?t=${timestamp}" 
                alt="${item.title}" 
                class="detail-image" 
                onerror="this.onerror=null; this.src='../images/placeholder.jpg?t=${timestamp}';">`
        ).join('');
      } else {
        html += `<img src="../images/placeholder.jpg?t=${new Date().getTime()}" alt="无图片" class="detail-image">`;
      }
      
      html += `</div>
        <h2 class="detail-title">${item.title}</h2>
        <span class="detail-status ${ITEM_STATUS[item.status].class}">${ITEM_STATUS[item.status].text}</span>
        <div class="detail-info">
          <div class="detail-left">
            <div class="detail-region">
              <i class="fas fa-map-marker-alt"></i>
              <span>${REGIONS[item.region] || '未知地区'}</span>
            </div>
            <div class="detail-category">
              <i class="fas fa-tag"></i>
              <span>${CATEGORIES[item.category] || '未知类别'}</span>
            </div>
          </div>
        </div>
        <div class="detail-description">${item.description}</div>
        
        <div class="detail-owner">`;
        
      // 添加所有者头像  
      const ownerTimestamp = new Date().getTime();
      if (item.owner && item.owner.avatar) {
        html += `<img src="${UPLOADS_URL}/avatars/${item.owner.avatar}?t=${ownerTimestamp}" 
                     alt="${item.owner ? item.owner.nickname : '用户'}" 
                     class="detail-owner-avatar"
                     onerror="this.onerror=null; this.src='${DEFAULT_AVATAR}?t=${ownerTimestamp}';">`;
      } else {
        html += `<img src="${DEFAULT_AVATAR}?t=${ownerTimestamp}" 
                     alt="${item.owner ? item.owner.nickname : '用户'}" 
                     class="detail-owner-avatar">`;
      }
      
      html += `<div class="detail-owner-info">
            <h3 class="detail-owner-name">${item.owner ? item.owner.nickname : '未知用户'}</h3>
            <p class="detail-owner-bio">${item.owner && item.owner.bio ? item.owner.bio : '这个人很懒，还没有写简介'}</p>
          </div>
        </div>
      `;
      
      // 添加操作按钮
      if (Auth.isLoggedIn()) {
        const currentUser = Auth.getCurrentUser();
        const isOwner = currentUser && item.owner && currentUser._id === item.owner._id;
        
        html += '<div class="detail-actions">';
        
        if (!isOwner) {
          // 如果不是物品所有者，显示借用按钮
          if (item.status === 0) {
            html += `<button class="borrow-btn" data-id="${item._id}">申请借用</button>`;
          }
          
          // 添加点赞按钮
          const liked = item.likes && item.likes.includes(currentUser._id);
          html += `
            <button class="like-btn ${liked ? 'liked' : ''}" data-id="${item._id}">
              <i class="fas fa-heart"></i>
              <span>${liked ? '取消点赞' : '点赞'}</span>
            </button>
          `;
        } else {
          // 如果是物品所有者，显示编辑和删除按钮
          html += `
            <button class="edit-btn" data-id="${item._id}">编辑</button>
            <button class="delete-btn" data-id="${item._id}">删除</button>
          `;
        }
        
        html += '</div>';
      } else {
        // 未登录，显示登录提示
        html += `
          <div class="detail-actions">
            <button class="login-required-btn">登录后可借用或点赞</button>
          </div>
        `;
      }
      
      // 添加评论区域
      html += `
        <div class="detail-comments">
          <h3>评论区</h3>
          ${Auth.isLoggedIn() ? `
            <div class="comment-form">
              <input type="text" id="comment-input" placeholder="写下你的评论...">
              <button id="submit-comment" data-id="${item._id}">评论</button>
            </div>
          ` : ''}
          <div class="comments-list">
            ${item.comments && item.comments.length > 0 ? 
              item.comments.map(comment => `
                <div class="comment">
                  <img src="${comment.user && comment.user.avatar ? `${UPLOADS_URL}/${comment.user.avatar}` : DEFAULT_AVATAR}" 
                      alt="${comment.user ? comment.user.nickname : '用户'}" 
                      class="comment-avatar"
                      onerror="this.src='${DEFAULT_AVATAR}'">
                  <div class="comment-content">
                    <div class="comment-user">${comment.user ? comment.user.nickname : '未知用户'}</div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-date">${new Date(comment.date).toLocaleString()}</div>
                  </div>
                </div>
              `).join('') : 
              '<div class="no-comments">暂无评论</div>'}
          </div>
        </div>
      `;
      
      // 更新详情容器
      itemDetailContainer.innerHTML = html;
      
      // 添加按钮事件
      this.addDetailEvents(itemDetailContainer, item);
      
    } catch (error) {
      // 加载失败，显示错误信息
      itemDetailContainer.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
    }
  }
  
  /**
   * 为物品详情页面添加交互事件
   * @param {HTMLElement} container - 详情容器元素
   * @param {object} item - 物品数据
   */
  static addDetailEvents(container, item) {
    // 借用按钮
    const borrowBtn = container.querySelector('.borrow-btn');
    if (borrowBtn) {
      borrowBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        try {
          // 发送借用请求
          await API.requestBorrow(item._id);
          alert('已发送借用请求，请等待物主确认');
          
          // 刷新物品详情
          this.showItemDetail(item._id);
        } catch (error) {
          alert(`借用请求失败: ${error.message}`);
        }
      });
    }
    
    // 点赞按钮
    const likeBtn = container.querySelector('.like-btn');
    if (likeBtn) {
      likeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        try {
          // 发送点赞请求
          const result = await API.likeItem(item._id);
          
          // 更新按钮显示
          if (result.liked) {
            likeBtn.classList.add('liked');
            likeBtn.querySelector('span').textContent = '取消点赞';
          } else {
            likeBtn.classList.remove('liked');
            likeBtn.querySelector('span').textContent = '点赞';
          }
        } catch (error) {
          alert(`操作失败: ${error.message}`);
        }
      });
    }
    
    // 编辑按钮
    const editBtn = container.querySelector('.edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        alert('编辑功能待实现');
      });
    }
    
    // 删除按钮
    const deleteBtn = container.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        if (confirm('确定要删除这个物品吗？此操作不可恢复。')) {
          try {
            // 发送删除请求
            await API.deleteItem(item._id);
            alert('物品已删除');
            
            // 关闭详情模态框
            document.getElementById('item-detail-modal').style.display = 'none';
            
            // 刷新物品列表
            this.loadItems();
          } catch (error) {
            alert(`删除失败: ${error.message}`);
          }
        }
      });
    }
    
    // 未登录按钮
    const loginRequiredBtn = container.querySelector('.login-required-btn');
    if (loginRequiredBtn) {
      loginRequiredBtn.addEventListener('click', () => {
        Auth.showLoginRequired();
      });
    }
    
    // 提交评论按钮
    const submitCommentBtn = container.querySelector('#submit-comment');
    if (submitCommentBtn) {
      submitCommentBtn.addEventListener('click', async () => {
        const commentInput = container.querySelector('#comment-input');
        const text = commentInput.value.trim();
        
        if (!text) {
          alert('评论内容不能为空');
          return;
        }
        
        try {
          // 发送评论请求
          await API.addItemComment(item._id, text);
          
          // 清空输入框
          commentInput.value = '';
          
          // 刷新物品详情
          this.showItemDetail(item._id);
        } catch (error) {
          alert(`评论失败: ${error.message}`);
        }
      });
    }
  }
  
  /**
   * 筛选物品列表
   */
  static filterItems() {
    const region = document.getElementById('region-filter').value;
    const category = document.getElementById('category-filter').value;
    const search = document.getElementById('search-input').value.trim();
    
    // 构建筛选条件
    const filters = {};
    if (region) filters.region = region;
    if (category) filters.category = category;
    if (search) filters.search = search;
    
    // 加载筛选后的物品列表
    this.loadItems(filters);
  }
}
