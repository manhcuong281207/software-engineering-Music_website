import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Check, Loader2, Music } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { getPublicSongs } from '../../api/catalog/public';
import { addSongToPlaylist } from '../../api/users/playlist';
import { usePlaylistModalStore } from '../../store/usePlaylistModalStore';

const AddSongForm = ({ playlist, onClose }) => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [addedSongIds, setAddedSongIds] = useState(new Set());
  const [addingId, setAddingId] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch songs based on debounced search
  const { data: songsData, isLoading: isSearching } = useQuery({
    queryKey: ['publicSongsSearch', debouncedQuery],
    queryFn: () => getPublicSongs({ keyword: debouncedQuery || undefined, size: 20 }),
  });

  const songs = songsData?.data?.content || songsData?.content || [];

  const addMutation = useMutation({
    mutationFn: (songId) => addSongToPlaylist(playlist.id, songId),
    onSuccess: (_, songId) => {
      setAddedSongIds((prev) => new Set(prev).add(songId));
      queryClient.invalidateQueries({ queryKey: ['playlistSongs', playlist.id] });
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
      toast.success('Đã thêm bài hát vào danh sách phát!');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể thêm bài hát vào playlist.';
      toast.error(msg);
    },
    onSettled: () => {
      setAddingId(null);
    },
  });

  const handleAdd = (songId) => {
    if (addingId) return;
    setAddingId(songId);
    addMutation.mutate(songId);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          autoFocus
          placeholder="Tìm kiếm bài hát để thêm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#242424] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#fa2d48] transition text-sm"
        />
      </div>

      {/* Results List */}
      <div className="flex flex-col gap-1 max-h-[360px] overflow-y-auto pr-1">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
            <Loader2 size={24} className="animate-spin text-[#fa2d48]" />
            <p className="text-xs">Đang tìm bài hát...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500 gap-2">
            <Music size={32} />
            <p className="text-sm">
              {debouncedQuery ? 'Không tìm thấy bài hát phù hợp.' : 'Nhập tên bài hát để tìm kiếm.'}
            </p>
          </div>
        ) : (
          songs.map((song) => {
            const isAdded = addedSongIds.has(song.id);
            const isCurrentlyAdding = addingId === song.id;

            return (
              <div
                key={song.id}
                className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl transition group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                  <div className="w-11 h-11 rounded-lg bg-[#282828] flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
                    {song.coverImage ? (
                      <img
                        src={song.coverImage}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music size={18} className="text-neutral-500" />
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
                  variant={isAdded ? 'secondary' : 'dark'}
                  size="sm"
                  disabled={isAdded || isCurrentlyAdding}
                  onClick={() => handleAdd(song.id)}
                  className="flex-shrink-0"
                >
                  {isCurrentlyAdding ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isAdded ? (
                    <>
                      <Check size={14} className="mr-1 text-emerald-400" />
                      Đã thêm
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

      {/* Footer */}
      <div className="flex justify-end pt-3 border-t border-white/10">
        <Button variant="dark" size="sm" onClick={onClose}>
          Xong
        </Button>
      </div>
    </div>
  );
};

export const AddSongModal = () => {
  const { targetPlaylistForSong, closeAddSong } = usePlaylistModalStore();

  return (
    <Modal
      isOpen={!!targetPlaylistForSong}
      onClose={closeAddSong}
      title={targetPlaylistForSong ? `Thêm bài hát vào "${targetPlaylistForSong.name}"` : 'Thêm bài hát'}
      maxWidth="max-w-xl"
    >
      {targetPlaylistForSong && (
        <AddSongForm
          key={targetPlaylistForSong.id}
          playlist={targetPlaylistForSong}
          onClose={closeAddSong}
        />
      )}
    </Modal>
  );
};
