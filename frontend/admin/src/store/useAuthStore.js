import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '../lib/queryClient';

export const useAuthStore = create(
  persist(
    (set) => ({
      admin: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      /**
       * Đăng nhập Quản trị viên:
       * Hỗ trợ truyền authResponse hoặc các tham số rời:
       * login({ adminId, email, fullName, role, accessToken, refreshToken })
       */
      login: (adminOrData, accessToken, refreshToken) => {
        try {
          queryClient.clear(); // Xóa sạch cache truy vấn của phiên trước
        } catch (e) {
          console.error("Lỗi khi xóa queryClient cache:", e);
        }

        if (typeof adminOrData === 'object' && adminOrData !== null && 'accessToken' in adminOrData) {
          const { accessToken: at, refreshToken: rt, admin: a, ...rest } = adminOrData;
          const adminObj = a || {
            id: rest.adminId || rest.id,
            adminId: rest.adminId || rest.id,
            email: rest.email,
            fullName: rest.fullName,
            role: rest.role || 'SUPER_ADMIN',
          };

          set({
            admin: adminObj,
            accessToken: at,
            refreshToken: rt || null,
            isAuthenticated: true,
          });
        } else {
          set({
            admin: adminOrData,
            accessToken: accessToken,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
          });
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mc-admin-login'));
        }
      },

      /**
       * Cập nhật Access Token và Refresh Token sau khi Refresh Token thành công
       */
      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
          isAuthenticated: !!accessToken,
        })),

      /**
       * Cập nhật thông tin admin
       */
      setAdmin: (admin) =>
        set((state) => ({
          admin: typeof admin === 'function' ? admin(state.admin) : { ...state.admin, ...admin },
        })),

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
          console.error("Lỗi khi đăng xuất:", e);
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

