# --------------------------
#  Stage 1: Build
# --------------------------
FROM node:22.12.0 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# --------------------------
#  Stage 2: Runtime
# --------------------------
FROM node:22.12.0 AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV PORT=50051
EXPOSE 50051

CMD ["node", "dist/main.js"]
