import api from '#/lib/axios';

/**
 * Chuẩn hóa đối tượng Playlist từ backend để UI dùng thống nhất
 */
export const normalizePlaylist = (raw) => {
  if (!raw) return null;
  return {
    id: raw.id || raw.playlistId || String(raw._id || ''),
    name: raw.name || raw.title || 'Danh sách phát chưa đặt tên',
    title: raw.name || raw.title || 'Danh sách phát chưa đặt tên',
    description: raw.description || '',
    coverImage: raw.coverImage || raw.coverUrl || '',
    coverUrl: raw.coverImage || raw.coverUrl || '',
    isPublic: raw.isPublic !== undefined ? Boolean(raw.isPublic) : false,
    userId: raw.userId || raw.ownerId || '',
    ownerName: raw.ownerName || raw.userName || 'Bạn',
    songCount: typeof raw.songCount === 'number'
      ? raw.songCount
      : (Array.isArray(raw.songs) ? raw.songs.length : 0),
    songs: Array.isArray(raw.songs) ? raw.songs.map(normalizePlaylistSong) : [],
    createdAt: raw.createdAt || raw.createdDate || null,
    updatedAt: raw.updatedAt || null,
  };
};

/**
 * Chuẩn hóa đối tượng bài hát trong Playlist
 */
export const normalizePlaylistSong = (raw) => {
  if (!raw) return null;
  return {
    id: raw.songId || raw.id || String(raw._id || ''),
    songId: raw.songId || raw.id || '',
    playlistId: raw.playlistId || '',
    title: raw.songTitle || raw.title || raw.name || 'Bài hát không tên',
    artist: raw.artistName || raw.artist || raw.ownerName || 'Nhiều nghệ sĩ',
    artistName: raw.artistName || raw.artist || raw.ownerName || 'Nhiều nghệ sĩ',
    albumTitle: raw.albumTitle || raw.albumName || '',
    coverImage: raw.coverImage || raw.coverUrl || '',
    coverUrl: raw.coverImage || raw.coverUrl || '',
    audioUrl: raw.audioUrl || raw.fileUrl || raw.streamUrl || '',
    durationSeconds: typeof raw.durationSeconds === 'number'
      ? raw.durationSeconds
      : (typeof raw.durationMs === 'number' ? Math.round(raw.durationMs / 1000) : 0),
    addedAt: raw.addedAt || raw.createdAt || null,
  };
};

/**
 * 2.2 Lấy danh sách Playlist của người dùng hiện tại
 * Endpoint: GET /api/user/playlists
 */
export const getUserPlaylists = async (params = { page: 0, size: 50 }) => {
  const response = await api.get('/user/playlists', { params });
  const payload = response.data?.data !== undefined ? response.data.data : response.data;
  const list = Array.isArray(payload)
    ? payload
    : (Array.isArray(payload?.content) ? payload.content : []);
  return list.map(normalizePlaylist);
};

/**
 * Lấy chi tiết thông tin 1 Playlist
 * Cố gắng gọi GET /api/user/playlists/{playlistId}, nếu backend chưa có endpoint này
 * thì tự động fallback tìm trong danh sách playlist của người dùng.
 */
export const getPlaylistById = async (playlistId) => {
  try {
    const response = await api.get(`/user/playlists/${playlistId}`);
    const payload = response.data?.data !== undefined ? response.data.data : response.data;
    return normalizePlaylist(payload);
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      const userPlaylists = await getUserPlaylists({ page: 0, size: 100 });
      const found = userPlaylists.find((p) => String(p.id) === String(playlistId));
      if (found) return found;
    }
    throw err;
  }
};

/**
 * 2.1 Tạo Playlist mới
 * Endpoint: POST /api/user/playlists
 * @param {{ name: string, description?: string, coverImage?: string, isPublic?: boolean }} data
 */
export const createPlaylist = async (data) => {
  const payload = {
    name: data.name.trim(),
    description: data.description?.trim() || '',
    coverImage: data.coverImage || '',
    isPublic: data.isPublic !== undefined ? data.isPublic : false,
  };
  const response = await api.post('/user/playlists', payload);
  const result = response.data?.data !== undefined ? response.data.data : response.data;
  return normalizePlaylist(result);
};

/**
 * Đổi tên / Chỉnh sửa Playlist
 * Endpoint: PUT /api/user/playlists/{playlistId} (chuẩn RESTful)
 */
export const updatePlaylist = async (playlistId, data) => {
  const payload = {
    name: data.name?.trim(),
    description: data.description !== undefined ? data.description.trim() : undefined,
    coverImage: data.coverImage,
    isPublic: data.isPublic,
  };
  try {
    const response = await api.put(`/user/playlists/${playlistId}`, payload);
    const result = response.data?.data !== undefined ? response.data.data : response.data;
    return normalizePlaylist(result);
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      throw new Error("Tính năng đổi tên playlist đang được Backend hoàn thiện thêm.");
    }
    throw err;
  }
};

/**
 * Xóa Playlist
 * Endpoint: DELETE /api/user/playlists/{playlistId} (chuẩn RESTful)
 */
export const deletePlaylist = async (playlistId) => {
  try {
    const response = await api.delete(`/user/playlists/${playlistId}`);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      throw new Error("Tính năng xóa playlist đang được Backend hoàn thiện thêm.");
    }
    throw err;
  }
};

/**
 * 2.5 Xem danh sách bài hát trong Playlist
 * Endpoint: GET /api/user/playlists/{playlistId}/songs
 */
export const getPlaylistSongs = async (playlistId, params = { page: 0, size: 100 }) => {
  const response = await api.get(`/user/playlists/${playlistId}/songs`, { params });
  const payload = response.data?.data !== undefined ? response.data.data : response.data;
  const list = Array.isArray(payload)
    ? payload
    : (Array.isArray(payload?.content) ? payload.content : []);
  return list.map(normalizePlaylistSong);
};

/**
 * 2.3 Thêm bài hát vào Playlist
 * Endpoint: POST /api/user/playlists/{playlistId}/songs
 * @param {string} playlistId
 * @param {string} songId
 */
export const addSongToPlaylist = async (playlistId, songId) => {
  const response = await api.post(`/user/playlists/${playlistId}/songs`, {
    songId: String(songId),
  });
  const payload = response.data?.data !== undefined ? response.data.data : response.data;
  return normalizePlaylistSong(payload);
};

/**
 * 2.4 Xóa bài hát khỏi Playlist
 * Endpoint: DELETE /api/user/playlists/{playlistId}/songs/{songId}
 * @param {string} playlistId
 * @param {string} songId
 */
export const removeSongFromPlaylist = async (playlistId, songId) => {
  const response = await api.delete(`/user/playlists/${playlistId}/songs/${songId}`);
  return response.data;
};
