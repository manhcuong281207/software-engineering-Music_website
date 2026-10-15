import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // Đăng nhập: lưu user info + cả 2 token
      login: (user, accessToken, refreshToken) => set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      }),

      // Cập nhật thông tin user sau khi edit profile
      setUser: (user) => set({ user }),

      // Cập nhật cặp token mới sau khi refresh
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      // Đăng xuất: clear tất cả
      logout: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'mc-music-auth', // Key lưu trong localStorage
    }
  )
);
