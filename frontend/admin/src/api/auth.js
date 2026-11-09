import api from "../lib/axios";

/**
 * Đăng nhập Quản trị viên
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} Response từ server chứa accessToken, refreshToken và thông tin admin
 */
export const loginAdminApi = async ({ email, password }) => {
  const response = await api.post("/admin/auth/login", { email, password });
  return response.data;
};

/**
 * Làm mới Token cho Quản trị viên
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
export const refreshTokenAdminApi = async (refreshToken) => {
  const response = await api.post("/admin/auth/refresh", { refreshToken });
  return response.data;
};

/**
 * Đăng xuất Quản trị viên
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
export const logoutAdminApi = async (refreshToken) => {
  const response = await api.post("/admin/auth/logout", { refreshToken });
  return response.data;
};

