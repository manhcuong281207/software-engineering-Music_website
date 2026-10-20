import React from "react";
import { Play, Heart } from "lucide-react";
import { Button } from "./Button";
import { CoverImage } from "./CoverImage";
import { useFavoriteStore } from "../../store/useFavoriteStore";

export const SongCard = ({
  id,
  title,
  subtitle,
  imageUrl,
  type = "song", // "artist", "album", "song", "playlist"
  artistName,
  onClick,
  onPlayClick,
  onLikeClick,
}) => {
  const isSongLiked = useFavoriteStore((state) => state.isSongLiked);
  const toggleLikeSong = useFavoriteStore((state) => state.toggleLikeSong);
  const isLiked = type === "song" && id ? isSongLiked(id) : false;
  const isArtist = type === "artist";
  const isAlbum = type === "album";

  let displaySubtitle = subtitle;
  if (!displaySubtitle) {
    if (isArtist) {
      displaySubtitle = "Nghệ sĩ";
    } else if (isAlbum && artistName) {
      displaySubtitle = `Album • ${artistName}`;
    } else if (artistName) {
      displaySubtitle = artistName;
    }
  }

  return (
    <div
      className="bg-transparent hover:bg-spotify-hover transition-all p-3 rounded-md cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative mb-4">
        <CoverImage
          src={imageUrl}
          alt={title}
          isArtist={isArtist}
          className={`w-full aspect-square object-cover shadow-lg ${isArtist ? "rounded-full" : "rounded-md"}`}
        />
        {/* Nút Heart nhanh cho bài hát */}
        {type === "song" && id && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onLikeClick) {
                onLikeClick();
              } else {
                toggleLikeSong({ id, songId: id, title, coverImage: imageUrl, artistName });
              }
            }}
            className={`absolute top-2 right-2 p-2 rounded-full bg-black/60 backdrop-blur-md transition-all duration-300 active:scale-90 ${
              isLiked
                ? "opacity-100 text-spotify-primary hover:scale-110"
                : "opacity-0 group-hover:opacity-100 text-white hover:text-spotify-primary hover:scale-110"
            }`}
            title={isLiked ? "Xóa khỏi Bài hát đã thích" : "Lưu vào Bài hát đã thích"}
          >
            <Heart size={16} className={isLiked ? "fill-spotify-primary" : ""} />
          </button>
        )}

        {/* Nút Play sẽ hiển thị hiệu ứng trượt lên và sáng lên khi hover vào thẻ card */}
        <Button
          variant="primary" size="md" iconOnly
          onClick={(e) => {
            e.stopPropagation();
            if (onPlayClick) onPlayClick();
          }}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
        >
          <Play size={24} className="fill-white text-white ml-1" />
        </Button>
      </div>
      <h3 className="text-white truncate text-sm font-semibold">
        {title}
      </h3>
      <p className="text-spotify-sub text-xs mt-1 truncate">{displaySubtitle}</p>
    </div>
  );
};
