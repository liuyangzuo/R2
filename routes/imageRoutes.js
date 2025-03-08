const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const r2Service = require('../services/r2Service');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置Multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器，只允许图片
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件！'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 限制20MB
  }
});

// 上传图片
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有提供图片文件' });
    }

    const result = await r2Service.uploadImage(req.file);
    res.status(201).json(result);
  } catch (error) {
    console.error('上传处理错误:', error);
    res.status(500).json({ error: '上传图片失败', message: error.message });
  }
});

// 获取所有图片
router.get('/', async (req, res) => {
  try {
    const images = await r2Service.listImages();
    res.json(images);
  } catch (error) {
    console.error('获取图片列表错误:', error);
    res.status(500).json({ error: '获取图片列表失败', message: error.message });
  }
});

// 获取特定图片的URL
router.get('/:key', async (req, res) => {
  try {
    const url = await r2Service.getImageUrl(req.params.key);
    res.json({ key: req.params.key, url });
  } catch (error) {
    console.error('获取图片URL错误:', error);
    res.status(500).json({ error: '获取图片URL失败', message: error.message });
  }
});

// 删除图片
router.delete('/:key', async (req, res) => {
  try {
    const result = await r2Service.deleteImage(req.params.key);
    res.json(result);
  } catch (error) {
    console.error('删除图片错误:', error);
    res.status(500).json({ error: '删除图片失败', message: error.message });
  }
});

module.exports = router; 