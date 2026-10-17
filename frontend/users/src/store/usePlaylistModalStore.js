import { create } from 'zustand';

export const usePlaylistModalStore = create((set) => ({
  // Create Modal
  isCreateOpen: false,
  openCreate: () => set({ isCreateOpen: true }),
  closeCreate: () => set({ isCreateOpen: false }),

  // Edit/Rename Modal
  editingPlaylist: null,
  openEdit: (playlist) => set({ editingPlaylist: playlist }),
  closeEdit: () => set({ editingPlaylist: null }),

  // Delete Modal
  deletingPlaylist: null,
  openDelete: (playlist) => set({ deletingPlaylist: playlist }),
  closeDelete: () => set({ deletingPlaylist: null }),

  // Add Song Modal
  targetPlaylistForSong: null,
  openAddSong: (playlist) => set({ targetPlaylistForSong: playlist }),
  closeAddSong: () => set({ targetPlaylistForSong: null }),
}));
