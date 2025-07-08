#!/bin/bash

# 设置项目ID
PROJECT_ID=$(gcloud config get-value project)
echo "使用项目ID: $PROJECT_ID"

# 构建并推送Docker镜像
echo "构建Docker镜像..."
docker build -t gcr.io/$PROJECT_ID/autocheckin .

echo "推送镜像到Container Registry..."
docker push gcr.io/$PROJECT_ID/autocheckin

# 部署到Cloud Run
echo "部署到Cloud Run..."
gcloud run deploy autocheckin \
  --image gcr.io/$PROJECT_ID/autocheckin \
  --region asia-east1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 900 \
  --concurrency 1

echo "部署完成！" 