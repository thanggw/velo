# Velo - Agile Project Management Platform

Velo là ứng dụng quản lý công việc theo mô hình Agile/Scrum, hỗ trợ quản lý project, phân quyền người dùng, Kanban board và dashboard theo dõi tiến độ.

## Tech Stack

### Frontend

- Vue 3, Vite, TypeScript
- Pinia
- Vue Router
- Element Plus
- Axios
- HTML5 Drag and Drop cho Kanban board

### Backend

- NestJS, TypeScript
- PostgreSQL
- Prisma ORM
- JWT access token và refresh token
- Passport, bcrypt
- class-validator, class-transformer

## Tính Năng Chính

- Đăng ký, đăng nhập, refresh token và đăng xuất.
- Phân quyền theo vai trò: `ADMIN`, `MANAGER`, `MEMBER`.
- Navigation guard ở frontend và guard ở backend.
- Quản lý project: tạo, sửa, xóa, gán manager và member.
- Kanban board theo project với các trạng thái: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`.
- Tạo, sửa, xóa, kéo thả task trên board.
- Dashboard tổng quan cho admin.
- Profile page cho người dùng cập nhật thông tin cá nhân.
- UI responsive cho desktop, tablet và mobile.

## Cấu Trúc Thư Mục

```text
velo/
  backend/
    prisma/
      migrations/
      schema.prisma
    src/
      auth/
      dashboard/
      prisma/
      projects/
      tasks/
      users/
    .env.example
    package.json
  frontend/
    src/
      api/
      directives/
      router/
      stores/
      styles/
      types/
      views/
    .env.example
    package.json
  .gitignore
  README.md
```

## Yêu Cầu Môi Trường

- Node.js 20 hoặc mới hơn
- npm
- PostgreSQL database

## Cài Đặt

Clone repository và cài dependencies cho từng app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Biến Môi Trường

Tạo file `.env` từ file mẫu:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Backend `.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_REFRESH_SECRET="replace-with-another-long-random-secret"
```

### Frontend `.env`

```env
VITE_API_BASE_URL="http://localhost:3000/api"
```

## Database

Chạy Prisma migration:

```bash
cd backend
npm run prisma:migrate
```

Generate Prisma Client nếu cần:

```bash
npm run prisma:generate
```

## Chạy Dự Án

Chạy backend:

```bash
cd backend
npm run start:dev
```

Backend mặc định chạy tại:

```text
http://localhost:3000/api
```

Chạy frontend:

```bash
cd frontend
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

## Scripts Hữu Ích

Backend:

```bash
npm run start:dev
npm run build
npm run prisma:migrate
npm run prisma:generate
npm run prisma:studio
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Checklist Trước Khi Push Lên GitHub

- Không commit file `.env`.
- Không commit `node_modules/`.
- Không commit `dist/`.
- Kiểm tra `.env.example` đã đủ biến môi trường cần thiết.
- Chạy build backend:

```bash
cd backend
npm run build
```

- Chạy build frontend:

```bash
cd frontend
npm run build
```
