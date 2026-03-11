# Maersk Automation System - Docker部署指南

## 快速开始

### 方式1: 使用 Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/MaerskLogis/maersk-automation.git
cd maersk-automation/docker-deploy

# 2. 启动服务
docker-compose up -d

# 3. 等待服务启动（约30秒）
sleep 30

# 4. 访问系统
# 前端界面: http://你的服务器IP
# VNC画面: http://你的服务器IP:6080/vnc.html
```

### 方式2: 使用 Dockerfile 构建

```bash
# 1. 构建镜像
docker build -t maersk-automation -f docker-deploy/Dockerfile .

# 2. 运行容器
docker run -d \
  --name maersk-automation \
  -p 80:80 \
  -p 3000:3000 \
  -p 6080:6080 \
  --shm-size=2gb \
  maersk-automation
```

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端界面 | http://服务器IP | 任务配置和执行状态 |
| 后端API | http://服务器IP:3000 | API接口 |
| VNC画面 | http://服务器IP:6080/vnc.html | 实时浏览器画面 |

## 常用命令

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 进入容器
docker-compose exec maersk-automation bash

# 查看VNC服务日志
docker-compose exec maersk-automation tail -f /var/log/supervisor/x11vnc.log
```

## 配置说明

### 环境变量

在 `docker-compose.yml` 中可以修改以下配置：

```yaml
environment:
  - DISPLAY=:99           # 虚拟显示
  - SCREEN_WIDTH=1920     # 屏幕宽度
  - SCREEN_HEIGHT=1080    # 屏幕高度
  - VNC_PORT=5900         # VNC端口
  - NOVNC_PORT=6080       # noVNC端口
```

### 端口映射

```yaml
ports:
  - "80:80"       # 前端界面
  - "3000:3000"   # 后端API
  - "6080:6080"   # noVNC
```

如果需要修改端口：
```yaml
ports:
  - "8080:80"     # 前端改为8080
  - "3001:3000"   # 后端改为3001
  - "6081:6080"   # VNC改为6081
```

## 故障排除

### 1. VNC无法连接

```bash
# 检查VNC服务状态
docker-compose exec maersk-automation supervisorctl status

# 重启VNC服务
docker-compose exec maersk-automation supervisorctl restart x11vnc
```

### 2. 浏览器无法启动

```bash
# 检查浏览器日志
docker-compose exec maersk-automation tail -f /var/log/supervisor/backend.log

# 检查Xvfb日志
docker-compose exec maersk-automation tail -f /var/log/supervisor/xvfb.log
```

### 3. 内存不足

```bash
# 增加共享内存
docker-compose down
docker-compose up -d --shm-size=4gb
```

### 4. 防火墙问题

```bash
# 开放端口（Ubuntu/Debian）
sudo ufw allow 80/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 6080/tcp

# 开放端口（CentOS）
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=6080/tcp
sudo firewall-cmd --reload
```

## 文件结构

```
docker-deploy/
├── Dockerfile              # Docker镜像构建文件
├── docker-compose.yml      # Docker Compose配置
├── supervisord.conf        # 服务管理配置
├── nginx.conf              # Nginx配置
├── automation.js           # 浏览器自动化（支持VNC）
└── README.md               # 本文件
```

## 更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose down
docker-compose build --no-cache

# 3. 启动服务
docker-compose up -d
```

## 安全建议

1. **修改默认端口**: 避免使用80/3000/6080等常见端口
2. **配置HTTPS**: 使用Nginx反向代理配置SSL证书
3. **设置访问密码**: 配置VNC密码
4. **限制IP访问**: 使用防火墙限制访问来源

## 技术支持

如有问题，请检查：
1. 容器日志: `docker-compose logs`
2. 服务状态: `docker-compose exec maersk-automation supervisorctl status`
3. 端口占用: `netstat -tlnp | grep 6080`
