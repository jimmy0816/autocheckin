const express = require('express');
const path = require('path');
const { run } = require('./index.js');

const app = express();
const PORT = process.env.PORT || 8080;

// 存储任务日志和浏览器实例
const taskLogs = new Map();
const taskBrowsers = new Map();

// 设置全局浏览器管理
global.taskBrowsers = taskBrowsers;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 处理打卡请求
app.post('/checkin', async (req, res) => {
    const { username, password, startDate, endDate } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: '请提供用户名和密码' 
        });
    }

    try {
        // 生成任务ID
        const taskId = Date.now().toString();
        const taskLog = [];
        
        // 初始化任务日志
        taskLogs.set(taskId, {
            status: 'running',
            logs: taskLog,
            startTime: new Date(),
            username: username
        });

        // 设置环境变量
        process.env.USERNAME = username;
        process.env.PASSWORD = password;
        
        // 重写console.log来捕获日志
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = (...args) => {
            const logMessage = args.join(' ');
            taskLog.push({ time: new Date(), type: 'info', message: logMessage });
            originalLog(...args);
        };
        
        console.error = (...args) => {
            const logMessage = args.join(' ');
            taskLog.push({ time: new Date(), type: 'error', message: logMessage });
            originalError(...args);
        };
        
        console.log(`用户 ${username} 开始打卡任务`);
        
        // 异步执行打卡任务
        run(startDate, endDate, taskId).then(() => {
            console.log(`用户 ${username} 打卡任务完成`);
            const task = taskLogs.get(taskId);
            if (task) {
                task.status = 'completed';
                task.endTime = new Date();
            }
            // 清理浏览器实例
            taskBrowsers.delete(taskId);
        }).catch((error) => {
            console.error(`用户 ${username} 打卡任务失败:`, error);
            const task = taskLogs.get(taskId);
            if (task) {
                task.status = 'failed';
                task.endTime = new Date();
                task.error = error.message;
                // 添加错误日志到任务日志中
                task.logs.push({ 
                    time: new Date(), 
                    type: 'error', 
                    message: `任务失败: ${error.message}` 
                });
            }
            // 清理浏览器实例
            taskBrowsers.delete(taskId);
        }).finally(() => {
            // 恢复原始console方法
            console.log = originalLog;
            console.error = originalError;
        });

        res.json({ 
            success: true, 
            message: '打卡任务已启动', 
            taskId: taskId
        });
    } catch (error) {
        console.error('启动打卡任务失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '启动打卡任务失败: ' + error.message 
        });
    }
});

// 获取任务日志
app.get('/logs/:taskId', (req, res) => {
    const { taskId } = req.params;
    const task = taskLogs.get(taskId);
    
    if (!task) {
        return res.status(404).json({ 
            success: false, 
            message: '任务不存在' 
        });
    }
    
    res.json({ 
        success: true, 
        task: task 
    });
});

// 获取所有任务
app.get('/tasks', (req, res) => {
    const tasks = Array.from(taskLogs.entries()).map(([id, task]) => ({
        id,
        username: task.username,
        status: task.status,
        startTime: task.startTime,
        endTime: task.endTime
    }));
    
    res.json({ 
        success: true, 
        tasks: tasks 
    });
});

// 中断任务
app.post('/cancel/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const task = taskLogs.get(taskId);
    
    if (!task) {
        return res.status(404).json({ 
            success: false, 
            message: '任务不存在' 
        });
    }
    
    if (task.status !== 'running') {
        return res.status(400).json({ 
            success: false, 
            message: '任务已完成或已中断' 
        });
    }
    
    try {
        // 关闭浏览器实例
        const browser = taskBrowsers.get(taskId);
        if (browser) {
            await browser.close();
            taskBrowsers.delete(taskId);
        }
        
        // 更新任务状态
        task.status = 'cancelled';
        task.endTime = new Date();
        task.logs.push({ 
            time: new Date(), 
            type: 'info', 
            message: '任务已被用户中断' 
        });
        
        res.json({ 
            success: true, 
            message: '任务已中断' 
        });
    } catch (error) {
        console.error('中断任务失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '中断任务失败: ' + error.message 
        });
    }
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 