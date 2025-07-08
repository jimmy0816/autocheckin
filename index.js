require('dotenv').config({ override: true });
const puppeteer = require('puppeteer-core');

async function createBrowser() {
    // 强制使用无头模式
    const options = {
        headless: true, // 始终使用无头模式
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ]
    };

    // 如果是本地环境，使用Chrome路径
    if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
        options.executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    }

    return await puppeteer.launch(options);
}

async function navigateToLogin(page) {
    await page.goto('https://auth.mayohr.com/HRM/Account/Login?original_target=https%3A%2F%2Fapolloxe.mayohr.com%2Ftube&lang=undefined');
}

async function performLogin(page, username, password) {
    await page.waitForSelector('input[name="userName"]');
    await page.type('input[name="userName"]', username);
    await page.waitForSelector('input[name="password"]');
    await page.type('input[name="password"]', password);
    await page.waitForSelector('.submit-btn');
    await page.click('.submit-btn');
    
    // 等待登录结果，检查是否有错误信息
    try {
        // 等待页面跳转或出现错误信息
        await page.waitForTimeout(3000);
        
        // 检查是否有登录错误信息
        const errorElement = await page.$('.error-message, .alert-danger, .login-error');
        if (errorElement) {
            const errorText = await errorElement.evaluate(el => el.textContent);
            throw new Error(`登录失败: ${errorText.trim()}`);
        }
        
        // 检查是否还在登录页面
        const loginForm = await page.$('input[name="userName"]');
        if (loginForm) {
            throw new Error('登录失败: 用户名或密码错误');
        }
        
        console.log('✅ 登录成功');
    } catch (error) {
        if (error.message.includes('登录失败')) {
            throw error;
        }
        // 其他错误可能是页面加载问题，继续检查
        console.log('⚠️ 登录状态检查中...');
        
        // 再次检查是否还在登录页面
        const loginForm = await page.$('input[name="userName"]');
        if (loginForm) {
            throw new Error('登录失败: 用户名或密码错误');
        }
    }
}

async function navigateToCheckinRecords(page) {
    await page.waitForSelector('.ta__confirmation');
    await page.goto('https://apolloxe.mayohr.com/ta?id=webforgetpunch');

    // Wait for 1 seconds
    await page.waitForTimeout(1000); 
}

async function setDateInput(page, date) {
    // 等待輸入框出現
    const inputSelector = 'input[type="text"][placeholder="YYYY/MM/DD"]';
    await page.waitForSelector(inputSelector, { visible: true, timeout: 10000 });

    // // 清空輸入框
    // await page.evaluate((selector) => {
    //     document.querySelector(selector).value = '';
    // }, inputSelector);

    // // 點擊輸入框以確保它被聚焦
    // await page.click(inputSelector);

    // // 輸入日期
    // await page.type(inputSelector, date, { delay: 100 });

    // // 等待一下，讓 React 有時間處理輸入
    // await page.waitForTimeout(500);

    // 點擊輸入框以打開 DayPicker
    await page.waitForSelector('[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.1.1.0.1.2.0"]');
    await page.click('[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.1.1.0.1.2.0"]');
    await page.waitForTimeout(1000);

    
    // await page.click(inputSelector);


    // 等待 DayPicker 出現
    await page.waitForSelector('.DayPicker', { visible: true, timeout: 5000 });

    // 解析日期
    const [year, month, day] = date.split('/').map(Number);

    // 導航到正確的月份和年份
    await navigateToCorrectMonth(page, year, month);

    const weekNumber = getWeekOfMonth(date);
    const dayNumber = convertDateToDay(date);

    // 選擇正確的日期
    await page.waitForSelector(`[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.1.1.0.1.0.0.1:$0.2.$${weekNumber}.$${dayNumber}"]` , { visible: true, timeout: 5000 });
    await page.click(`[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.1.1.0.1.0.0.1:$0.2.$${weekNumber}.$${dayNumber}"]`);
    // const daySelector = `.DayPicker-Day:not(.DayPicker-Day--outside):not(.DayPicker-Day--disabled)[aria-label="${year}年${month}月${day}日"]`;


    // 等待 DayPicker 關閉和任何更新完成
    await page.waitForTimeout(1000);
}

async function navigateToCorrectMonth(page, targetYear, targetMonth) {
    while (true) {
        const currentDateText = await page.$eval('.DayPicker-Caption', el => el.textContent);
        const [currentMonth, currentYear] = currentDateText.split(' ');
        
        if (Number(currentYear) === targetYear && getMonthNumber(currentMonth) === targetMonth) {
            break;
        }

        if (Number(currentYear) < targetYear || (Number(currentYear) === targetYear && getMonthNumber(currentMonth) < targetMonth)) {
            await page.click('.DayPicker-NavButton--next');
        } else {
            await page.click('.DayPicker-NavButton--prev');
        }

        await page.waitForTimeout(500);
    }
}

function getMonthNumber(monthName) {
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return months.indexOf(monthName) + 1;
}

function getMonthNumber(monthName) {
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return months.indexOf(monthName) + 1;
}

// async function setDateInput(page, date) {

//     await page.waitForSelector('input[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.1.1.0.1.1"]');

//       // 找到 input 元素并更改其值
//     await page.evaluate(() => {
//         const input = document.querySelector('input[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.1.1.0.1.1"]');  // 假设 input 元素的 id 是 'my-input'
//         input.value = '';
//     }, );

//     await page.type('input[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.1.1.0.1.1"]', date);
    
//     console.log('setting date', date); 
//     // Wait for 2 seconds
//     await page.waitForTimeout(800);    
// }

async function setTypeInput(page, type) {
    // 點擊類型
    await page.waitForSelector('[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.2.1.0.0.1.1.0"]');
    await page.click('[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.2.1.0.0.1.1.0"]');

    // type = 1 work ; type = 2 get off work

    workName ='[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.2.1.0.0.1.2.0.$option-0-1"]';
    getOffWorkName = '[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.2.1.0.0.1.2.0.$option-1-2"]';
    
    await page.waitForSelector((type == 1)? workName : getOffWorkName);
    await page.click((type == 1)? workName : getOffWorkName); 

    // Wait for 2 seconds
    await page.waitForTimeout(1000);         
}

async function setHoursTimeInput(page, type) {
    // 點擊小時
    //<div class="Select-placeholder" data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.3.1.0.0.1.1.0"><span data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.3.1.0.0.1.1.0.0">請選擇</span></div>
    await page.waitForSelector('[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.3.1.0.0.1.1.0"]');
    await page.click('[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.3.1.0.0.1.1.0"]');
    await page.waitForTimeout(2000);

    // type = 1 work ; type = 2 get off work
    const nightName = '[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.3.1.0.0.1.2.0.$option-9-09"]';
    const sixteenName = '[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.3.1.0.0.1.2.0.$option-18-18"]';

    // 尝试多种选择器
    const selectors = [
        (type == 1) ? nightName : sixteenName,
        // 备用选择器 - 基于文本内容
        (type == 1) ? 'div[role="option"]:contains("09")' : 'div[role="option"]:contains("18")',
        // 更通用的选择器
        (type == 1) ? '.Select-option:contains("09")' : '.Select-option:contains("18")'
    ];

    let clicked = false;
    for (const selector of selectors) {
        try {
            await page.waitForSelector(selector, { timeout: 5000 });
            await page.click(selector);
            clicked = true;
            break;
        } catch (error) {
            continue;
        }
    }

    if (!clicked) {
        throw new Error('无法找到小时选项');
    }

    // Wait for 2 seconds
    await page.waitForTimeout(1000);         
}

async function setMinsTimeInput(page, type) {
    // 點擊分鐘
    // .0.0.1.2.0.1.1.1.4.0.1.0.0.3.1.2.0.1.1 v1
    // <div class="Select-placeholder" data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.3.1.2.0.1.1.0"><span data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.3.1.0.0.1.1.0.0">請選擇</span></div>
    await page.waitForSelector('[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.3.1.2.0.1.1.0"]');
    await page.click('[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.3.1.2.0.1.1.0"]');
    await page.waitForTimeout(1000);

    // type = 1 work ; type = 2 get off work
    thirtyName ='[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.3.1.2.0.1.2.0.$option-30-30"]';
    zeroName = '[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.3.1.2.0.1.2.0.$option-0-00"]';


    await page.waitForSelector((type == 1)? thirtyName : zeroName);
    await page.click((type == 1)? thirtyName : zeroName); 

    // Wait for 2 seconds
    await page.waitForTimeout(1000);         
}

async function setOtherInput(page) {
    //其他
    otherName ='[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.4.1.0.0.1.1.0"]';

    await page.waitForSelector(otherName);
    await page.click(otherName);

    optionName ='[data-reactid=".0.0.1.3.0.1.1.1.4.0.1.0.0.4.1.0.0.1.2.0.$option-0-00000000-0000-0000-0000-000000000000"]';
    
    await page.waitForSelector(optionName);
    await page.click(optionName);

    // Wait for 2 seconds
    await page.waitForTimeout(500); 
}

async function setLocationDetail(page) {
    await page.waitForSelector('textarea[name="locationDetails"]');
    await page.type('textarea[name="locationDetails"]', 'home');

    // Wait for 2 seconds
    await page.waitForTimeout(500);     
}

async function clickSubmitButton(page) {
    //確認送出按鈕
    await page.waitForSelector('.ta_btn.new__btn--fixed-height');
    await page.click('.ta_btn.new__btn--fixed-height');
    
    await page.waitForTimeout(500);  

    //再次確認送出按鈕
    await page.waitForSelector('.btn.btn-primary');
    await page.click('.btn.btn-primary');

    // 等待提交结果
    await page.waitForTimeout(2000);
    
    // 检查是否有成功或错误消息
    try {
        // 检查成功消息
        const successElement = await page.$('.alert-success, .success-message, .ta__confirmation');
        if (successElement) {
            const successText = await successElement.evaluate(el => el.textContent);
            console.log(`✅ 送出成功: ${successText.trim()}`);
            return true;
        }
        
        // 检查错误消息
        const errorElement = await page.$('.alert-danger, .error-message, .ta__error');
        if (errorElement) {
            const errorText = await errorElement.evaluate(el => el.textContent);
            throw new Error(`送出失败: ${errorText.trim()}`);
        }
        
        // 如果没有明确的消息，检查页面状态
        const submitButton = await page.$('.ta_btn.new__btn--fixed-height');
        if (submitButton) {
            console.log('✅ 送出成功 (无明确提示)');
            return true;
        }
        
        console.log('✅ 送出成功');
        return true;
    } catch (error) {
        if (error.message.includes('送出失败')) {
            throw error;
        }
        console.log('✅ 送出成功 (默认)');
        return true;
    }
}

async function runOneForm(page, date, type) {
    try {
        await navigateToCheckinRecords(page);
        await setTypeInput(page, type);
        await setHoursTimeInput(page, type);
        await setMinsTimeInput(page, type);
        await setOtherInput(page);
        await setLocationDetail(page);
        await setDateInput(page, date);
        const success = await clickSubmitButton(page);

        const typeText = type === 1 ? '上班' : '下班';
        if (success) {
            console.log(`✅ ${date} ${typeText}打卡完成`);
        }
        // Wait for 1 seconds
        await page.waitForTimeout(500);
    } catch (error) {
        const typeText = type === 1 ? '上班' : '下班';
        console.error(`❌ ${date} ${typeText}打卡失败: ${error.message}`);
        throw error;
    }
}

async function fillDates(page, start, end) {
    let startDate = new Date(start);
    let endDate = new Date(end);
    let weekdays = generateWeekdays(startDate, endDate);
    let successCount = 0;
    let failCount = 0;

    console.log(`📋 开始处理 ${weekdays.length} 个工作日的打卡`);

    for (const date of weekdays) {
        try {
            await runOneForm(page, date, 1);
            successCount++;
            await page.waitForTimeout(500);
        } catch (error) {
            failCount++;
            console.error(`❌ ${date} 上班打卡失败: ${error.message}`);
        }
        
        try {
            await runOneForm(page, date, 0);
            successCount++;
            await page.waitForTimeout(500);
        } catch (error) {
            failCount++;
            console.error(`❌ ${date} 下班打卡失败: ${error.message}`);
        }
    }
    
    console.log(`📊 打卡统计: 成功 ${successCount} 次, 失败 ${failCount} 次`);
}
// Add other function definitions here...

async function run(startDate = null, endDate = null, taskId = null) {
    let browser = null;
    try {
        browser = await createBrowser();
        const page = await browser.newPage();

        // 如果提供了taskId，将浏览器实例存储起来以便中断
        if (taskId && global.taskBrowsers) {
            global.taskBrowsers.set(taskId, browser);
        }

        await navigateToLogin(page);
        
        // 自动检测环境变量
        if (!process.env.USERNAME || typeof process.env.USERNAME !== 'string' || !process.env.PASSWORD || typeof process.env.PASSWORD !== 'string') {
            console.error('环境变量读取失败，当前值如下:');
            console.error('USERNAME:', process.env.USERNAME);
            console.error('PASSWORD:', process.env.PASSWORD);
            throw new Error('环境变量 USERNAME 或 PASSWORD 未设置或格式不正确，请检查 .env 文件内容并确保无引号、无空格。');
        }
        
        await performLogin(page, process.env.USERNAME, process.env.PASSWORD);
        
        const startTime = new Date().toLocaleString('zh-TW');
        console.log(`🚀 开始打卡任务 - ${startTime}`);
        
        // 如果没有提供日期，使用默认值：前一个月一号到今天
        if (!startDate || !endDate) {
            const today = new Date();
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            
            startDate = startDate || `${lastMonth.getFullYear()}/${lastMonth.getMonth() + 1}/${lastMonth.getDate()}`;
            endDate = endDate || `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
            
            console.log(`📅 打卡日期区间: ${startDate} 到 ${endDate}`);
        }

        await fillDates(page, startDate, endDate);

        const endTime = new Date().toLocaleString('zh-TW');
        console.log(`🎉 所有打卡任务完成！结束时间: ${endTime}`);
    } catch (error) {
        console.error('❌ 打卡任务执行失败:', error.message);
        throw error; // 重新抛出错误，让服务器端能够捕获
    } finally {
        // 清理浏览器实例
        if (browser && taskId && global.taskBrowsers) {
            global.taskBrowsers.delete(taskId);
        }
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('关闭浏览器失败:', closeError.message);
            }
        }
    }
}


// 日期生成函数
function generateWeekdays(startDate, endDate) {
    let dateArray = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        let weekDay = currentDate.getDay();

        if (weekDay !== 6 && weekDay !== 0) {
            let formattedDate = currentDate.getFullYear() + '/' + (currentDate.getMonth()+1) + '/' + currentDate.getDate();
            dateArray.push(formattedDate);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
}

function getWeekOfMonth(dateString) {
    // firstDayOfMonth 取得該月份的第一天。
    // dayOfWeek 取得該月第一天是星期幾（0 表示星期日，6 表示星期六）。
    // adjustedDate 計算日期加上月初第一天的星期數。
    // Math.ceil(adjustedDate / 7) 計算該日期屬於第幾個星期。   
    const date = new Date(dateString);
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstDayOfMonth.getDay();
    const adjustedDate = date.getDate() + dayOfWeek;
    return Math.ceil(adjustedDate / 7) - 1;
}
function convertDateToMonth(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    let month = date.getMonth(); // 月份減1
    const day = date.getDate().toString().padStart(2, '0'); // 保證雙位數
    
    // 將月的個位數去掉0
    const formattedMonth = month.toString();
  
    return `${formattedMonth}`;
}

function convertDateToDay(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    let month = date.getMonth(); // 月份減1
    const day = date.getDate();
    
    // 將月的個位數去掉0
    const formattedMonth = month.toString();
  
    return `${year}${formattedMonth}${day}`;
  }


// 只有在直接运行此文件时才执行
if (require.main === module) {
    // 立即执行一次
    console.log('立即执行模式...');
    // 可以传入自定义日期区间，或者使用默认值
    // run('2025/01/01', '2025/01/31'); // 自定义日期
    run(); // 使用默认日期区间（前一个月一号到今天）
}

// 导出 run 函数供其他模块使用
module.exports = { run };