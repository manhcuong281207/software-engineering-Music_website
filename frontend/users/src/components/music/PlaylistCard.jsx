import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Play, MoreVertical, Edit3, Trash2, Music, Plus, Loader2 } from 'lucide-react';
import { CoverImage } from '../ui/CoverImage';
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
        navigate(`/playlist/${playlist.id}`);
      }
    } catch (err) {
      console.error('Lỗi khi phát danh sách bài hát:', err);
      navigate(`/playlist/${playlist.id}`);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative p-3 sm:p-4 rounded-xl bg-[#181818] hover:bg-[#222222] border border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Cover Image Wrapper */}
      <div className="relative w-full aspect-square rounded-lg bg-[#282828] mb-3 overflow-hidden shadow-md flex items-center justify-center">
        {playlist.coverImage ? (
          <img
            src={playlist.coverImage}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Music size={40} className="text-neutral-500 group-hover:text-[#fa2d48] transition-colors" />
        )}

        {/* Play Button Overlay */}
        <button
          type="button"
          onClick={handlePlay}
          disabled={isLoadingSongs}
          aria-label="Phát playlist"
          className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-[#fa2d48] text-white flex items-center justify-center shadow-xl shadow-black/60 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 transition-all duration-200 z-10"
        >
          {isLoadingSongs ? (
            <Loader2 size={20} className="animate-spin text-white" />
          ) : (
            <Play size={20} fill="currentColor" className="ml-0.5" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-[#fa2d48] transition-colors">
            {playlist.name}
          </h4>

          {/* Context Menu Trigger */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="p-1 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition opacity-0 group-hover:opacity-100"
              aria-label="Tùy chọn playlist"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-44 bg-[#282828] border border-white/10 rounded-xl shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openAddSong(playlist);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-white/10 text-left transition"
                >
                  <Plus size={14} />
                  Thêm bài hát
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openEdit(playlist);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-white/10 text-left transition"
                >
                  <Edit3 size={14} />
                  Đổi tên / Sửa
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openDelete(playlist);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 text-left transition"
                >
                  <Trash2 size={14} />
                  Xóa playlist
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-neutral-400 truncate mt-1">
          {playlist.description || `Danh sách phát • ${playlist.ownerName || 'Bạn'}`}
        </p>
      </div>
    </div>
  );
};

export const SkeletonPlaylistCard = () => {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-[#181818] border border-white/5 flex flex-col gap-3 animate-pulse">
      <div className="w-full aspect-square rounded-lg bg-[#282828]" />
      <div className="h-4 bg-[#282828] rounded w-3/4" />
      <div className="h-3 bg-[#282828] rounded w-1/2" />
    </div>
  );
};
