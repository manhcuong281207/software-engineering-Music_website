# MC Music Admin Portal — Frontend

Hệ thống ứng dụng Web Quản trị (Admin) chuyên biệt thuộc hệ sinh thái **MC Music**, phục vụ việc quản lý người dùng, nghệ sĩ và kiểm duyệt nội dung phát hành (bài hát, album).
Dự án được xây dựng theo kiến trúc Microservices & Multi-issuer JWT độc lập.

---

## 1. Công nghệ sử dụng (Tech Stack)

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 (Chủ đề Spotify Dark Mode & Red Neon Theme `#fa2d48`, tuân thủ tài liệu `frontend/ui_ux_guidelines.md`)
- **State Management**: Zustand (Lưu trữ phiên đăng nhập quản trị độc lập tại `mc-admin-auth`)
- **Data Fetching & Cache**: TanStack React Query v5
- **Routing**: React Router v7 (Hỗ trợ Nested Layout, ProtectedRoute & GuestRoute)
- **Form & Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast thông báo chuẩn dark theme)
- **Linter**: Oxlint

---

## 2. Cấu trúc thư mục dự án

```text
frontend/admin/
├── public/                 # Favicon và SVG icons
├── src/
│   ├── api/                # Cấu trúc API modules dùng chung
│   │   ├── auth.js         # API Đăng nhập, Làm mới token, Đăng xuất Admin
│   │   ├── users.js        # API Lấy danh sách, xem chi tiết, khóa/mở khóa User
│   │   ├── artists.js      # API Lấy danh sách, xem chi tiết, khóa/mở khóa Artist
│   │   ├── catalog.js      # API Duyệt/Từ chối bài hát và album (Pending, Approved, Rejected)
│   │   └── index.js        # Export tập trung toàn bộ API modules
│   ├── components/
│   │   ├── auth/           # Route guards (ProtectedRoute, GuestRoute)
│   │   └── ui/             # UI Components chuẩn hóa (Button, StatusBadge, Modal, Skeleton, Pagination)
│   ├── layouts/            # Cấu trúc giao diện dùng chung
│   │   ├── AdminLayout.jsx # Layout chính kết hợp Sidebar + Topbar + Content
│   │   ├── Sidebar.jsx     # Thanh điều hướng trái (Responsive drawer trên mobile)
│   │   └── Topbar.jsx      # Thanh tiêu đề, thông tin quản trị viên & Đăng xuất
│   ├── lib/
│   │   ├── axios.js        # Axios instance dùng chung (Request & Response interceptors, Token refresh queue)
│   │   └── queryClient.js  # Cấu hình TanStack React Query
│   ├── pages/              # Các màn hình chức năng
│   │   ├── DashboardPage.jsx       # Trang tổng quan số liệu thống kê
│   │   ├── LoginPage.jsx           # Trang đăng nhập quản trị viên
│   │   ├── UsersPage.jsx           # Quản lý & khóa/mở khóa người dùng
│   │   ├── ArtistsPage.jsx         # Quản lý & khóa/mở khóa nghệ sĩ
│   │   ├── SongModerationPage.jsx  # Kiểm duyệt bài hát (Nghe thử, Duyệt, Từ chối)
│   │   ├── AlbumModerationPage.jsx # Kiểm duyệt album (Duyệt, Từ chối)
│   │   └── NotFoundPage.jsx        # Trang 404
│   ├── routes/
│   │   └── index.jsx       # Cấu hình định tuyến toàn ứng dụng
│   ├── store/
│   │   └── useAuthStore.js # Zustand store quản lý Auth Quản trị viên
│   ├── utils/
│   │   ├── formatters.js   # Hàm định dạng số, ngày tháng, thời lượng
│   │   └── toastUtils.js   # Helper hiển thị thông báo Sonner
│   ├── App.jsx             # Root component
│   ├── index.css           # Cấu hình TailwindCSS v4 theme
│   └── main.jsx            # Entry point
├── .env.example            # Mẫu biến môi trường
├── .env                    # Biến môi trường cục bộ
├── index.html              # HTML template
├── package.json            # Danh sách thư viện và scripts
└── vite.config.js          # Cấu hình Vite & Proxy chuyển tiếp Gateway
```

---

## 3. Cấu hình Axios & Cơ chế Xác thực

- **Định tuyến qua API Gateway**: Toàn bộ request gọi qua prefix `/api` sẽ được Vite Proxy tự động chuyển tiếp tới API Gateway (`http://localhost:8686/api`).
- **Request Interceptor**: Tự động lấy `accessToken` từ `useAuthStore` và đính kèm vào header:
  ```http
  Authorization: Bearer <ADMIN_ACCESS_TOKEN>
  ```
- **Response Interceptor & Refresh Token Queue**:
  - Khi gặp lỗi **HTTP 401 (Unauthorized)**, hệ thống tự động đưa request vào hàng đợi và âm thầm gọi `/api/admin/auth/refresh` bằng `refreshToken`.
  - Cập nhật cặp token mới vào store và thực thi lại các request đang chờ.
  - Nếu refresh token hết hạn hoặc lỗi, tự động dọn sạch phiên và điều hướng về trang `/login`.
  - Bắt lỗi **HTTP 403 (Forbidden)** khi tài khoản không đủ quyền và bắn event cảnh báo người dùng.

---

## 4. Hướng dẫn Cài đặt & Khởi chạy

### Bước 1: Cài đặt dependencies
```bash
cd frontend/admin
npm install
```

### Bước 2: Thiết lập biến môi trường
Sao chép `.env.example` thành `.env` (mặc định đã được cấu hình sẵn cho môi trường local):
```env
VITE_API_GATEWAY_URL=http://localhost:8686
VITE_API_BASE_URL=/api
```

### Bước 3: Chạy ứng dụng trong môi trường Development (Port 5175)
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:5175`

### Bước 4: Kiểm tra Linter & Build Production
```bash
# Kiểm tra code bằng oxlint
npm run lint

# Build bản đóng gói production
npm run build
```

---

## 5. Tài khoản Quản trị viên mặc định

Dùng tài khoản đã được cấp sẵn trong Database (`database/init-docker.sql`):
- **Email**: `admin@mcmusic.com`
- **Mật khẩu**: Khớp với mật khẩu quản trị viên hệ thống được sinh ra trong CSDL.

---

## 6. Hướng dẫn Phát triển tính năng mới cho Thành viên

1. **Gọi API mới**: Thêm hàm gọi API vào file tương ứng trong `src/api/` (hoặc tạo file mới và export ở `src/api/index.js`), sử dụng instance `api` từ `#/lib/axios`.
2. **Tạo trang mới**: Đặt component trang trong `src/pages/`.
3. **Thêm Route**: Đăng ký đường dẫn mới trong `src/routes/index.jsx` bên trong thẻ `<Route element={<AdminLayout />}>`.
4. **Thêm mục Sidebar**: Bổ sung icon và đường dẫn vào mảng `NAV_ITEMS` tại `src/layouts/Sidebar.jsx`.

