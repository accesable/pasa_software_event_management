# --------------------------
#  Stage 1: Build
# --------------------------
FROM node:22.12.0 AS builder

WORKDIR /app

# Copy package.json, package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build NestJS
RUN npm run build


# --------------------------
#  Stage 2: Runtime
# --------------------------
FROM node:22.12.0 AS runner

WORKDIR /app

# Copy node_modules và dist đã build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Thiết lập biến môi trường cổng chạy
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main.js"]
