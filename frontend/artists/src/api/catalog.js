import api from "#/lib/axios";

// ==========================================
// 1. QUẢN LÝ BÀI HÁT (SONGS)
// ==========================================

/**
 * Đăng tải bài hát mới (Audio + Cover + Metadata)
 * Endpoint: POST /api/catalog/artist/songs
 * @param {FormData} formData
 * @returns {Promise<Object>} ApiResponse<SongResponse>
 */
export const uploadSongApi = async (formData) => {
  const response = await api.post("/catalog/artist/songs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Lấy danh sách bài hát do chính nghệ sĩ đăng tải
 * Endpoint: GET /api/catalog/artist/songs
 * @param {Object} params - { status, isDeleted, page, size }
 * @returns {Promise<Object>} ApiResponse<Page<SongResponse>>
 */
export const getArtistSongsApi = async (params = {}) => {
  const response = await api.get("/catalog/artist/songs", { params });
  return response.data;
};

/**
 * Chỉnh sửa bài hát (đổi tên, ảnh bìa, thể loại, album, cờ explicit)
 * Endpoint: PUT /api/catalog/artist/songs/{id}
 * @param {string} songId
 * @param {FormData} formData
 * @returns {Promise<Object>} ApiResponse<SongResponse>
 */
export const updateSongApi = async (songId, formData) => {
  const response = await api.put(`/catalog/artist/songs/${songId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Xóa mềm bài hát vào thùng rác (is_deleted = true)
 * Endpoint: DELETE /api/catalog/artist/songs/{id}
 * @param {string} songId
 * @returns {Promise<Object>} ApiResponse<Void>
 */
export const deleteSongApi = async (songId) => {
  const response = await api.delete(`/catalog/artist/songs/${songId}`);
  return response.data;
};

/**
 * Khôi phục bài hát từ thùng rác (is_deleted = false)
 * Endpoint: PUT /api/catalog/artist/songs/{id}/restore
 * @param {string} songId
 * @returns {Promise<Object>} ApiResponse<SongResponse>
 */
export const restoreSongApi = async (songId) => {
  const response = await api.put(`/catalog/artist/songs/${songId}/restore`);
  return response.data;
};

/**
 * Thêm mới hoặc cập nhật lời bài hát
 * Endpoint: POST /api/catalog/artist/songs/{songId}/lyrics
 * @param {string} songId
 * @param {Object} data - { content, language }
 * @returns {Promise<Object>} ApiResponse<Void>
 */
export const updateSongLyricsApi = async (songId, data) => {
  const response = await api.post(`/catalog/artist/songs/${songId}/lyrics`, data);
  return response.data;
};

/**
 * Lấy lời bài hát công khai
 * Endpoint: GET /api/catalog/public/songs/{songId}/lyrics
 * @param {string} songId
 * @returns {Promise<Object>} ApiResponse<LyricsResponse>
 */
export const getSongLyricsApi = async (songId) => {
  const response = await api.get(`/catalog/public/songs/${songId}/lyrics`);
  return response.data;
};

/**
 * Thêm nghệ sĩ hợp tác (Feat / Producer) vào bài hát
 * Endpoint: POST /api/catalog/artist/songs/{songId}/artists
 * @param {string} songId
 * @param {Object} data - { artistId, role } - role: FEATURED | PRODUCER
 * @returns {Promise<Object>} ApiResponse<Void>
 */
export const addSongArtistApi = async (songId, data) => {
  const response = await api.post(`/catalog/artist/songs/${songId}/artists`, data);
  return response.data;
};

/**
 * Xóa nghệ sĩ phụ / feat khỏi bài hát
 * Endpoint: DELETE /api/catalog/artist/songs/{songId}/artists/{artistId}
 * @param {string} songId
 * @param {string} artistId
 * @returns {Promise<Object>} ApiResponse<Void>
 */
export const removeSongArtistApi = async (songId, artistId) => {
  const response = await api.delete(`/catalog/artist/songs/${songId}/artists/${artistId}`);
  return response.data;
};

// ==========================================
// 2. QUẢN LÝ ALBUM (ALBUMS)
// ==========================================

/**
 * Tạo Album mới (ALBUM / EP / SINGLE)
 * Endpoint: POST /api/catalog/artist/albums
 * @param {FormData} formData
 * @returns {Promise<Object>} ApiResponse<AlbumResponse>
 */
export const createAlbumApi = async (formData) => {
  const response = await api.post("/catalog/artist/albums", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Lấy danh sách Album do chính nghệ sĩ tạo
 * Endpoint: GET /api/catalog/artist/albums
 * @param {Object} params - { isDeleted, page, size }
 * @returns {Promise<Object>} ApiResponse<Page<AlbumResponse>>
 */
export const getArtistAlbumsApi = async (params = {}) => {
  const response = await api.get("/catalog/artist/albums", { params });
  return response.data;
};

/**
 * Chỉnh sửa thông tin Album
 * Endpoint: PUT /api/catalog/artist/albums/{id}
 * @param {string} albumId
 * @param {FormData} formData
 * @returns {Promise<Object>} ApiResponse<AlbumResponse>
 */
export const updateAlbumApi = async (albumId, formData) => {
  const response = await api.put(`/catalog/artist/albums/${albumId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Xóa mềm Album (cascade xóa mềm toàn bộ bài hát trong album)
 * Endpoint: DELETE /api/catalog/artist/albums/{id}
 * @param {string} albumId
 * @returns {Promise<Object>} ApiResponse<Void>
 */
export const deleteAlbumApi = async (albumId) => {
  const response = await api.delete(`/catalog/artist/albums/${albumId}`);
  return response.data;
};

/**
 * Khôi phục Album từ thùng rác (cascade khôi phục toàn bộ bài hát)
 * Endpoint: PUT /api/catalog/artist/albums/{id}/restore
 * @param {string} albumId
 * @returns {Promise<Object>} ApiResponse<AlbumResponse>
 */
export const restoreAlbumApi = async (albumId) => {
  const response = await api.put(`/catalog/artist/albums/${albumId}/restore`);
  return response.data;
};

/**
 * Đưa bài hát đã đăng tải vào một Album
 * Endpoint: POST /api/catalog/artist/albums/{albumId}/songs
 * @param {string} albumId
 * @param {Object} data - { songId, trackNumber }
 * @returns {Promise<Object>} ApiResponse<Void>
 */
export const addSongToAlbumApi = async (albumId, data) => {
  const response = await api.post(`/catalog/artist/albums/${albumId}/songs`, data);
  return response.data;
};

/**
 * Gỡ bài hát khỏi Album (chuyển thành bài lẻ Single)
 * Endpoint: DELETE /api/catalog/artist/albums/{albumId}/songs/{songId}
 * @param {string} albumId
 * @param {string} songId
 * @returns {Promise<Object>} ApiResponse<Void>
 */
export const removeSongFromAlbumApi = async (albumId, songId) => {
  const response = await api.delete(`/catalog/artist/albums/${albumId}/songs/${songId}`);
  return response.data;
};

/**
 * Đổi số thứ tự track của các bài hát trong Album
 * Endpoint: PUT /api/catalog/artist/albums/{albumId}/songs/reorder
 * @param {string} albumId
 * @param {Object} data - { songOrders: [{ songId, trackNumber }] }
 * @returns {Promise<Object>} ApiResponse<Void>
 */
export const reorderAlbumSongsApi = async (albumId, data) => {
  const response = await api.put(`/catalog/artist/albums/${albumId}/songs/reorder`, data);
  return response.data;
};

/**
 * Lấy danh sách bài hát trong Album
 * Endpoint: GET /api/catalog/public/albums/{albumId}/songs
 * @param {string} albumId
 * @param {Object} params - { sort, page, size }
 * @returns {Promise<Object>} ApiResponse<Page<SongResponse>>
 */
export const getAlbumSongsApi = async (albumId, params = {}) => {
  const response = await api.get(`/catalog/public/albums/${albumId}/songs`, { params });
  return response.data;
};

// ==========================================
// 3. PUBLIC UTILITIES
// ==========================================

/**
 * Lấy danh sách tất cả các thể loại âm nhạc công khai
 * Endpoint: GET /api/catalog/public/genres
 * @returns {Promise<Object>} ApiResponse<List<GenreResponse>>
 */
export const getPublicGenresApi = async () => {
  const response = await api.get("/catalog/public/genres");
  return response.data;
};

/**
 * Lấy danh sách nghệ sĩ công khai (dùng để tìm kiếm khi Feat)
 * Endpoint: GET /api/artist/public/artists
 * @param {Object} params - { keyword, page, size, sort }
 * @returns {Promise<Object>} ApiResponse<Page<ArtistPublicResponse>>
 */
export const getPublicArtistsApi = async (params = {}) => {
  const response = await api.get("/artist/public/artists", { params });
  return response.data;
};
