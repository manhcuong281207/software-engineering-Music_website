import api from "../lib/axios";

/**
 * Lấy danh sách Bài hát đang chờ duyệt (PENDING)
 * @param {Object} params - { page, size }
 * @returns {Promise<Object>}
 */
export const getPendingSongsApi = async ({ page = 0, size = 10 } = {}) => {
  const response = await api.get("/catalog/admin/songs/pending", {
    params: { page, size },
  });
  return response.data;
};

/**
 * Cập nhật trạng thái duyệt / từ chối / gỡ bài hát
 * @param {string} songId - UUID của bài hát
 * @param {'APPROVED' | 'REJECTED' | 'TAKEDOWN'} status - Trạng thái mới
 * @param {string} reason - Lý do nếu từ chối hoặc gỡ bài
 * @returns {Promise<Object>}
 */
export const updateSongStatusApi = async (songId, status, reason = "") => {
  const response = await api.patch(`/catalog/admin/songs/${songId}/status`, {
    status,
    reason,
  });
  return response.data;
};

/**
 * Lấy danh sách Album đang chờ duyệt (PENDING)
 * @param {Object} params - { page, size }
 * @returns {Promise<Object>}
 */
export const getPendingAlbumsApi = async ({ page = 0, size = 10 } = {}) => {
  const response = await api.get("/catalog/admin/albums/pending", {
    params: { page, size },
  });
  return response.data;
};

/**
 * Cập nhật trạng thái duyệt / từ chối / gỡ Album
 * @param {string} albumId - UUID của album
 * @param {'APPROVED' | 'REJECTED' | 'TAKEDOWN'} status - Trạng thái mới
 * @param {string} reason - Lý do nếu từ chối hoặc gỡ album
 * @returns {Promise<Object>}
 */
export const updateAlbumStatusApi = async (albumId, status, reason = "") => {
  const response = await api.patch(`/catalog/admin/albums/${albumId}/status`, {
    status,
    reason,
  });
  return response.data;
};

/**
 * Lấy danh sách thể loại nhạc công khai
 * @returns {Promise<Object>}
 */
export const getPublicGenresApi = async () => {
  const response = await api.get("/catalog/public/genres");
  return response.data;
};

/**
 * Lấy danh sách bài hát công khai (dùng để lấy tổng số bài hát phát hành cho Dashboard)
 * @param {Object} params - { page, size, keyword, genreId, sort }
 * @returns {Promise<Object>}
 */
export const getPublicSongsApi = async ({ page = 0, size = 10, keyword = "", sort = "createdAt,desc" } = {}) => {
  const response = await api.get("/catalog/public/songs", {
    params: { page, size, keyword, sort },
  });
  return response.data;
};

