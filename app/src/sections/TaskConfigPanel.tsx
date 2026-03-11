import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Play,
  RotateCcw,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/store';
import {
  taskTypeOptions,
  captchaModeOptions,
  browserModeOptions,
  type TaskType,
  type CaptchaMode,
  type BrowserMode,
} from '@/types';

// 模拟执行任务的函数
function simulateTaskExecution(
  config: any,
  onLog: (level: string, message: string) => void,
  onVNCStatus: (connected: boolean) => void,
  onComplete: (success: boolean, result: any) => void
) {
  const taskId = `TASK-${Date.now()}`;
  
  // 模拟执行步骤
  const steps = [
    { delay: 500, level: 'info', message: `任务 ${taskId} 开始执行` },
    { delay: 1000, level: 'info', message: `任务类型: 登录测试` },
    { delay: 1500, level: 'info', message: `浏览器模式: ${config.browserMode === 'headed' ? '有头模式' : '无头模式'}` },
    { delay: 2000, level: 'info', message: '正在启动 Chromium 浏览器...' },
    { delay: 2500, level: 'info', message: '浏览器启动成功' },
    { delay: 3000, level: 'info', message: 'VNC 连接已建立', vnc: true },
    { delay: 3500, level: 'info', message: '正在访问 https://www.maersk.com' },
    { delay: 4500, level: 'info', message: '页面加载完成' },
    { delay: 5000, level: 'info', message: '点击登录按钮' },
    { delay: 6000, level: 'info', message: '跳转到登录页面' },
    { delay: 7000, level: 'info', message: `输入账号: ${config.username}` },
    { delay: 8000, level: 'info', message: '输入密码' },
    { delay: 9000, level: 'info', message: '点击登录按钮' },
    { delay: 11000, level: 'info', message: '等待登录响应...' },
  ];
  
  // 模拟登录结果 (70%成功率)
  const success = Math.random() > 0.3;
  
  if (success) {
    steps.push({ delay: 13000, level: 'success', message: '登录成功！' });
    steps.push({ delay: 14000, level: 'info', message: '正在获取用户信息...' });
    steps.push({ delay: 15000, level: 'info', message: '任务执行完成', vnc: false });
  } else {
    steps.push({ delay: 13000, level: 'error', message: '登录失败: 账号或密码错误' });
    steps.push({ delay: 14000, level: 'info', message: '任务执行完成', vnc: false });
  }
  
  // 执行步骤
  steps.forEach((step) => {
    setTimeout(() => {
      onLog(step.level, step.message);
      if (step.vnc !== undefined) {
        onVNCStatus(step.vnc);
      }
    }, step.delay);
  });
  
  // 完成回调
  setTimeout(() => {
    onComplete(success, {
      taskId,
      taskType: config.taskType,
      username: config.username,
      loginStatus: success ? 'success' : 'failed',
      captchaStatus: config.captchaMode === 'manual' ? '无需处理' : '自动识别成功',
      executionTime: '15.0s',
      completionTime: new Date().toLocaleString('zh-CN'),
      error: success ? undefined : '账号或密码错误',
    });
  }, 15500);
  
  return taskId;
}

export function TaskConfigPanel() {
  const {
    config,
    setConfig,
    activeTab,
    setActiveTab,
    setTaskStatus,
    setCurrentTaskId,
    addLog,
    clearLogs,
    setExecutionResult,
    addHistoryRecord,
    setVNCStatus,
    setResultActiveTab,
  } = useAppStore();

  const [isExecuting, setIsExecuting] = useState(false);

  const handleStart = async () => {
    if (!config.username || !config.password) {
      addLog({
        level: 'error',
        message: '请填写账号和密码',
      });
      return;
    }

    setIsExecuting(true);
    setTaskStatus('running');
    clearLogs();
    setExecutionResult(null);
    setResultActiveTab('logs');
    setVNCStatus({ connected: false });

    // 使用模拟执行模式
    const taskId = simulateTaskExecution(
      config,
      (level, message) => addLog({ level: level as any, message }),
      (connected) => setVNCStatus({ connected }),
      (success, result) => {
        setExecutionResult(result);
        setTaskStatus(success ? 'success' : 'failed');
        addHistoryRecord({
          id: result.taskId,
          taskType: config.taskType,
          status: success ? 'success' : 'failed',
          username: config.username,
          createdAt: new Date().toLocaleString('zh-CN'),
          completedAt: result.completionTime,
        });
        setIsExecuting(false);
        setVNCStatus({ connected: false });
      }
    );
    
    setCurrentTaskId(taskId);
  };

  const handleReset = () => {
    setConfig({
      username: 'HTXTMSK',
      password: 'HTmsk2026',
    });
    clearLogs();
    setExecutionResult(null);
    setTaskStatus('idle');
    setCurrentTaskId(null);
    setVNCStatus({ connected: false });
  };

  return (
    <Card className="h-full shadow-lg border-0 flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Settings className="w-5 h-5 text-indigo-500" />
          任务配置
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-auto">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'basic' | 'advanced')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100">
            <TabsTrigger
              value="basic"
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-600"
            >
              基础设置
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-600"
            >
              高级选项
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="basic" className="space-y-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* 任务类型 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">任务类型</Label>
                  <Select
                    value={config.taskType}
                    onValueChange={(v) => setConfig({ taskType: v as TaskType })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 账号密码 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Maersk 账号</Label>
                    <Input
                      placeholder="请输入账号"
                      value={config.username}
                      onChange={(e) => setConfig({ username: e.target.value })}
                      className="focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">密码</Label>
                    <Input
                      type="password"
                      placeholder="请输入密码"
                      value={config.password}
                      onChange={(e) => setConfig({ password: e.target.value })}
                      className="focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* 验证码处理方式 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">验证码处理方式</Label>
                  <Select
                    value={config.captchaMode}
                    onValueChange={(v) => setConfig({ captchaMode: v as CaptchaMode })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {captchaModeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scrapfly选项 */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useScrapfly"
                      checked={config.useScrapfly}
                      onCheckedChange={(checked) =>
                        setConfig({ useScrapfly: checked as boolean })
                      }
                    />
                    <Label htmlFor="useScrapfly" className="text-sm text-slate-600">
                      使用 Scrapfly 抓取
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableScrapflyProtection"
                      checked={config.enableScrapflyProtection}
                      onCheckedChange={(checked) =>
                        setConfig({ enableScrapflyProtection: checked as boolean })
                      }
                    />
                    <Label htmlFor="enableScrapflyProtection" className="text-sm text-slate-600">
                      启用 Scrapfly 反爬虫保护
                    </Label>
                  </div>
                </div>

                {/* 通知方式 */}
                <div className="space-y-2 pt-2">
                  <Label className="text-sm font-medium text-slate-700">通知方式</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notifyFeishu"
                        checked={config.notifications.feishu}
                        onCheckedChange={(checked) =>
                          setConfig({
                            notifications: { ...config.notifications, feishu: checked as boolean },
                          })
                        }
                      />
                      <Label htmlFor="notifyFeishu" className="text-sm text-slate-600">
                        飞书
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notifyDingtalk"
                        checked={config.notifications.dingtalk}
                        onCheckedChange={(checked) =>
                          setConfig({
                            notifications: {
                              ...config.notifications,
                              dingtalk: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="notifyDingtalk" className="text-sm text-slate-600">
                        钉钉
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notifyWebhook"
                        checked={config.notifications.webhook}
                        onCheckedChange={(checked) =>
                          setConfig({
                            notifications: { ...config.notifications, webhook: checked as boolean },
                          })
                        }
                      />
                      <Label htmlFor="notifyWebhook" className="text-sm text-slate-600">
                        Webhook
                      </Label>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* 浏览器模式 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">浏览器模式</Label>
                  <Select
                    value={config.browserMode}
                    onValueChange={(v) => setConfig({ browserMode: v as BrowserMode })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {browserModeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 操作延迟和页面超时 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">操作延迟 (ms)</Label>
                    <Input
                      type="number"
                      value={config.operationDelay}
                      onChange={(e) =>
                        setConfig({ operationDelay: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">页面超时 (ms)</Label>
                    <Input
                      type="number"
                      value={config.pageTimeout}
                      onChange={(e) =>
                        setConfig({ pageTimeout: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                {/* 视口宽度 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">视口宽度</Label>
                  <Input
                    type="number"
                    value={config.viewportWidth}
                    onChange={(e) =>
                      setConfig({ viewportWidth: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                {/* Scrapfly API Key */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Scrapfly API Key (可选)</Label>
                  <Input
                    placeholder="scp-live-..."
                    value={config.scrapflyApiKey}
                    onChange={(e) => setConfig({ scrapflyApiKey: e.target.value })}
                  />
                </div>

                {/* 飞书 Webhook URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">飞书 Webhook URL (可选)</Label>
                  <Input
                    placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                    value={config.feishuWebhookUrl}
                    onChange={(e) => setConfig({ feishuWebhookUrl: e.target.value })}
                  />
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* 提示信息 */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            提示：所有敏感信息仅保存在浏览器本地，不会传输到外部。
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleStart}
            disabled={isExecuting}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                执行中...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                开始执行
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isExecuting}
            className="px-6"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
