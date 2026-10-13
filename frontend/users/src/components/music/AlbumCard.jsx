import { Play, Music } from 'lucide-react';
import { formatReleaseDate } from '../../utils/formatters';

/**
 * AlbumCard - Card hiển thị album/EP
 */
export default function AlbumCard({ album }) {
  return (
    <div className="group relative p-4 bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg cursor-pointer">
      {/* Cover */}
      <div className="relative mb-4 rounded-md overflow-hidden aspect-square shadow-xl">
        <img
          src={album.cover_image}
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Play overlay */}
        <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button className="w-12 h-12 bg-[#fa2d48] hover:bg-[#e0223e] hover:scale-105 rounded-full flex items-center justify-center shadow-lg shadow-[#fa2d48]/30 transition-all duration-200">
            <Play size={20} fill="white" className="text-white ml-0.5" />
          </button>
        </div>

        {/* Album type badge */}
        <div className="absolute top-2 left-2">
          <span className="text-xs bg-black/60 backdrop-blur-sm text-[#a7a7a7] px-2 py-0.5 rounded-full font-medium">
            {album.album_type === 'ALBUM' ? 'Album' : album.album_type === 'EP' ? 'EP' : 'Single'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-sm font-semibold text-white truncate mb-1">{album.title}</p>
        <p className="text-xs text-[#a7a7a7] truncate">{album.owner_name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Music size={10} className="text-[#6d6d6d]" />
          <p className="text-xs text-[#6d6d6d]">
            {album.total_tracks} bài · {formatReleaseDate(album.release_date)}
          </p>
        </div>
      </div>
    </div>
  );
}
