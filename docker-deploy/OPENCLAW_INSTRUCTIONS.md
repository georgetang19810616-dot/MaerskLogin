# 提供给 OpenClaw 的完整 Docker 部署配置

## 📦 文件清单

已为你准备好以下 Docker 部署文件：

```
docker-deploy/
├── Dockerfile              # Docker镜像构建
├── docker-compose.yml      # 一键启动配置
├── supervisord.conf        # 服务进程管理
├── nginx.conf              # Web服务器配置
├── automation.js           # 浏览器自动化（支持真实VNC）
├── server-index.js         # 后端主程序（支持截图推送）
├── deploy.sh               # 一键部署脚本
├── README.md               # 部署文档
├── FILES.md                # 文件说明
└── .github/workflows/
    └── docker-build.yml    # GitHub Actions自动构建
```

## 🚀 快速部署（3步完成）

### 第1步：复制文件到项目

```bash
# 在项目根目录执行
cd /path/to/maersk-automation

# 复制Docker文件
cp docker-deploy/Dockerfile .
cp docker-deploy/docker-compose.yml .
mkdir -p docker-deploy
cp docker-deploy/supervisord.conf docker-deploy/
cp docker-deploy/nginx.conf docker-deploy/

# 替换后端文件（支持真实浏览器和VNC）
cp docker-deploy/automation.js server/automation.js
cp docker-deploy/server-index.js server/index.js
```

### 第2步：修改 docker-compose.yml

将 `docker-compose.yml` 中的：
```yaml
build:
  context: ..
  dockerfile: docker-deploy/Dockerfile
```

改为：
```yaml
build:
  context: .
  dockerfile: Dockerfile
```

### 第3步：启动服务

```bash
# 构建并启动
docker-compose up -d --build

# 等待1-2分钟
docker-compose logs -f
```

## 🌐 访问地址

启动成功后，通过以下地址访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端界面** | `http://你的服务器IP` | 任务配置和执行状态 |
| **VNC画面** | `http://你的服务器IP:6080/vnc.html` | 实时浏览器画面 |
| **后端API** | `http://你的服务器IP:3000` | API接口 |

## 📋 完整项目结构

```
maersk-automation/
├── app/                      # React前端（已存在）
│   ├── src/
│   ├── dist/
│   └── package.json
├── server/                   # Node.js后端
│   ├── index.js              # ← 替换为docker-deploy/server-index.js
│   ├── automation.js         # ← 替换为docker-deploy/automation.js
│   └── package.json
├── docker-deploy/            # Docker配置（已存在）
│   ├── supervisord.conf
│   ├── nginx.conf
│   └── ...
├── Dockerfile                # ← 从docker-deploy复制
├── docker-compose.yml        # ← 从docker-deploy复制（需修改路径）
└── .github/workflows/        # GitHub Actions（可选）
    └── docker-build.yml
```

## 🔧 关键配置说明

### Dockerfile 特点
- 基于 `playwright:v1.40.0-jammy` 镜像（已包含Chromium浏览器）
- 安装 Xvfb + x11vnc + noVNC（虚拟显示和VNC服务）
- 使用 Supervisor 管理所有进程
- 包含 Nginx 作为前端服务器

### 服务进程
1. **Xvfb** - 虚拟显示服务器 (`:99`)
2. **x11vnc** - VNC服务器 (端口5900)
3. **noVNC** - Web VNC客户端 (端口6080)
4. **Nginx** - Web服务器 (端口80)
5. **Node.js** - 后端API (端口3000)

### 端口映射
```yaml
ports:
  - "80:80"       # 前端界面
  - "3000:3000"   # 后端API
  - "6080:6080"   # VNC画面
```

## 🐛 常见问题

### 1. VNC画面空白
```bash
# 检查VNC服务
docker-compose exec maersk-automation supervisorctl status

# 重启VNC
docker-compose exec maersk-automation supervisorctl restart x11vnc novnc
```

### 2. 浏览器无法启动
```bash
# 查看后端日志
docker-compose logs backend

# 检查Xvfb
docker-compose exec maersk-automation ps aux | grep Xvfb
```

### 3. 端口冲突
修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "8080:80"     # 前端改为8080
  - "3001:3000"   # 后端改为3001
  - "6081:6080"   # VNC改为6081
```

## 📝 提交到GitHub

```bash
# 添加新文件
git add docker-deploy/
git add Dockerfile docker-compose.yml
git add server/automation.js server/index.js

# 提交
git commit -m "Add Docker deployment configuration with VNC support"

# 推送
git push origin main
```

## 🎯 一键部署脚本

也可以直接使用提供的脚本：

```bash
chmod +x docker-deploy/deploy.sh
./docker-deploy/deploy.sh
```

## ✅ 验证部署

```bash
# 检查容器运行状态
docker-compose ps

# 检查所有服务
docker-compose exec maersk-automation supervisorctl status

# 测试API
curl http://localhost:3000/api/health
```

## 📞 需要OpenClaw完成的

1. 复制 `docker-deploy/` 目录下的所有文件到项目
2. 将 `Dockerfile` 和 `docker-compose.yml` 放到项目根目录
3. 修改 `docker-compose.yml` 中的 `context` 路径
4. 替换 `server/automation.js` 和 `server/index.js`
5. 提交到GitHub
6. 在服务器上运行 `docker-compose up -d --build`

---

**完成以上步骤后，你将拥有：**
- ✅ 可访问的前端界面
- ✅ 真实的浏览器自动化（非模拟）
- ✅ 实时VNC画面显示
- ✅ 完整的任务执行日志
