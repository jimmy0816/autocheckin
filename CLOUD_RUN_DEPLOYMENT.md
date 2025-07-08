# 🚀 Cloud Run 部署说明

## 修复的问题
- ✅ 修复了 `puppeteer-core` 的 `executablePath` 错误
- ✅ 将 `puppeteer-core` 替换为 `puppeteer`（自动管理Chrome）
- ✅ 优化了 Dockerfile 配置
- ✅ 添加了 Cloud Build 配置文件

## 部署方法

### 方法1：使用部署脚本（推荐）

#### Windows用户：
双击运行 `deploy.bat` 文件

#### Linux/Mac用户：
```bash
chmod +x deploy.sh
./deploy.sh
```

### 方法2：手动部署

1. **启用必要的API**：
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

2. **构建并推送镜像**：
   ```bash
   # 设置项目ID
   export PROJECT_ID=$(gcloud config get-value project)
   
   # 构建镜像
   docker build -t gcr.io/$PROJECT_ID/autocheckin .
   
   # 推送镜像
   docker push gcr.io/$PROJECT_ID/autocheckin
   ```

3. **部署到Cloud Run**：
   ```bash
   gcloud run deploy autocheckin \
     --image gcr.io/$PROJECT_ID/autocheckin \
     --region asia-east1 \
     --platform managed \
     --allow-unauthenticated \
     --memory 2Gi \
     --cpu 2 \
     --timeout 900 \
     --concurrency 1
   ```

### 方法3：使用 Cloud Build（需要额外配置）

如果Cloud Build遇到日志存储桶问题，请使用上述方法1或方法2。

## 配置说明

### 资源分配
- **内存**: 2GB（puppeteer需要足够内存）
- **CPU**: 2核
- **超时**: 900秒（15分钟）
- **并发**: 1（避免资源冲突）

### 环境变量
在Cloud Run控制台中设置：
- `NODE_ENV=production`
- 其他必要的环境变量

## 验证部署

1. **访问应用**：
   - 部署完成后会显示URL
   - 例如：`https://autocheckin-xxxxx-ew.a.run.app`

2. **测试功能**：
   - 打开Web界面
   - 输入测试账号密码
   - 验证打卡功能

## 常见问题

### 问题1：内存不足
**解决方案**：增加内存到2GB或更多

### 问题2：超时错误
**解决方案**：增加超时时间到900秒

### 问题3：Chrome启动失败
**解决方案**：确保使用puppeteer而不是puppeteer-core

## 监控和日志

- **查看日志**：Cloud Run控制台 → 日志
- **监控性能**：Cloud Run控制台 → 指标
- **错误排查**：查看构建日志和运行时日志 