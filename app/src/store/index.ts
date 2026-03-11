import { create } from 'zustand';
import type { AppState, TaskConfig, LogEntry } from '@/types';

const defaultConfig: TaskConfig = {
  // 基础设置
  taskType: 'login',
  username: 'HTXTMSK',
  password: 'HTmsk2026',
  captchaMode: 'manual',
  useScrapfly: true,
  enableScrapflyProtection: true,
  notifications: {
    feishu: true,
    dingtalk: false,
    webhook: true,
  },
  
  // 高级选项
  browserMode: 'headed',
  operationDelay: 150,
  pageTimeout: 30000,
  viewportWidth: 1920,
  scrapflyApiKey: '',
  feishuWebhookUrl: '',
};

const defaultVNCStatus = {
  connected: false,
  url: '',
  host: '127.0.0.1',
  port: 5900,
};

export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  config: { ...defaultConfig },
  activeTab: 'basic',
  taskStatus: 'idle',
  currentTaskId: null,
  executionResult: null,
  logs: [],
  dataFiles: [],
  history: [],
  vncStatus: { ...defaultVNCStatus },
  resultActiveTab: 'logs',

  // Actions
  setConfig: (config) => {
    set((state) => ({
      config: { ...state.config, ...config },
    }));
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  setTaskStatus: (status) => {
    set({ taskStatus: status });
  },

  setCurrentTaskId: (id) => {
    set({ currentTaskId: id });
  },

  addLog: (log) => {
    const newLog: LogEntry = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('zh-CN'),
    };
    set((state) => ({
      logs: [...state.logs, newLog],
    }));
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  setExecutionResult: (result) => {
    set({ executionResult: result });
  },

  setResultActiveTab: (tab) => {
    set({ resultActiveTab: tab });
  },

  setVNCStatus: (status) => {
    set((state) => ({
      vncStatus: { ...state.vncStatus, ...status },
    }));
  },

  addHistoryRecord: (record) => {
    set((state) => ({
      history: [record, ...state.history],
    }));
  },

  reset: () => {
    set({
      config: { ...defaultConfig },
      taskStatus: 'idle',
      currentTaskId: null,
      executionResult: null,
      logs: [],
      dataFiles: [],
      vncStatus: { ...defaultVNCStatus },
      resultActiveTab: 'logs',
    });
  },
}));
