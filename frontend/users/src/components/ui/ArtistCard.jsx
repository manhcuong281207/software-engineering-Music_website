import React from "react";
import { useNavigate } from "react-router";
import { Play } from "lucide-react";
import { Button } from "./Button";
import { CoverImage } from "./CoverImage";

/**
 * Component ArtistCard hiển thị thẻ nghệ sĩ dạng avatar tròn đặc trưng của Spotify / MC Music
 * @param {Object} artist - Thông tin nghệ sĩ { id, stageName, avatarUrl, followerCount }
 * @param {Function} onClick - Xử lý click thẻ (mặc định chuyển đến /artist/:id)
 * @param {Function} onPlayClick - Xử lý click nút Play
 */
export const ArtistCard = ({ artist, onClick, onPlayClick, className = "" }) => {
  const navigate = useNavigate();

  if (!artist) return null;

  const id = artist.id;
  const stageName = artist.stageName || artist.name || "Nghệ sĩ";
  const avatarUrl = artist.avatarUrl || artist.imageUrl;
  const followerCount = artist.followerCount;

  const handleClick = (e) => {
    if (onClick) {
      onClick(artist, e);
    } else if (id) {
      navigate(`/artist/${id}`);
    }
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (onPlayClick) {
      onPlayClick(artist, e);
    }
  };

  const formattedFollowers =
    followerCount !== undefined && followerCount !== null
      ? `${Number(followerCount).toLocaleString("vi-VN")} người theo dõi`
      : "Nghệ sĩ";

  return (
    <div
      onClick={handleClick}
      className={`group relative p-3.5 sm:p-4 rounded-xl bg-transparent hover:bg-spotify-hover/80 transition-all duration-300 cursor-pointer flex flex-col items-center text-center select-none border border-transparent hover:border-white/5 ${className}`}
    >
      {/* Khung ảnh đại diện tròn */}
      <div className="relative mb-3.5 w-full aspect-square max-w-[180px]">
        <CoverImage
          src={avatarUrl}
          alt={stageName}
          isArtist={true}
          className="w-full h-full object-cover rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.6)] group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.8)] transition-all duration-300"
        />

        {/* Nút Play tròn màu đỏ neon trượt lên khi hover */}
        {onPlayClick && (
          <Button
            variant="primary"
            size="md"
            iconOnly
            onClick={handlePlay}
            tooltip="Phát nhạc nghệ sĩ"
            tooltipPosition="top"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-[0_8px_20px_rgba(250,45,72,0.5)] hover:scale-110 active:scale-95"
          >
            <Play size={22} className="fill-white text-white ml-0.5" />
          </Button>
        )}
      </div>

      {/* Thông tin nghệ sĩ */}
      <div className="w-full">
        <h3 className="text-white text-sm sm:text-base font-bold truncate group-hover:text-[#fa2d48] transition-colors">
          {stageName}
        </h3>
        <p className="text-spotify-sub text-xs mt-1 truncate">
          {formattedFollowers}
        </p>
      </div>

      {/* Badge phân loại */}
      <div className="mt-2.5">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/5 group-hover:border-[#fa2d48]/30 group-hover:text-white transition-colors">
          Nghệ sĩ
        </span>
      </div>
    </div>
  );
};
