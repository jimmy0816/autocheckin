@echo off
echo 正在执行Git上传...

REM 检查Git是否安装
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误：未找到Git，请先安装Git
    pause
    exit /b 1
)

echo Git已安装，开始上传...

REM 初始化仓库
echo 1. 初始化Git仓库...
git init

REM 添加远程仓库
echo 2. 添加远程仓库...
git remote add origin https://github.com/jimmy0816/autocheckin.git

REM 添加文件
echo 3. 添加文件...
git add .

REM 提交
echo 4. 提交更改...
git commit -m "Initial commit: 自动打卡系统"

REM 设置主分支
echo 5. 设置主分支...
git branch -M main

REM 推送
echo 6. 推送到GitHub...
git push -u origin main

echo 上传完成！
pause 