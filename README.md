# Maersk Automation System

智能航运自动化处理系统 - 自动登录马士基网站并执行各种操作。

## 功能特性

- **自动登录**: 自动访问 www.maersk.com 并完成登录
- **任务类型**: 支持登录测试、查询船期、查看订舱、下载文件
- **实时日志**: WebSocket 实时推送执行日志
- **VNC预览**: 实时查看浏览器操作画面
- **通知集成**: 支持飞书、钉钉、Webhook 通知
- **反爬虫保护**: 集成 Scrapfly 代理服务
- **历史记录**: 保存所有任务执行历史

## 技术栈

### 前端
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion (动画)
- Zustand (状态管理)

### 后端
- Node.js + Express
- Playwright (浏览器自动化)
- WebSocket (实时通信)

## 项目结构

```
maersk-automation/
├── app/                    # 前端应用
│   ├── src/
│   │   ├── sections/       # 页面组件
│   │   │   ├── TaskConfigPanel.tsx
│   │   │   └── ExecutionStatusPanel.tsx
│   │   ├── services/       # API 服务
│   │   │   └── api.ts
│   │   ├── store/          # 状态管理
│   │   │   └── index.ts
│   │   ├── types/          # TypeScript 类型
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── dist/               # 构建输出
│   └── package.json
├── server/                 # 后端服务
│   ├── index.js            # 主入口
│   ├── automation.js       # 自动化逻辑
│   └── package.json
├── Design.md               # 设计文档
├── DEPLOY.md               # 部署指南
└── README.md               # 项目说明
```

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd maersk-automation
```

### 2. 安装前端依赖

```bash
cd app
npm install
npm run build
cd ..
```

### 3. 安装后端依赖

```bash
cd server
npm install

# 安装 Playwright 浏览器
npx playwright install chromium
cd ..
```

### 4. 启动服务

```bash
# 启动后端
cd server
npm start

# 或使用 PM2
pm2 start index.js --name maersk-automation
```

### 5. 访问系统

打开浏览器访问: `http://localhost:3000`

## 使用说明

### 配置任务

1. **基础设置**
   - 选择任务类型
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
   - 查看执行结果

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

#### 健康检查
```bash
GET /api/health
```

## 生产部署

详见 [DEPLOY.md](./DEPLOY.md)

## 注意事项

1. **账号安全**: 请确保使用强密码，并定期更换
2. **网络环境**: 服务器需要能够访问 www.maersk.com
3. **资源要求**: 建议至少 2GB RAM，4GB 更佳
4. **浏览器依赖**: 需要安装 Playwright 浏览器依赖

## 故障排除

### 浏览器无法启动

```bash
# 检查依赖
ldd ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome

# 重新安装浏览器
npx playwright install --with-deps chromium
```

### 内存不足

```bash
# 增加交换空间
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 查看日志

```bash
# 后端日志
pm2 logs maersk-automation

# 系统日志
journalctl -u maersk-automation
```

## 开发计划

- [x] 基础登录功能
- [x] 实时日志推送
- [x] WebSocket 通信
- [x] 任务历史记录
- [ ] VNC 实时预览
- [ ] 验证码自动识别
- [ ] 查询船期功能
- [ ] 查看订舱功能
- [ ] 文件下载功能
- [ ] 多账号管理
- [ ] 定时任务

## 许可证

MIT License

## 免责声明

本工具仅供学习和研究使用。使用本工具时请遵守相关法律法规和网站服务条款。作者不对因使用本工具而产生的任何后果负责。
