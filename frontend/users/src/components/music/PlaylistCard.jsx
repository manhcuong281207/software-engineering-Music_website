import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Play, MoreVertical, Edit3, Trash2, Music, ListPlus } from 'lucide-react';
import { CoverImage } from '../ui/CoverImage';
import { Button } from '../ui/Button';
import { usePlayerStore } from '../../store/usePlayerStore';
import { usePlaylistModalStore } from '../../store/usePlaylistModalStore';
import { getPlaylistSongs } from '../../api/users/playlist';

export const PlaylistCard = ({ playlist }) => {
  const navigate = useNavigate();
  const { setIsPlaying, setCurrentSong, setQueue } = usePlayerStore();
  const { openEdit, openDelete, openAddSong } = usePlaylistModalStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = () => {
    navigate(`/playlist/${playlist.id}`);
  };

  const handlePlay = async (e) => {
    e.stopPropagation();

    if (isLoadingSongs) return;

    try {
      setIsLoadingSongs(true);
      const songs = await getPlaylistSongs(playlist.id);
      if (songs && songs.length > 0) {
        setQueue(songs);
        setCurrentSong(songs[0]);
        setIsPlaying(true);
      } else {
        // Nếu playlist rỗng, mở trang chi tiết để thêm bài hát
        navigate(`/playlist/${playlist.id}`);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách bài hát:', err);
      navigate(`/playlist/${playlist.id}`);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-spotify-card hover:bg-spotify-card-hover p-4 rounded-xl transition-all duration-300 group relative flex flex-col cursor-pointer border border-white/5 hover:border-white/10 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Cover Image Container */}
      <div className="relative mb-3 w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-[#2a1318] via-[#1a1416] to-[#121212] flex items-center justify-center shadow-lg">
        {playlist.coverImage ? (
          <CoverImage
            src={playlist.coverImage}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-spotify-primary group-hover:scale-110 transition-transform duration-300">
            <Music size={42} strokeWidth={1.5} />
          </div>
        )}

        {/* Hover Play Button */}
        <div className="absolute right-2.5 bottom-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl z-10">
          <Button
            variant="primary"
            size="sm"
            iconOnly
            onClick={handlePlay}
            disabled={isLoadingSongs}
            className="!w-11 !h-11 shadow-2xl"
            aria-label={`Phát danh sách ${playlist.name}`}
          >
            <Play size={18} fill="currentColor" strokeWidth={0} className="translate-x-[1px]" />
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white truncate group-hover:text-spotify-primary transition-colors">
            {playlist.name}
          </h4>
          <p className="text-xs text-spotify-sub mt-1 truncate">
            {playlist.description || `Danh sách phát • ${playlist.songCount || 0} bài hát`}
          </p>
        </div>

        {/* 3-dot Context Menu */}
        <div className="relative flex-shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-full text-spotify-sub hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            aria-label="Tùy chọn playlist"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-[#282828] border border-white/10 rounded-xl shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  openAddSong(playlist);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-white/90 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ListPlus size={15} className="text-spotify-sub" />
                Thêm bài hát
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  openEdit(playlist);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-white/90 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Edit3 size={15} className="text-spotify-sub" />
                Đổi tên / Sửa
              </button>

              <div className="border-t border-white/10 my-1" />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  openDelete(playlist);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <Trash2 size={15} />
                Xóa playlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SkeletonPlaylistCard = () => {
  return (
    <div className="bg-spotify-card p-4 rounded-xl border border-white/5 flex flex-col animate-pulse">
      <div className="w-full aspect-square rounded-lg bg-white/10 mb-3" />
      <div className="h-4 bg-white/15 rounded-md w-3/4 mb-2" />
      <div className="h-3 bg-white/10 rounded-md w-1/2" />
    </div>
  );
};
