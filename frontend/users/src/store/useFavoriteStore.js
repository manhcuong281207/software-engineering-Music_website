import { create } from 'zustand';
import { toast } from 'sonner';
import {
  getFavoriteSongs,
  addFavoriteSong,
  removeFavoriteSong,
  getFavoriteAlbums,
  addFavoriteAlbum,
  removeFavoriteAlbum,
} from '../api/users/favorite';
import {
  getFollowedArtists,
  followArtist,
  unfollowArtist,
} from '../api/users/follow';
import { useAuthStore } from './useAuthStore';
import { showLoginToast } from '../utils/toastUtils';

export const useFavoriteStore = create((set, get) => ({
  likedSongIds: [],
  likedAlbumIds: [],
  followedArtistIds: [],
  likedSongCount: 0,
  isInitialized: false,
  isLoading: false,

  /**
   * Khởi tạo tải toàn bộ IDs đã like/follow khi người dùng đã đăng nhập
   */
  initFavorites: async (force = false) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      set({
        likedSongIds: [],
        likedAlbumIds: [],
        followedArtistIds: [],
        likedSongCount: 0,
        isInitialized: false,
      });
      return;
    }

    if (get().isInitialized && !force) return;

    set({ isLoading: true });
    try {
      const [songsRes, albumsRes, artistsRes] = await Promise.allSettled([
        getFavoriteSongs({ page: 0, size: 100 }),
        getFavoriteAlbums({ page: 0, size: 100 }),
        getFollowedArtists({ page: 0, size: 100 }),
      ]);

      const songIds =
        songsRes.status === 'fulfilled'
          ? (songsRes.value.content || []).map((s) => String(s.id || s.songId))
          : [];
      const albumIds =
        albumsRes.status === 'fulfilled'
          ? (albumsRes.value.content || []).map((a) => String(a.id || a.albumId))
          : [];
      const artistIds =
        artistsRes.status === 'fulfilled'
          ? (artistsRes.value.content || []).map((ar) => String(ar.id || ar.artistId))
          : [];
      const totalSongs =
        songsRes.status === 'fulfilled'
          ? songsRes.value.totalElements ?? songIds.length
          : songIds.length;

      set({
        likedSongIds: songIds,
        likedAlbumIds: albumIds,
        followedArtistIds: artistIds,
        likedSongCount: totalSongs,
        isInitialized: true,
        isLoading: false,
      });
    } catch (err) {
      console.error('Lỗi khởi tạo Favorites:', err);
      set({ isLoading: false });
    }
  },

  /**
   * Kiểm tra bài hát có được like hay chưa
   */
  isSongLiked: (songId) => {
    if (!songId) return false;
    return get().likedSongIds.includes(String(songId));
  },

  /**
   * Kiểm tra album có được like hay chưa
   */
  isAlbumLiked: (albumId) => {
    if (!albumId) return false;
    return get().likedAlbumIds.includes(String(albumId));
  },

  /**
   * Kiểm tra nghệ sĩ có được follow hay chưa
   */
  isArtistFollowed: (artistId) => {
    if (!artistId) return false;
    return get().followedArtistIds.includes(String(artistId));
  },

  /**
   * Toggle yêu thích Bài hát (Optimistic update)
   */
  toggleLikeSong: async (song, options = {}) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      showLoginToast('lưu bài hát vào danh sách yêu thích', options.onLogin);
      return false;
    }

    const songId = String(song?.id || song?.songId || '');
    if (!songId) return false;

    const currentlyLiked = get().likedSongIds.includes(songId);
    const previousIds = [...get().likedSongIds];
    const previousCount = get().likedSongCount;

    // 1. Optimistic Update
    if (currentlyLiked) {
      set({
        likedSongIds: previousIds.filter((id) => id !== songId),
        likedSongCount: Math.max(0, previousCount - 1),
      });
      toast.success('Đã xóa khỏi Bài hát đã thích');
    } else {
      set({
        likedSongIds: [...previousIds, songId],
        likedSongCount: previousCount + 1,
      });
      toast.success('Đã thêm vào Bài hát đã thích');
    }

    // 2. Gọi API ngầm
    try {
      if (currentlyLiked) {
        await removeFavoriteSong(songId);
      } else {
        await addFavoriteSong(songId);
      }

      if (options.queryClient) {
        options.queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
      }

      return !currentlyLiked;
    } catch (err) {
      // 3. Rollback nếu lỗi
      console.error('Lỗi toggleLikeSong:', err);
      set({
        likedSongIds: previousIds,
        likedSongCount: previousCount,
      });
      toast.error('Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.');
      return currentlyLiked;
    }
  },

  /**
   * Toggle yêu thích Album (Optimistic update)
   */
  toggleLikeAlbum: async (album, options = {}) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      showLoginToast('thêm album vào danh sách yêu thích', options.onLogin);
      return false;
    }

    const albumId = String(album?.id || album?.albumId || '');
    if (!albumId) return false;

    const currentlyLiked = get().likedAlbumIds.includes(albumId);
    const previousIds = [...get().likedAlbumIds];

    // 1. Optimistic Update
    if (currentlyLiked) {
      set({
        likedAlbumIds: previousIds.filter((id) => id !== albumId),
      });
      toast.success('Đã xóa album khỏi danh sách yêu thích');
    } else {
      set({
        likedAlbumIds: [...previousIds, albumId],
      });
      toast.success('Đã thêm album vào danh sách yêu thích');
    }

    // 2. Gọi API ngầm
    try {
      if (currentlyLiked) {
        await removeFavoriteAlbum(albumId);
      } else {
        await addFavoriteAlbum(albumId);
      }

      if (options.queryClient) {
        options.queryClient.invalidateQueries({ queryKey: ['userFavoriteAlbums'] });
      }

      return !currentlyLiked;
    } catch (err) {
      // 3. Rollback nếu lỗi
      console.error('Lỗi toggleLikeAlbum:', err);
      set({ likedAlbumIds: previousIds });
      toast.error('Không thể cập nhật album yêu thích. Vui lòng thử lại.');
      return currentlyLiked;
    }
  },

  /**
   * Toggle theo dõi Nghệ sĩ (Optimistic update)
   */
  toggleFollowArtist: async (artist, options = {}) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      showLoginToast('theo dõi nghệ sĩ', options.onLogin);
      return false;
    }

    const artistId = String(artist?.id || artist?.artistId || '');
    if (!artistId) return false;

    const currentlyFollowed = get().followedArtistIds.includes(artistId);
    const previousIds = [...get().followedArtistIds];

    // 1. Optimistic Update
    if (currentlyFollowed) {
      set({
        followedArtistIds: previousIds.filter((id) => id !== artistId),
      });
      toast.success(`Đã hủy theo dõi ${artist?.stageName || artist?.artistName || 'nghệ sĩ'}`);
    } else {
      set({
        followedArtistIds: [...previousIds, artistId],
      });
      toast.success(`Đã theo dõi ${artist?.stageName || artist?.artistName || 'nghệ sĩ'}`);
    }

    // 2. Gọi API ngầm
    try {
      if (currentlyFollowed) {
        await unfollowArtist(artistId);
      } else {
        await followArtist(artistId);
      }

      if (options.queryClient) {
        options.queryClient.invalidateQueries({ queryKey: ['userFollowedArtists'] });
      }

      return !currentlyFollowed;
    } catch (err) {
      // 3. Rollback nếu lỗi
      console.error('Lỗi toggleFollowArtist:', err);
      set({ followedArtistIds: previousIds });
      toast.error('Không thể cập nhật trạng thái theo dõi. Vui lòng thử lại.');
      return currentlyFollowed;
    }
  },

  /**
   * Đặt lại trạng thái (khi đăng xuất)
   */
  resetFavorites: () => {
    set({
      likedSongIds: [],
      likedAlbumIds: [],
      followedArtistIds: [],
      likedSongCount: 0,
      isInitialized: false,
      isLoading: false,
    });
  },
}));

// Tự động lắng nghe thay đổi authentication để khởi tạo hoặc xóa sạch state
if (typeof window !== 'undefined') {
  useAuthStore.subscribe((state, prevState) => {
    if (prevState?.isAuthenticated && !state.isAuthenticated) {
      useFavoriteStore.getState().resetFavorites();
    } else if (!prevState?.isAuthenticated && state.isAuthenticated) {
      useFavoriteStore.getState().initFavorites(true);
    }
  });
}

