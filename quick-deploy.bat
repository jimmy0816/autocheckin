@echo off
echo 快速部署到Cloud Run...

REM 获取项目ID
for /f "tokens=*" %%i in ('gcloud config get-value project') do set PROJECT_ID=%%i
echo 项目ID: %PROJECT_ID%

REM 构建镜像
echo 构建Docker镜像...
docker build -f Dockerfile -t asia-east1-docker.pkg.dev/%PROJECT_ID%/autocheckin/autocheckin .

if %errorlevel% neq 0 (
    echo ❌ 构建失败！
    pause
    exit /b 1
)

REM 推送镜像
echo 推送镜像到Artifact Registry...
docker push asia-east1-docker.pkg.dev/%PROJECT_ID%/autocheckin/autocheckin

if %errorlevel% neq 0 (
    echo ❌ 推送失败！请先运行 setup-artifact-registry.bat
    pause
    exit /b 1
)

REM 部署到Cloud Run
echo 部署到Cloud Run...
gcloud run deploy autocheckin ^
  --image asia-east1-docker.pkg.dev/%PROJECT_ID%/autocheckin/autocheckin ^
  --region asia-east1 ^
  --platform managed ^
  --allow-unauthenticated ^
  --memory 2Gi ^
  --cpu 2 ^
  --timeout 900 ^
  --concurrency 1

if %errorlevel% equ 0 (
    echo ✅ 部署成功！
    echo 获取服务URL...
    gcloud run services describe autocheckin --region=asia-east1 --format="value(status.url)"
) else (
    echo ❌ 部署失败！
)

pause 