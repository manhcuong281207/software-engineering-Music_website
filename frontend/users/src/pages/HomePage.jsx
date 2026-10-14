import { useState, useEffect, useMemo } from 'react';
import { Play, TrendingUp, Disc3 } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { getGreeting, formatCount } from '../utils/formatters';
import { usePlayer } from '../contexts/PlayerContext';
import SectionRow from '../components/layout/SectionRow';
import SongCard from '../components/music/SongCard';
import AlbumCard from '../components/music/AlbumCard';
import ArtistCard from '../components/music/ArtistCard';

// Greeting time-of-day background colors
const GREETING_BG = {
  sáng: 'from-[#1a3a4a] to-[#121212]',
  chiều: 'from-[#3a2a1a] to-[#121212]',
  tối: 'from-[#2a1a3a] to-[#121212]',
};

// Quick access items (trending playlists)
const QUICK_ACCESS = [
  { id: 'qa1', name: 'Nhạc Yêu Thích', color: 'bg-purple-700', emoji: '💜' },
  { id: 'qa2', name: 'Top V-Pop', color: 'bg-pink-700', emoji: '🔥' },
  { id: 'qa3', name: 'Chill Buổi Sáng', color: 'bg-blue-700', emoji: '☀️' },
  { id: 'qa4', name: 'Workout Mix', color: 'bg-green-700', emoji: '💪' },
  { id: 'qa5', name: 'Study Lofi', color: 'bg-amber-700', emoji: '📚' },
  { id: 'qa6', name: 'Top Thịnh Hành', color: 'bg-red-700', emoji: '🎵' },
];

// Genre color map
const GENRE_COLORS = [
  'bg-[#0d3a2f]',
  'bg-[#1e3a5f]',
  'bg-[#3a1e5f]',
  'bg-[#3a2a00]',
  'bg-[#1a3a1a]',
  'bg-[#3a1a1a]',
  'bg-[#1a1a3a]',
  'bg-[#2a3a00]',
];

export default function HomePage() {
  const { playSong } = usePlayer();

  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [trending, setTrending] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState({
    featured: true,
    releases: true,
    trending: true,
    artists: true,
    genres: true,
  });

  const greeting = getGreeting();
  const greetingKey = greeting.includes('sáng') ? 'sáng' : greeting.includes('chiều') ? 'chiều' : 'tối';

  // Fetch all data
  useEffect(() => {
    mockApi.getFeaturedSongs().then(({ data }) => {
      setFeaturedSongs(data);
      setLoading((p) => ({ ...p, featured: false }));
    });
    mockApi.getNewReleases().then(({ data }) => {
      setNewReleases(data);
      setLoading((p) => ({ ...p, releases: false }));
    });
    mockApi.getTrendingSongs().then(({ data }) => {
      setTrending(data);
      setLoading((p) => ({ ...p, trending: false }));
    });
    mockApi.getFeaturedArtists().then(({ data }) => {
      setArtists(data);
      setLoading((p) => ({ ...p, artists: false }));
    });
    mockApi.getGenres().then(({ data }) => {
      setGenres(data);
      setLoading((p) => ({ ...p, genres: false }));
    });
  }, []);

  // Expose searchQuery to parent (Topbar passes it down via prop)
  // For now we listen to a custom event from Topbar
  useEffect(() => {
    const handler = (e) => setSearchQuery(e.detail);
    window.addEventListener('mc-search', handler);
    return () => window.removeEventListener('mc-search', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await mockApi.searchSongs(searchQuery);
      setSearchResults(data);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  // ── Search Results View ──────────────────────────────────────────────────
  if (isSearching) {
    return (
      <div className="pt-2 pb-24 md:pb-4">
        <h2 className="text-xl font-bold text-white mb-4">
          Kết quả cho &quot;{searchQuery}&quot;
        </h2>
        {searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Disc3 size={48} className="text-[#4d4d4d] mb-4" />
            <p className="text-[#a7a7a7]">Không tìm thấy kết quả nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchResults.map((song) => (
              <SongCard key={song.id} song={song} songList={searchResults} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Main Home View ───────────────────────────────────────────────────────
  return (
    <div className="pb-24 md:pb-4">
      {/* Hero gradient header */}
      <div className={`-mx-4 md:-mx-6 px-4 md:px-6 pt-4 pb-8 bg-gradient-to-b ${GREETING_BG[greetingKey]} mb-6`}>
        {/* Greeting */}
        <h1 className="text-2xl md:text-3xl font-black text-white mb-6">
          {greeting}! 👋
        </h1>

        {/* Quick access grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {QUICK_ACCESS.map((item) => (
            <button
              key={item.id}
              className="flex items-center gap-3 bg-[#282828]/80 hover:bg-[#3d3d3d] transition-all duration-200 rounded-md overflow-hidden h-14 group"
            >
              <div className={`w-14 h-full ${item.color} flex items-center justify-center text-xl flex-shrink-0`}>
                {item.emoji}
              </div>
              <span className="text-sm font-semibold text-white truncate pr-2">{item.name}</span>
              <div className="ml-auto pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-[#fa2d48] rounded-full flex items-center justify-center shadow-lg">
                  <Play size={14} fill="white" className="text-white ml-0.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured Songs ── */}
      <SectionRow
        title="🎵 Đề xuất cho bạn"
        isLoading={loading.featured}
        skeletonCount={6}
        onShowAll={() => {}}
      >
        {featuredSongs.map((song) => (
          <SongCard key={song.id} song={song} songList={featuredSongs} />
        ))}
      </SectionRow>

      {/* ── Trending with numbered list ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg font-bold text-white md:text-xl flex items-center gap-2">
            <TrendingUp size={20} className="text-[#fa2d48]" />
            Thịnh Hành Hôm Nay
          </h2>
          <button className="text-xs font-semibold text-[#a7a7a7] hover:text-white transition-colors uppercase tracking-wider">
            Xem tất cả
          </button>
        </div>

        {/* Compact list */}
        <div className="space-y-1">
          {(loading.trending
            ? Array.from({ length: 6 })
            : trending
          ).map((song, i) => (
            loading.trending ? (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
                <div className="w-6 text-center">
                  <div className="h-4 w-4 bg-[#282828] animate-pulse rounded mx-auto" />
                </div>
                <div className="w-12 h-12 bg-[#282828] animate-pulse rounded-md flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-[#282828] animate-pulse rounded w-3/5" />
                  <div className="h-3 bg-[#282828] animate-pulse rounded w-2/5" />
                </div>
                <div className="h-3 bg-[#282828] animate-pulse rounded w-8 hidden md:block" />
              </div>
            ) : (
              <TrendingRow key={song.id} song={song} index={i} songs={trending} />
            )
          ))}
        </div>
      </section>

      {/* ── New Releases (Albums) ── */}
      <SectionRow
        title="🆕 Phát Hành Mới"
        isLoading={loading.releases}
        skeletonCount={6}
        onShowAll={() => {}}
      >
        {newReleases.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </SectionRow>

      {/* ── Featured Artists ── */}
      <SectionRow
        title="🎤 Nghệ Sĩ Nổi Bật"
        isLoading={loading.artists}
        skeletonCount={6}
        skeletonType="circle"
        onShowAll={() => {}}
      >
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </SectionRow>

      {/* ── Browse Genres ── */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4 px-1 md:text-xl">
          🎸 Duyệt Theo Thể Loại
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(loading.genres ? Array.from({ length: 8 }) : genres).map((genre, i) =>
            loading.genres ? (
              <div key={i} className="h-20 bg-[#282828] animate-pulse rounded-lg" />
            ) : (
              <GenreCard key={genre.id} genre={genre} color={GENRE_COLORS[i % GENRE_COLORS.length]} />
            ),
          )}
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TrendingRow({ song, index, songs }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <div
      className="group flex items-center gap-4 p-3 rounded-lg hover:bg-[#282828] transition-all duration-200 cursor-pointer"
      onClick={() => playSong(song, songs)}
    >
      {/* Rank number */}
      <div className="w-6 text-center flex-shrink-0">
        {isActive && isPlaying ? (
          <div className="flex items-end justify-center gap-0.5 h-4">
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="w-0.5 bg-[#fa2d48] rounded-full animate-bounce"
                style={{ animationDelay: `${j * 0.15}s`, height: `${6 + j * 3}px` }}
              />
            ))}
          </div>
        ) : (
          <span
            className={`text-sm font-bold ${
              index < 3 ? 'text-[#fa2d48]' : 'text-[#a7a7a7]'
            } group-hover:hidden`}
          >
            {index + 1}
          </span>
        )}
        <Play
          size={14}
          className="hidden group-hover:block text-white mx-auto"
          fill="white"
        />
      </div>

      {/* Cover */}
      <img
        src={song.cover_image}
        alt={song.title}
        className="w-12 h-12 rounded-md object-cover flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate ${
            isActive ? 'text-[#fa2d48]' : 'text-white'
          }`}
        >
          {song.title}
        </p>
        <p className="text-xs text-[#a7a7a7] truncate">{song.owner_name}</p>
      </div>

      {/* Play count */}
      <div className="hidden md:flex items-center gap-1 text-xs text-[#6d6d6d] flex-shrink-0">
        <TrendingUp size={12} />
        {formatCount(song.play_count)}
      </div>
    </div>
  );
}

function GenreCard({ genre, color }) {
  return (
    <div
      className={`relative h-20 ${color} rounded-lg overflow-hidden cursor-pointer group transition-transform duration-200 hover:scale-105`}
    >
      <div className="absolute inset-0 p-3 flex items-end">
        <span className="text-sm font-bold text-white drop-shadow-md">{genre.name}</span>
      </div>
      <div className="absolute top-0 right-0 w-16 h-full overflow-hidden opacity-60">
        <img
          src={genre.cover_image}
          alt={genre.name}
          className="w-full h-full object-cover rotate-[20deg] translate-x-4 translate-y-2 rounded-md shadow-lg"
        />
      </div>
    </div>
  );
}
