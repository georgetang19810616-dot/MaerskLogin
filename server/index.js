const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const { MaerskAutomation } = require('./automation');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, '../app/dist')));

// 任务存储
const tasks = new Map();
const clients = new Map();

// WebSocket连接处理
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const taskId = url.searchParams.get('taskId');
  
  if (taskId) {
    clients.set(taskId, ws);
    console.log(`WebSocket connected for task: ${taskId}`);
    
    ws.on('close', () => {
      clients.delete(taskId);
      console.log(`WebSocket disconnected for task: ${taskId}`);
    });
    
    ws.on('error', (error) => {
      console.error(`WebSocket error for task ${taskId}:`, error);
      clients.delete(taskId);
    });
  } else {
    ws.close();
  }
});

// 发送日志到客户端
function sendLog(taskId, level, message) {
  const ws = clients.get(taskId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'log',
      data: {
        timestamp: new Date().toLocaleTimeString('zh-CN'),
        level,
        message
      }
    }));
  }
  
  // 同时保存到任务日志
  const task = tasks.get(taskId);
  if (task) {
    task.logs.push({
      timestamp: new Date().toLocaleTimeString('zh-CN'),
      level,
      message
    });
  }
}

// 发送执行结果到客户端
function sendResult(taskId, result) {
  const ws = clients.get(taskId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'result',
      data: result
    }));
  }
  
  // 更新任务状态
  const task = tasks.get(taskId);
  if (task) {
    task.status = result.loginStatus === 'success' ? 'success' : 'failed';
    task.result = result;
    task.completedAt = new Date().toISOString();
  }
}

// API路由

// 创建任务
app.post('/api/tasks', async (req, res) => {
  try {
    const taskId = `TASK-${Date.now()}`;
    const config = { ...req.body, taskId };
    
    const task = {
      id: taskId,
      config,
      status: 'running',
      result: null,
      logs: [],
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    
    tasks.set(taskId, task);
    
    // 异步执行任务
    const automation = new MaerskAutomation(config, 
      (level, message) => sendLog(taskId, level, message),
      (result) => sendResult(taskId, result)
    );
    
    automation.executeTask().catch(error => {
      console.error(`Task ${taskId} execution error:`, error);
      sendLog(taskId, 'error', `任务执行异常: ${error.message}`);
      sendResult(taskId, {
        taskId,
        taskType: config.taskType,
        username: config.username,
        loginStatus: 'failed',
        captchaStatus: '-',
        executionTime: '0s',
        completionTime: new Date().toLocaleString('zh-CN'),
        error: error.message,
      });
    });
    
    res.json({
      success: true,
      taskId,
      message: '任务已创建并开始执行',
    });
    
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: `创建任务失败: ${error.message}`,
    });
  }
});

// 获取任务状态
app.get('/api/tasks/:taskId', (req, res) => {
  const task = tasks.get(req.params.taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: '任务不存在',
    });
  }
  
  res.json({
    success: true,
    task: {
      id: task.id,
      status: task.status,
      result: task.result,
      logs: task.logs,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
    },
  });
});

// 获取所有任务
app.get('/api/tasks', (req, res) => {
  const taskList = Array.from(tasks.values()).map(task => ({
    id: task.id,
    status: task.status,
    taskType: task.config.taskType,
    username: task.config.username,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
  }));
  
  res.json({
    success: true,
    tasks: taskList,
  });
});

// 取消任务
app.delete('/api/tasks/:taskId', (req, res) => {
  const task = tasks.get(req.params.taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: '任务不存在',
    });
  }
  
  tasks.delete(req.params.taskId);
  clients.delete(req.params.taskId);
  
  res.json({
    success: true,
    message: '任务已取消',
  });
});

// 获取VNC连接信息
app.get('/api/vnc/:taskId', (req, res) => {
  const task = tasks.get(req.params.taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: '任务不存在',
    });
  }
  
  // 返回VNC连接信息
  // 注意：实际VNC功能需要额外的设置，如 noVNC 或独立VNC服务器
  res.json({
    success: true,
    vnc: {
      connected: task.status === 'running',
      host: '127.0.0.1',
      port: 5900,
      url: `vnc://127.0.0.1:5900`,
    },
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    tasks: {
      total: tasks.size,
      running: Array.from(tasks.values()).filter(t => t.status === 'running').length,
    },
  });
});

// 所有其他路由返回前端应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../app/dist/index.html'));
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`Maersk Automation System`);
  console.log(`=================================`);
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`API地址: http://localhost:${PORT}/api`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
  console.log(`=================================`);
});

module.exports = { app, server };
