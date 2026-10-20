import { create } from 'zustand';

export const usePlayerStore = create((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  playbackHistory: [], // Lưu trữ stack các bài hát đã phát trong phiên làm việc
  volume: 1, // Âm lượng từ 0 đến 1

  // Set bài hát hiện tại và tự động phát, đồng thời đẩy bài cũ vào playbackHistory
  setCurrentSong: (song) => set((state) => {
    if (!song) return { currentSong: null, isPlaying: false };
    
    const currentId = state.currentSong ? (state.currentSong.id || state.currentSong.songId) : null;
    const newId = song ? (song.id || song.songId) : null;

    let updatedHistory = state.playbackHistory;
    if (state.currentSong && currentId && currentId !== newId) {
      const lastInHistory = updatedHistory[updatedHistory.length - 1];
      const lastId = lastInHistory ? (lastInHistory.id || lastInHistory.songId) : null;
      if (lastId !== currentId) {
        updatedHistory = [...updatedHistory, state.currentSong];
      }
    }

    return {
      currentSong: song,
      isPlaying: true,
      playbackHistory: updatedHistory,
    };
  }),

  // Set bài hát quay lại (không đẩy bài hiện tại vào backward history để tránh loop)
  setPreviousSong: (song) => set({
    currentSong: song,
    isPlaying: true,
  }),

  // Lấy và xóa bài hát gần nhất trong playbackHistory
  popPlaybackHistory: () => {
    const { playbackHistory } = get();
    if (playbackHistory.length === 0) return null;
    const prevSong = playbackHistory[playbackHistory.length - 1];
    set({ playbackHistory: playbackHistory.slice(0, -1) });
    return prevSong;
  },

  // Chuyển đổi trạng thái play/pause
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  // Đặt danh sách phát hiện tại
  setQueue: (queue) => set({ queue }),

  // Điều chỉnh âm lượng
  setVolume: (volume) => set({ volume }),

  // Phát bài tiếp theo trong queue
  playNext: () => set((state) => {
    if (!state.currentSong || state.queue.length === 0) return state;

    const currentId = state.currentSong.id || state.currentSong.songId;
    const currentIndex = state.queue.findIndex(
      (s) => (s.id || s.songId) === currentId
    );

    if (currentIndex !== -1 && currentIndex < state.queue.length - 1) {
      const nextSong = state.queue[currentIndex + 1];
      return {
        currentSong: nextSong,
        isPlaying: true,
        playbackHistory: [...state.playbackHistory, state.currentSong],
      };
    }

    // Nếu đang ở bài cuối, có thể loop hoặc dừng
    return { isPlaying: false };
  }),

  // Phát bài trước đó (trong queue cơ bản)
  playPrevious: () => set((state) => {
    if (!state.currentSong || state.queue.length === 0) return state;

    const currentId = state.currentSong.id || state.currentSong.songId;
    const currentIndex = state.queue.findIndex(
      (s) => (s.id || s.songId) === currentId
    );

    if (currentIndex > 0) {
      return { currentSong: state.queue[currentIndex - 1], isPlaying: true };
    }

    // Nếu đang ở bài đầu tiên, phát lại từ đầu
    return { currentSong: state.queue[0], isPlaying: true };
  }),
}));
