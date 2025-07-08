# 手动更新Git步骤

由于终端环境可能有问题，请按照以下步骤手动更新Git：

## 步骤1：打开命令提示符或PowerShell
在项目目录 `C:\www\autocheckin` 中打开命令提示符或PowerShell

## 步骤2：检查Git状态
```bash
git status
```

## 步骤3：添加修改的文件
```bash
git add cloudbuild.complete.yaml
git add quick-deploy.bat
git add deploy.bat
git add fix-docker.bat
git add setup-artifact-registry.bat
git add deploy-fixed.bat
git add Dockerfile修复说明.md
```

## 步骤4：提交更改
```bash
git commit -m "修复Dockerfile引用问题，将Dockerfile.simple改为Dockerfile"
```

## 步骤5：推送到GitHub
```bash
git push origin main
```

## 步骤6：验证推送
```bash
git log --oneline -5
```

## 或者使用提供的脚本

### 方式1：使用批处理文件
双击运行 `update-git.bat`

### 方式2：使用PowerShell脚本
在PowerShell中运行：
```powershell
.\update-git.ps1
```

## 推送成功后
推送成功后，你可以：

1. **重新触发Cloud Build构建**：
   ```bash
   gcloud builds submit --config=cloudbuild.complete.yaml
   ```

2. **或者使用修复后的部署脚本**：
   ```bash
   deploy-fixed.bat
   ```

## 如果遇到问题
- 确保Git已正确安装
- 确保已配置Git用户信息
- 确保有GitHub仓库的推送权限
- 检查网络连接是否正常 