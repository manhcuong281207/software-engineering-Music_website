import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  Play,
  Pause,
  Shuffle,
  Music2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getFavoriteSongs } from '../api/users/favorite';
import { getSongById } from '../api/catalog/public';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { Button } from '../components/ui/Button';
import { SongRow } from '../components/ui/SongRow';
import { SkeletonRow } from '../components/ui/Skeleton';
import { toast } from 'sonner';

export const LikedSongsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { currentSong, isPlaying, setIsPlaying, setCurrentSong, setQueue } =
    usePlayerStore();

  // Lấy danh sách bài hát yêu thích
  const {
    data: favoritesData,
    isLoading,
  } = useQuery({
    queryKey: ['userFavorites'],
    queryFn: () => getFavoriteSongs({ page: 0, size: 100 }),
    enabled: isAuthenticated,
  });

  const songs = favoritesData?.content || [];

  // Kiểm tra xem bài hát hiện tại có đang nằm trong danh sách Liked Songs và đang phát hay không
  const isLikedPlaying = useMemo(() => {
    if (!isPlaying || !currentSong) return false;
    const currentId = String(currentSong.id || currentSong.songId);
    return songs.some((s) => String(s.id || s.songId) === currentId);
  }, [isPlaying, currentSong, songs]);

  /**
   * Phát một bài hát: Nếu bài hát chưa có audioUrl (do dữ liệu phi chuẩn hóa),
   * gọi API Catalog để lấy đầy đủ chi tiết trước khi phát.
   */
  const handlePlaySong = async (song, playlistQueue = songs) => {
    try {
      const songId = song.id || song.songId;
      let fullSong = song;

      if (!fullSong.audioUrl) {
        const detailRes = await getSongById(songId);
        if (detailRes?.data) {
          fullSong = {
            ...song,
            ...detailRes.data,
            id: detailRes.data.id || songId,
            songId: detailRes.data.id || songId,
          };
        }
      }

      if (!fullSong.audioUrl) {
        toast.error('Không tìm thấy nguồn âm thanh cho bài hát này.');
        return;
      }

      setQueue(playlistQueue);
      setCurrentSong(fullSong);
      setIsPlaying(true);
    } catch (err) {
      console.error('Lỗi khi phát bài hát:', err);
      toast.error('Không thể tải bài hát để phát.');
    }
  };

  /**
   * Bấm nút Play All: Phát bài đầu tiên trong danh sách yêu thích
   */
  const handlePlayAll = () => {
    if (songs.length === 0) return;
    if (isLikedPlaying) {
      setIsPlaying(false);
      return;
    }
    handlePlaySong(songs[0], songs);
  };

  /**
   * Trộn bài ngẫu nhiên
   */
  const handleShufflePlay = () => {
    if (songs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * songs.length);
    handlePlaySong(songs[randomIndex], songs);
  };

  /**
   * Format ngày thêm (ISO -> DD/MM/YYYY)
   */
  const formatAddedDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7a1829] to-[#fa2d48] flex items-center justify-center shadow-xl shadow-[#fa2d48]/20 text-white">
          <Heart size={40} className="fill-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Bài hát đã thích</h2>
        <p className="text-sm text-spotify-sub max-w-sm">
          Đăng nhập để xem và quản lý toàn bộ những bài hát bạn đã thả tim.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/login')}>
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full -mx-6 -mt-20">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="relative flex flex-col sm:flex-row items-end gap-6 px-8 pt-28 pb-8 bg-gradient-to-b from-[#501537] via-[#210a18] to-spotify-base">
        {/* Cover Khối Trái Tim Lớn */}
        <div className="flex-shrink-0 w-44 h-44 sm:w-52 sm:h-52 rounded-xl bg-gradient-to-br from-[#7a1829] via-[#fa2d48] to-[#991b1b] flex items-center justify-center shadow-[0_16px_36px_rgba(250,45,72,0.35)] self-center sm:self-end group relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Heart
            size={76}
            className="text-white fill-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Thông tin Playlist */}
        <div className="flex flex-col gap-2 pb-1">
          <span className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#fa2d48]" />
            Danh sách phát
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
            Bài hát đã thích
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap text-sm">
            <span className="font-bold text-white">
              {user?.fullName || 'Người nghe nhạc'}
            </span>
            <span className="text-spotify-sub">•</span>
            <span className="text-spotify-sub">
              {songs.length} bài hát
            </span>
          </div>
        </div>
      </div>

      {/* ── ACTION BAR ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-8 py-5 bg-gradient-to-b from-[#210a18]/60 to-transparent">
        {/* Nút Play chính */}
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className="w-14 h-14 rounded-full bg-spotify-primary hover:bg-spotify-primary-hover flex items-center justify-center shadow-[0_8px_20px_rgba(250,45,72,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          title={isLikedPlaying ? 'Tạm dừng' : 'Phát tất cả'}
        >
          {isLikedPlaying ? (
            <Pause size={24} fill="white" className="text-white" />
          ) : (
            <Play size={24} fill="white" className="text-white ml-1" />
          )}
        </button>

        {/* Nút Trộn bài */}
        <Button
          variant="ghost"
          size="md"
          iconOnly
          tooltip="Trộn bài ngẫu nhiên"
          tooltipPosition="top"
          disabled={songs.length === 0}
          onClick={handleShufflePlay}
        >
          <Shuffle size={22} />
        </Button>
      </div>

      {/* ── DANH SÁCH BÀI HÁT ─────────────────────────────────────────────────── */}
      <div className="px-8 pb-14">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center border border-dashed border-white/10 rounded-2xl p-8 bg-white/[0.02]">
            <div className="p-4 rounded-full bg-white/5 text-spotify-sub">
              <Music2 size={40} />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white">
                Chưa có bài hát nào trong mục Yêu thích
              </h3>
              <p className="text-sm text-spotify-sub mt-1">
                Hãy nhấn vào biểu tượng trái tim ở bất kỳ bài hát nào để lưu lại và nghe lại tại đây.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/')}
              className="mt-2"
            >
              Khám phá bài hát mới
            </Button>
          </div>
        ) : (
          <div>
            {/* Header bảng bài hát */}
            <div className="flex items-center gap-4 px-4 py-2 mb-2 border-b border-spotify-hover text-xs font-semibold text-spotify-sub uppercase tracking-wider">
              <div className="w-6 text-right">#</div>
              <div className="flex-1">Tiêu đề</div>
              <div className="hidden md:flex items-center gap-1.5 min-w-[120px]">
                <Calendar size={13} />
                <span>Ngày thêm</span>
              </div>
              <div className="w-10" />
              <div className="flex items-center gap-1 w-12 justify-end">
                <Clock size={14} />
              </div>
            </div>

            {/* Danh sách bài hát */}
            <div className="flex flex-col gap-1">
              {songs.map((song, index) => {
                const songId = song.id || song.songId;
                const isThisPlaying =
                  isPlaying &&
                  currentSong &&
                  String(currentSong.id || currentSong.songId) === String(songId);

                return (
                  <SongRow
                    key={songId || index}
                    index={index + 1}
                    song={song}
                    isPlaying={isThisPlaying}
                    onPlayClick={() => handlePlaySong(song, songs)}
                    extraAction={
                      <span>{formatAddedDate(song.createdAt)}</span>
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
