@echo off
echo 自动更新Git...

REM 设置错误处理
setlocal enabledelayedexpansion

REM 检查Git是否可用
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git未安装或不在PATH中
    pause
    exit /b 1
)

echo ✅ Git可用

REM 添加文件
echo 添加修改的文件...
git add cloudbuild.complete.yaml
git add quick-deploy.bat
git add deploy.bat
git add fix-docker.bat
git add setup-artifact-registry.bat
git add deploy-fixed.bat
git add Dockerfile修复说明.md

if %errorlevel% neq 0 (
    echo ❌ 添加文件失败
    pause
    exit /b 1
)

echo ✅ 文件添加成功

REM 提交更改
echo 提交更改...
git commit -m "修复Dockerfile引用问题，将Dockerfile.simple改为Dockerfile"

if %errorlevel% neq 0 (
    echo ❌ 提交失败
    pause
    exit /b 1
)

echo ✅ 提交成功

REM 推送到GitHub
echo 推送到GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo ❌ 推送失败
    pause
    exit /b 1
)

echo ✅ 推送成功！
echo 现在可以重新触发Cloud Build构建了。

pause 