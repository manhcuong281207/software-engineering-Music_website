import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Check, Loader2, Music } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { CoverImage } from '../ui/CoverImage';
import { getPublicSongs } from '../../api/catalog/public';
import { addSongToPlaylist, getPlaylistSongs } from '../../api/users/playlist';
import { usePlaylistModalStore } from '../../store/usePlaylistModalStore';

export const AddSongModal = () => {
  const { targetPlaylistForSong, closeAddSong } = usePlaylistModalStore();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [addingSongId, setAddingSongId] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Lấy danh sách bài hát hiện tại trong playlist để check trùng
  const { data: currentSongs = [] } = useQuery({
    queryKey: ['playlistSongs', targetPlaylistForSong?.id],
    queryFn: () => getPlaylistSongs(targetPlaylistForSong.id),
    enabled: !!targetPlaylistForSong?.id,
  });

  // Tìm kiếm bài hát từ Catalog Service
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['catalogSongsSearch', debouncedQuery],
    queryFn: () => getPublicSongs({ keyword: debouncedQuery || undefined, size: 20 }),
    enabled: !!targetPlaylistForSong,
  });

  const rawSongList = searchResults?.data?.content || searchResults?.data || searchResults || [];
  const songs = Array.isArray(rawSongList) ? rawSongList : [];

  const existingSongIds = new Set(
    currentSongs.map((s) => String(s.songId || s.id))
  );

  const addMutation = useMutation({
    mutationFn: ({ playlistId, songId }) => addSongToPlaylist(playlistId, songId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlistSongs', variables.playlistId] });
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.playlistId] });
      toast.success('Đã thêm bài hát vào danh sách phát!');
      setAddingSongId(null);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể thêm bài hát vào playlist.';
      toast.error(msg);
      setAddingSongId(null);
    },
  });

  const handleAddSong = (song) => {
    if (!targetPlaylistForSong || addingSongId) return;
    const songId = song.id || song.songId;
    setAddingSongId(songId);
    addMutation.mutate({
      playlistId: targetPlaylistForSong.id,
      songId,
    });
  };

  const handleClose = () => {
    setQuery('');
    setDebouncedQuery('');
    setAddingSongId(null);
    closeAddSong();
  };

  const formatDuration = (msOrSec) => {
    if (!msOrSec) return '--:--';
    const totalSec = msOrSec > 1000 ? Math.floor(msOrSec / 1000) : msOrSec;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      isOpen={!!targetPlaylistForSong}
      onClose={handleClose}
      title={`Thêm bài hát vào "${targetPlaylistForSong?.name || 'Playlist'}"`}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        {/* Search input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-spotify-sub" />
          <input
            type="text"
            autoFocus
            placeholder="Tìm kiếm bài hát theo tên hoặc nghệ sĩ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#2a2a2a] border border-white/10 rounded-xl text-white placeholder-spotify-sub focus:outline-none focus:ring-2 focus:ring-spotify-primary/40 focus:border-white/30 transition text-sm"
          />
        </div>

        {/* Songs List */}
        <div className="max-h-[360px] overflow-y-auto scrollbar-thin pr-1 flex flex-col gap-1">
          {isSearching ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-spotify-sub">
              <Loader2 size={28} className="animate-spin text-spotify-primary" />
              <span className="text-sm">Đang tìm bài hát...</span>
            </div>
          ) : songs.length === 0 ? (
            <div className="py-12 text-center text-spotify-sub flex flex-col items-center gap-2">
              <Music size={32} className="opacity-40" />
              <span className="text-sm">
                {debouncedQuery
                  ? `Không tìm thấy bài hát nào khớp với "${debouncedQuery}"`
                  : 'Nhập từ khóa để tìm kiếm bài hát'}
              </span>
            </div>
          ) : (
            songs.map((song) => {
              const songId = String(song.id || song.songId);
              const isAlreadyAdded = existingSongIds.has(songId);
              const isAddingThis = addingSongId === songId;

              return (
                <div
                  key={songId}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  {/* Song Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                    <div className="w-11 h-11 flex-shrink-0">
                      <CoverImage
                        src={song.coverImage || song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover rounded-lg shadow-sm"
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

                  {/* Right side: Duration + Action button */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-spotify-sub">
                      {formatDuration(song.durationMs || song.durationSeconds)}
                    </span>

                    {isAlreadyAdded ? (
                      <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 font-medium">
                        <Check size={13} />
                        Đã có
                      </span>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddSong(song)}
                        disabled={isAddingThis || addingSongId !== null}
                        className="!h-8 !px-3 text-xs"
                      >
                        {isAddingThis ? (
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

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
