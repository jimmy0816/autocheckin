@echo off
echo 修复Dockerfile引用问题并重新部署...

REM 提交修复
echo 提交修复...
git add cloudbuild.complete.yaml quick-deploy.bat deploy.bat fix-docker.bat setup-artifact-registry.bat
git commit -m "修复Dockerfile引用问题，将Dockerfile.simple改为Dockerfile"

if %errorlevel% neq 0 (
    echo ❌ 提交失败！
    pause
    exit /b 1
)

REM 推送到GitHub
echo 推送到GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo ❌ 推送失败！
    pause
    exit /b 1
)

echo ✅ 修复已提交并推送！
echo 现在可以重新触发Cloud Build构建了。
echo.
echo 手动触发构建命令：
echo gcloud builds submit --config=cloudbuild.complete.yaml

pause 