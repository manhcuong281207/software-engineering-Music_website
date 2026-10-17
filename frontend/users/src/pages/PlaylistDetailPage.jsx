import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  Pause,
  Shuffle,
  Clock,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Music,
  Search,
  Check,
  Loader2,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { CoverImage } from '../components/ui/CoverImage';
import { SkeletonRow } from '../components/ui/Skeleton';
import {
  getPlaylistById,
  getPlaylistSongs,
  removeSongFromPlaylist,
  addSongToPlaylist,
} from '../api/users/playlist';
import { getPublicSongs } from '../api/catalog/public';
import { usePlayerStore } from '../store/usePlayerStore';
import { usePlaylistModalStore } from '../store/usePlaylistModalStore';
import { useAuthStore } from '../store/useAuthStore';

export const PlaylistDetailPage = () => {
  const { id: playlistId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { currentSong, isPlaying, setIsPlaying, setCurrentSong, setQueue } = usePlayerStore();
  const { openEdit, openDelete, openAddSong } = usePlaylistModalStore();

  // Inline song search state
  const [inlineSearch, setInlineSearch] = useState('');
  const [debouncedInlineSearch, setDebouncedInlineSearch] = useState('');
  const [addingSongId, setAddingSongId] = useState(null);
  const [removingSongId, setRemovingSongId] = useState(null);

  // Debounce inline search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInlineSearch(inlineSearch.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [inlineSearch]);

  // 1. Fetch Playlist metadata
  const {
    data: playlist,
    isLoading: isPlaylistLoading,
    isError: isPlaylistError,
    error: playlistError,
    refetch: refetchPlaylist,
  } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: () => getPlaylistById(playlistId),
    enabled: !!playlistId && isAuthenticated,
  });

  // 2. Fetch Playlist Songs
  const {
    data: songs = [],
    isLoading: isSongsLoading,
    isError: isSongsError,
    error: songsError,
    refetch: refetchSongs,
  } = useQuery({
    queryKey: ['playlistSongs', playlistId],
    queryFn: () => getPlaylistSongs(playlistId),
    enabled: !!playlistId && isAuthenticated,
  });

  // 3. Inline Catalog search for quick adding
  const { data: searchResults, isLoading: isSearchingCatalog } = useQuery({
    queryKey: ['inlineCatalogSearch', debouncedInlineSearch],
    queryFn: () => getPublicSongs({ keyword: debouncedInlineSearch || undefined, size: 10 }),
    enabled: debouncedInlineSearch.length > 0,
  });

  const catalogSongs = useMemo(() => {
    const raw = searchResults?.data?.content || searchResults?.data || searchResults || [];
    return Array.isArray(raw) ? raw : [];
  }, [searchResults]);

  const existingSongIds = useMemo(() => {
    return new Set(songs.map((s) => String(s.songId || s.id)));
  }, [songs]);

  // Mutations
  const removeMutation = useMutation({
    mutationFn: (songId) => removeSongFromPlaylist(playlistId, songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlistSongs', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      toast.success('Đã xóa bài hát khỏi playlist!');
      setRemovingSongId(null);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa bài hát.';
      toast.error(msg);
      setRemovingSongId(null);
    },
  });

  const addMutation = useMutation({
    mutationFn: (songId) => addSongToPlaylist(playlistId, songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlistSongs', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      toast.success('Đã thêm bài hát vào playlist!');
      setAddingSongId(null);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể thêm bài hát.';
      toast.error(msg);
      setAddingSongId(null);
    },
  });

  const handleRemoveSong = (e, song) => {
    e.stopPropagation();
    const songId = song.songId || song.id;
    setRemovingSongId(songId);
    removeMutation.mutate(songId);
  };

  const handleAddSong = (song) => {
    const songId = song.id || song.songId;
    setAddingSongId(songId);
    addMutation.mutate(songId);
  };

  // ── Tính tổng thời lượng playlist ──────────────────────────────────────────
  const totalDuration = useMemo(() => {
    const totalMs = songs.reduce((acc, s) => {
      const ms = s.durationMs ?? (s.durationSeconds ? s.durationSeconds * 1000 : 0);
      return acc + ms;
    }, 0);
    const totalSec = Math.floor(totalMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h} giờ ${m} phút`;
    if (m > 0) return `${m} phút ${s} giây`;
    return `${s} giây`;
  }, [songs]);

  const formatDuration = (msOrSec) => {
    if (!msOrSec) return '--:--';
    const totalSec = msOrSec > 1000 ? Math.floor(msOrSec / 1000) : msOrSec;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isPlaylistPlaying =
    isPlaying && currentSong && songs.some((s) => s.id === currentSong.id || s.songId === currentSong.id);

  const handlePlayPlaylist = () => {
    if (songs.length === 0) return;
    if (isPlaylistPlaying) {
      setIsPlaying(false);
      return;
    }
    setQueue(songs);
    setCurrentSong(songs[0]);
    setIsPlaying(true);
  };

  const handleShufflePlay = () => {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setCurrentSong(shuffled[0]);
    setIsPlaying(true);
  };

  const handlePlaySong = (song) => {
    setQueue(songs);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-xl font-bold text-white mb-2">Vui lòng đăng nhập</h2>
        <p className="text-spotify-sub text-sm mb-4">
          Bạn cần đăng nhập để xem chi tiết danh sách phát cá nhân.
        </p>
        <Button variant="white" size="md" onClick={() => navigate('/login')}>
          Đăng nhập
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full pb-16">
      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div className="relative flex flex-col sm:flex-row items-end gap-6 px-6 pt-12 pb-8 bg-gradient-to-b from-[#3a131a] via-[#1a1215] to-spotify-base -mx-6 -mt-20 mb-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/library')}
          className="absolute top-6 left-6 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
          aria-label="Quay lại Thư viện"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Playlist Cover */}
        <div className="flex-shrink-0 w-44 h-44 sm:w-52 sm:h-52 rounded-xl shadow-2xl overflow-hidden self-center sm:self-end bg-gradient-to-br from-[#2a1015] via-[#1a1216] to-[#121212] flex items-center justify-center border border-white/10 group relative">
          {playlist?.coverImage ? (
            <CoverImage
              src={playlist.coverImage}
              alt={playlist.name || 'Playlist'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-spotify-primary">
              <Music size={56} strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Playlist Info */}
        <div className="flex flex-col gap-2 flex-1 min-w-0 self-center sm:self-end text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
            <span>DANH SÁCH PHÁT</span>
            <span>•</span>
            <span className="text-spotify-primary">
              {playlist?.isPublic ? 'Công khai' : 'Riêng tư'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight break-words">
            {playlist?.name || (isPlaylistLoading ? 'Đang tải...' : 'Danh sách phát')}
          </h1>

          {playlist?.description && (
            <p className="text-sm text-spotify-sub line-clamp-2 max-w-xl">
              {playlist.description}
            </p>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-white/90 font-medium mt-1">
            <span className="font-bold text-white">{playlist?.ownerName || 'Bạn'}</span>
            <span>•</span>
            <span>{songs.length} bài hát</span>
            {songs.length > 0 && (
              <>
                <span>•</span>
                <span className="text-spotify-sub">{totalDuration}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── ACTION CONTROLS ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Big Play Button */}
          <Button
            variant="primary"
            size="lg"
            iconOnly
            onClick={handlePlayPlaylist}
            disabled={songs.length === 0}
            className="!w-14 !h-14 shadow-[0_8px_20px_rgba(250,45,72,0.4)]"
            tooltip={isPlaylistPlaying ? 'Tạm dừng' : 'Phát danh sách'}
          >
            {isPlaylistPlaying ? (
              <Pause size={26} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={26} fill="currentColor" strokeWidth={0} className="translate-x-[2px]" />
            )}
          </Button>

          {/* Shuffle Button */}
          <Button
            variant="ghost"
            size="md"
            iconOnly
            onClick={handleShufflePlay}
            disabled={songs.length === 0}
            className="text-spotify-sub hover:text-white"
            tooltip="Phát ngẫu nhiên"
          >
            <Shuffle size={22} />
          </Button>

          {/* Add Song Button */}
          {playlist && (
            <Button
              variant="dark"
              size="sm"
              onClick={() => openAddSong(playlist)}
              className="rounded-full px-4"
            >
              <Plus size={16} className="mr-1.5" />
              Thêm bài hát
            </Button>
          )}
        </div>

        {/* Playlist Options (Edit / Delete) */}
        {playlist && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={() => openEdit(playlist)}
              className="text-spotify-sub hover:text-white"
              tooltip="Đổi tên / Chỉnh sửa"
            >
              <Edit3 size={18} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={() => openDelete(playlist)}
              className="text-spotify-sub hover:text-red-400"
              tooltip="Xóa playlist"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        )}
      </div>

      {/* ── API ERROR BANNER ──────────────────────────────────────────────── */}
      {(isPlaylistError || isSongsError) && (
        <div className="p-4 mb-6 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={22} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold text-sm">
                Lỗi tải thông tin playlist
              </p>
              <p className="text-xs text-red-200/80 mt-0.5">
                {playlistError?.message || songsError?.message || 'Không thể lấy dữ liệu từ máy chủ (GET /api/user/playlists/{id}).'}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              refetchPlaylist();
              refetchSongs();
            }}
            className="flex-shrink-0 text-xs border-red-500/40"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* ── SONGS TABLE ───────────────────────────────────────────────────── */}
      <div className="flex flex-col mb-10">
        {/* Table Header */}
        <div className="grid grid-cols-[16px_1fr_60px_40px] sm:grid-cols-[24px_1fr_1fr_80px_40px] items-center gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-spotify-sub uppercase tracking-wider">
          <div className="text-center">#</div>
          <div>Tiêu đề</div>
          <div className="hidden sm:block">Nghệ sĩ</div>
          <div className="text-right flex items-center justify-end">
            <Clock size={16} />
          </div>
          <div className="text-center"></div>
        </div>

        {/* Songs List */}
        {isSongsLoading ? (
          <div className="flex flex-col py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-spotify-sub">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Music size={26} className="opacity-40" />
            </div>
            <p className="text-base font-bold text-white mb-1">
              Chưa có bài hát nào trong playlist này
            </p>
            <p className="text-xs max-w-sm mb-4">
              Hãy dùng thanh tìm kiếm bên dưới để tìm và thêm những bài hát tuyệt vời vào danh sách phát của bạn.
            </p>
          </div>
        ) : (
          <div className="flex flex-col py-1">
            {songs.map((song, index) => {
              const songId = song.songId || song.id;
              const isCurrentPlaying =
                isPlaying && currentSong && (currentSong.id === song.id || currentSong.id === song.songId);
              const isRemovingThis = removingSongId === songId;

              return (
                <div
                  key={song.id || index}
                  onClick={() => handlePlaySong(song)}
                  className={`grid grid-cols-[16px_1fr_60px_40px] sm:grid-cols-[24px_1fr_1fr_80px_40px] items-center gap-4 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer ${
                    isCurrentPlaying ? 'bg-white/5' : ''
                  }`}
                >
                  {/* # Index or Equalizer / Play button */}
                  <div className="flex items-center justify-center text-xs">
                    {isCurrentPlaying ? (
                      <Volume2 size={16} className="text-spotify-primary animate-pulse" />
                    ) : (
                      <span className="text-spotify-sub group-hover:hidden">
                        {index + 1}
                      </span>
                    )}
                    <button
                      className={`hidden group-hover:flex items-center justify-center text-white ${
                        isCurrentPlaying ? '!hidden' : ''
                      }`}
                      aria-label="Phát bài hát"
                    >
                      <Play size={14} fill="currentColor" />
                    </button>
                  </div>

                  {/* Title & Cover */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-10 h-10 flex-shrink-0">
                      <CoverImage
                        src={song.coverImage || song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover rounded-md shadow-sm"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isCurrentPlaying ? 'text-spotify-primary' : 'text-white'
                        }`}
                      >
                        {song.title}
                      </span>
                      <span className="text-xs text-spotify-sub sm:hidden truncate">
                        {song.artistName || song.artist || 'Nhiều nghệ sĩ'}
                      </span>
                    </div>
                  </div>

                  {/* Artist (Desktop) */}
                  <div className="hidden sm:block text-sm text-spotify-sub truncate group-hover:text-white transition-colors">
                    {song.artistName || song.artist || 'Nhiều nghệ sĩ'}
                  </div>

                  {/* Duration */}
                  <div className="text-right text-xs text-spotify-sub">
                    {formatDuration(song.durationMs || song.durationSeconds)}
                  </div>

                  {/* Remove Button */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={(e) => handleRemoveSong(e, song)}
                      disabled={isRemovingThis}
                      className="p-1.5 rounded-full text-spotify-sub hover:text-red-400 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                      aria-label="Xóa khỏi playlist"
                      title="Xóa bài hát khỏi playlist"
                    >
                      {isRemovingThis ? (
                        <Loader2 size={15} className="animate-spin text-red-400" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── INLINE SEARCH & ADD SONGS SECTION ──────────────────────────────── */}
      <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            Tìm thêm bài hát cho danh sách phát này
          </h3>
          <p className="text-xs text-spotify-sub">
            Tìm kiếm bài hát từ kho Catalog để thêm vào playlist nhanh chóng
          </p>
        </div>

        {/* Search input */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-spotify-sub" />
          <input
            type="text"
            placeholder="Tìm theo tên bài hát hoặc nghệ sĩ..."
            value={inlineSearch}
            onChange={(e) => setInlineSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-spotify-card hover:bg-spotify-card-hover border border-white/10 rounded-full text-white placeholder-spotify-sub text-sm outline-none focus:ring-2 focus:ring-spotify-primary/40 focus:border-white/20 transition"
          />
        </div>

        {/* Search results list */}
        {debouncedInlineSearch && (
          <div className="flex flex-col gap-1 mt-2 max-w-2xl bg-spotify-card/60 border border-white/5 p-3 rounded-2xl">
            {isSearchingCatalog ? (
              <div className="py-6 flex items-center justify-center gap-2 text-spotify-sub text-sm">
                <Loader2 size={20} className="animate-spin text-spotify-primary" />
                <span>Đang tìm bài hát...</span>
              </div>
            ) : catalogSongs.length === 0 ? (
              <div className="py-6 text-center text-spotify-sub text-sm">
                Không tìm thấy bài hát nào khớp với "{debouncedInlineSearch}"
              </div>
            ) : (
              catalogSongs.map((song) => {
                const sId = String(song.id || song.songId);
                const isAlreadyIn = existingSongIds.has(sId);
                const isAdding = addingSongId === sId;

                return (
                  <div
                    key={sId}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                      <div className="w-10 h-10 flex-shrink-0">
                        <CoverImage
                          src={song.coverImage || song.coverUrl}
                          alt={song.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white truncate">
                          {song.title}
                        </span>
                        <span className="text-xs text-spotify-sub truncate">
                          {song.artistName || song.artist || song.ownerName || 'Nghệ sĩ'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-spotify-sub">
                        {formatDuration(song.durationMs || song.durationSeconds)}
                      </span>

                      {isAlreadyIn ? (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 font-medium">
                          <Check size={13} />
                          Đã thêm
                        </span>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAddSong(song)}
                          disabled={isAdding || addingSongId !== null}
                          className="!h-8 !px-3 text-xs"
                        >
                          {isAdding ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Plus size={14} className="mr-1" />
                              Thêm
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
