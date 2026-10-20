import api from '#/lib/axios';

/**
 * Chuẩn hóa đối tượng bài hát yêu thích từ backend
 */
export const normalizeFavoriteSong = (raw) => {
  if (!raw) return null;
  return {
    id: raw.songId || raw.id || String(raw._id || ''),
    songId: raw.songId || raw.id || '',
    title: raw.songTitle || raw.title || raw.name || 'Bài hát không tên',
    artistName: raw.artistName || raw.artist || raw.ownerName || 'Nhiều nghệ sĩ',
    ownerName: raw.artistName || raw.artist || raw.ownerName || 'Nhiều nghệ sĩ',
    coverImage: raw.coverImage || raw.coverUrl || '',
    coverUrl: raw.coverImage || raw.coverUrl || '',
    createdAt: raw.createdAt || raw.createdDate || null,
  };
};

/**
 * Chuẩn hóa đối tượng album yêu thích từ backend
 */
export const normalizeFavoriteAlbum = (raw) => {
  if (!raw) return null;
  return {
    id: raw.albumId || raw.id || String(raw._id || ''),
    albumId: raw.albumId || raw.id || '',
    title: raw.albumTitle || raw.title || 'Album chưa đặt tên',
    artistName: raw.artistName || raw.artist || raw.ownerName || 'Nghệ sĩ',
    ownerName: raw.artistName || raw.artist || raw.ownerName || 'Nghệ sĩ',
    coverImage: raw.coverImage || raw.coverUrl || '',
    coverUrl: raw.coverImage || raw.coverUrl || '',
    createdAt: raw.createdAt || raw.createdDate || null,
  };
};

/**
 * 3.1 Thêm bài hát vào danh sách yêu thích
 * Endpoint: POST /api/user/favorites/{songId}
 */
export const addFavoriteSong = async (songId) => {
  const response = await api.post(`/user/favorites/${songId}`);
  return response.data;
};

/**
 * 3.2 Xóa bài hát khỏi danh sách yêu thích
 * Endpoint: DELETE /api/user/favorites/{songId}
 */
export const removeFavoriteSong = async (songId) => {
  const response = await api.delete(`/user/favorites/${songId}`);
  return response.data;
};

/**
 * 3.3 Lấy danh sách bài hát yêu thích của người dùng hiện tại
 * Endpoint: GET /api/user/favorites
 * @param {{ page?: number, size?: number }} params
 */
export const getFavoriteSongs = async (params = { page: 0, size: 50 }) => {
  const response = await api.get('/user/favorites', { params });
  const payload = response.data?.data !== undefined ? response.data.data : response.data;
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.content)
    ? payload.content
    : [];
  return {
    content: list.map(normalizeFavoriteSong),
    totalElements: payload?.totalElements ?? list.length,
    totalPages: payload?.totalPages ?? 1,
    page: payload?.number ?? params.page ?? 0,
    size: payload?.size ?? params.size ?? 50,
  };
};

/**
 * 3.4 Thêm Album vào danh sách yêu thích
 * Endpoint: POST /api/user/favorites/albums/{albumId}
 */
export const addFavoriteAlbum = async (albumId) => {
  const response = await api.post(`/user/favorites/albums/${albumId}`);
  return response.data;
};

/**
 * 3.5 Xóa Album khỏi danh sách yêu thích
 * Endpoint: DELETE /api/user/favorites/albums/{albumId}
 */
export const removeFavoriteAlbum = async (albumId) => {
  const response = await api.delete(`/user/favorites/albums/${albumId}`);
  return response.data;
};

/**
 * 3.6 Lấy danh sách Album yêu thích của người dùng hiện tại
 * Endpoint: GET /api/user/favorites/albums
 * @param {{ page?: number, size?: number }} params
 */
export const getFavoriteAlbums = async (params = { page: 0, size: 50 }) => {
  const response = await api.get('/user/favorites/albums', { params });
  const payload = response.data?.data !== undefined ? response.data.data : response.data;
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.content)
    ? payload.content
    : [];
  return {
    content: list.map(normalizeFavoriteAlbum),
    totalElements: payload?.totalElements ?? list.length,
    totalPages: payload?.totalPages ?? 1,
    page: payload?.number ?? params.page ?? 0,
    size: payload?.size ?? params.size ?? 50,
  };
};
