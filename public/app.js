document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const uploadForm = document.getElementById('upload-form');
  const imageInput = document.getElementById('image-input');
  const fileNameDisplay = document.getElementById('file-name');
  const imagePreview = document.getElementById('image-preview');
  const uploadStatus = document.getElementById('upload-status');
  const imageList = document.getElementById('image-list');
  const imageTemplate = document.getElementById('image-template');

  // 文件选择事件
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 显示文件名
    fileNameDisplay.textContent = file.name;

    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  // 表单提交事件
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const file = imageInput.files[0];
    if (!file) {
      showStatus('请选择一个图片文件', 'error');
      return;
    }

    // 创建FormData对象
    const formData = new FormData();
    formData.append('image', file);

    // 显示上传中状态
    showStatus('上传中...', 'info');
    
    try {
      // 发送上传请求
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '上传失败');
      }

      const result = await response.json();
      
      // 显示成功状态
      showStatus(`图片上传成功: ${result.key}`, 'success');
      
      // 重置表单
      uploadForm.reset();
      fileNameDisplay.textContent = '';
      imagePreview.style.display = 'none';
      
      // 刷新图片列表
      loadImages();
    } catch (error) {
      showStatus(`上传错误: ${error.message}`, 'error');
    }
  });

  // 显示状态信息
  function showStatus(message, type = 'info') {
    uploadStatus.textContent = message;
    uploadStatus.className = 'status';
    uploadStatus.classList.add(type);
    
    // 5秒后自动清除成功或信息状态
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        uploadStatus.textContent = '';
        uploadStatus.className = 'status';
      }, 5000);
    }
  }

  // 加载图片列表
  async function loadImages() {
    try {
      imageList.innerHTML = '<div class="loading">加载中...</div>';
      
      const response = await fetch('/api/images');
      if (!response.ok) {
        throw new Error('获取图片列表失败');
      }
      
      const images = await response.json();
      
      // 清空列表
      imageList.innerHTML = '';
      
      if (images.length === 0) {
        imageList.innerHTML = '<div class="loading">没有找到图片</div>';
        return;
      }
      
      // 添加图片到列表
      images.forEach(image => {
        const imageElement = createImageElement(image);
        imageList.appendChild(imageElement);
      });
    } catch (error) {
      imageList.innerHTML = `<div class="loading error">错误: ${error.message}</div>`;
    }
  }

  // 创建图片元素
  function createImageElement(image) {
    const template = imageTemplate.content.cloneNode(true);
    const imageItem = template.querySelector('.image-item');
    
    // 设置图片
    const img = template.querySelector('img');
    img.src = image.url;
    img.alt = image.key;
    
    // 设置信息
    template.querySelector('.image-name').textContent = image.key;
    template.querySelector('.image-size').textContent = formatFileSize(image.size);
    
    // 复制URL按钮
    const copyUrlBtn = template.querySelector('.copy-url-btn');
    copyUrlBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(image.url)
        .then(() => {
          copyUrlBtn.textContent = '已复制!';
          setTimeout(() => {
            copyUrlBtn.textContent = '复制链接';
          }, 2000);
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    });
    
    // 删除按钮
    const deleteBtn = template.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async () => {
      if (confirm(`确定要删除图片 ${image.key} 吗?`)) {
        try {
          const response = await fetch(`/api/images/${image.key}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            throw new Error('删除失败');
          }
          
          // 从DOM中移除
          imageItem.remove();
          
          // 如果没有图片了，显示提示
          if (imageList.children.length === 0) {
            imageList.innerHTML = '<div class="loading">没有找到图片</div>';
          }
          
          showStatus(`图片 ${image.key} 已删除`, 'success');
        } catch (error) {
          showStatus(`删除错误: ${error.message}`, 'error');
        }
      }
    });
    
    return imageItem;
  }

  // 格式化文件大小
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 初始加载图片
  loadImages();
}); 