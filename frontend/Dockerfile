FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_USER_SERVICE_URL
ARG VITE_PRODUCT_SERVICE_URL
ENV VITE_USER_SERVICE_URL=$VITE_USER_SERVICE_URL
ENV VITE_PRODUCT_SERVICE_URL=$VITE_PRODUCT_SERVICE_URL

RUN npm run build

FROM node:20-alpine AS production
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:3000 || exit 1
CMD ["serve", "-s", "dist", "-l", "3000"]