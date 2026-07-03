FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_AUTH_SERVICE_URL
ENV VITE_AUTH_SERVICE_URL=$VITE_AUTH_SERVICE_URL
ARG VITE_ACCOUNT_SERVICE_URL
ENV VITE_ACCOUNT_SERVICE_URL=$VITE_ACCOUNT_SERVICE_URL
ARG VITE_POINTS_SERVICE_URL
ENV VITE_POINTS_SERVICE_URL=$VITE_POINTS_SERVICE_URL

RUN pnpm build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
