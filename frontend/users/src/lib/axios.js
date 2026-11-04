import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// Base URL cho API: dùng proxy Vite (/api) hoặc cấu hình qua env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    // Timeout cho request để tránh treo giao diện (15s)
    timeout: 15000,
});

// Interceptor cho Request: Gắn Bearer Token nếu đã đăng nhập
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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

// Interceptor cho Response: Xử lý kết quả trả về & Tự động Refresh Token khi 401
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            const status = error.response.status;

            // Xử lý khi Token hết hạn (401)
            if (status === 401 && originalRequest && !originalRequest._retry) {
                // Nếu 401 xảy ra ở chính các endpoint auth (login, register, refresh), không thử refresh
                const isAuthEndpoint = originalRequest.url?.includes("/user/auth/");
                if (isAuthEndpoint) {
                    return Promise.reject(error);
                }

                const { refreshToken, logout, setTokens } = useAuthStore.getState();

                if (!refreshToken) {
                    logout();
                    return Promise.reject(error);
                }

                if (isRefreshing) {
                    // Nếu đang trong quá trình refresh token, đưa request vào hàng đợi
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
                    // Gọi API refresh token (dùng axios trực tiếp để tránh vòng lặp interceptor)
                    const res = await axios.post(`${API_BASE_URL}/user/auth/refresh`, {
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
                        throw new Error("Không nhận được token mới từ hệ thống");
                    }
                } catch (refreshErr) {
                    processQueue(refreshErr, null);
                    logout();
                    return Promise.reject(refreshErr);
                } finally {
                    isRefreshing = false;
                }
            } else if (status === 403) {
                console.warn("Truy cập bị từ chối: Không đủ quyền hạn.");
            } else if (status >= 500) {
                console.error("Máy chủ gặp lỗi, vui lòng thử lại sau.");
            }
        } else if (error.request) {
            console.error("Lỗi kết nối mạng: Không nhận được phản hồi từ máy chủ.");
        }

        return Promise.reject(error);
    }
);

export default api;
