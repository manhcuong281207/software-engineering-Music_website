import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  Plus,
  Trash2,
  Edit3,
  Music,
  Search,
  Check,
  Loader2,
  Clock,
  ArrowLeft,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { SkeletonRow } from '../components/ui/Skeleton';
import {
  getPlaylistById,
  getPlaylistSongs,
  removeSongFromPlaylist,
  addSongToPlaylist,
} from '../api/users/playlist';
import { getPublicSongs, getSongById } from '../api/catalog/public';
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

  // Search inline để thêm bài hát ngay trên trang
  const [inlineQuery, setInlineQuery] = useState('');
  const [debouncedInlineQuery, setDebouncedInlineQuery] = useState('');
  const [addingSongId, setAddingSongId] = useState(null);
  const [removingSongId, setRemovingSongId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInlineQuery(inlineQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [inlineQuery]);

  // 1. Fetch Playlist metadata
  const {
    data: playlist,
    isLoading: isPlaylistLoading,
    isError: isPlaylistError,
    error: playlistError,
  } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: () => getPlaylistById(playlistId),
    enabled: !!playlistId && isAuthenticated,
  });

  // 2. Fetch Playlist Songs
  const {
    data: songs = [],
  } = useQuery({
    queryKey: ['playlistSongs', playlistId],
    queryFn: () => getPlaylistSongs(playlistId),
    enabled: !!playlistId && isAuthenticated,
  });

  // 3. Search query cho phần thêm bài hát inline
  const {
    data: searchResultsData,
    isLoading: isSearching,
  } = useQuery({
    queryKey: ['inlineSearchSongs', debouncedInlineQuery],
    queryFn: () => getPublicSongs({ keyword: debouncedInlineQuery || undefined, size: 8 }),
    enabled: !!playlistId && debouncedInlineQuery.length > 0,
  });

  const searchResults = searchResultsData?.data?.content || searchResultsData?.content || [];

  // 4. Mutation xóa bài hát khỏi playlist
  const removeMutation = useMutation({
    mutationFn: (songId) => removeSongFromPlaylist(playlistId, songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlistSongs', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
      toast.success('Đã xóa bài hát khỏi danh sách phát');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa bài hát.';
      toast.error(msg);
    },
    onSettled: () => {
      setRemovingSongId(null);
    },
  });

  // 5. Mutation thêm bài hát inline
  const addMutation = useMutation({
    mutationFn: (songId) => addSongToPlaylist(playlistId, songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlistSongs', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
      toast.success('Đã thêm bài hát vào danh sách phát!');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể thêm bài hát.';
      toast.error(msg);
    },
    onSettled: () => {
      setAddingSongId(null);
    },
  });

  const handleRemoveSong = (e, songId) => {
    e.stopPropagation();
    if (removingSongId) return;
    setRemovingSongId(songId);
    removeMutation.mutate(songId);
  };

  const handleAddInlineSong = (songId) => {
    if (addingSongId) return;
    setAddingSongId(songId);
    addMutation.mutate(songId);
  };

  // 6. Phát bài hát
  const handlePlayTrack = async (track) => {
    // Nếu track chưa có audioUrl, lấy thêm từ Catalog
    let resolvedTrack = track;
    if (!resolvedTrack.audioUrl && resolvedTrack.songId) {
      try {
        const catRes = await getSongById(resolvedTrack.songId);
        const catData = catRes?.data || catRes;
        if (catData?.audioUrl) {
          resolvedTrack = {
            ...resolvedTrack,
            audioUrl: catData.audioUrl,
            durationSeconds: catData.durationSeconds,
          };
        }
      } catch (err) {
        console.warn('Không lấy được audioUrl từ Catalog:', err);
      }
    }

    // Set queue gồm toàn bộ danh sách bài hát trong playlist
    setQueue(songs);
    setCurrentSong(resolvedTrack);
    setIsPlaying(true);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      handlePlayTrack(songs[0], 0);
    } else {
      toast.info('Danh sách phát chưa có bài hát nào.');
    }
  };

  // Format Helpers
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
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
        <Music size={48} className="text-[#fa2d48]" />
        <h2 className="text-xl font-bold text-white">Vui lòng đăng nhập</h2>
        <p className="text-sm text-neutral-400 max-w-sm">
          Bạn cần đăng nhập tài khoản để xem và quản lý danh sách phát của mình.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/login')}>
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  if (isPlaylistLoading) {
    return (
      <div className="p-6 flex flex-col gap-6 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-48 h-48 bg-[#282828] rounded-xl flex-shrink-0" />
          <div className="flex flex-col gap-3 flex-1">
            <div className="w-24 h-4 bg-[#282828] rounded-full" />
            <div className="w-72 h-10 bg-[#282828] rounded-lg" />
            <div className="w-48 h-4 bg-[#282828] rounded-full" />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isPlaylistError || !playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="p-4 rounded-full bg-white/5 text-neutral-400">
          <Music size={36} />
        </div>
        <h2 className="text-xl font-bold text-white">Không tìm thấy danh sách phát</h2>
        <p className="text-sm text-neutral-400 max-w-sm">
          {playlistError?.message || 'Danh sách phát không tồn tại hoặc bạn không có quyền truy cập.'}
        </p>
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-1.5" />
          Quay lại
        </Button>
      </div>
    );
  }

  const existingSongIds = new Set(songs.map((s) => s.songId || s.id));

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* 1. Header Banner */}
      <div className="relative p-6 sm:p-8 bg-gradient-to-b from-[#2a1719] via-[#1a1213] to-[#121212] border-b border-white/5">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Cover Art */}
          <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-gradient-to-br from-[#fa2d48]/40 to-neutral-900 shadow-2xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10 group relative">
            {playlist.coverImage ? (
              <img
                src={playlist.coverImage}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music size={64} className="text-[#fa2d48]" />
            )}
          </div>

          {/* Info Details */}
          <div className="flex flex-col gap-2 flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white">
                Danh sách phát
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/5">
                {playlist.isPublic ? 'Công khai' : 'Riêng tư'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight break-words">
              {playlist.name}
            </h1>

            {playlist.description && (
              <p className="text-sm text-neutral-400 line-clamp-2 mt-1">
                {playlist.description}
              </p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-neutral-300 mt-2 font-medium">
              <span className="text-white font-semibold">{playlist.ownerName || 'Bạn'}</span>
              <span>•</span>
              <span>{songs.length} bài hát</span>
              {playlist.createdAt && (
                <>
                  <span>•</span>
                  <span className="text-neutral-400">Tạo ngày {formatDate(playlist.createdAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 mt-8 flex-wrap">
          <Button
            variant="primary"
            size="md"
            onClick={handlePlayAll}
            className="shadow-lg shadow-[#fa2d48]/25"
          >
            <Play size={20} fill="currentColor" className="mr-2" />
            Phát tất cả
          </Button>

          <Button
            variant="dark"
            size="md"
            onClick={() => openEdit(playlist)}
            tooltip="Đổi tên hoặc chỉnh sửa mô tả"
          >
            <Edit3 size={18} className="mr-1.5 text-neutral-300" />
            Đổi tên
          </Button>

          <Button
            variant="dark"
            size="md"
            onClick={() => openAddSong(playlist)}
            tooltip="Mở hộp thoại tìm và thêm bài hát"
          >
            <Plus size={18} className="mr-1.5 text-neutral-300" />
            Thêm bài hát
          </Button>

          <Button
            variant="dark"
            size="md"
            onClick={() => openDelete(playlist)}
            className="hover:bg-red-950/40 hover:text-red-400 hover:border-red-500/30 transition"
            tooltip="Xóa danh sách phát này"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      {/* 2. Tracklist Table */}
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
            <div className="p-4 rounded-full bg-[#fa2d48]/10 text-[#fa2d48] mb-3">
              <Music size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Danh sách phát của bạn đang trống
            </h3>
            <p className="text-sm text-neutral-400 max-w-md mb-5">
              Hãy tìm kiếm và thêm các bài hát yêu thích bên dưới để lấp đầy playlist này!
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openAddSong(playlist)}
            >
              <Plus size={16} className="mr-1.5" />
              Tìm bài hát ngay
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Table Header */}
            <div className="grid grid-cols-[36px_1fr_120px_90px] sm:grid-cols-[48px_1fr_180px_100px] items-center px-4 py-2 text-xs font-bold text-neutral-400 border-b border-white/10 uppercase tracking-wider">
              <span className="text-center">#</span>
              <span>Tiêu đề</span>
              <span className="hidden sm:block">Ngày thêm</span>
              <span className="text-right flex items-center justify-end gap-1">
                <Clock size={14} />
              </span>
            </div>

            {/* Song Rows */}
            <div className="flex flex-col mt-1 divide-y divide-white/[0.02]">
              {songs.map((track, idx) => {
                const isTrackPlaying =
                  isPlaying &&
                  (currentSong?.songId === track.songId ||
                    currentSong?.id === track.songId ||
                    currentSong?.id === track.id);
                const isThisRemoving = removingSongId === track.songId;

                return (
                  <div
                    key={track.songId || track.id || idx}
                    onClick={() => handlePlayTrack(track, idx)}
                    className="grid grid-cols-[36px_1fr_120px_90px] sm:grid-cols-[48px_1fr_180px_100px] items-center px-3 sm:px-4 py-2.5 rounded-xl hover:bg-white/5 transition group cursor-pointer"
                  >
                    {/* Index / Play Button */}
                    <div className="flex items-center justify-center">
                      {isTrackPlaying ? (
                        <Volume2 size={16} className="text-[#fa2d48] animate-pulse" />
                      ) : (
                        <span className="text-sm font-medium text-neutral-500 group-hover:hidden">
                          {idx + 1}
                        </span>
                      )}
                      <button
                        type="button"
                        className="hidden group-hover:flex items-center justify-center text-white"
                        aria-label="Phát bài này"
                      >
                        <Play size={15} fill="currentColor" />
                      </button>
                    </div>

                    {/* Title & Artist */}
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="w-10 h-10 rounded-lg bg-[#282828] flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
                        {track.coverImage ? (
                          <img
                            src={track.coverImage}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music size={16} className="text-neutral-500" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isTrackPlaying ? 'text-[#fa2d48]' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </span>
                        <span className="text-xs text-neutral-400 truncate">
                          {track.artistName || track.artist || 'Nhiều nghệ sĩ'}
                        </span>
                      </div>
                    </div>

                    {/* Added At */}
                    <div className="hidden sm:block text-xs text-neutral-400 truncate">
                      {formatDate(track.addedAt)}
                    </div>

                    {/* Duration & Remove Action */}
                    <div className="flex items-center justify-end gap-2 text-xs text-neutral-400">
                      <span className="font-mono group-hover:hidden">
                        {formatDuration(track.durationSeconds)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSong(e, track.songId)}
                        disabled={isThisRemoving}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title="Xóa bài hát khỏi playlist"
                      >
                        {isThisRemoving ? (
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
          </div>
        )}

        {/* 3. Section Tìm kiếm & Thêm bài hát Inline */}
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Tìm thêm bài hát cho danh sách phát của bạn
            </h3>
            <p className="text-xs text-neutral-400">
              Nhập tên bài hát hoặc nghệ sĩ để tìm kiếm và thêm trực tiếp vào playlist
            </p>
          </div>

          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài hát..."
              value={inlineQuery}
              onChange={(e) => setInlineQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#fa2d48] transition text-sm"
            />
          </div>

          {debouncedInlineQuery && (
            <div className="flex flex-col gap-1.5 mt-2 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
              {isSearching ? (
                <div className="flex items-center justify-center py-8 text-neutral-400 gap-2">
                  <Loader2 size={18} className="animate-spin text-[#fa2d48]" />
                  <span className="text-xs">Đang tìm bài hát...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  Không tìm thấy bài hát nào cho từ khóa "{debouncedInlineQuery}".
                </div>
              ) : (
                searchResults.map((song) => {
                  const alreadyInPlaylist = existingSongIds.has(song.id);
                  const isAdding = addingSongId === song.id;

                  return (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className="w-10 h-10 rounded-lg bg-[#282828] flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
                          {song.coverImage ? (
                            <img
                              src={song.coverImage}
                              alt={song.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Music size={16} className="text-neutral-500" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-white truncate">
                            {song.title}
                          </span>
                          <span className="text-xs text-neutral-400 truncate">
                            {song.ownerName || song.artistName || 'Nghệ sĩ'}
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant={alreadyInPlaylist ? 'secondary' : 'dark'}
                        size="sm"
                        disabled={alreadyInPlaylist || isAdding}
                        onClick={() => handleAddInlineSong(song.id)}
                      >
                        {isAdding ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : alreadyInPlaylist ? (
                          <>
                            <Check size={14} className="mr-1 text-emerald-400" />
                            Đã có
                          </>
                        ) : (
                          <>
                            <Plus size={14} className="mr-1" />
                            Thêm
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
