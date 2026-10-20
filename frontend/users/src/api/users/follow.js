import api from '#/lib/axios';

/**
 * Chuẩn hóa đối tượng nghệ sĩ đang theo dõi từ backend
 */
export const normalizeFollowedArtist = (raw) => {
  if (!raw) return null;
  return {
    id: raw.artistId || raw.id || String(raw._id || ''),
    artistId: raw.artistId || raw.id || '',
    stageName: raw.artistName || raw.stageName || raw.name || 'Nghệ sĩ',
    artistName: raw.artistName || raw.stageName || raw.name || 'Nghệ sĩ',
    avatarUrl: raw.avatar || raw.avatarUrl || '',
    avatar: raw.avatar || raw.avatarUrl || '',
  };
};

/**
 * 3.7 Theo dõi nghệ sĩ
 * Endpoint: POST /api/user/follows/artists/{artistId}
 */
export const followArtist = async (artistId) => {
  const response = await api.post(`/user/follows/artists/${artistId}`);
  return response.data;
};

/**
 * 3.8 Hủy theo dõi nghệ sĩ
 * Endpoint: DELETE /api/user/follows/artists/{artistId}
 */
export const unfollowArtist = async (artistId) => {
  const response = await api.delete(`/user/follows/artists/${artistId}`);
  return response.data;
};

/**
 * 3.9 Lấy danh sách nghệ sĩ đang theo dõi của người dùng hiện tại
 * Endpoint: GET /api/user/follows/artists
 * @param {{ page?: number, size?: number }} params
 */
export const getFollowedArtists = async (params = { page: 0, size: 50 }) => {
  const response = await api.get('/user/follows/artists', { params });
  const payload = response.data?.data !== undefined ? response.data.data : response.data;
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.content)
    ? payload.content
    : [];
  return {
    content: list.map(normalizeFollowedArtist),
    totalElements: payload?.totalElements ?? list.length,
    totalPages: payload?.totalPages ?? 1,
    page: payload?.number ?? params.page ?? 0,
    size: payload?.size ?? params.size ?? 50,
  };
};
