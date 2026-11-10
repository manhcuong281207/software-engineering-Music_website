import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// Base URL: qua Vite proxy ("/api" -> "http://localhost:8686/api") hoặc biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ── 1. REQUEST INTERCEPTOR: TỰ ĐỘNG GẮN ADMIN ACCESS TOKEN ───────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Nếu gửi FormData (upload file/ảnh), gỡ Content-Type để axios/browser tự sinh multipart boundary
    if (config.data instanceof FormData && config.headers) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
        config.headers.delete("content-type");
      } else {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── 2. RESPONSE INTERCEPTOR: XỬ LÝ LỖI TOÀN CỤC & TỰ ĐỘNG LÀM MỚI TOKEN (401/403) ──
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;

      // --- Xử lý 403 Forbidden: Không đủ quyền quản trị ---
      if (status === 403) {
        console.warn("[Admin API] 403 Forbidden: Tài khoản không có quyền thực hiện hành động này.");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("mc-admin-forbidden", {
              detail: { message: error.response?.data?.message || "Bạn không có quyền thực hiện chức năng này." },
            })
          );
        }
      }

      // --- Xử lý 401 Unauthorized: Token hết hạn, tự động Refresh Token ---
      if (status === 401 && originalRequest && !originalRequest._retry) {
        // Nếu lỗi xảy ra tại chính các endpoint auth (login, refresh, logout), không thử refresh lại
        const isAuthEndpoint = originalRequest.url?.includes("/admin/auth/");
        if (isAuthEndpoint) {
          return Promise.reject(error);
        }

        const { refreshToken, logout, setTokens } = useAuthStore.getState();

        // Không có refresh token -> đăng xuất người dùng
        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        // Nếu đã có một tiến trình refresh đang chạy, xếp request hiện tại vào hàng đợi
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Gọi API Refresh Token của admin thông qua instance axios độc lập (tránh đệ quy interceptor)
          const res = await axios.post(`${API_BASE_URL}/admin/auth/refresh`, {
            refreshToken,
          });

          const data = res.data?.data;
          const newAccessToken = data?.accessToken;
          const newRefreshToken = data?.refreshToken;

          if (newAccessToken) {
            setTokens(newAccessToken, newRefreshToken);
            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } else {
            throw new Error("Không nhận được token mới từ server");
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          logout();
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

