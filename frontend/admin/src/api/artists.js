import api from "../lib/axios";

/**
 * Lấy danh sách Nghệ sĩ có phân trang và sắp xếp
 * @param {Object} params - { page, size, sort }
 * @returns {Promise<Object>}
 */
export const getArtistsApi = async ({ page = 0, size = 10, sort = "createdAt,desc" } = {}) => {
  const response = await api.get("/admin/artists", {
    params: { page, size, sort },
  });
  return response.data;
};

/**
 * Lấy thông tin chi tiết một Nghệ sĩ theo ID
 * @param {string} id - UUID của nghệ sĩ
 * @returns {Promise<Object>}
 */
export const getArtistDetailApi = async (id) => {
  const response = await api.get(`/admin/artists/${id}`);
  return response.data;
};

/**
 * Khóa hoặc Mở khóa tài khoản Nghệ sĩ
 * @param {string} id - UUID của nghệ sĩ
 * @param {boolean} isActive - true: mở khóa, false: khóa
 * @returns {Promise<Object>}
 */
export const toggleArtistStatusApi = async (id, isActive) => {
  const response = await api.patch(`/admin/artists/${id}/status`, {
    isActive,
  });
  return response.data;
};

