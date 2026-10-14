const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Service xử lý các API xác thực người dùng (Users Service)
 * Sử dụng native Fetch API, không phụ thuộc thư viện bên ngoài.
 */
export const authService = {
  /**
   * Đăng nhập người dùng
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} ApiResponse chứa data: { userId, email, fullName, accessToken, refreshToken }
   */
  async login({ email, password }) {
    const response = await fetch(`${BASE_URL}/api/user/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Đăng nhập thất bại.');
      error.status = response.status;
      error.response = { data, status: response.status };
      throw error;
    }

    return data;
  },

  /**
   * Đăng ký tài khoản người dùng mới
   * @param {Object} userData - { email, password, fullName }
   * @returns {Promise<Object>} ApiResponse chứa data: { userId, email, fullName, accessToken, refreshToken }
   */
  async register({ email, password, fullName }) {
    const response = await fetch(`${BASE_URL}/api/user/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Đăng ký thất bại.');
      error.status = response.status;
      error.response = { data, status: response.status };
      throw error;
    }

    return data;
  },

  /**
   * Làm mới Access Token bằng Refresh Token
   * @param {string} refreshToken
   * @returns {Promise<Object>} ApiResponse chứa data: { accessToken, refreshToken }
   */
  async refreshToken(refreshToken) {
    const response = await fetch(`${BASE_URL}/api/user/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Làm mới token thất bại.');
      error.status = response.status;
      error.response = { data, status: response.status };
      throw error;
    }

    return data;
  },

  /**
   * Đăng xuất người dùng (hủy Refresh Token trên server)
   * @param {string} refreshToken
   * @returns {Promise<Object>} ApiResponse
   */
  async logout(refreshToken) {
    const response = await fetch(`${BASE_URL}/api/user/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Đăng xuất thất bại.');
      error.status = response.status;
      error.response = { data, status: response.status };
      throw error;
    }

    return data;
  },
};

export default authService;
