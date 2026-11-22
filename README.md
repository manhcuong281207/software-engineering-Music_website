# MC Music — Hệ thống Website Nghe Nhạc Trực Tuyến

Dự án Bài tập lớn môn **Công nghệ phần mềm** — Nhóm **CatGPT** (Trường Đại học CMC).  
**McMusic** là nền tảng nghe nhạc trực tuyến đa vai trò được thiết kế theo kiến trúc **Microservices hướng sự kiện (Event-Driven)**, phục vụ 3 nhóm đối tượng độc lập: **Người nghe nhạc (User)**, **Nghệ sĩ sáng tạo (Artist)** và **Quản trị viên (Admin)**.

---

## 1. Thành viên nhóm thực hiện (Nhóm CatGPT)

* **Giảng viên hướng dẫn:** ThS. Nguyễn Thị Vân Anh

| STT | Họ và tên | Mã sinh viên | Vai trò chính | Tài khoản GitHub |
| :-: | :--- | :---: | :--- | :--- |
| 1 | Nguyễn Mạnh Cường | `bit250052` | Tech Lead / Product Owner / Backend | `@manhcuong281207` |
| 2 | Tạ Hoàng Hải | `bit250125` | Backend Developer / QA Tester | `@tahoanghaip-hub` |
| 3 | Nguyễn Xuân Bách | `bit250037` | Scrum Master / Frontend Developer | `@nbach5176-tech` |
| 4 | Hoàng Thiên Bảo | `bit250044` | Frontend Developer | `@AbcxyzMewmew` |
| 5 | Hoàng Quốc Anh | `bit252134` | Frontend Developer | `@QuocAnhh124` |

---

## 2. Tính năng nổi bật (MVP)

* **Cổng Người nghe (User Web):**
  * Đăng ký, đăng nhập xác thực JWT (Access Token & Refresh Token).
  * Khám phá bài hát thịnh hành, album mới phát hành, duyệt nhạc theo 12 thể loại & tâm trạng.
  * Tìm kiếm thống nhất (`Unified Search`) có gợi ý tức thời (Debounce 350ms) và thuật toán xếp hạng độ liên quan (`RelevanceScorer`).
  * Trình phát nhạc liên tục (Queue, Next/Prev, Repeat, Shuffle), xem lời bài hát, lưu danh sách yêu thích, quản lý Playlist cá nhân, theo dõi nghệ sĩ và ghi nhận lịch sử nghe.
* **Cổng Nghệ sĩ (Artist Web):**
  * Tài khoản và hồ sơ nghệ sĩ độc lập; cập nhật hồ sơ tự động đồng bộ qua Apache Kafka.
  * Đăng tải bài hát (MP3/WAV), ảnh bìa, lời bài hát lên Cloudinary; tạo Album/EP/Single và sắp xếp thứ tự track.
  * Theo dõi trạng thái kiểm duyệt tác phẩm (`PENDING`, `APPROVED`, `REJECTED`, `TAKEDOWN`).
* **Cổng Quản trị viên (Admin Web):**
  * Kiểm duyệt hàng đợi bài hát/album chờ duyệt kèm nghe thử âm thanh; tự động đồng bộ trạng thái 2 chiều (Auto-Approve & Cascade Status).
  * Quản lý và khóa/mở khóa tài khoản User & Artist xuyên dịch vụ qua OpenFeign.

---

## 3. Kiến trúc hệ thống & Công nghệ sử dụng

* **Kiến trúc:** Microservices + Event-Driven, tách biệt 3 ứng dụng SPA (Same-Origin Policy), 1 API Gateway chỉ định tuyến (không giải mã JWT), 4 Backend Services sử dụng 4 schema độc lập trên PostgreSQL, kết hợp xác thực đa nguồn (`MultiIssuerJwtFilter`) và phi chuẩn hóa dữ liệu (`Data Denormalization`).
* **Backend:** Java 17, Spring Boot 4.1.1, Spring Cloud Gateway, Spring Cloud OpenFeign, Spring Security + JJWT, Gradle.
* **Frontend:** React 19, Vite 8, Tailwind CSS 4, TanStack React Query, Zustand, React Hook Form + Zod, Axios.
* **Database & Hạ tầng:** PostgreSQL 15 (4 schemas: `mc_music_users_schema`, `mc_music_artists_schema`, `mc_music_admin_schema`, `mc_music_catalog_schema`), Apache Kafka 3.7.0 (`artist-events-topic`), Cloudinary CDN, Docker & Docker Compose, Nginx.

### Sơ đồ cổng dịch vụ (Docker Compose)

| Dịch vụ / Ứng dụng | Mô tả | Cổng mặc định |
| :--- | :--- | :---: |
| `users-frontend` | Giao diện Người nghe nhạc (React + Nginx) | `5173` |
| `artists-frontend` | Giao diện Cổng Nghệ sĩ (React + Nginx) | `5172` |
| `admin-frontend` | Giao diện Quản trị viên (React + Nginx) | `5171` |
| `api-gateway` | Spring Cloud Gateway định tuyến & CORS | `8686` |
| `catalog-service` | Quản lý bài hát, album, tìm kiếm, Cloudinary | `8081` |
| `users-service` | Auth User, Playlist, Yêu thích, Theo dõi, Lịch sử | `8082` |
| `artists-service` | Auth Artist, Hồ sơ nghệ sĩ, Kafka Producer | `8083` |
| `admin-service` | Auth Admin, Quản lý khóa/mở khóa tài khoản | `8084` |
| `postgres-db` | PostgreSQL 15 (4 schemas độc lập) | `5432` |
| `kafka` | Apache Kafka 3.7.0 (KRaft mode) | `9092` |

---

## 4. Cấu trúc thư mục dự án

```text
software-engineering-Music_website/
├── backend/
│   ├── shared-auth-lib/       # Thư viện dùng chung xử lý JWT (JwtTokenProvider)
│   ├── api-gateway/           # API Gateway (Port 8686)
│   ├── catalog-service/       # Service quản lý âm nhạc & Cloudinary (Port 8081)
│   ├── users-service/         # Service người nghe & thư viện cá nhân (Port 8082)
│   ├── artists-service/       # Service nghệ sĩ & Kafka Producer (Port 8083)
│   ├── admin-service/         # Service quản trị hệ thống (Port 8084)
│   └── quy-chuan-api.md       # Quy chuẩn thiết kế RESTful API
├── frontend/
│   ├── users/                 # Ứng dụng web Người nghe (Vite dev: 5173)
│   ├── artists/               # Ứng dụng web Nghệ sĩ (Vite dev: 5174)
│   ├── admin/                 # Ứng dụng web Quản trị viên (Vite dev: 5175)
│   └── ui_ux_guidelines.md    # Hướng dẫn hệ thống thiết kế UI/UX
├── database/
│   ├── init-docker.sql        # Script khởi tạo 4 schema và dữ liệu thể loại
│   └── insert_mock_catalog_data.sql # Dữ liệu mẫu bài hát/album
├── docs/                      # Tài liệu phân tích API, CSDL, Kiến trúc
├── .env.example               # File mẫu biến môi trường cho Docker Compose
└── docker-compose.yml         # Cấu hình dựng toàn bộ 10 container
```

---

## 5. Hướng dẫn cài đặt và chạy dự án

### Cách 1: Chạy toàn bộ hệ thống bằng Docker Compose (Khuyên dùng)

**Yêu cầu:** Đã cài đặt Docker Desktop / Docker Compose.

1. **Clone repository:**
   ```bash
   git clone https://github.com/manhcuong281207/software-engineering-Music_website.git
   cd software-engineering-Music_website
   ```

2. **Cấu hình biến môi trường:**  
   Sao chép các file `.env.example` thành `.env` tại thư mục gốc và trong các service (`backend/users-service`, `backend/artists-service`, `backend/admin-service`, `backend/catalog-service`, `backend/api-gateway`), điền thông tin Cloudinary và secret key tương ứng:
   ```bash
   cp .env.example .env
   ```

3. **Khởi chạy toàn bộ 10 containers:**
   ```bash
   docker compose up --build -d
   ```

4. **Truy cập ứng dụng:**
   * User Web: `http://localhost:5173`
   * Artist Web: `http://localhost:5172`
   * Admin Web: `http://localhost:5171`
   * API Gateway: `http://localhost:8686`

---

### Cách 2: Chạy thủ công ở môi trường phát triển (Local Dev)

**Yêu cầu:** JDK 17, Node.js 18+, PostgreSQL 15, Apache Kafka.

1. Khởi tạo cơ sở dữ liệu PostgreSQL bằng `database/init-docker.sql` và publish thư viện dùng chung:
   ```bash
   cd backend/shared-auth-lib
   ./gradlew publishToMavenLocal
   ```
2. Chạy từng Backend Service (trong thư mục mỗi service):
   ```bash
   ./gradlew bootRun
   ```
3. Chạy từng Frontend App:
   ```bash
   cd frontend/users   # hoặc frontend/artists, frontend/admin
   npm install
   npm run dev
   ```

---

## 6. Kiểm thử (Testing)

* **Unit Test (Backend):** Sử dụng JUnit 5, Mockito và cơ sở dữ liệu H2 In-Memory (`application-test.yml`). Chạy trong từng module backend (ví dụ `users-service`, `catalog-service`, `artists-service`, `admin-service`, `api-gateway`, `shared-auth-lib`):
  ```bash
  ./gradlew test
  ```
* **Kiểm thử chức năng (Functional Testing):** Bộ 19 Test Case kiểm thử luồng Auth, Search, Player và User Library (đạt 17/19 Pass, ghi nhận 2 lỗi cải tiến về tìm kiếm tiếng Việt không dấu `unaccent` và đồng bộ Lyrics LRC).
