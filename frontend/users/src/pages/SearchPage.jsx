import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Compass,
  Search,
  Sparkles,
  Play,
  ArrowLeft,
  Music2,
  Disc3,
  Flame,
  Zap,
  Coffee,
  Heart,
  Radio,
  Mic2,
  Star,
  Globe,
  Shuffle,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { getPublicGenres, getPublicSongs, searchCatalogApi } from "../api/catalog/public";
import { usePlayerStore } from "../store/usePlayerStore";
import { SongRow } from "../components/ui/SongRow";
import { CoverImage } from "../components/ui/CoverImage";

// Bảng màu & biểu tượng đặc trưng chuẩn Spotify cho từng thể loại
const GENRE_STYLE_MAP = {
  pop: {
    bgClass: "from-[#ec1e7b] to-[#a30b50]",
    accentColor: "#ec1e7b",
    icon: Sparkles,
    badge: "Sôi động & Bắt tai",
  },
  ballad: {
    bgClass: "from-[#1e824c] to-[#0f4d2a]",
    accentColor: "#1e824c",
    icon: Heart,
    badge: "Sâu lắng & Cảm xúc",
  },
  "r&b": {
    bgClass: "from-[#8c1932] to-[#590f20]",
    accentColor: "#8c1932",
    icon: Flame,
    badge: "Mượt mà & Nhịp điệu",
  },
  "hip-hop": {
    bgClass: "from-[#bc5900] to-[#7a3b00]",
    accentColor: "#bc5900",
    icon: Radio,
    badge: "Chất đường phố",
  },
  rap: {
    bgClass: "from-[#d83f2a] to-[#8d1e0e]",
    accentColor: "#d83f2a",
    icon: Mic2,
    badge: "Flow & Câu từ",
  },
  edm: {
    bgClass: "from-[#0d72ed] to-[#08428d]",
    accentColor: "#0d72ed",
    icon: Zap,
    badge: "Năng lượng & Bùng nổ",
  },
  lofi: {
    bgClass: "from-[#8400e7] to-[#4c0087]",
    accentColor: "#8400e7",
    icon: Coffee,
    badge: "Thư giãn & Tập trung",
  },
  jazz: {
    bgClass: "from-[#477d95] to-[#264958]",
    accentColor: "#477d95",
    icon: Disc3,
    badge: "Cổ điển & Tinh tế",
  },
  indie: {
    bgClass: "from-[#608108] to-[#3a4e05]",
    accentColor: "#608108",
    icon: Compass,
    badge: "Độc lập & Tự do",
  },
  acoustic: {
    bgClass: "from-[#af2896] to-[#6d185e]",
    accentColor: "#af2896",
    icon: Music2,
    badge: "Mộc mạc & Chân thật",
  },
  "k-pop": {
    bgClass: "from-[#e1118c] to-[#920959]",
    accentColor: "#e1118c",
    icon: Star,
    badge: "Thịnh hành & Hút mắt",
  },
  "us-uk": {
    bgClass: "from-[#3b5998] to-[#1d2f53]",
    accentColor: "#3b5998",
    icon: Globe,
    badge: "Quốc tế & Đỉnh cao",
  },
};

// Fallback gradient ngẫu nhiên nhưng ổn định cho các thể loại mới
const FALLBACK_GRADIENTS = [
  { bgClass: "from-[#e0223e] to-[#800d1e]", accentColor: "#e0223e" },
  { bgClass: "from-[#3b82f6] to-[#1d4ed8]", accentColor: "#3b82f6" },
  { bgClass: "from-[#10b981] to-[#047857]", accentColor: "#10b981" },
  { bgClass: "from-[#f59e0b] to-[#b45309]", accentColor: "#f59e0b" },
  { bgClass: "from-[#8b5cf6] to-[#6d28d9]", accentColor: "#8b5cf6" },
  { bgClass: "from-[#ec4899] to-[#be185d]", accentColor: "#ec4899" },
];

const getGenreStyle = (name = "") => {
  const normalized = name.toLowerCase().trim();
  if (GENRE_STYLE_MAP[normalized]) {
    return GENRE_STYLE_MAP[normalized];
  }
  // Băm tên thể loại để chọn bảng màu cố định
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_GRADIENTS.length;
  return {
    ...FALLBACK_GRADIENTS[index],
    icon: Music2,
    badge: "Giai điệu tuyển chọn",
  };
};

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get("q") || "";
  const genreParam = searchParams.get("genre") || "";

  const { playSongWithContext, currentSong, isPlaying } = usePlayerStore();

  // 1. Tải toàn bộ danh sách thể loại nhạc từ Backend API
  const {
    data: genresResponse,
    isLoading: isLoadingGenres,
    isError: isErrorGenres,
    refetch: refetchGenres,
  } = useQuery({
    queryKey: ["publicGenres"],
    queryFn: getPublicGenres,
    staleTime: 1000 * 60 * 15, // 15 phút
  });

  const genres = useMemo(() => genresResponse?.data || [], [genresResponse]);

  // Đồng bộ selectedGenre trực tiếp từ query param ?genre và danh sách genres
  const selectedGenre = useMemo(() => {
    if (!genreParam || genres.length === 0) return null;
    return (
      genres.find(
        (g) => g.id === genreParam || g.name.toLowerCase() === genreParam.toLowerCase()
      ) || null
    );
  }, [genreParam, genres]);

  // 2. Tải bài hát thuộc thể loại đã chọn
  const {
    data: genreSongsResponse,
    isLoading: isLoadingGenreSongs,
  } = useQuery({
    queryKey: ["genreSongs", selectedGenre?.id],
    queryFn: () =>
      getPublicSongs({
        genreId: selectedGenre.id,
        size: 50,
        sort: "playCount,desc",
      }),
    enabled: !!selectedGenre?.id,
  });

  const genreSongs = useMemo(
    () => genreSongsResponse?.data?.content || [],
    [genreSongsResponse]
  );

  // 3. Tải kết quả tìm kiếm nếu có từ khóa
  const {
    data: searchResponse,
    isLoading: isLoadingSearch,
  } = useQuery({
    queryKey: ["catalogSearch", keyword],
    queryFn: () => searchCatalogApi(keyword, 10),
    enabled: keyword.trim().length > 0,
    staleTime: 1000 * 60 * 2,
  });

  const searchResults = searchResponse?.data;

  // Xử lý chọn thể loại
  const handleSelectGenre = (genre) => {
    const next = new URLSearchParams(searchParams);
    next.set("genre", genre.id);
    setSearchParams(next);
  };

  // Quay lại danh sách tất cả thể loại
  const handleBackToAllGenres = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("genre");
    setSearchParams(newParams);
  };

  // Phát danh sách bài hát trong thể loại
  const handlePlayGenreAll = (isRandom = false) => {
    if (!genreSongs || genreSongs.length === 0) return;
    const startIndex = isRandom
      ? Math.floor(Math.random() * genreSongs.length)
      : 0;
    playSongWithContext(genreSongs[startIndex], genreSongs, startIndex);
  };

  return (
    <div className="min-h-full pb-16">
      {/* =========================================================================
          TRƯỜNG HỢP 1: ĐANG TÌM KIẾM THEO TỪ KHÓA (keyword !== "")
         ========================================================================= */}
      {keyword.trim().length > 0 ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-spotify-sub">
                Kết quả tìm kiếm cho
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                "{keyword}"
              </h1>
            </div>
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("q");
                setSearchParams(next);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <X size={14} />
              Xóa tìm kiếm
            </button>
          </div>

          {isLoadingSearch ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg bg-[#181818] animate-pulse"
                />
              ))}
            </div>
          ) : !searchResults ||
            ((!searchResults.songs || searchResults.songs.length === 0) &&
              (!searchResults.albums || searchResults.albums.length === 0) &&
              (!searchResults.artists || searchResults.artists.length === 0) &&
              !searchResults.topResult) ? (
            <div className="text-center py-20 bg-[#141414] rounded-2xl border border-white/5 p-8">
              <Search size={48} className="mx-auto text-neutral-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Không tìm thấy kết quả phù hợp
              </h3>
              <p className="text-spotify-sub max-w-md mx-auto text-sm">
                Hãy kiểm tra lại chính tả hoặc thử tìm kiếm với tên nghệ sĩ, bài hát hoặc thể loại khác.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Kết quả hàng đầu & Danh sách bài hát */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Top Result Card (nếu có) */}
                {searchResults.topResult && (
                  <div className="lg:col-span-5">
                    <h2 className="text-xl font-bold text-white mb-4">
                      Kết quả hàng đầu
                    </h2>
                    <div
                      onClick={() => {
                        if (searchResults.topResult.type === "ARTIST") {
                          navigate(`/artist/${searchResults.topResult.id}`);
                        } else if (searchResults.topResult.type === "ALBUM") {
                          navigate(`/album/${searchResults.topResult.id}`);
                        }
                      }}
                      className="p-6 rounded-2xl bg-[#181818] hover:bg-[#222222] transition-all duration-300 group cursor-pointer relative shadow-xl border border-white/5"
                    >
                      <CoverImage
                        src={searchResults.topResult.imageUrl}
                        alt={searchResults.topResult.title}
                        isArtist={searchResults.topResult.type === "ARTIST"}
                        className={`w-24 h-24 mb-5 shadow-2xl ${
                          searchResults.topResult.type === "ARTIST"
                            ? "rounded-full"
                            : "rounded-xl"
                        }`}
                      />
                      <h3 className="text-2xl font-black text-white group-hover:text-[#fa2d48] transition-colors truncate">
                        {searchResults.topResult.title}
                      </h3>
                      <p className="text-spotify-sub text-sm mt-1 truncate">
                        {searchResults.topResult.subtitle}
                      </p>
                      <span className="inline-block mt-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/40 text-neutral-300 border border-white/10">
                        {searchResults.topResult.type === "ARTIST"
                          ? "Nghệ sĩ"
                          : searchResults.topResult.type === "ALBUM"
                          ? "Album"
                          : "Bài hát"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Danh sách bài hát khớp */}
                <div
                  className={
                    searchResults.topResult ? "lg:col-span-7" : "lg:col-span-12"
                  }
                >
                  <h2 className="text-xl font-bold text-white mb-4">Bài hát</h2>
                  {searchResults.songs && searchResults.songs.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.songs.slice(0, 5).map((song, idx) => (
                        <SongRow
                          key={song.id}
                          index={idx + 1}
                          song={song}
                          isPlaying={isPlaying && currentSong?.id === song.id}
                          onPlayClick={() =>
                            playSongWithContext(song, searchResults.songs, idx)
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-spotify-sub text-sm">
                      Không có bài hát nào khớp.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : selectedGenre ? (
        /* =========================================================================
            TRƯỜNG HỢP 2: ĐANG XEM CHI TIẾT 1 THỂ LOẠI NHẠC
           ========================================================================= */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header Banner cho thể loại */}
          {(() => {
            const style = getGenreStyle(selectedGenre.name);
            const Icon = style.icon;
            return (
              <div
                className={`relative overflow-hidden rounded-2xl p-6 sm:p-10 bg-gradient-to-br ${style.bgClass} shadow-2xl`}
              >
                {/* Nút quay lại */}
                <button
                  onClick={handleBackToAllGenres}
                  className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 text-white text-sm font-semibold backdrop-blur-md transition-all cursor-pointer border border-white/10"
                >
                  <ArrowLeft size={16} />
                  Tất cả thể loại
                </button>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                      Thể loại nhạc
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mt-3 mb-2 drop-shadow-lg">
                      {selectedGenre.name}
                    </h1>
                    <p className="text-white/80 text-sm sm:text-base font-medium flex items-center gap-2">
                      <Icon size={18} />
                      {style.badge} • {genreSongs.length} bài hát nổi bật
                    </p>
                  </div>

                  {/* Cụm nút Play thể loại */}
                  {genreSongs.length > 0 && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePlayGenreAll(false)}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#fa2d48] hover:bg-[#e0223e] text-white font-bold shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Play size={20} fill="currentColor" />
                        Phát tất cả
                      </button>
                      <button
                        onClick={() => handlePlayGenreAll(true)}
                        className="p-3.5 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        title="Phát ngẫu nhiên"
                      >
                        <Shuffle size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Ảnh nền xoay góc trang trí */}
                <div className="absolute -bottom-8 -right-8 w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shadow-2xl opacity-40 transform rotate-[20deg] pointer-events-none">
                  {selectedGenre.coverImage ? (
                    <img
                      src={selectedGenre.coverImage}
                      alt={selectedGenre.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-black/50 flex items-center justify-center">
                      <Icon size={80} className="text-white/60" />
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Danh sách bài hát của thể loại */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Danh sách bài hát {selectedGenre.name}
            </h2>

            {isLoadingGenreSongs ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-lg bg-[#181818] animate-pulse"
                  />
                ))}
              </div>
            ) : genreSongs.length === 0 ? (
              <div className="text-center py-16 bg-[#141414] rounded-2xl border border-white/5">
                <Music2 size={44} className="mx-auto text-neutral-500 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">
                  Chưa có bài hát nào thuộc thể loại này
                </h3>
                <p className="text-spotify-sub text-sm">
                  Hãy đón chờ những giai điệu mới được các nghệ sĩ đăng tải nhé!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {genreSongs.map((song, index) => (
                  <SongRow
                    key={song.id}
                    index={index + 1}
                    song={song}
                    isPlaying={isPlaying && currentSong?.id === song.id}
                    onPlayClick={() =>
                      playSongWithContext(song, genreSongs, index)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* =========================================================================
            TRƯỜNG HỢP 3: MÀN HÌNH CHÍNH DUYỆT TÌM - HIỂN THỊ TOÀN BỘ THỂ LOẠI DẠNG THẺ
           ========================================================================= */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header phần Duyệt tìm */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fa2d48]/10 text-[#fa2d48] border border-[#fa2d48]/20 text-xs font-bold uppercase tracking-wider mb-2">
                <Compass size={14} />
                Khám phá âm nhạc
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Duyệt tìm tất cả
              </h1>
              <p className="text-spotify-sub text-sm sm:text-base mt-1">
                Khám phá thế giới âm nhạc thông qua các thể loại đặc sắc được tuyển chọn
              </p>
            </div>

            {/* Thống kê số lượng thể loại */}
            {!isLoadingGenres && genres.length > 0 && (
              <span className="text-xs font-medium text-neutral-400 bg-[#1c1c1c] px-3.5 py-1.5 rounded-full border border-neutral-800 self-start sm:self-auto">
                <strong className="text-white">{genres.length}</strong> thể loại sẵn có
              </span>
            )}
          </div>

          {/* Lỗi tải API thể loại */}
          {isErrorGenres && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                <p className="text-sm">
                  Không thể tải danh sách thể loại nhạc từ máy chủ. Vui lòng thử lại.
                </p>
              </div>
              <button
                onClick={() => refetchGenres()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800/40 hover:bg-red-800/60 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                Thử lại
              </button>
            </div>
          )}

          {/* Loading Skeleton Grid */}
          {isLoadingGenres ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 sm:h-48 rounded-xl bg-[#1c1c1c] animate-pulse relative overflow-hidden"
                >
                  <div className="p-4 space-y-2">
                    <div className="h-6 w-20 bg-neutral-700/60 rounded" />
                    <div className="h-4 w-12 bg-neutral-800 rounded" />
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-neutral-800 rounded-md rotate-[25deg]" />
                </div>
              ))}
            </div>
          ) : genres.length === 0 ? (
            /* Khi danh sách rỗng */
            <div className="text-center py-24 bg-[#141414] rounded-2xl border border-white/5">
              <Compass size={56} className="mx-auto text-neutral-600 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">
                Chưa có thể loại nào được khởi tạo
              </h3>
              <p className="text-spotify-sub text-sm max-w-md mx-auto">
                Dữ liệu thể loại đang được hệ thống cập nhật. Vui lòng quay lại sau!
              </p>
            </div>
          ) : (
            /* =================================================================
                LƯỚI THẺ THỂ LOẠI (GENRE CARDS GRID) - CHUẨN SPOTIFY RED THEME
               ================================================================= */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {genres.map((genre) => {
                const style = getGenreStyle(genre.name);
                const Icon = style.icon;

                return (
                  <div
                    key={genre.id}
                    onClick={() => handleSelectGenre(genre)}
                    className={`group relative overflow-hidden rounded-xl p-4 sm:p-5 h-40 sm:h-48 cursor-pointer select-none transition-all duration-300 hover:scale-[1.04] shadow-lg hover:shadow-2xl bg-gradient-to-br ${style.bgClass} flex flex-col justify-between`}
                    style={{
                      boxShadow: `0 8px 24px -6px ${style.accentColor}33`,
                    }}
                  >
                    {/* Hiệu ứng viền sáng nhẹ khi hover */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 pointer-events-none" />

                    {/* Tiêu đề thể loại & Icon */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                          Thể loại
                        </span>
                        <Icon size={16} className="text-white/80" />
                      </div>
                      <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-md break-words pr-2 line-clamp-2">
                        {genre.name}
                      </h3>
                    </div>

                    {/* Badge phụ tinh tế */}
                    <div className="relative z-10">
                      <span className="text-[11px] font-medium text-white/80 backdrop-blur-sm bg-black/25 px-2 py-0.5 rounded-full inline-block truncate max-w-[85%]">
                        {style.badge}
                      </span>
                    </div>

                    {/* Artwork / Thumbnail xoay nghiêng 25 độ ở góc dưới bên phải */}
                    <div className="absolute -bottom-2 -right-3 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-md overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.55)] transform rotate-[25deg] group-hover:rotate-[28deg] group-hover:scale-105 transition-all duration-300 pointer-events-none">
                      {genre.coverImage ? (
                        <img
                          src={genre.coverImage}
                          alt={genre.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full bg-black/40 flex items-center justify-center ${
                          genre.coverImage ? "hidden" : "flex"
                        }`}
                      >
                        <Icon size={36} className="text-white/80" />
                      </div>
                    </div>

                    {/* Nút Play tương tác nhanh khi hover */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95">
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default SearchPage;
