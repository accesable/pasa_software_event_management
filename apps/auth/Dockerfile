FROM node:22-alpine
WORKDIR /app

# Vì context là root, gõ COPY này sẽ lấy file package.json ở root vào /app
COPY package*.json ./
RUN npm install

# Copy toàn bộ code từ root context vào /app
COPY . .

# Chuyển vào thư mục auth
WORKDIR /app/apps/auth
EXPOSE 50051
CMD ["npm", "run", "start:dev", "auth"]
