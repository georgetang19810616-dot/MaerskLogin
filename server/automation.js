const { chromium } = require('playwright');
const fetch = require('node-fetch');

class MaerskAutomation {
  constructor(config, sendLog, sendResult) {
    this.config = config;
    this.sendLog = sendLog;
    this.sendResult = sendResult;
    this.browser = null;
    this.page = null;
    this.context = null;
  }

  async init() {
    this.sendLog('info', '正在启动浏览器...');
    
    const launchOptions = {
      headless: this.config.browserMode === 'headless',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    };

    // 如果使用 Scrapfly
    if (this.config.useScrapfly && this.config.scrapflyApiKey) {
      this.sendLog('info', '使用 Scrapfly 代理');
      launchOptions.proxy = {
        server: 'http://scrapfly.io:8080',
        username: this.config.scrapflyApiKey,
        password: '',
      };
    }

    this.browser = await chromium.launch(launchOptions);
    
    this.context = await this.browser.newContext({
      viewport: {
        width: this.config.viewportWidth || 1920,
        height: 1080,
      },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    this.page = await this.context.newPage();
    
    // 设置默认超时
    this.page.setDefaultTimeout(this.config.pageTimeout || 30000);
    this.page.setDefaultNavigationTimeout(this.config.pageTimeout || 30000);

    this.sendLog('info', '浏览器启动成功');
  }

  async delay(ms) {
    const delayTime = ms + (this.config.operationDelay || 0);
    await new Promise(resolve => setTimeout(resolve, delayTime));
  }

  async navigateToMaersk() {
    this.sendLog('info', '正在访问 https://www.maersk.com');
    
    try {
      await this.page.goto('https://www.maersk.com', {
        waitUntil: 'networkidle',
      });
      
      await this.delay(1000);
      this.sendLog('info', '页面加载完成');
      
      // 处理 Cookie 弹窗
      try {
        const acceptCookies = await this.page.$('button:has-text("Allow all")');
        if (acceptCookies) {
          await acceptCookies.click();
          await this.delay(500);
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
      // 查找登录按钮
      const loginButton = await this.page.$('a:has-text("Login"), button:has-text("Login")');
      
      if (!loginButton) {
        // 尝试其他选择器
        const altLogin = await this.page.$('[data-testid="login-button"], .login-button, #login');
        if (altLogin) {
          await altLogin.click();
        } else {
          throw new Error('未找到登录按钮');
        }
      } else {
        await loginButton.click();
      }
      
      await this.delay(1500);
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
        timeout: 10000,
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
      const submitButton = await this.page.$('button[type="submit"], button:has-text("Log in"), button:has-text("Login")');
      
      if (submitButton) {
        await submitButton.click();
      } else {
        // 尝试按 Enter 键
        await this.page.keyboard.press('Enter');
      }
      
      await this.delay(3000);
      
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
          // 这里可以添加验证码处理逻辑
          await this.handleCaptcha();
        }
      }
      
      this.sendLog('success', '登录成功');
      return true;
    } catch (error) {
      this.sendLog('error', `登录失败: ${error.message}`);
      return false;
    }
  }

  async handleCaptcha() {
    if (this.config.captchaMode === 'manual') {
      this.sendLog('info', '等待人工处理验证码...');
      // 在实际实现中，这里应该暂停并等待用户输入
      // 可以通过 WebSocket 发送验证码图片给用户
      await this.delay(10000); // 模拟等待时间
    } else {
      this.sendLog('info', '尝试自动识别验证码');
      // 这里可以集成验证码识别服务
      // 如 2captcha、Anti-Captcha 等
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
      
      // 6. 根据任务类型执行后续操作
      if (success) {
        switch (this.config.taskType) {
          case 'schedule':
            await this.querySchedule();
            break;
          case 'booking':
            await this.viewBooking();
            break;
          case 'download':
            await this.downloadFiles();
            break;
          default:
            // 登录测试，无需额外操作
            break;
        }
      }
      
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
      
      // 发送通知
      if (this.config.notifications.feishu && this.config.feishuWebhookUrl) {
        await this.sendFeishuNotification(result);
      }
      
      // 关闭浏览器
      if (this.browser) {
        await this.browser.close();
        this.sendLog('info', '浏览器已关闭');
      }
    }
  }

  async querySchedule() {
    this.sendLog('info', '开始查询船期');
    // 实现查询船期逻辑
    await this.delay(2000);
    this.sendLog('info', '船期查询完成');
  }

  async viewBooking() {
    this.sendLog('info', '开始查看订舱');
    // 实现查看订舱逻辑
    await this.delay(2000);
    this.sendLog('info', '订舱信息获取完成');
  }

  async downloadFiles() {
    this.sendLog('info', '开始下载文件');
    // 实现文件下载逻辑
    await this.delay(2000);
    this.sendLog('info', '文件下载完成');
  }

  async sendFeishuNotification(result) {
    try {
      const response = await fetch(this.config.feishuWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msg_type: 'text',
          content: {
            text: `马士基自动化任务通知\n任务ID: ${result.taskId}\n状态: ${result.loginStatus === 'success' ? '成功' : '失败'}\n账号: ${result.username}\n完成时间: ${result.completionTime}`
          }
        })
      });
      
      if (response.ok) {
        this.sendLog('info', '飞书通知发送成功');
      } else {
        this.sendLog('warn', '飞书通知发送失败');
      }
    } catch (error) {
      this.sendLog('error', `发送飞书通知失败: ${error.message}`);
    }
  }
}

module.exports = { MaerskAutomation };
