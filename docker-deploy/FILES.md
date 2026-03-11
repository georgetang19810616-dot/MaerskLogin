# Docker部署文件清单

## 必需文件

将这些文件复制到你的项目目录：

```
maersk-automation/
├── app/                      # 前端代码（已存在）
│   ├── src/
│   ├── dist/
│   └── package.json
├── server/                   # 后端代码（已存在）
│   ├── index.js
│   ├── automation.js
│   └── package.json
├── docker-deploy/            # Docker部署文件（新增）
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── supervisord.conf
│   ├── nginx.conf
│   ├── automation.js         # 替换server/automation.js
│   ├── server-index.js       # 替换server/index.js
│   ├── deploy.sh
│   ├── README.md
│   └── FILES.md              # 本文件
```

## 快速部署步骤

### 1. 复制Docker部署文件

```bash
# 在项目根目录执行
cp docker-deploy/Dockerfile .
cp docker-deploy/docker-compose.yml .
cp docker-deploy/supervisord.conf docker-deploy/
cp docker-deploy/nginx.conf docker-deploy/
cp docker-deploy/automation.js server/automation.js
cp docker-deploy/server-index.js server/index.js
```

### 2. 修改docker-compose.yml中的路径

```yaml
build:
  context: .
  dockerfile: Dockerfile
```

### 3. 构建并启动

```bash
docker-compose up -d --build
```

## 文件说明

| 文件 | 用途 | 位置 |
|------|------|------|
| Dockerfile | Docker镜像构建配置 | 项目根目录 |
| docker-compose.yml | 多容器编排配置 | 项目根目录 |
| supervisord.conf | 进程管理配置 | docker-deploy/ |
| nginx.conf | Web服务器配置 | docker-deploy/ |
| automation.js | 浏览器自动化（支持VNC） | server/（替换原文件） |
| server-index.js | 后端主程序（支持截图推送） | server/（替换原文件） |
| deploy.sh | 一键部署脚本 | docker-deploy/ |

## 端口说明

| 端口 | 服务 | 访问地址 |
|------|------|----------|
| 80 | Nginx（前端） | http://服务器IP |
| 3000 | Node.js后端 | http://服务器IP:3000 |
| 6080 | noVNC | http://服务器IP:6080/vnc.html |
| 5900 | VNC服务器 | vnc://服务器IP:5900 |

## 提供给OpenClaw的完整指令

```
项目地址: https://github.com/MaerskLogis/maersk-automation

需要完成的Docker部署配置：

1. 复制以下文件到项目根目录：
   - docker-deploy/Dockerfile
   - docker-deploy/docker-compose.yml
   - docker-deploy/supervisord.conf
   - docker-deploy/nginx.conf

2. 替换以下文件：
   - server/automation.js → docker-deploy/automation.js
   - server/index.js → docker-deploy/server-index.js

3. 修改docker-compose.yml中的build路径

4. 确保Docker和Docker Compose已安装

5. 运行: docker-compose up -d --build

6. 访问: http://服务器IP 和 http://服务器IP:6080/vnc.html
```
