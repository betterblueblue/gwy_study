# 公务员备考系统

一个基于Vue 3和Element Plus的公务员备考系统，帮助考生更好地准备公务员考试。

## 功能特点

- 笔记管理：分类整理学习笔记
- 错题本：记录和复习做错的题目
- 练习系统：在线练习题目
- 学习计划：制定和跟踪学习计划

## 技术栈

- Vue 3
- Vite
- Vue Router
- Pinia
- Element Plus
- Axios

## 部署说明

### 环境要求

- Node.js 18+
- Nginx

### 服务器配置

1. 安装Node.js和npm：
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. 安装Nginx：
```bash
sudo apt update
sudo apt install nginx
```

3. 配置Nginx：
- 将项目的nginx.conf文件复制到/etc/nginx/sites-available/
- 创建软链接到sites-enabled
- 重启Nginx服务

### GitHub Actions配置

1. 在GitHub仓库设置中添加以下Secrets：
- SERVER_HOST：服务器IP地址
- SERVER_USERNAME：SSH用户名
- SSH_PRIVATE_KEY：SSH私钥

2. 推送代码到main分支会自动触发部署

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 许可证

MIT