# 使用官方 Node.js 运行时作为基础镜像
FROM node:18-slim

# 安装 Chrome 依赖
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制 package.json 首先（利用Docker缓存）
COPY package.json ./

# 安装依赖（让npm自动处理，不使用package-lock.json）
RUN npm install --only=production --omit=dev

# 复制应用代码
COPY . .

# 创建非 root 用户
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# 切换到非 root 用户
USER pptruser

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["npm", "start"] 