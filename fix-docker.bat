@echo off
echo 修复Docker构建问题...

REM 删除可能存在的package-lock.json
if exist package-lock.json (
    echo 删除旧的package-lock.json...
    del package-lock.json
)

REM 使用简化的Dockerfile构建
echo 使用Dockerfile.simple构建镜像...
docker build -f Dockerfile.simple -t autocheckin .

if %errorlevel% equ 0 (
    echo ✅ Docker构建成功！
    echo 测试镜像...
    docker run --rm autocheckin node test-deps.js
) else (
    echo ❌ Docker构建失败！
)

pause 