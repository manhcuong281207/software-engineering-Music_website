import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Play, Heart } from "lucide-react";
import { CoverImage } from "./CoverImage";
import { useFavoriteStore } from "../../store/useFavoriteStore";

/**
 * Component hiển thị 1 dòng bài hát trong danh sách ngang (Album Detail, Artist Profile, Liked Songs).
 */
export const SongRow = ({ index, song, onPlayClick, isPlaying, extraAction }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isSongLiked = useFavoriteStore((state) => state.isSongLiked);
  const toggleLikeSong = useFavoriteStore((state) => state.toggleLikeSong);
  const [isHovered, setIsHovered] = useState(false);

  const songId = song?.id || song?.songId;
  const isLiked = isSongLiked(songId);

  // Xử lý hiển thị thời lượng (ms -> mm:ss hoặc seconds -> mm:ss)
  const formatDuration = (ms, seconds) => {
    let totalSeconds = 0;
    if (typeof seconds === "number" && seconds > 0) {
      totalSeconds = seconds;
    } else if (typeof ms === "number" && ms > 0) {
      totalSeconds = Math.floor(ms / 1000);
    } else {
      return "--:--";
    }
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLike = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài (gây play nhạc)
    toggleLikeSong(song, {
      onLogin: () => navigate("/login"),
      queryClient,
    });
  };

  return (
    <div
      className="flex items-center gap-4 py-2 px-4 rounded-md hover:bg-[#2a2a2a] group cursor-pointer transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPlayClick}
    >
      {/* Cột STT / Nút Play */}
      <div className="w-6 text-right flex justify-end">
        {isHovered ? (
          <button className="text-white">
            <Play size={16} fill="currentColor" />
          </button>
        ) : (
          <span
            className={`text-sm ${
              isPlaying ? "text-spotify-primary font-bold" : "text-spotify-sub"
            }`}
          >
            {index}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div className="w-10 h-10 flex-shrink-0">
        <CoverImage
          src={song.coverImage || song.coverUrl}
          alt={song.title}
          className="w-full h-full object-cover rounded shadow-sm"
        />
      </div>

      {/* Thông tin bài hát */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <span
          className={`text-base truncate ${
            isPlaying ? "text-spotify-primary font-bold" : "text-white"
          }`}
        >
          {song.title}
        </span>
        <span className="text-sm text-spotify-sub group-hover:text-white transition-colors truncate">
          {song.artistName || song.ownerName}
        </span>
      </div>

      {/* Extra action (ví dụ: ngày thêm vào playlist/yêu thích) nếu có */}
      {extraAction && (
        <div className="hidden md:flex items-center text-xs text-spotify-sub min-w-[120px]">
          {extraAction}
        </div>
      )}

      {/* Hành động (Like) - Luôn hiện nếu đã thích, hoặc hiện khi hover */}
      <div
        className={`w-10 flex items-center justify-center transition-all ${
          isLiked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <button
          type="button"
          className={`p-1.5 rounded-full hover:scale-110 active:scale-95 transition-all ${
            isLiked
              ? "text-spotify-primary hover:text-spotify-primary-hover"
              : "text-spotify-sub hover:text-white"
          }`}
          onClick={handleLike}
          title={isLiked ? "Xóa khỏi Bài hát đã thích" : "Lưu vào Bài hát đã thích"}
        >
          <Heart
            size={18}
            className={isLiked ? "fill-spotify-primary text-spotify-primary" : ""}
          />
        </button>
      </div>

      {/* Thời lượng */}
      <div className="w-12 text-sm text-spotify-sub text-right">
        {formatDuration(song.durationMs, song.durationSeconds)}
      </div>
    </div>
  );
};
