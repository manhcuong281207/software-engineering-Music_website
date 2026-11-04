import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentUserApi, logoutApi } from '../api/auth/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * Đăng nhập / Lưu token sau khi xác thực thành công.
       * Hỗ trợ 2 kiểu tham số:
       * 1. login(authResponseData) -> { userId, email, fullName, accessToken, refreshToken, avatarUrl? }
       * 2. login(userObj, accessToken, refreshToken)
       */
      login: (userOrData, accessToken, refreshToken) => {
        if (typeof userOrData === 'object' && userOrData !== null && 'accessToken' in userOrData) {
          const { accessToken: at, refreshToken: rt, user: u, ...rest } = userOrData;
          const userObj = u || {
            id: rest.userId || rest.id,
            userId: rest.userId || rest.id,
            email: rest.email,
            fullName: rest.fullName,
            avatarUrl: rest.avatarUrl || null,
            role: rest.role || 'USER',
          };

          set({
            user: userObj,
            accessToken: at,
            refreshToken: rt || null,
            isAuthenticated: !!at,
          });
        } else {
          set({
            user: userOrData,
            accessToken: accessToken,
            refreshToken: refreshToken || null,
            isAuthenticated: !!accessToken,
          });
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mc-music-login'));
        }
      },

      /**
       * Cập nhật access token và refresh token (sau khi refresh token thành công)
       */
      setTokens: (accessToken, refreshToken) => set((state) => ({
        accessToken,
        refreshToken: refreshToken || state.refreshToken,
        isAuthenticated: !!accessToken,
      })),

      /**
       * Cập nhật thông tin user (ví dụ sau khi fetch /api/user/me hoặc đổi avatar/tên)
       */
      setUser: (user) => set((state) => ({
        user: typeof user === 'function' ? user(state.user) : { ...state.user, ...user },
      })),

      /**
       * Đồng bộ lại thông tin profile mới nhất từ backend
       */
      fetchProfile: async () => {
        const { accessToken } = get();
        if (!accessToken) return null;

        try {
          set({ isLoading: true });
          const res = await getCurrentUserApi();
          if (res?.data) {
            set((state) => ({
              user: { ...state.user, ...res.data },
            }));
            return res.data;
          }
        } catch (err) {
          console.warn('Không thể đồng bộ profile:', err?.message);
        } finally {
          set({ isLoading: false });
        }
        return null;
      },

      /**
       * Đăng xuất cục bộ: xóa toàn bộ dữ liệu xác thực và trạng thái phát nhạc
       */
      logout: () => {
        try {
          localStorage.removeItem('mc-music-player');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('mc-music-logout'));
          }
        } catch (e) {
          console.error('Lỗi khi dọn dẹp storage lúc logout:', e);
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      /**
       * Đăng xuất toàn diện (gọi backend để hủy refresh token trước khi xóa state)
       */
      performLogout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await logoutApi(refreshToken);
          }
        } catch (err) {
          console.warn('Lỗi khi thu hồi refresh token từ backend:', err);
        } finally {
          get().logout();
        }
      },
    }),
    {
      name: 'mc-music-auth', // Key lưu trong localStorage
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
