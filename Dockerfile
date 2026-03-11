# Maersk Automation System - Docker镜像
# 包含: Node.js, Playwright浏览器, noVNC, 前端, 后端

FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    xvfb \
    x11vnc \
    novnc \
    websockify \
    supervisor \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# 安装Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# 复制项目文件
COPY app/ ./app/
COPY server/ ./server/
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/nginx.conf

# 安装前端依赖并构建
WORKDIR /app/app
RUN npm install && npm run build

# 安装后端依赖
WORKDIR /app/server
RUN npm install

# 安装Playwright浏览器
RUN npx playwright install chromium

# 创建工作目录
WORKDIR /app

# 暴露端口
# 80 - Nginx (前端)
# 3000 - 后端API
# 6080 - noVNC
EXPOSE 80 3000 6080

# 启动supervisor管理所有服务
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
