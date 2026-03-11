# Docker 一键部署指南

## 🚀 快速开始（3步完成）

### 第1步：确保Docker已安装

```bash
# 检查Docker
docker --version
docker-compose --version

# 如果没安装，参考：https://docs.docker.com/get-docker/
```

### 第2步：克隆项目并进入目录

```bash
git clone https://github.com/MaerskLogis/maersk-automation.git
cd maersk-automation
```

### 第3步：一键启动

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 等待1-2分钟，让浏览器初始化
sleep 60

# 查看日志
docker-compose logs -f
```

## 🌐 访问系统

启动成功后，通过以下地址访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端界面** | `http://你的服务器IP` | 任务配置和执行状态 |
| **VNC画面** | `http://你的服务器IP:6080/vnc.html` | 实时浏览器画面 |
| **后端API** | `http://你的服务器IP:3000/api/health` | 健康检查 |

## 📁 项目结构

```
maersk-automation/
├── app/                      # React前端
├── server/                   # Node.js后端
├── docker-deploy/            # Docker配置文件
├── Dockerfile                # Docker镜像构建
├── docker-compose.yml        # 服务编排
├── supervisord.conf          # 进程管理
├── nginx.conf                # Web服务器配置
└── DOCKER_DEPLOY.md          # 本文件
```

## 🔧 常用命令

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

# 查看VNC服务状态
docker-compose exec maersk-automation supervisorctl status
```

## 🐛 故障排除

### VNC画面空白

```bash
# 检查VNC服务
docker-compose exec maersk-automation supervisorctl status

# 重启VNC服务
docker-compose exec maersk-automation supervisorctl restart x11vnc novnc

# 查看VNC日志
docker-compose exec maersk-automation tail -f /var/log/supervisor/x11vnc.log
```

### 浏览器无法启动

```bash
# 查看后端日志
docker-compose logs backend

# 检查Xvfb是否运行
docker-compose exec maersk-automation ps aux | grep Xvfb
```

### 端口冲突

修改 `docker-compose.yml`：
```yaml
ports:
  - "8080:80"     # 前端改为8080
  - "3001:3000"   # 后端改为3001
  - "6081:6080"   # VNC改为6081
```

## 🔒 防火墙配置

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 6080/tcp

# CentOS
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=6080/tcp
sudo firewall-cmd --reload
```

## 📊 服务说明

Docker容器内运行以下服务：

| 服务 | 端口 | 说明 |
|------|------|------|
| Xvfb | - | 虚拟显示服务器 |
| x11vnc | 5900 | VNC服务器 |
| noVNC | 6080 | Web VNC客户端 |
| Nginx | 80 | 前端Web服务器 |
| Node.js | 3000 | 后端API服务 |

## 📝 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建
docker-compose down
docker-compose up -d --build
```

## ✅ 验证部署成功

```bash
# 1. 检查容器运行
docker-compose ps

# 2. 检查所有服务
docker-compose exec maersk-automation supervisorctl status

# 3. 测试API
curl http://localhost:3000/api/health

# 4. 访问VNC
# 打开浏览器访问 http://服务器IP:6080/vnc.html
```

## 🎯 功能特点

- ✅ **真实浏览器**：使用Playwright控制真实Chromium浏览器
- ✅ **VNC画面**：通过noVNC实时观看浏览器操作
- ✅ **自动登录**：自动访问maersk.com并登录
- ✅ **实时日志**：WebSocket推送执行日志
- ✅ **任务历史**：保存所有任务执行记录

---

**部署完成后，你将看到真实的浏览器自动化过程，而不是模拟画面！**
