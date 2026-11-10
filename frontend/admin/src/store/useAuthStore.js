import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '../lib/queryClient';

export const ALLOWED_ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'];

/**
 * Tiện ích giải mã phần Payload của JWT mà không cần thư viện ngoài
 */
export const decodeJwtPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('Không thể giải mã JWT token:', e);
    return null;
  }
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      admin: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      /**
       * Đăng nhập Quản trị viên:
       * Nhận authResponse từ backend hoặc các tham số rời
       */
      login: (adminOrData, accessToken, refreshToken) => {
        try {
          queryClient.clear(); // Xóa cache truy vấn của phiên trước
        } catch (e) {
          console.error('Lỗi khi xóa queryClient cache:', e);
        }

        let at = accessToken;
        let rt = refreshToken || null;
        let adminObj = null;

        if (typeof adminOrData === 'object' && adminOrData !== null && 'accessToken' in adminOrData) {
          const { accessToken: token, refreshToken: rToken, admin: a, ...rest } = adminOrData;
          at = token;
          rt = rToken || null;

          const decoded = decodeJwtPayload(at);
          const detectedRole = rest.role || a?.role || decoded?.role || 'SUPER_ADMIN';

          // Kiểm tra quyền hạn Admin ngay khi đăng nhập
          if (decoded?.role && !ALLOWED_ADMIN_ROLES.includes(decoded.role)) {
            throw new Error('Tài khoản của bạn không có quyền truy cập khu vực Quản trị.');
          }

          adminObj = a || {
            id: rest.adminId || rest.id || decoded?.sub,
            adminId: rest.adminId || rest.id || decoded?.sub,
            email: rest.email,
            fullName: rest.fullName,
            role: detectedRole,
          };
        } else {
          const decoded = decodeJwtPayload(at);
          const detectedRole = adminOrData?.role || decoded?.role || 'SUPER_ADMIN';

          if (decoded?.role && !ALLOWED_ADMIN_ROLES.includes(decoded.role)) {
            throw new Error('Tài khoản của bạn không có quyền truy cập khu vực Quản trị.');
          }

          adminObj = typeof adminOrData === 'object' && adminOrData !== null
            ? { ...adminOrData, role: detectedRole }
            : adminOrData;
        }

        set({
          admin: adminObj,
          accessToken: at,
          refreshToken: rt,
          isAuthenticated: true,
        });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mc-admin-login'));
        }
      },

      /**
       * Cập nhật Access Token và Refresh Token sau khi Refresh Token thành công
       */
      setTokens: (newAccessToken, newRefreshToken) =>
        set((state) => ({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || state.refreshToken,
          isAuthenticated: !!newAccessToken,
        })),

      /**
       * Cập nhật thông tin admin
       */
      setAdmin: (admin) =>
        set((state) => ({
          admin: typeof admin === 'function' ? admin(state.admin) : { ...state.admin, ...admin },
        })),

      /**
       * Kiểm tra vai trò của Admin hiện tại
       */
      hasRole: (role) => {
        return get().admin?.role === role;
      },

      /**
       * Kiểm tra xem Admin có quyền quản trị hợp lệ hay không
       */
      hasValidAdminRole: () => {
        const role = get().admin?.role;
        return ALLOWED_ADMIN_ROLES.includes(role);
      },

      /**
       * Kiểm tra xem Access Token đã hết hạn chưa (dựa theo exp claim trong JWT)
       */
      isTokenExpired: () => {
        const token = get().accessToken;
        if (!token) return true;
        const decoded = decodeJwtPayload(token);
        if (!decoded?.exp) return false;
        // Hết hạn nếu thời gian hiện tại vượt mốc exp trừ 10s đệm
        return Date.now() / 1000 >= decoded.exp - 10;
      },

      /**
       * Đăng xuất Quản trị viên
       */
      logout: () => {
        try {
          queryClient.clear();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('mc-admin-logout'));
          }
        } catch (e) {
          console.error('Lỗi khi đăng xuất:', e);
        }

        set({
          admin: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'mc-admin-auth', // Tách biệt key lưu localStorage cho domain Admin
    }
  )
);
