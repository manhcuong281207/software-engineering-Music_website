import api from '#/lib/axios';

/**
 * Đăng ký tài khoản người dùng mới.
 * @param {{ email: string, password: string, fullName: string }} data
 */
export const register = async (data) => {
  const response = await api.post('/user/auth/register', data);
  return response.data;
};

/**
 * Đăng nhập tài khoản người dùng.
 * @param {{ email: string, password: string }} data
 */
export const login = async (data) => {
  const response = await api.post('/user/auth/login', data);
  return response.data;
};

/**
 * Làm mới cặp Access/Refresh Token.
 * @param {{ refreshToken: string }} data
 */
export const refreshToken = async (data) => {
  const response = await api.post('/user/auth/refresh', data);
  return response.data;
};

/**
 * Đăng xuất — vô hiệu hóa Refresh Token trên server.
 * @param {{ refreshToken: string }} data
 */
export const logout = async (data) => {
  const response = await api.post('/user/auth/logout', data);
  return response.data;
};
