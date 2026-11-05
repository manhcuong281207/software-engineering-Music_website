import api from "#/lib/axios";

/**
 * Trích xuất thông báo lỗi từ phản hồi server
 */
export const getErrorMessage = (error, defaultMessage = "Đã có lỗi xảy ra. Vui lòng thử lại.") => {
  if (!error) return defaultMessage;
  if (typeof error === "string") return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message) return error.message;
  return defaultMessage;
};

/**
 * Đăng nhập tài khoản Nghệ sĩ
 * @param {Object} credentials - { email, password }
 */
export const loginApi = async (credentials) => {
  const response = await api.post("/artist/auth/login", credentials);
  return response.data;
};

/**
 * Đăng ký tài khoản Nghệ sĩ
 * @param {Object} data - { email, password, stageName }
 */
export const registerApi = async (data) => {
  const response = await api.post("/artist/auth/register", data);
  return response.data;
};

/**
 * Làm mới Access Token
 * @param {string} refreshToken
 */
export const refreshTokenApi = async (refreshToken) => {
  const response = await api.post("/artist/auth/refresh", { refreshToken });
  return response.data;
};

/**
 * Đăng xuất Nghệ sĩ
 * @param {string} refreshToken
 */
export const logoutApi = async (refreshToken) => {
  const response = await api.post("/artist/auth/logout", { refreshToken });
  return response.data;
};

