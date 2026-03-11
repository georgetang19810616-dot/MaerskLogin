// 任务类型
export type TaskType = 'login' | 'schedule' | 'booking' | 'download';

// 任务状态
export type TaskStatus = 'idle' | 'running' | 'success' | 'failed';

// 验证码处理方式
export type CaptchaMode = 'manual' | 'auto';

// 浏览器模式
export type BrowserMode = 'headed' | 'headless';

// 通知方式
export interface NotificationMethods {
  feishu: boolean;
  dingtalk: boolean;
  webhook: boolean;
}

// 任务配置
export interface TaskConfig {
  // 基础设置
  taskType: TaskType;
  username: string;
  password: string;
  captchaMode: CaptchaMode;
  useScrapfly: boolean;
  enableScrapflyProtection: boolean;
  notifications: NotificationMethods;
  
  // 高级选项
  browserMode: BrowserMode;
  operationDelay: number;
  pageTimeout: number;
  viewportWidth: number;
  scrapflyApiKey: string;
  feishuWebhookUrl: string;
}

// 执行结果
export interface ExecutionResult {
  taskId: string;
  taskType: TaskType;
  username: string;
  loginStatus: 'success' | 'failed' | 'pending';
  captchaStatus: string;
  executionTime: string;
  completionTime: string;
  error?: string;
}

// 日志条目
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

// 数据文件
export interface DataFile {
  id: string;
  name: string;
  size: string;
  downloadUrl: string;
}

// 历史记录
export interface HistoryRecord {
  id: string;
  taskType: TaskType;
  status: TaskStatus;
  username: string;
  createdAt: string;
  completedAt?: string;
}

// VNC状态
export interface VNCStatus {
  connected: boolean;
  url: string;
  host: string;
  port: number;
}

// 应用状态
export interface AppState {
  // 配置
  config: TaskConfig;
  activeTab: 'basic' | 'advanced';
  
  // 执行状态
  taskStatus: TaskStatus;
  currentTaskId: string | null;
  
  // 结果
  executionResult: ExecutionResult | null;
  logs: LogEntry[];
  dataFiles: DataFile[];
  history: HistoryRecord[];
  
  // VNC
  vncStatus: VNCStatus;
  
  // 当前显示的标签页
  resultActiveTab: 'logs' | 'result' | 'files' | 'history';
  
  // Actions
  setConfig: (config: Partial<TaskConfig>) => void;
  setActiveTab: (tab: 'basic' | 'advanced') => void;
  setTaskStatus: (status: TaskStatus) => void;
  setCurrentTaskId: (id: string | null) => void;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  setExecutionResult: (result: ExecutionResult | null) => void;
  setResultActiveTab: (tab: 'logs' | 'result' | 'files' | 'history') => void;
  setVNCStatus: (status: Partial<VNCStatus>) => void;
  addHistoryRecord: (record: HistoryRecord) => void;
  reset: () => void;
}

// 任务类型选项
export const taskTypeOptions: { value: TaskType; label: string }[] = [
  { value: 'login', label: '登录测试' },
  { value: 'schedule', label: '查询船期' },
  { value: 'booking', label: '查看订舱' },
  { value: 'download', label: '下载文件' },
];

// 验证码处理方式选项
export const captchaModeOptions: { value: CaptchaMode; label: string }[] = [
  { value: 'manual', label: '人工介入' },
  { value: 'auto', label: '自动识别' },
];

// 浏览器模式选项
export const browserModeOptions: { value: BrowserMode; label: string }[] = [
  { value: 'headed', label: '有头模式(调试)' },
  { value: 'headless', label: '无头模式' },
];
