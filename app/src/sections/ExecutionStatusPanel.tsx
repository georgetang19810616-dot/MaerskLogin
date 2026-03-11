import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  FileText,
  Download,
  History,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileDown,
  Calendar,
  User,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store';
import { taskTypeOptions } from '@/types';

export function ExecutionStatusPanel() {
  const {
    taskStatus,
    currentTaskId,
    executionResult,
    logs,
    dataFiles,
    history,
    resultActiveTab,
    setResultActiveTab,
  } = useAppStore();

  const getStatusBadge = () => {
    switch (taskStatus) {
      case 'running':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            执行中
          </Badge>
        );
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            执行成功
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            执行失败
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            等待执行
          </Badge>
        );
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="w-3 h-3 text-amber-500" />;
      default:
        return <Activity className="w-3 h-3 text-blue-500" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warn':
        return 'text-amber-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <Card className="h-full shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Activity className="w-5 h-5 text-indigo-500" />
            执行状态
          </CardTitle>
          {getStatusBadge()}
        </div>
        {currentTaskId && (
          <p className="text-xs text-slate-500 mt-1">任务 ID: {currentTaskId}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={resultActiveTab} onValueChange={(v) => setResultActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-100">
            <TabsTrigger
              value="logs"
              className="text-xs data-[state=active]:bg-white data-[state=active]:text-indigo-600"
            >
              <Activity className="w-3 h-3 mr-1" />
              实时日志
            </TabsTrigger>
            <TabsTrigger
              value="result"
              className="text-xs data-[state=active]:bg-white data-[state=active]:text-indigo-600"
            >
              <FileText className="w-3 h-3 mr-1" />
              执行结果
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="text-xs data-[state=active]:bg-white data-[state=active]:text-indigo-600"
            >
              <Download className="w-3 h-3 mr-1" />
              数据文件
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs data-[state=active]:bg-white data-[state=active]:text-indigo-600"
            >
              <History className="w-3 h-3 mr-1" />
              历史记录
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* 实时日志 */}
            <TabsContent value="logs" className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ScrollArea className="h-[400px] w-full rounded-lg border border-slate-200 bg-slate-50 p-4">
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <Activity className="w-8 h-8 mb-2" />
                      <p className="text-sm">暂无日志</p>
                      <p className="text-xs">点击"开始执行"查看实时日志</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {logs.map((log, index) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="text-slate-400 text-xs whitespace-nowrap">
                            {log.timestamp}
                          </span>
                          {getLogIcon(log.level)}
                          <span className={`${getLogColor(log.level)}`}>{log.message}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </motion.div>
            </TabsContent>

            {/* 执行结果 */}
            <TabsContent value="result" className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {!executionResult ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 border border-slate-200 rounded-lg bg-slate-50">
                    <FileText className="w-8 h-8 mb-2" />
                    <p className="text-sm">暂无执行结果</p>
                    <p className="text-xs">任务执行完成后显示结果</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        执行结果
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-sm text-slate-500">任务ID</span>
                          <span className="text-sm font-medium text-slate-700">
                            {executionResult.taskId}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-sm text-slate-500">任务类型</span>
                          <span className="text-sm font-medium text-slate-700">
                            {taskTypeOptions.find((t) => t.value === executionResult.taskType)
                              ?.label || executionResult.taskType}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-sm text-slate-500">账号</span>
                          <span className="text-sm font-medium text-slate-700">
                            {executionResult.username}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-sm text-slate-500">登录状态</span>
                          <span
                            className={`text-sm font-medium flex items-center gap-1 ${
                              executionResult.loginStatus === 'success'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {executionResult.loginStatus === 'success' ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                成功
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                失败
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-sm text-slate-500">验证码处理</span>
                          <span className="text-sm font-medium text-slate-700">
                            {executionResult.captchaStatus}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-sm text-slate-500">执行时间</span>
                          <span className="text-sm font-medium text-slate-700">
                            {executionResult.executionTime}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-slate-500">完成时间</span>
                          <span className="text-sm font-medium text-slate-700">
                            {executionResult.completionTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {executionResult.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">错误信息</span>
                        </div>
                        <p className="text-sm text-red-600 mt-2">{executionResult.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* 数据文件 */}
            <TabsContent value="files" className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {dataFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 border border-slate-200 rounded-lg bg-slate-50">
                    <FileDown className="w-8 h-8 mb-2" />
                    <p className="text-sm">暂无数据文件</p>
                    <p className="text-xs">任务执行后生成的文件将显示在这里</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dataFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">{file.name}</p>
                            <p className="text-xs text-slate-500">{file.size}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          下载
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* 历史记录 */}
            <TabsContent value="history" className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 border border-slate-200 rounded-lg bg-slate-50">
                    <History className="w-8 h-8 mb-2" />
                    <p className="text-sm">暂无历史记录</p>
                    <p className="text-xs">任务执行历史将显示在这里</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {history.map((record) => (
                        <div
                          key={record.id}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-slate-500">{record.id}</span>
                            <Badge
                              variant={record.status === 'success' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {record.status === 'success' ? '成功' : '失败'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1 text-slate-600">
                              <Calendar className="w-3 h-3" />
                              {taskTypeOptions.find((t) => t.value === record.taskType)?.label}
                            </div>
                            <div className="flex items-center gap-1 text-slate-600">
                              <User className="w-3 h-3" />
                              {record.username}
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 col-span-2">
                              <Clock className="w-3 h-3" />
                              {record.createdAt}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  );
}
