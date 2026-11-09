import api from "../lib/axios";

/**
 * Lấy danh sách Người dùng có phân trang và sắp xếp
 * @param {Object} params - { page, size, sort }
 * @returns {Promise<Object>}
 */
export const getUsersApi = async ({ page = 0, size = 10, sort = "createdAt,desc" } = {}) => {
  const response = await api.get("/admin/users", {
    params: { page, size, sort },
  });
  return response.data;
};

/**
 * Lấy thông tin chi tiết một Người dùng theo ID
 * @param {string} id - UUID của người dùng
 * @returns {Promise<Object>}
 */
export const getUserDetailApi = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

/**
 * Khóa hoặc Mở khóa tài khoản Người dùng
 * @param {string} id - UUID của người dùng
 * @param {boolean} isActive - true: mở khóa, false: khóa
 * @returns {Promise<Object>}
 */
export const toggleUserStatusApi = async (id, isActive) => {
  const response = await api.patch(`/admin/users/${id}/status`, {
    isActive,
  });
  return response.data;
};

