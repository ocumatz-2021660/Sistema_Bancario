FROM node:22-alpine

WORKDIR /app/backend

RUN npm install -g pnpm@10

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY auth-service/package.json ./auth-service/package.json
COPY account-service/package.json ./account-service/package.json
COPY points-service/package.json ./points-service/package.json

RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3002

CMD ["pnpm", "--filter", "account-service", "start"]
