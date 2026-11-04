import api from "#/lib/axios";

/**
 * Lấy danh sách bài hát do chính nghệ sĩ đăng tải
 * Endpoint: GET /api/catalog/artist/songs
 * @param {Object} params - { page, size, status, isDeleted }
 */
export const getArtistSongsApi = async (params = {}) => {
  const response = await api.get("/catalog/artist/songs", { params });
  return response.data;
};

/**
 * Lấy danh sách album do chính nghệ sĩ tạo
 * Endpoint: GET /api/catalog/artist/albums
 * @param {Object} params - { page, size, isDeleted }
 */
export const getArtistAlbumsApi = async (params = {}) => {
  const response = await api.get("/catalog/artist/albums", { params });
  return response.data;
};

