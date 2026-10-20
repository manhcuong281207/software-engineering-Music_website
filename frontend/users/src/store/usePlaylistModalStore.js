import { create } from 'zustand';

export const usePlaylistModalStore = create((set) => ({
  // Modal Tạo Playlist
  isCreateOpen: false,
  openCreate: () => set({ isCreateOpen: true }),
  closeCreate: () => set({ isCreateOpen: false }),

  // Modal Sửa/Đổi tên Playlist
  editingPlaylist: null,
  openEdit: (playlist) => set({ editingPlaylist: playlist }),
  closeEdit: () => set({ editingPlaylist: null }),

  // Modal Xóa Playlist
  deletingPlaylist: null,
  openDelete: (playlist) => set({ deletingPlaylist: playlist }),
  closeDelete: () => set({ deletingPlaylist: null }),

  // Modal Thêm Bài Hát vào Playlist
  targetPlaylistForSong: null,
  openAddSong: (playlist) => set({ targetPlaylistForSong: playlist }),
  closeAddSong: () => set({ targetPlaylistForSong: null }),
}));
