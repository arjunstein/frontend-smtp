# Stage 1: Base & Dependencies
FROM node:22-alpine AS base
WORKDIR /app

# Copy dependency manifests
COPY package.json ./

# Install dependencies cleanly
RUN npm install

# Stage 2: Development with Hot Module Reload (HMR)
FROM base AS dev
WORKDIR /app
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# Stage 3: Builder for Production
FROM base AS builder
WORKDIR /app
COPY . .
RUN npm run build

# Stage 4: Production Web Server with Nginx
FROM nginx:alpine AS prod
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
