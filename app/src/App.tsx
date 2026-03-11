import { motion } from 'framer-motion';
import { Ship } from 'lucide-react';
import { TaskConfigPanel } from '@/sections/TaskConfigPanel';
import { ExecutionStatusPanel } from '@/sections/ExecutionStatusPanel';
import { VNCViewer } from '@/sections/VNCViewer';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7c6ecf] via-[#8b7fd4] to-[#a78bfa]">
      {/* 页面头部 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="pt-6 pb-4 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
            className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm"
          >
            <Ship className="w-6 h-6 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-2xl font-bold text-white"
          >
            Maersk Automation System
          </motion.h1>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-sm text-white/70"
        >
          智能航运自动化处理系统
        </motion.p>
      </motion.header>

      {/* 主内容区域 - 三栏布局 */}
      <main className="container mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 max-w-[1600px] mx-auto">
          {/* 左侧：任务配置面板 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-[calc(100vh-160px)] min-h-[600px]"
          >
            <TaskConfigPanel />
          </motion.div>

          {/* 中间：执行状态面板 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-[calc(100vh-160px)] min-h-[600px]"
          >
            <ExecutionStatusPanel />
          </motion.div>

          {/* 右侧：VNC实时浏览器画面 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="h-[calc(100vh-160px)] min-h-[600px]"
          >
            <VNCViewer />
          </motion.div>
        </div>
      </main>

      {/* 页面底部 */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="py-3 text-center text-white/50 text-xs"
      >
        <p>© 2024 Maersk Automation System. All rights reserved.</p>
      </motion.footer>
    </div>
  );
}

export default App;
