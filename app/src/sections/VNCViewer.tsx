import { useEffect, useState } from 'react';
import { Monitor, ExternalLink, RefreshCw, Ship, PlayCircle, Globe, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';

// 模拟浏览器画面组件
function BrowserPreview({ taskStatus, currentStep }: { taskStatus: string; currentStep: string }) {
  if (taskStatus === 'idle') {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500">
        <div className="text-center">
          <Ship className="w-16 h-16 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-medium">等待任务启动</p>
          <p className="text-xs text-slate-500 mt-1">点击"开始执行"启动浏览器</p>
        </div>
      </div>
    );
  }

  if (taskStatus === 'connecting') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="relative">
            <Monitor className="w-16 h-16 mx-auto mb-3 text-yellow-500/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <p className="text-sm font-medium">正在建立 VNC 连接...</p>
          <p className="text-xs text-slate-500 mt-1">请稍候</p>
        </div>
      </div>
    );
  }

  // 显示模拟的浏览器画面
  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* 浏览器地址栏 */}
      <div className="bg-slate-100 border-b border-slate-200 p-2 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-600 flex items-center gap-2">
          <Globe className="w-3 h-3" />
          {taskStatus === 'running' ? 'https://www.maersk.com' : 'about:blank'}
        </div>
      </div>
      
      {/* 浏览器内容区域 */}
      <div className="flex-1 relative overflow-hidden">
        {taskStatus === 'running' ? (
          <div className="w-full h-full bg-gradient-to-b from-[#7c6ecf] to-[#a78bfa] flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Ship className="w-10 h-10 text-white" />
              </div>
              <p className="text-lg font-bold">MAERSK</p>
              <p className="text-sm text-white/70 mt-2">All the way</p>
              
              {/* 当前操作提示 */}
              <div className="mt-6 bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                <p className="text-xs text-white/80">当前操作</p>
                <p className="text-sm font-medium">{currentStep}</p>
              </div>
            </div>
          </div>
        ) : taskStatus === 'success' ? (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-lg font-semibold text-slate-700">登录成功</p>
              <p className="text-sm text-slate-500 mt-2">已成功登录马士克账户</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-lg font-semibold text-slate-700">登录失败</p>
              <p className="text-sm text-slate-500 mt-2">请检查账号密码是否正确</p>
            </div>
          </div>
        )}
      </div>
      
      {/* 浏览器状态栏 */}
      <div className="bg-slate-100 border-t border-slate-200 p-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${taskStatus === 'running' ? 'bg-green-500 animate-pulse' : taskStatus === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
          {taskStatus === 'running' ? '浏览器运行中' : taskStatus === 'success' ? '任务完成' : '任务失败'}
        </div>
        <div className="flex items-center gap-2">
          <PlayCircle className="w-3 h-3" />
          <span>Chromium 120</span>
        </div>
      </div>
    </div>
  );
}

export function VNCViewer() {
  const { vncStatus, taskStatus, currentTaskId, logs } = useAppStore();
  const [currentStep, setCurrentStep] = useState('准备中...');

  // 根据日志更新当前步骤
  useEffect(() => {
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      setCurrentStep(lastLog.message);
    }
  }, [logs]);

  const getStatusColor = () => {
    if (vncStatus.connected) return 'bg-green-500';
    if (taskStatus === 'running') return 'bg-yellow-500 animate-pulse';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (vncStatus.connected) return '已连接';
    if (taskStatus === 'running') return '连接中...';
    return '未连接';
  };

  return (
    <Card className="h-full shadow-lg border-0 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Monitor className="w-5 h-5 text-indigo-500" />
            实时浏览器画面 (VNC)
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`} />
            <span className="text-xs text-slate-500">{getStatusText()}</span>
          </div>
        </div>
        {currentTaskId && (
          <p className="text-xs text-slate-400 mt-1">任务: {currentTaskId}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-3">
        {/* VNC 显示区域 */}
        <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden min-h-[350px] relative border border-slate-200">
          <BrowserPreview taskStatus={taskStatus} currentStep={currentStep} />
        </div>

        {/* VNC 控制按钮 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            disabled={taskStatus !== 'running'}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            重新加载
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            disabled={taskStatus !== 'running'}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            新窗口打开
          </Button>
        </div>

        {/* VNC 连接信息 */}
        <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
          <p className="font-medium text-slate-600">VNC 连接信息</p>
          <div className="grid grid-cols-2 gap-2 text-slate-500">
            <span>主机: {vncStatus.host}</span>
            <span>端口: {vncStatus.port}</span>
          </div>
          <p className="text-slate-400 text-[10px] mt-1">
            密码: 无 | 协议: VNC over WebSocket
          </p>
        </div>

        {/* 提示 */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-[10px] text-blue-600">
          提示: 当前为演示模式，实际部署后可连接真实浏览器
        </div>
      </CardContent>
    </Card>
  );
}
