@echo off
echo 设置Artifact Registry...

REM 获取项目ID
for /f "tokens=*" %%i in ('gcloud config get-value project') do set PROJECT_ID=%%i
echo 项目ID: %PROJECT_ID%

REM 启用Artifact Registry API
echo 启用Artifact Registry API...
gcloud services enable artifactregistry.googleapis.com

REM 创建Artifact Registry仓库
echo 创建Artifact Registry仓库...
gcloud artifacts repositories create autocheckin ^
  --repository-format=docker ^
  --location=asia-east1 ^
  --description="Auto Check-in Docker Repository"

REM 配置Docker认证
echo 配置Docker认证...
gcloud auth configure-docker asia-east1-docker.pkg.dev

echo Artifact Registry设置完成！
echo 现在可以使用以下命令构建和推送镜像：
echo docker build -f Dockerfile.simple -t asia-east1-docker.pkg.dev/%PROJECT_ID%/autocheckin/autocheckin .
echo docker push asia-east1-docker.pkg.dev/%PROJECT_ID%/autocheckin/autocheckin

pause 