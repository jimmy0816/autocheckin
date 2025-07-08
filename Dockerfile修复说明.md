# Dockerfile 引用问题修复说明

## 问题描述
Cloud Build 构建失败，错误信息：
```
unable to prepare context: unable to evaluate symlinks in Dockerfile path: lstat /workspace/Dockerfile.simple: no such file or directory
```

## 问题原因
- `cloudbuild.complete.yaml` 文件中引用了 `Dockerfile.simple`
- 但该文件已被删除，只保留了 `Dockerfile`

## 修复内容
已修复以下文件中的 `Dockerfile.simple` 引用：

1. **cloudbuild.complete.yaml** - Cloud Build 配置文件
2. **quick-deploy.bat** - 快速部署脚本
3. **deploy.bat** - 部署脚本
4. **fix-docker.bat** - Docker修复脚本
5. **setup-artifact-registry.bat** - Artifact Registry设置脚本

## 解决方案
所有文件中的 `Dockerfile.simple` 都已改为 `Dockerfile`

## 重新部署
现在可以使用以下任一方式重新部署：

### 方式1：直接部署（推荐）
```bash
deploy-fixed.bat
```

### 方式2：手动命令
```bash
gcloud builds submit --config=cloudbuild.complete.yaml
```

### 方式3：使用修复脚本
```bash
fix-and-deploy.bat
```

## 验证
部署成功后，可以通过以下命令获取服务URL：
```bash
gcloud run services describe autocheckin --region=asia-east1 --format="value(status.url)"
```

## 注意事项
- 确保已设置正确的项目ID
- 确保已配置Artifact Registry
- 如果遇到权限问题，请检查gcloud认证状态 