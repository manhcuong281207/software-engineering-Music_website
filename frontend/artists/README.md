# MC Music for Artists — Frontend

Ứng dụng web chuyên biệt dành cho Nghệ sĩ (Artist) thuộc hệ sinh thái **MC Music**.
Được xây dựng độc lập theo kiến trúc Microservices & Multi-issuer JWT của dự án.

## Công nghệ sử dụng
- **React 19** + **Vite**
- **Tailwind CSS v4** (Modern Spotify Dark Palette & Neon Red theme)
- **Zustand** (Artist Auth Store, phân tách session độc lập)
- **TanStack React Query v5** (Cache & Data Synchronization)
- **React Router v7** (Nested layouts, Protected routes)
- **React Hook Form + Zod** (Client-side validation)
- **Sonner** (Toast notifications)
- **Lucide React** (Icons)

## Chức năng chính
1. **Trang chủ / Tổng quan (Dashboard)**:
   - Hiển thị thông tin chào mừng nghệ sĩ đang đăng nhập.
   - Thống kê thời gian thực: Tổng lượt nghe (`totalPlays`), Tổng lượt thích (`totalLikes`), Người theo dõi (`totalFollowers`), Tổng số bài hát (`totalSongs`).
   - Danh sách các tác phẩm gần đây kèm trạng thái duyệt (`APPROVED`, `PENDING`, `REJECTED`, `TAKEDOWN`).
2. **Hồ sơ nghệ sĩ (Profile)**:
   - Xem đầy đủ thông tin: Nghệ danh, Email, ID (UUID), Ảnh đại diện, Ảnh bìa, Số lượt theo dõi.
   - Chỉnh sửa hồ sơ trực tiếp: Đổi nghệ danh, cập nhật tiểu sử, upload ảnh đại diện và ảnh bìa trực tiếp lên Cloudinary thông qua Backend `artists-service` (`PUT /api/artist/me`).
   - Tự động đồng bộ tên nghệ danh sang `catalog-service` qua sự kiện Kafka (`ArtistProfileUpdatedEvent`).
3. **Xác thực (Authentication)**:
   - Đăng nhập / Đăng ký nghệ sĩ riêng biệt (`/artist/auth/login`, `/artist/auth/register`).
   - Quản lý phiên làm việc, tự động làm mới token (Refresh Token Rotation).

## Khởi chạy dự án
```bash
# Cài đặt thư viện
npm install

# Khởi chạy môi trường Dev (Port 5174)
npm run dev

# Kiểm tra lint
npm run lint

# Build production
npm run build
```

