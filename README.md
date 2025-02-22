# This is the IT Project By PASA Software Team
## Account
- Account (or sign up, sign in with google)
  - **User 1:**
  - email: user8@gmail.com
    password: password123
  - **User 2:**
  - email: user1@example.com
    password: password123

## 🌍 Running on Deployment
<b>🚀 Deployed Links: </b>
- link deploy FE : https://pasasoftware.site
- link deploy BE : https://api.pasasoftware.site

## 💻 Running Locally
1️⃣ System Requirements
  • Node.js: v22.12.0
  • Yarn: v1.22.22 
  • NestJS: v9.4.2

2️⃣ Install & Run RabbitMQ in Docker
```bash
docker run -d --hostname my-rabbit --name some-rabbit -p 5672:5672 -p 15672:15672 -p 15692:15692 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=1234 rabbitmq:3-management
```

3️⃣ Run Frontend
```bash
cd frontend
yarn install
yarn dev
```
🔗 Default URL: http://localhost:5173

4️⃣ Run Backend
Step 1: Configure the backend
  • In backend/apps/apigateway/src/main.ts, update:
```bash
origin: ["https://pasasoftware.site"]
```
  • to:
```bash
origin: ["http://localhost:5173"]
```

• Update environment variables in backend\apps\apigateway.env.example
```bash
REDIS_HOST=redis-10701.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=10701
REDIS_PASSWORD=wNNnPwxAjaO5RuN3mT7rUjBC6twXfrUu
```
- version: node v22.12.0, yarn 1.22.22, nest 9.4.2
```bash
yarn install
yarn start:all
```

## 🧪 Run Unit Tests
<b>run unit test for BE</b>
```bash
yarn test:unit
```
