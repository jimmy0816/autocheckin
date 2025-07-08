# PowerShell脚本：更新到Git
Write-Host "正在更新到Git..." -ForegroundColor Green

# 检查Git状态
Write-Host "检查Git状态..." -ForegroundColor Yellow
git status

# 添加所有修改的文件
Write-Host "添加修改的文件..." -ForegroundColor Yellow
git add cloudbuild.complete.yaml
git add quick-deploy.bat
git add deploy.bat
git add fix-docker.bat
git add setup-artifact-registry.bat
git add deploy-fixed.bat
git add Dockerfile修复说明.md

# 提交更改
Write-Host "提交更改..." -ForegroundColor Yellow
git commit -m "修复Dockerfile引用问题，将Dockerfile.simple改为Dockerfile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 提交成功！" -ForegroundColor Green
    
    # 推送到远程仓库
    Write-Host "推送到GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 推送成功！" -ForegroundColor Green
        Write-Host "现在可以重新触发Cloud Build构建了。" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 推送失败！" -ForegroundColor Red
    }
} else {
    Write-Host "❌ 提交失败！" -ForegroundColor Red
}

Write-Host "按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 