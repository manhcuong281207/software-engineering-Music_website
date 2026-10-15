import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE_URL = "/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000,
});

// Interceptor cho Request: Đính kèm Authorization header
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Flag chống race condition khi nhiều request cùng bị 401
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

// Interceptor cho Response: Auto refresh token khi Access Token hết hạn
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        if (status === 401 && !originalRequest._retry) {
            const { refreshToken: storedRefreshToken, setTokens, logout } = useAuthStore.getState();

            // Nếu không có refreshToken => đăng xuất luôn
            if (!storedRefreshToken) {
                logout();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Nếu đang refresh thì đưa request vào hàng chờ
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi trực tiếp axios (không qua interceptor) để tránh vòng lặp vô hạn
                const response = await axios.post(`${API_BASE_URL}/user/auth/refresh`, {
                    refreshToken: storedRefreshToken,
                });
                const { accessToken: newAccess, refreshToken: newRefresh } = response.data.data;
                setTokens(newAccess, newRefresh);
                processQueue(null, newAccess);
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (status === 403) {
            console.warn("Forbidden! You don't have permission.");
        } else if (status >= 500) {
            console.error("Server error. Please try again later.");
        }

        return Promise.reject(error);
    }
);

export default api;