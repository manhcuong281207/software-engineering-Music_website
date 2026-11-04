import api from "#/lib/axios";

/**
 * Lấy thông tin cá nhân của Nghệ sĩ đang đăng nhập
 * Endpoint: GET /api/artist/me
 * @returns {Promise<Object>} ApiResponse<ArtistProfileResponse>
 */
export const getArtistProfileApi = async () => {
  const response = await api.get("/artist/me");
  return response.data;
};

/**
 * Cập nhật thông tin cá nhân của Nghệ sĩ (stageName, biography, avatarFile, coverFile)
 * Endpoint: PUT /api/artist/me
 * @param {FormData} formData
 * @returns {Promise<Object>} ApiResponse<ArtistProfileResponse>
 */
export const updateArtistProfileApi = async (formData) => {
  const response = await api.put("/artist/me", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Lấy số liệu thống kê tổng quan (Dashboard) của Nghệ sĩ đang đăng nhập
 * Endpoint: GET /api/artist/dashboard
 * @returns {Promise<Object>} ApiResponse<ArtistDashboardResponse> (totalFollowers, totalSongs, totalPlays, totalLikes)
 */
export const getArtistDashboardApi = async () => {
  const response = await api.get("/artist/dashboard");
  return response.data;
};

