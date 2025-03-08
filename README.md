
# 🚀  所有的代码都是 Cursor 生成，包括这个 README，除了这句话和下面一张图

<p align="center">
  <img src="https://static.1994131.xyz/uPic/VGgaK7.png" />
</p>

# Cloudflare R2 图片上传器

这是一个使用Node.js开发的应用程序，用于将图片上传到Cloudflare R2存储服务。

## 功能

- 上传图片到Cloudflare R2
- 获取已上传图片的URL
- 列出已上传的图片
- 删除已上传的图片

## 技术栈

- Node.js
- Express.js
- AWS SDK for JavaScript v3 (用于与R2兼容的S3 API交互)
- Multer (用于处理文件上传)

## 安装

1. 克隆仓库
```bash
git clone <repository-url>
cd cloudflare-r2-uploader
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
```
然后编辑`.env`文件，填入你的Cloudflare R2凭证和其他配置。

## 使用方法

1. 启动服务器
```bash
npm start
```

2. 开发模式（使用nodemon自动重启）
```bash
npm run dev
```

3. API端点
- `POST /upload`: 上传图片
- `GET /images`: 列出所有图片
- `GET /images/:key`: 获取特定图片的URL
- `DELETE /images/:key`: 删除特定图片

## Cloudflare R2设置

1. 在Cloudflare控制面板中创建R2存储桶
2. 创建API令牌，获取访问密钥和密钥ID
3. 将这些凭证添加到`.env`文件中

## 许可证

MIT 
