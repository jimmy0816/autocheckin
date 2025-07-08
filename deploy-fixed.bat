@echo off
echo 直接部署到Cloud Run（修复版）...

REM 获取项目ID
for /f "tokens=*" %%i in ('gcloud config get-value project') do set PROJECT_ID=%%i
echo 项目ID: %PROJECT_ID%

REM 直接提交到Cloud Build
echo 提交到Cloud Build...
gcloud builds submit --config=cloudbuild.complete.yaml

if %errorlevel% equ 0 (
    echo ✅ 部署成功！
    echo 获取服务URL...
    gcloud run services describe autocheckin --region=asia-east1 --format="value(status.url)"
) else (
    echo ❌ 部署失败！
)

pause 