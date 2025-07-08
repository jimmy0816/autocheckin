# 自动打卡系统

这是一个基于 Puppeteer 的自动打卡系统，支持多用户使用，可以在后台自动执行打卡操作。

## 功能特性

- ✅ 自动登录系统
- ✅ 自动填写打卡表单
- ✅ 支持自定义日期范围
- ✅ 支持定时任务模式
- ✅ 服务器环境部署
- ✅ 多用户 Web 界面
- ✅ Google Cloud Run 部署支持

## 部署到 Google Cloud Run

### 1. 准备代码
确保你的代码已经推送到 GitHub 仓库。

### 2. 部署步骤
1. 安装 [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
2. 登录 Google Cloud：`gcloud auth login`
3. 设置项目：`gcloud config set project YOUR_PROJECT_ID`
4. 启用 Cloud Run API：`gcloud services enable run.googleapis.com`
5. 构建并部署：
   ```bash
   gcloud run deploy autocheckin \
     --source . \
     --platform managed \
     --region asia-east1 \
     --allow-unauthenticated \
     --memory 2Gi \
     --cpu 2 \
     --timeout 3600
   ```

### 3. 访问应用
部署完成后，你会得到一个公开的 URL，任何人都可以访问并输入自己的账号密码进行打卡。

## 使用说明

### Web 界面功能
- **用户名/密码**：输入您的登录凭据
- **日期范围**：选择要打卡的日期范围（默认前一个月1号到今天）
- **定时任务**：勾选后启用每天凌晨2点自动执行
- **立即执行**：点击按钮立即开始打卡任务

### 安全说明
- 所有数据仅在内存中处理，不会保存到服务器
- 建议使用后及时清除浏览器缓存
- 请勿在公共设备上输入敏感信息

## 本地运行

```bash
# 安装依赖
npm install

# 设置环境变量（创建 .env 文件）
echo USERNAME=your_username > .env
echo PASSWORD=your_password >> .env

# 运行
npm start
```

## 定时任务

系统支持两种运行模式：

1. **立即执行模式**：部署后立即执行一次
2. **定时任务模式**：每天凌晨2点自动执行

通过设置 `SCHEDULE_MODE` 环境变量来控制。

## 注意事项

- 服务器环境会自动使用无头浏览器模式
- 本地环境会显示浏览器窗口
- 建议在服务器上使用定时任务模式
- 请确保账号密码正确且有效

## 故障排除

如果遇到问题，请检查：
1. 环境变量是否正确设置
2. 网络连接是否正常
3. 目标网站是否有变化 