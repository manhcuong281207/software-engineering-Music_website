import { Play, Pause, Heart } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { formatDuration } from '../../utils/formatters';

/**
 * SongCard - Card hiển thị bài hát (dạng lưới)
 * Props: song, songList (danh sách queue để play liên tục)
 */
export default function SongCard({ song, songList = [] }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  const handlePlay = (e) => {
    e.stopPropagation();
    playSong(song, songList.length > 0 ? songList : [song]);
  };

  return (
    <div
      className="group relative p-4 bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg cursor-pointer"
      onClick={handlePlay}
    >
      {/* Cover Image */}
      <div className="relative mb-4 rounded-md overflow-hidden aspect-square shadow-xl">
        <img
          src={song.cover_image}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Play button overlay */}
        <div
          className={`absolute bottom-2 right-2 transition-all duration-300 ${
            isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
        >
          <button
            onClick={handlePlay}
            className="w-12 h-12 bg-[#fa2d48] hover:bg-[#e0223e] hover:scale-105 rounded-full flex items-center justify-center shadow-lg shadow-[#fa2d48]/30 transition-all duration-200"
          >
            {isActive && isPlaying ? (
              <Pause size={20} fill="white" className="text-white" />
            ) : (
              <Play size={20} fill="white" className="text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Active indicator */}
        {isActive && isPlaying && (
          <div className="absolute top-2 left-2">
            <div className="flex items-end gap-0.5 h-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-[#fa2d48] rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s`, height: `${8 + i * 4}px` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <p
          className={`text-sm font-semibold truncate mb-1 transition-colors ${
            isActive ? 'text-[#fa2d48]' : 'text-white'
          }`}
        >
          {song.title}
        </p>
        <p className="text-xs text-[#a7a7a7] truncate">{song.owner_name}</p>
        <p className="text-xs text-[#6d6d6d] mt-1">{formatDuration(song.duration_seconds)}</p>
      </div>
    </div>
  );
}
