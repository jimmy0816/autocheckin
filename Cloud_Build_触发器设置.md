# 🔧 Cloud Build 触发器设置指南

## 问题解决
根据你提供的成功配置，我已经修复了Cloud Build的日志存储桶问题。

## 修复的配置

### 1. 主要修复
- ✅ 添加了 `options.logging: CLOUD_LOGGING_ONLY`
- ✅ 使用 `$COMMIT_SHA` 作为镜像标签
- ✅ 完整的构建、推送、部署流程

### 2. 配置文件
- `cloudbuild.complete.yaml` - 完整的Cloud Build配置（推荐使用）
- `cloudbuild.yaml` - 简化版配置

## 设置步骤

### 步骤1：启用API
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 步骤2：创建触发器
1. 访问 [Cloud Build 触发器](https://console.cloud.google.com/cloud-build/triggers)
2. 点击"创建触发器"
3. 填写配置：
   - **名称**: `autocheckin-deploy`
   - **描述**: `自动部署自动打卡系统`
   - **事件**: `推送到分支`
   - **仓库**: 选择你的GitHub仓库
   - **分支**: `^main$`（或你的主分支名）
   - **构建配置**: `cloudbuild.complete.yaml`
   - **包含日志**: 勾选

### 步骤3：设置权限
确保Cloud Build服务账号有权限：
- Cloud Run Admin
- Storage Admin
- Service Account User

### 步骤4：测试触发器
1. 提交代码到GitHub
2. 推送到main分支
3. 检查Cloud Build控制台是否自动触发构建

## 配置文件说明

### cloudbuild.complete.yaml
```yaml
steps:
  # 构建Docker镜像
  - name: "gcr.io/cloud-builders/docker"
    args: ["build", "-t", "gcr.io/$PROJECT_ID/autocheckin:$COMMIT_SHA", "."]
  
  # 推送镜像
  - name: "gcr.io/cloud-builders/docker"
    args: ["push", "gcr.io/$PROJECT_ID/autocheckin:$COMMIT_SHA"]
  
  # 部署到Cloud Run
  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
    entrypoint: gcloud
    args: ["run", "deploy", "autocheckin", ...]

images:
  - "gcr.io/$PROJECT_ID/autocheckin:$COMMIT_SHA"

options:
  logging: CLOUD_LOGGING_ONLY  # 关键修复
```

## 验证部署

1. **检查构建日志**：
   - 访问Cloud Build控制台
   - 查看构建历史
   - 确认没有日志存储桶错误

2. **检查部署状态**：
   - 访问Cloud Run控制台
   - 确认服务已部署
   - 获取访问URL

3. **测试应用**：
   - 访问部署的URL
   - 测试打卡功能

## 常见问题

### 问题1：权限不足
```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"
```

### 问题2：触发器未触发
- 检查分支名称是否正确
- 确认代码已推送到GitHub
- 检查触发器配置

### 问题3：构建失败
- 查看构建日志
- 确认Dockerfile正确
- 检查依赖项

## 监控和维护

- **构建监控**: Cloud Build控制台
- **运行监控**: Cloud Run控制台
- **日志查看**: Cloud Logging
- **成本监控**: Cloud Billing 