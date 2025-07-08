# 🔄 Artifact Registry 迁移说明

## 问题解决
Google Container Registry (GCR) 已被弃用，需要迁移到 Artifact Registry。

## 主要修复

### 1. 更新镜像路径
**旧路径**（已弃用）：
```
gcr.io/$PROJECT_ID/autocheckin
```

**新路径**（Artifact Registry）：
```
asia-east1-docker.pkg.dev/$PROJECT_ID/autocheckin/autocheckin
```

### 2. 优化构建时间
- 使用Docker缓存优化
- 先复制package.json，再安装依赖
- 最后复制应用代码

### 3. 创建自动化脚本
- `setup-artifact-registry.bat` - 设置Artifact Registry
- `quick-deploy.bat` - 快速部署脚本

## 部署步骤

### 步骤1：设置Artifact Registry
```bash
# 运行设置脚本
setup-artifact-registry.bat
```

或者手动执行：
```bash
# 启用API
gcloud services enable artifactregistry.googleapis.com

# 创建仓库
gcloud artifacts repositories create autocheckin \
  --repository-format=docker \
  --location=asia-east1 \
  --description="Auto Check-in Docker Repository"

# 配置Docker认证
gcloud auth configure-docker asia-east1-docker.pkg.dev
```

### 步骤2：快速部署
```bash
# 运行快速部署脚本
quick-deploy.bat
```

### 步骤3：验证部署
访问Cloud Run控制台查看服务URL

## 构建优化

### Dockerfile.simple 优化
```dockerfile
# 复制 package.json 首先（利用Docker缓存）
COPY package.json ./

# 安装依赖
RUN npm install --only=production --omit=dev

# 复制应用代码
COPY . .
```

### 构建时间优化
- 利用Docker层缓存
- 依赖安装只在实际需要时执行
- 减少不必要的文件复制

## 配置文件更新

### cloudbuild.complete.yaml
- 更新镜像路径为Artifact Registry
- 使用优化的Dockerfile.simple

### deploy.bat
- 更新镜像标签
- 使用新的仓库路径

## 常见问题

### 问题1：权限不足
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 问题2：仓库不存在
```bash
# 创建仓库
gcloud artifacts repositories create autocheckin \
  --repository-format=docker \
  --location=asia-east1
```

### 问题3：Docker认证失败
```bash
# 配置Docker认证
gcloud auth configure-docker asia-east1-docker.pkg.dev
```

## 性能改进

### 构建时间
- 从12分钟减少到约3-5分钟
- 利用Docker缓存优化
- 减少不必要的依赖安装

### 部署时间
- 使用Artifact Registry提高推送速度
- 优化镜像大小

## 下一步

1. 运行 `setup-artifact-registry.bat`
2. 运行 `quick-deploy.bat`
3. 验证应用功能
4. 更新Cloud Build触发器配置

## 文件说明

- `setup-artifact-registry.bat` - Artifact Registry设置脚本
- `quick-deploy.bat` - 快速部署脚本
- `Dockerfile.simple` - 优化的Dockerfile
- `cloudbuild.complete.yaml` - 更新的Cloud Build配置 