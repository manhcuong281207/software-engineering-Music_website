import api from '#/lib/axios';

/**
 * Chuẩn hóa dữ liệu Playlist từ backend để frontend luôn nhận được format thống nhất.
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
    isPublic: raw.isPublic !== undefined ? Boolean(raw.isPublic) : true,
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
 * Chuẩn hóa dữ liệu Bài hát trong Playlist để tích hợp tốt với PlayerStore và UI.
 */
export const normalizePlaylistSong = (raw) => {
  if (!raw) return null;
  return {
    id: raw.id || raw.songId || String(raw._id || ''),
    songId: raw.songId || raw.id || '',
    playlistSongId: raw.playlistSongId || raw.id || '',
    title: raw.title || raw.songTitle || raw.name || 'Bài hát không tên',
    artist: raw.artist || raw.artistName || raw.ownerName || 'Nhiều nghệ sĩ',
    artistName: raw.artist || raw.artistName || raw.ownerName || 'Nhiều nghệ sĩ',
    albumTitle: raw.albumTitle || raw.albumName || '',
    coverImage: raw.coverImage || raw.coverUrl || '',
    coverUrl: raw.coverImage || raw.coverUrl || '',
    audioUrl: raw.audioUrl || raw.fileUrl || raw.streamUrl || '',
    durationSeconds: typeof raw.durationSeconds === 'number' 
      ? raw.durationSeconds 
      : (typeof raw.durationMs === 'number' ? Math.round(raw.durationMs / 1000) : 0),
    durationMs: typeof raw.durationMs === 'number' 
      ? raw.durationMs 
      : (typeof raw.durationSeconds === 'number' ? raw.durationSeconds * 1000 : 0),
    addedAt: raw.addedAt || raw.createdAt || null,
  };
};

/**
 * 2.2 Lấy danh sách Playlist của người dùng hiện tại
 * Endpoint: GET /api/user/playlists
 */
export const getUserPlaylists = async () => {
  const response = await api.get('/user/playlists');
  const payload = response.data?.data !== undefined ? response.data.data : response.data;
  const list = Array.isArray(payload) 
    ? payload 
    : (Array.isArray(payload?.content) ? payload.content : []);
  return list.map(normalizePlaylist);
};

/**
 * Lấy chi tiết thông tin 1 Playlist
 * Endpoint: GET /api/user/playlists/{playlistId}
 */
export const getPlaylistById = async (playlistId) => {
  const response = await api.get(`/user/playlists/${playlistId}`);
  const payload = response.data?.data !== undefined ? response.data.data : response.data;
  return normalizePlaylist(payload);
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
    isPublic: data.isPublic !== undefined ? data.isPublic : true,
  };
  const response = await api.post('/user/playlists', payload);
  const result = response.data?.data !== undefined ? response.data.data : response.data;
  return normalizePlaylist(result);
};

/**
 * Đổi tên / Chỉnh sửa Playlist
 * Endpoint: PUT /api/user/playlists/{playlistId}
 * @param {string|number} playlistId
 * @param {{ name: string, description?: string, coverImage?: string, isPublic?: boolean }} data
 */
export const updatePlaylist = async (playlistId, data) => {
  const payload = {
    name: data.name?.trim(),
    description: data.description !== undefined ? data.description.trim() : undefined,
    coverImage: data.coverImage,
    isPublic: data.isPublic,
  };
  const response = await api.put(`/user/playlists/${playlistId}`, payload);
  const result = response.data?.data !== undefined ? response.data.data : response.data;
  return normalizePlaylist(result);
};

/**
 * Xóa Playlist
 * Endpoint: DELETE /api/user/playlists/{playlistId}
 * @param {string|number} playlistId
 */
export const deletePlaylist = async (playlistId) => {
  const response = await api.delete(`/user/playlists/${playlistId}`);
  return response.data;
};

/**
 * 2.5 Xem danh sách bài hát trong Playlist
 * Endpoint: GET /api/user/playlists/{playlistId}/songs
 * @param {string|number} playlistId
 */
export const getPlaylistSongs = async (playlistId) => {
  const response = await api.get(`/user/playlists/${playlistId}/songs`);
  const payload = response.data?.data !== undefined ? response.data.data : response.data;
  const list = Array.isArray(payload) 
    ? payload 
    : (Array.isArray(payload?.content) ? payload.content : []);
  return list.map(normalizePlaylistSong);
};

/**
 * 2.3 Thêm bài hát vào Playlist
 * Endpoint: POST /api/user/playlists/{playlistId}/songs
 * @param {string|number} playlistId
 * @param {string|number} songId
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
 * @param {string|number} playlistId
 * @param {string|number} songId
 */
export const removeSongFromPlaylist = async (playlistId, songId) => {
  const response = await api.delete(`/user/playlists/${playlistId}/songs/${songId}`);
  return response.data;
};
