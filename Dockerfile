# Dùng node.js để build ứng dụng
FROM node:18 as build

# Đặt thư mục làm việc
WORKDIR /app

# Copy file package.json và cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy toàn bộ source code và build
COPY . .
RUN npm run build

# Dùng nginx để phục vụ static files
FROM nginx:latest

# Copy build từ container node vào nginx
COPY --from=build /app/build /usr/share/nginx/html

# Mở port 80
EXPOSE 5123

# Chạy nginx
CMD ["nginx", "-g", "daemon off;"]
