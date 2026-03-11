import type { TaskConfig } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// 创建任务
export async function createTask(config: TaskConfig) {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  
  if (!response.ok) {
    throw new Error('创建任务失败');
  }
  
  return response.json();
}

// 获取任务状态
export async function getTask(taskId: string) {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`);
  
  if (!response.ok) {
    throw new Error('获取任务状态失败');
  }
  
  return response.json();
}

// 获取所有任务
export async function getAllTasks() {
  const response = await fetch(`${API_BASE_URL}/api/tasks`);
  
  if (!response.ok) {
    throw new Error('获取任务列表失败');
  }
  
  return response.json();
}

// 取消任务
export async function cancelTask(taskId: string) {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('取消任务失败');
  }
  
  return response.json();
}

// 获取VNC连接信息
export async function getVNCInfo(taskId: string) {
  const response = await fetch(`${API_BASE_URL}/api/vnc/${taskId}`);
  
  if (!response.ok) {
    throw new Error('获取VNC信息失败');
  }
  
  return response.json();
}

// 创建WebSocket连接
export function createWebSocket(taskId: string) {
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}?taskId=${taskId}`;
  return new WebSocket(wsUrl);
}
