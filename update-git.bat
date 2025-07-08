@echo off
echo 正在更新到Git...

REM 调用PowerShell脚本
powershell -ExecutionPolicy Bypass -File "update-git.ps1"

pause 