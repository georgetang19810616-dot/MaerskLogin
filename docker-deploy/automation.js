const { chromium } = require('playwright');

class MaerskAutomation {
  constructor(config, sendLog, sendResult, sendScreenshot) {
    this.config = config;
    this.sendLog = sendLog;
    this.sendResult = sendResult;
    this.sendScreenshot = sendScreenshot;
    this.browser = null;
    this.page = null;
    this.context = null;
  }

  async init() {
    this.sendLog('info', '正在启动 Chromium 浏览器...');
    
    const launchOptions = {
      // 有头模式，才能在VNC中看到
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        // 使用虚拟显示
        '--display=:99',
        // 窗口大小
        '--window-size=1920,1080',
        // 启动位置
        '--window-position=0,0',
      ],
    };

    this.browser = await chromium.launch(launchOptions);
    
    this.context = await this.browser.newContext({
      viewport: {
        width: 1920,
        height: 1080,
      },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    this.page = await this.context.newPage();
    
    // 设置默认超时
    this.page.setDefaultTimeout(30000);
    this.page.setDefaultNavigationTimeout(30000);

    this.sendLog('info', '浏览器启动成功');
    
    // 发送初始截图
    await this.sendPageScreenshot();
  }

  async delay(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
    // 每次延迟后发送截图
    await this.sendPageScreenshot();
  }

  async sendPageScreenshot() {
    try {
      if (this.page) {
        const screenshot = await this.page.screenshot({ 
          type: 'jpeg',
          quality: 80,
          fullPage: false
        });
        if (this.sendScreenshot) {
          this.sendScreenshot(screenshot.toString('base64'));
        }
      }
    } catch (e) {
      // 忽略截图错误
    }
  }

  async navigateToMaersk() {
    this.sendLog('info', '正在访问 https://www.maersk.com');
    
    try {
      await this.page.goto('https://www.maersk.com', {
        waitUntil: 'networkidle',
        timeout: 60000,
      });
      
      await this.delay(2000);
      this.sendLog('info', '页面加载完成');
      
      // 处理 Cookie 弹窗
      try {
        const acceptCookies = await this.page.$('button:has-text("Allow all"), button:has-text("Accept all")');
        if (acceptCookies) {
          await acceptCookies.click();
          await this.delay(1000);
          this.sendLog('info', '已接受 Cookies');
        }
      } catch (e) {
        // Cookie 弹窗可能不存在
      }
      
      return true;
    } catch (error) {
      this.sendLog('error', `访问马士基网站失败: ${error.message}`);
      return false;
    }
  }

  async clickLogin() {
    this.sendLog('info', '点击登录按钮');
    
    try {
      // 等待并点击登录按钮
      const loginButton = await this.page.waitForSelector('a:has-text("Login"), button:has-text("Login")', { timeout: 10000 });
      await loginButton.click();
      
      await this.delay(3000);
      this.sendLog('info', '跳转到登录页面');
      
      return true;
    } catch (error) {
      this.sendLog('error', `点击登录按钮失败: ${error.message}`);
      return false;
    }
  }

  async fillCredentials() {
    this.sendLog('info', `输入账号: ${this.config.username}`);
    
    try {
      // 等待登录表单加载
      await this.page.waitForSelector('input[type="text"], input[name="username"], input[id="username"]', {
        timeout: 15000,
      });
      
      // 输入用户名
      const usernameInput = await this.page.$('input[type="text"], input[name="username"], input[id="username"]');
      if (usernameInput) {
        await usernameInput.fill(this.config.username);
        await this.delay(500);
      }
      
      this.sendLog('info', '输入密码');
      
      // 输入密码
      const passwordInput = await this.page.$('input[type="password"], input[name="password"], input[id="password"]');
      if (passwordInput) {
        await passwordInput.fill(this.config.password);
        await this.delay(500);
      }
      
      return true;
    } catch (error) {
      this.sendLog('error', `填写登录信息失败: ${error.message}`);
      return false;
    }
  }

  async submitLogin() {
    this.sendLog('info', '点击登录');
    
    try {
      // 查找提交按钮
      const submitButton = await this.page.$('button[type="submit"], button:has-text("Log in")');
      
      if (submitButton) {
        await submitButton.click();
      } else {
        // 尝试按 Enter 键
        await this.page.keyboard.press('Enter');
      }
      
      await this.delay(5000);
      
      // 检查登录结果
      const currentUrl = this.page.url();
      
      // 如果 URL 包含 login 或 auth，可能登录失败
      if (currentUrl.includes('login') || currentUrl.includes('auth')) {
        // 检查错误消息
        const errorElement = await this.page.$('.error-message, .alert-error, [role="alert"]');
        if (errorElement) {
          const errorText = await errorElement.textContent();
          throw new Error(errorText || '登录失败');
        }
        
        // 检查是否有验证码
        const captchaElement = await this.page.$('.captcha, [data-testid="captcha"], img[src*="captcha"]');
        if (captchaElement && this.config.captchaMode === 'manual') {
          this.sendLog('warn', '检测到验证码，需要人工处理');
          // 等待人工处理
          await this.delay(10000);
        }
      }
      
      this.sendLog('success', '登录成功');
      return true;
    } catch (error) {
      this.sendLog('error', `登录失败: ${error.message}`);
      return false;
    }
  }

  async executeTask() {
    const startTime = Date.now();
    let success = false;
    let error = null;

    try {
      // 1. 初始化浏览器
      await this.init();
      
      // 2. 访问马士基网站
      success = await this.navigateToMaersk();
      if (!success) throw new Error('访问网站失败');
      
      // 3. 点击登录
      success = await this.clickLogin();
      if (!success) throw new Error('点击登录失败');
      
      // 4. 填写账号密码
      success = await this.fillCredentials();
      if (!success) throw new Error('填写登录信息失败');
      
      // 5. 提交登录
      success = await this.submitLogin();
      if (!success) throw new Error('登录提交失败');
      
    } catch (err) {
      error = err.message;
      this.sendLog('error', `任务执行出错: ${error}`);
    } finally {
      // 计算执行时间
      const executionTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
      
      // 发送结果
      const result = {
        taskId: this.config.taskId,
        taskType: this.config.taskType,
        username: this.config.username,
        loginStatus: success ? 'success' : 'failed',
        captchaStatus: this.config.captchaMode === 'manual' ? '无需处理' : '自动识别',
        executionTime,
        completionTime: new Date().toLocaleString('zh-CN'),
        error: error || undefined,
      };
      
      this.sendResult(result);
      
      // 最后截图
      await this.sendPageScreenshot();
      
      // 关闭浏览器
      if (this.browser) {
        await this.browser.close();
        this.sendLog('info', '浏览器已关闭');
      }
    }
  }
}

module.exports = { MaerskAutomation };
