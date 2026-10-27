import React from "react";
import { useNavigate } from "react-router";
import { Play, Mic2, Music2, Disc3 } from "lucide-react";
import { CoverImage } from "../ui/CoverImage";

/**
 * Component hiển thị Kết quả hàng đầu (Top Result) theo mức độ ưu tiên
 * được thuật toán RelevanceScorer của Backend tính toán và trả về.
 *
 * @param {Object} topResult - Đối tượng { type, item, score } từ API search
 * @param {Function} onPlaySong - Callback phát nhạc khi kết quả là Bài hát
 * @param {Function} onPlayArtist - Callback phát nhạc khi kết quả là Nghệ sĩ
 * @param {Function} onPlayAlbum - Callback phát nhạc khi kết quả là Album
 */
export const TopResultCard = ({
  topResult,
  onPlaySong,
  onPlayArtist,
  onPlayAlbum,
  className = "",
}) => {
  const navigate = useNavigate();

  if (!topResult) return null;

  const item = topResult.item || topResult;
  const rawType = (topResult.type || "").toUpperCase();
  const type =
    rawType ||
    (item.stageName ? "ARTIST" : item.albumType ? "ALBUM" : "SONG");

  const id = item.id || topResult.id;
  const isArtist = type === "ARTIST";
  const isAlbum = type === "ALBUM";
  const isSong = type === "SONG";

  const title =
    item.title || item.stageName || item.name || topResult.title || "Không có tên";
  const imageUrl =
    item.coverImage || item.avatarUrl || item.imageUrl || topResult.imageUrl;

  // Xây dựng subtitle mô tả chi tiết
  let subtitle = topResult.subtitle;
  if (!subtitle) {
    if (isArtist) {
      subtitle = item.followerCount !== undefined
        ? `${Number(item.followerCount).toLocaleString("vi-VN")} người theo dõi`
        : "Nghệ sĩ";
    } else if (isAlbum) {
      subtitle = `${item.ownerName || "Nghệ sĩ"} • ${item.albumType || "Album"}`;
    } else {
      subtitle = item.ownerName ? `Bài hát • ${item.ownerName}` : "Bài hát";
    }
  }

  // Cấu hình Badge phân loại theo kiểu thực thể
  const badgeConfig = isArtist
    ? { label: "Nghệ sĩ", icon: Mic2, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" }
    : isAlbum
    ? { label: "Album", icon: Disc3, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" }
    : { label: "Bài hát", icon: Music2, color: "text-[#fa2d48] bg-[#fa2d48]/10 border-[#fa2d48]/20" };

  const BadgeIcon = badgeConfig.icon;

  const handleClick = () => {
    if (isArtist) {
      navigate(`/artist/${id}`);
    } else if (isAlbum) {
      navigate(`/album/${id}`);
    } else if (isSong) {
      if (onPlaySong) {
        onPlaySong(item);
      }
    }
  };

  const handlePlayButtonClick = (e) => {
    e.stopPropagation();
    if (isSong && onPlaySong) {
      onPlaySong(item);
    } else if (isArtist && onPlayArtist) {
      onPlayArtist(item);
    } else if (isAlbum && onPlayAlbum) {
      onPlayAlbum(item);
    } else {
      handleClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#1e1e1e] to-[#141414] hover:bg-[#222222] transition-all duration-300 cursor-pointer select-none border border-white/5 hover:border-white/10 shadow-2xl flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Hình ảnh đại diện */}
        <div className="relative mb-5 inline-block">
          <CoverImage
            src={imageUrl}
            alt={title}
            isArtist={isArtist}
            className={`w-24 h-24 sm:w-28 sm:h-28 object-cover shadow-[0_12px_28px_rgba(0,0,0,0.7)] group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.9)] transition-all duration-300 ${
              isArtist ? "rounded-full" : "rounded-xl"
            }`}
          />
        </div>

        {/* Tiêu đề kết quả */}
        <h3
          className="text-2xl sm:text-3xl font-black text-white group-hover:text-[#fa2d48] transition-colors line-clamp-2 leading-tight"
          title={title}
        >
          {title}
        </h3>

        {/* Subtitle mô tả phụ */}
        <p className="text-spotify-sub text-sm sm:text-base font-medium mt-2 line-clamp-1">
          {subtitle}
        </p>
      </div>

      {/* Dưới cùng: Badge phân loại & Nút Play nổi bật */}
      <div className="flex items-center justify-between mt-6 pt-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeConfig.color}`}
        >
          <BadgeIcon size={13} />
          {badgeConfig.label}
        </span>

        {/* Nút Play to nổi bật ở góc dưới bên phải */}
        <button
          onClick={handlePlayButtonClick}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#fa2d48] hover:bg-[#e0223e] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(250,45,72,0.5)] transform translate-y-2 opacity-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          title={`Phát ${badgeConfig.label.toLowerCase()}`}
        >
          <Play size={24} fill="currentColor" className="ml-1" />
        </button>
      </div>
    </div>
  );
};
