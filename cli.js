#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { uploadImage, getImageUrl } = require('./services/r2Service');

// 检查命令行参数
if (process.argv.length < 3) {
  console.log('用法: node cli.js <图片路径>');
  process.exit(1);
}

// 获取图片路径
const imagePath = process.argv[2];

// 检查文件是否存在
if (!fs.existsSync(imagePath)) {
  console.error(`错误: 文件 "${imagePath}" 不存在`);
  process.exit(1);
}

// 检查文件是否为图片
const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp'
};

const ext = path.extname(imagePath).toLowerCase();
if (!mimeTypes[ext]) {
  console.error(`错误: 文件 "${imagePath}" 不是支持的图片格式`);
  console.error(`支持的格式: ${Object.keys(mimeTypes).join(', ')}`);
  process.exit(1);
}

// 创建模拟的multer文件对象
const file = {
  originalname: path.basename(imagePath),
  path: imagePath,
  mimetype: mimeTypes[ext],
  size: fs.statSync(imagePath).size
};

// 上传图片
console.log(`正在上传 ${imagePath}...`);

uploadImage(file)
  .then(result => {
    console.log('\n上传成功!');
    console.log('-------------------');
    console.log(`文件名: ${result.key}`);
    console.log(`大小: ${formatFileSize(result.size)}`);
    console.log(`类型: ${result.mimetype}`);
    console.log(`URL: ${result.url || '无公共URL'}`);
    console.log('-------------------');
  })
  .catch(error => {
    console.error('上传失败:', error.message);
    process.exit(1);
  });

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 