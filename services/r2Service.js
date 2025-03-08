const {
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { r2Client, bucketName, publicUrl } = require('../config/r2');
const path = require('path');
const fs = require('fs');

/**
 * 上传图片到R2
 * @param {Object} file - Multer文件对象
 * @returns {Promise<Object>} 上传结果
 */
async function uploadImage(file) {
  try {
    // 生成唯一的文件名
    const timestamp = Date.now();
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const fileName = `${path.basename(originalName, extension)}-${timestamp}${extension}`;
    
    // 读取文件内容
    const fileContent = fs.readFileSync(file.path);
    
    // 设置上传参数
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: file.mimetype,
    };
    
    // 执行上传
    const command = new PutObjectCommand(params);
    await r2Client.send(command);
    
    // 删除临时文件
    fs.unlinkSync(file.path);
    
    // 返回上传结果
    return {
      success: true,
      key: fileName,
      url: publicUrl ? `${publicUrl}/${fileName}` : null,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
}

/**
 * 获取图片的签名URL
 * @param {string} key - 图片的键值
 * @param {number} expiresIn - URL过期时间（秒）
 * @returns {Promise<string>} 签名URL
 */
async function getImageUrl(key, expiresIn = 3600) {
  try {
    if (publicUrl) {
      return `${publicUrl}/${key}`;
    }
    
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    
    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error) {
    console.error('获取图片URL失败:', error);
    throw error;
  }
}

/**
 * 列出所有图片
 * @returns {Promise<Array>} 图片列表
 */
async function listImages() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName
    });
    
    const response = await r2Client.send(command);
    
    if (!response.Contents) {
      return [];
    }
    
    return Promise.all(response.Contents.map(async (item) => {
      return {
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        url: await getImageUrl(item.Key)
      };
    }));
  } catch (error) {
    console.error('列出图片失败:', error);
    throw error;
  }
}

/**
 * 删除图片
 * @param {string} key - 图片的键值
 * @returns {Promise<Object>} 删除结果
 */
async function deleteImage(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    
    await r2Client.send(command);
    
    return {
      success: true,
      key
    };
  } catch (error) {
    console.error('删除图片失败:', error);
    throw error;
  }
}

module.exports = {
  uploadImage,
  getImageUrl,
  listImages,
  deleteImage
}; 