import api from '#/lib/axios';

/**
 * Chuẩn hóa đối tượng lịch sử nghe nhạc từ backend
 */
export const normalizeHistorySong = (raw) => {
  if (!raw) return null;
  return {
    id: raw.songId || raw.id || String(raw._id || ''),
    songId: raw.songId || raw.id || '',
    title: raw.songTitle || raw.title || 'Bài hát không tên',
    artistName: raw.artistName || raw.artist || raw.ownerName || 'Nhiều nghệ sĩ',
    ownerName: raw.artistName || raw.artist || raw.ownerName || 'Nhiều nghệ sĩ',
    coverImage: raw.coverImage || raw.coverUrl || '',
    coverUrl: raw.coverImage || raw.coverUrl || '',
    playedAt: raw.playedAt || null,
    durationListened: raw.durationListened || 0,
  };
};

/**
 * 3.10 Ghi nhận lịch sử nghe nhạc
 * Endpoint: POST /api/user/history
 * @param {{ songId: string, durationListened: number }} payload
 */
export const addPlayHistory = async ({ songId, durationListened }) => {
  const response = await api.post('/user/history', {
    songId,
    durationListened,
  });
  return response.data;
};

/**
 * 3.11 Lấy lịch sử nghe nhạc của người dùng hiện tại
 * Endpoint: GET /api/user/history
 * @param {{ page?: number, size?: number }} params
 */
export const getUserPlayHistory = async (params = { page: 0, size: 50 }) => {
  const response = await api.get('/user/history', { params });
  const rawData = response.data?.data;
  return {
    content: (rawData?.content || []).map(normalizeHistorySong),
    totalElements: rawData?.totalElements || 0,
    totalPages: rawData?.totalPages || 0,
  };
};
