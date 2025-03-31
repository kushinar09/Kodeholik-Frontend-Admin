# Build frontend bằng NodeJS
FROM node:lts-alpine AS build

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file package.json và yarn.lock trước để cài đặt dependencies trước (tăng tốc build)
COPY package*.json yarn.lock ./

# Cài đặt dependencies
RUN yarn install --frozen-lockfile

# Copy toàn bộ code
COPY . .

# Build ứng dụng React (Vite)
RUN yarn build

# Chạy Nginx để serve frontend
FROM nginx:alpine

# Copy file build từ stage build

# Gán quyền cho thư mục chứa file tĩnh
RUN chmod -R 755 /usr/share/nginx/html

# Mở port 80
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]