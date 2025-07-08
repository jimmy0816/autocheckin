@echo off
echo 开始部署到Cloud Run...

REM 设置项目ID
for /f "tokens=*" %%i in ('gcloud config get-value project') do set PROJECT_ID=%%i
echo 使用项目ID: %PROJECT_ID%

REM 构建Docker镜像
echo 构建Docker镜像...
docker build -f Dockerfile -t asia-east1-docker.pkg.dev/%PROJECT_ID%/autocheckin/autocheckin .

REM 推送镜像到Artifact Registry
echo 推送镜像到Artifact Registry...
docker push asia-east1-docker.pkg.dev/%PROJECT_ID%/autocheckin/autocheckin

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

echo 部署完成！
pause 