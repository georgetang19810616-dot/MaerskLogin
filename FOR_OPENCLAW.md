# 给 OpenClaw 的 Docker 部署配置说明

## 📦 已准备好的文件

项目根目录下已有以下Docker部署文件：

```
maersk-automation/
├── Dockerfile                    # Docker镜像构建配置 ✅
├── docker-compose.yml            # 一键启动配置 ✅
├── supervisord.conf              # 进程管理配置 ✅
├── nginx.conf                    # Web服务器配置 ✅
├── DOCKER_DEPLOY.md              # Docker部署指南 ✅
├── app/                          # React前端
├── server/                       # Node.js后端（已更新）
│   ├── index.js                  # ← 已替换为支持VNC的版本
│   └── automation.js             # ← 已替换为真实浏览器版本
└── docker-deploy/                # Docker配置文件备份
```

## 🚀 一键部署命令

在你的服务器上执行：

```bash
# 1. 进入项目目录
cd /path/to/maersk-automation

# 2. 构建并启动（只需这一条命令）
docker-compose up -d --build

# 3. 等待1-2分钟初始化
docker-compose logs -f

# 4. 访问系统
# 前端: http://你的服务器IP
# VNC:  http://你的服务器IP:6080/vnc.html
```

## 🌐 访问地址

| 服务 | 地址 |
|------|------|
| **前端界面** | `http://服务器IP` |
| **VNC画面** | `http://服务器IP:6080/vnc.html` |
| **API** | `http://服务器IP:3000` |

## 🔧 关键修改说明

### 1. 后端代码已更新

- `server/automation.js` - 支持真实浏览器和VNC显示
- `server/index.js` - 支持截图实时推送到前端

### 2. Docker配置包含

- **Xvfb** - 虚拟显示服务器
- **x11vnc** - VNC服务器
- **noVNC** - Web版VNC客户端
- **Nginx** - 前端Web服务器
- **Node.js** - 后端API
- **Playwright** - 浏览器自动化

### 3. 浏览器配置

```javascript
// 有头模式，在VNC中可见
headless: false,
args: ['--display=:99', '--window-size=1920,1080']
```

## ✅ 验证部署成功

```bash
# 检查容器状态
docker-compose ps

# 检查所有服务
docker-compose exec maersk-automation supervisorctl status

# 查看日志
docker-compose logs -f
```

## 🐛 常见问题

### VNC画面空白
```bash
docker-compose exec maersk-automation supervisorctl restart x11vnc novnc
```

### 端口冲突
修改 `docker-compose.yml` 中的端口映射即可。

## 📋 需要OpenClaw做的

1. ✅ 确保服务器已安装Docker和Docker Compose
2. ✅ 在项目根目录执行 `docker-compose up -d --build`
3. ✅ 等待1-2分钟
4. ✅ 访问 `http://服务器IP:6080/vnc.html` 查看VNC画面
5. ✅ 访问 `http://服务器IP` 使用前端界面

---

**部署完成后，你将看到真实的Chromium浏览器在VNC中运行，而不是模拟画面！**
