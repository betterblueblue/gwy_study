# MongoDB安装和配置指南

## 1. 导入MongoDB公钥并添加官方源
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
```

## 2. 更新软件包并安装MongoDB
```bash
sudo apt-get update
sudo apt-get install -y mongodb-org
```

## 3. 启动MongoDB服务并设置开机自启
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 4. 创建数据库用户和设置访问权限
1. 连接到MongoDB Shell
```bash
mongosh
```

2. 创建管理员用户
```javascript
use admin
db.createUser(
  {
    user: "admin",
    pwd: "your_secure_password",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)
```

3. 创建应用数据库用户
```javascript
use gwy_study
db.createUser(
  {
    user: "gwy_app",
    pwd: "your_app_password",
    roles: [ { role: "readWrite", db: "gwy_study" } ]
  }
)
```

## 5. 配置MongoDB允许远程连接
1. 编辑MongoDB配置文件
```bash
sudo nano /etc/mongod.conf
```

2. 修改bindIp配置
```yaml
net:
  port: 27017
  bindIp: 0.0.0.0
```

3. 重启MongoDB服务
```bash
sudo systemctl restart mongod
```

## 6. 验证安装
```bash
mongosh --eval 'db.runCommand({ connectionStatus: 1 })'
```

## 安全建议
1. 使用强密码
2. 限制防火墙只允许特定IP访问27017端口
3. 定期备份数据库
4. 保持MongoDB版本更新以修复安全漏洞