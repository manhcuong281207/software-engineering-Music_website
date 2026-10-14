import { UserRound } from 'lucide-react';
import { formatCount } from '../../utils/formatters';

/**
 * ArtistCard - Card hiển thị nghệ sĩ (avatar tròn)
 */
export default function ArtistCard({ artist }) {
  return (
    <div className="group p-4 bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg cursor-pointer text-center">
      {/* Avatar tròn */}
      <div className="relative mx-auto mb-4 w-full aspect-square max-w-[160px]">
        <div className="relative rounded-full overflow-hidden shadow-2xl w-full h-full">
          <img
            src={artist.avatar_url}
            alt={artist.stage_name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        {/* Online dot */}
        <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#fa2d48] rounded-full border-2 border-[#181818] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <p className="text-sm font-semibold text-white truncate mb-1">
        {artist.stage_name}
      </p>
      <p className="text-xs text-[#a7a7a7]">Nghệ sĩ</p>
      <p className="text-xs text-[#6d6d6d] mt-0.5">
        {formatCount(artist.follower_count)} người theo dõi
      </p>
    </div>
  );
}
