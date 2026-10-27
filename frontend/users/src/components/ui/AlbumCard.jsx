import React from "react";
import { useNavigate } from "react-router";
import { Play } from "lucide-react";
import { Button } from "./Button";
import { CoverImage } from "./CoverImage";

/**
 * Component AlbumCard hiển thị thẻ album chuẩn phong cách Spotify / MC Music
 * @param {Object} album - Thông tin album { id, title, coverImage, ownerName, albumType, releaseDate, totalTracks }
 * @param {Function} onClick - Xử lý click thẻ (mặc định chuyển đến /album/:id)
 * @param {Function} onPlayClick - Xử lý click nút Play
 */
export const AlbumCard = ({ album, onClick, onPlayClick, className = "" }) => {
  const navigate = useNavigate();

  if (!album) return null;

  const id = album.id;
  const title = album.title || "Album không có tên";
  const coverImage = album.coverImage || album.coverUrl;
  const ownerName = album.ownerName || album.artistName || "Nghệ sĩ";
  const albumType = album.albumType || "ALBUM";
  const totalTracks = album.totalTracks;

  // Trích xuất năm phát hành nếu có
  let releaseYear = null;
  if (album.releaseDate) {
    try {
      const date = new Date(album.releaseDate);
      if (!isNaN(date.getFullYear())) {
        releaseYear = date.getFullYear();
      }
    } catch {
      // Bỏ qua lỗi parse date
    }
  }

  const formatType = (type) => {
    if (!type) return "Album";
    const upper = type.toUpperCase();
    if (upper === "EP") return "EP";
    if (upper === "SINGLE") return "Single";
    return "Album";
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(album, e);
    } else if (id) {
      navigate(`/album/${id}`);
    }
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (onPlayClick) {
      onPlayClick(album, e);
    }
  };

  // Tạo dòng mô tả phụ: Ví dụ: "2024 • Album • Sơn Tùng M-TP"
  const subtitleParts = [];
  if (releaseYear) subtitleParts.push(releaseYear);
  subtitleParts.push(formatType(albumType));
  if (ownerName) subtitleParts.push(ownerName);
  const displaySubtitle = subtitleParts.join(" • ");

  return (
    <div
      onClick={handleClick}
      className={`group relative p-3.5 sm:p-4 rounded-xl bg-transparent hover:bg-spotify-hover/80 transition-all duration-300 cursor-pointer select-none border border-transparent hover:border-white/5 ${className}`}
    >
      {/* Khung bìa Album vuông */}
      <div className="relative mb-3.5 w-full aspect-square">
        <CoverImage
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.6)] group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.8)] transition-all duration-300"
        />

        {/* Nút Play tròn màu đỏ neon trượt lên khi hover */}
        {onPlayClick && (
          <Button
            variant="primary"
            size="md"
            iconOnly
            onClick={handlePlay}
            tooltip="Phát album"
            tooltipPosition="top"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-[0_8px_20px_rgba(250,45,72,0.5)] hover:scale-110 active:scale-95"
          >
            <Play size={22} className="fill-white text-white ml-0.5" />
          </Button>
        )}
      </div>

      {/* Thông tin Album */}
      <div className="w-full">
        <h3 className="text-white text-sm sm:text-base font-bold truncate group-hover:text-[#fa2d48] transition-colors">
          {title}
        </h3>
        <p className="text-spotify-sub text-xs mt-1 truncate" title={displaySubtitle}>
          {displaySubtitle}
        </p>
      </div>

      {/* Thông tin số bài hát nếu có */}
      {totalTracks !== undefined && totalTracks > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
          <span>{totalTracks} bài hát</span>
        </div>
      )}
    </div>
  );
};
