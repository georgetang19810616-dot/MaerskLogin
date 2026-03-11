import asyncio
from playwright.async_api import async_playwright

# 测试账号
USERNAME = "HTXTMSK"
PASSWORD = "HTmsk2026"

async def test_login():
    async with async_playwright() as p:
        # 启动浏览器
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = await context.new_page()
        
        print("1. 访问马士基网站...")
        try:
            await page.goto("https://www.maersk.com", timeout=30000)
        except Exception as e:
            print(f"   访问失败: {e}")
            await browser.close()
            return
        
        await asyncio.sleep(2)
        
        print("2. 点击登录按钮...")
        try:
            login_btn = page.locator('a:has-text("Login")').first
            await login_btn.click()
            await asyncio.sleep(3)
        except Exception as e:
            print(f"   点击登录失败: {e}")
        
        print(f"3. 当前URL: {page.url}")
        
        # 检查是否在登录页面
        if "login" in page.url or "auth" in page.url:
            print("4. 在登录页面，输入账号密码...")
            
            # 输入用户名
            try:
                username_input = page.locator('input[type="text"]').first
                await username_input.fill(USERNAME)
                print(f"   已输入账号: {USERNAME}")
            except Exception as e:
                print(f"   输入账号失败: {e}")
            
            await asyncio.sleep(0.5)
            
            # 输入密码
            try:
                password_input = page.locator('input[type="password"]').first
                await password_input.fill(PASSWORD)
                print("   已输入密码")
            except Exception as e:
                print(f"   输入密码失败: {e}")
            
            await asyncio.sleep(0.5)
            
            # 点击登录按钮
            print("5. 点击登录按钮...")
            try:
                submit_btn = page.locator('button[type="submit"]').first
                await submit_btn.click()
                await asyncio.sleep(5)
            except Exception as e:
                print(f"   点击登录失败: {e}")
            
            print(f"6. 登录后URL: {page.url}")
            
            # 检查登录结果
            if "login" in page.url or "auth" in page.url:
                # 检查是否有错误信息
                try:
                    error_msg = page.locator('.error-message, [role="alert"]').first
                    if await error_msg.is_visible():
                        error_text = await error_msg.text_content()
                        print(f"   登录失败: {error_text}")
                    else:
                        print("   登录可能失败，仍在登录页面")
                except:
                    print("   登录可能失败，仍在登录页面")
                
                # 截图查看
                await page.screenshot(path="/mnt/okcomputer/output/login_result.png")
                print("   已保存截图: login_result.png")
            else:
                print("   登录成功！")
                await page.screenshot(path="/mnt/okcomputer/output/login_success.png")
                print("   已保存登录成功截图: login_success.png")
        else:
            print("未跳转到登录页面")
        
        # 关闭浏览器
        await browser.close()
        print("测试完成")

# 运行测试
asyncio.run(test_login())
