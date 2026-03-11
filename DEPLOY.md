# Maersk Automation System - 部署指南

## 系统概述

这是一个智能航运自动化处理系统，可以自动登录马士基网站并执行各种操作（查询船期、查看订舱、下载文件等）。

## 系统架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   前端 (React)  │────▶│  后端 (Node.js) │────▶│  浏览器自动化   │
│                 │◄────│   + WebSocket   │◄────│  (Playwright)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 部署要求

### 服务器要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **内存**: 至少 2GB RAM (推荐 4GB+)
- **CPU**: 至少 2 核心
- **磁盘**: 至少 20GB 可用空间
- **网络**: 能够访问 www.maersk.com

### 软件依赖
- Node.js 18+
- npm 9+
- Playwright 浏览器依赖

## 部署步骤

### 1. 安装 Node.js

```bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# 验证安装
node -v
npm -v
```

### 2. 安装 Playwright 依赖

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpango-1.0-0 \
  libcairo2 \
  libatspi2.0-0

# 安装 Playwright 浏览器
npx playwright install chromium
```

### 3. 部署后端服务

```bash
# 创建应用目录
mkdir -p /opt/maersk-automation
cd /opt/maersk-automation

# 上传代码
# 将 server/ 目录上传到 /opt/maersk-automation/server/

# 安装依赖
cd server
npm install

# 安装 Playwright
npm install playwright
npx playwright install chromium

# 创建环境变量文件
cat > .env << EOF
PORT=3000
NODE_ENV=production
EOF

# 测试启动
node index.js
```

### 4. 配置 PM2 进程管理

```bash
# 安装 PM2
npm install -g pm2

# 创建 PM2 配置文件
cat > /opt/maersk-automation/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'maersk-automation',
    script: './server/index.js',
    cwd: '/opt/maersk-automation',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/var/log/maersk-automation/app.log',
    out_file: '/var/log/maersk-automation/out.log',
    err_file: '/var/log/maersk-automation/err.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# 创建日志目录
sudo mkdir -p /var/log/maersk-automation

# 启动服务
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save
pm2 startup
```

### 5. 配置 Nginx 反向代理

```bash
# 安装 Nginx
sudo apt-get install -y nginx

# 创建 Nginx 配置文件
sudo cat > /etc/nginx/sites-available/maersk-automation << EOF
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # 前端静态文件
    location / {
        root /opt/maersk-automation/app/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # WebSocket 支持
        proxy_read_timeout 86400;
    }

    # WebSocket 代理
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 启用配置
sudo ln -sf /etc/nginx/sites-available/maersk-automation /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 6. 配置 HTTPS (使用 Let's Encrypt)

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 7. 配置防火墙

```bash
# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 允许 SSH (如果还没允许)
sudo ufw allow 22/tcp

# 启用防火墙
sudo ufw enable
```

## 使用说明

### 访问系统

打开浏览器访问: `https://your-domain.com`

### 配置任务

1. **基础设置**
   - 选择任务类型 (登录测试/查询船期/查看订舱/下载文件)
   - 输入 Maersk 账号和密码
   - 选择验证码处理方式
   - 配置通知方式

2. **高级选项**
   - 浏览器模式 (有头/无头)
   - 操作延迟和页面超时
   - Scrapfly API Key (可选)
   - 飞书 Webhook URL (可选)

3. **开始执行**
   - 点击"开始执行"按钮
   - 实时查看执行日志
   - 通过 VNC 观看浏览器操作

### API 接口

#### 创建任务
```bash
POST /api/tasks
Content-Type: application/json

{
  "taskType": "login",
  "username": "your-username",
  "password": "your-password",
  "captchaMode": "manual",
  "browserMode": "headed",
  "notifications": {
    "feishu": true,
    "dingtalk": false,
    "webhook": true
  }
}
```

#### 获取任务状态
```bash
GET /api/tasks/:taskId
```

#### 获取所有任务
```bash
GET /api/tasks
```

#### 取消任务
```bash
DELETE /api/tasks/:taskId
```

## 故障排除

### 1. Playwright 浏览器无法启动

```bash
# 检查依赖
ldd ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome

# 重新安装浏览器
npx playwright install --with-deps chromium
```

### 2. 内存不足

```bash
# 增加交换空间
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久生效
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3. 无法连接到 Maersk 网站

```bash
# 检查网络连接
curl -I https://www.maersk.com

# 检查 DNS 解析
nslookup www.maersk.com
```

### 4. 查看日志

```bash
# 查看应用日志
pm2 logs maersk-automation

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 安全建议

1. **使用强密码**: 确保 Maersk 账号使用强密码
2. **限制访问**: 使用 IP 白名单或 VPN 访问系统
3. **定期更新**: 保持系统和依赖项更新
4. **备份数据**: 定期备份任务配置和历史记录
5. **监控日志**: 定期检查系统日志发现异常

## 更新部署

```bash
cd /opt/maersk-automation

# 停止服务
pm2 stop maersk-automation

# 更新代码
# 上传新的代码文件

# 安装依赖
cd server && npm install && cd ..

# 重启服务
pm2 restart maersk-automation

# 查看状态
pm2 status
```

## 技术支持

如有问题，请检查:
1. 系统日志: `pm2 logs`
2. Nginx 日志: `/var/log/nginx/`
3. 应用日志: `/var/log/maersk-automation/`
