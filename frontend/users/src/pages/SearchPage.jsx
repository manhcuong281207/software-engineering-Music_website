import React, { useMemo, useState, useEffect } from "react";
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
  SearchX,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

import {
  getPublicGenres,
  getPublicSongs,
  getPublicAlbums,
  getArtistSongs,
  getAlbumSongs,
  searchCatalogApi,
} from "../api/catalog/public";
import { getPublicArtists } from "../api/artists/public";
import { usePlayerStore } from "../store/usePlayerStore";
import { SongRow } from "../components/ui/SongRow";
import { CoverImage } from "../components/ui/CoverImage";
import { ArtistCard } from "../components/ui/ArtistCard";
import { AlbumCard } from "../components/ui/AlbumCard";
import { TopResultCard } from "../components/search/TopResultCard";
import { Pagination } from "../components/ui/Pagination";
import { SkeletonCard, SkeletonRow } from "../components/ui/Skeleton";

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

// Cấu hình các Tabs tìm kiếm
const SEARCH_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "songs", label: "Bài hát" },
  { id: "artists", label: "Nghệ sĩ" },
  { id: "albums", label: "Album" },
];

// Cấu hình sắp xếp cho từng Tab
const SONG_SORT_OPTIONS = [
  { value: "playCount,desc", label: "Nhiều lượt nghe nhất" },
  { value: "likeCount,desc", label: "Yêu thích nhất" },
  { value: "createdAt,desc", label: "Mới nhất" },
  { value: "title,asc", label: "Tên bài hát (A-Z)" },
];

const ARTIST_SORT_OPTIONS = [
  { value: "followerCount,desc", label: "Nhiều người theo dõi nhất" },
  { value: "createdAt,desc", label: "Mới tham gia" },
  { value: "stageName,asc", label: "Tên nghệ sĩ (A-Z)" },
];

const ALBUM_SORT_OPTIONS = [
  { value: "likeCount,desc", label: "Yêu thích nhất" },
  { value: "createdAt,desc", label: "Mới phát hành" },
  { value: "title,asc", label: "Tên album (A-Z)" },
];

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const keyword = searchParams.get("q") || "";
  const genreParam = searchParams.get("genre") || "";
  const activeTab = searchParams.get("type") || "all";
  const pageParam = parseInt(searchParams.get("page") || "0", 10);
  const sortParam = searchParams.get("sort") || "";

  const { playSongWithContext, currentSong, isPlaying } = usePlayerStore();

  // ─── 1. Xử lý Thể loại Nhạc ──────────────────────────────────────────────────
  const {
    data: genresResponse,
    isLoading: isLoadingGenres,
    isError: isErrorGenres,
    refetch: refetchGenres,
  } = useQuery({
    queryKey: ["publicGenres"],
    queryFn: getPublicGenres,
    staleTime: 1000 * 60 * 15,
  });

  const genres = useMemo(() => genresResponse?.data || [], [genresResponse]);

  const selectedGenre = useMemo(() => {
    if (!genreParam || genres.length === 0) return null;
    return (
      genres.find(
        (g) => g.id === genreParam || g.name.toLowerCase() === genreParam.toLowerCase()
      ) || null
    );
  }, [genreParam, genres]);

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

  // ─── 2. Tải kết quả Unified Search (Tab "Tất cả") ─────────────────────────────
  const hasKeyword = keyword.trim().length > 0;

  const {
    data: unifiedSearchResponse,
    isLoading: isLoadingUnified,
    isError: isErrorUnified,
    refetch: refetchUnified,
  } = useQuery({
    queryKey: ["catalogUnifiedSearch", keyword],
    queryFn: () => searchCatalogApi(keyword, 10),
    enabled: hasKeyword && activeTab === "all",
    staleTime: 1000 * 60 * 2,
  });

  const unifiedData = unifiedSearchResponse?.data;
  const topResult = unifiedData?.topResult;
  const unifiedSongs = unifiedData?.songs || [];
  const unifiedArtists = unifiedData?.artists || [];
  const unifiedAlbums = unifiedData?.albums || [];

  // ─── 3. Tích hợp API tìm kiếm riêng lẻ Bài hát (Tab "Bài hát") ────────────────
  const songSort = sortParam || "playCount,desc";
  const {
    data: songsSearchResponse,
    isLoading: isLoadingSongsSearch,
    isError: isErrorSongsSearch,
  } = useQuery({
    queryKey: ["searchIndividualSongs", keyword, pageParam, songSort],
    queryFn: () =>
      getPublicSongs({
        keyword: keyword.trim(),
        page: pageParam,
        size: 20,
        sort: songSort,
      }),
    enabled: hasKeyword && activeTab === "songs",
    staleTime: 1000 * 60 * 2,
  });

  const songsPageData = songsSearchResponse?.data;
  const individualSongs = songsPageData?.content || [];
  const songsTotalPages = songsPageData?.totalPages || 0;
  const songsTotalElements = songsPageData?.totalElements || 0;

  // ─── 4. Tích hợp API tìm kiếm riêng lẻ Nghệ sĩ (Tab "Nghệ sĩ") ────────────────
  const artistSort = sortParam || "followerCount,desc";
  const {
    data: artistsSearchResponse,
    isLoading: isLoadingArtistsSearch,
    isError: isErrorArtistsSearch,
  } = useQuery({
    queryKey: ["searchIndividualArtists", keyword, pageParam, artistSort],
    queryFn: () =>
      getPublicArtists({
        keyword: keyword.trim(),
        page: pageParam,
        size: 18,
        sort: artistSort,
      }),
    enabled: hasKeyword && activeTab === "artists",
    staleTime: 1000 * 60 * 2,
  });

  const artistsPageData = artistsSearchResponse?.data;
  const individualArtists = artistsPageData?.content || [];
  const artistsTotalPages = artistsPageData?.totalPages || 0;
  const artistsTotalElements = artistsPageData?.totalElements || 0;

  // ─── 5. Tích hợp API tìm kiếm riêng lẻ Album (Tab "Album") ────────────────────
  const albumSort = sortParam || "likeCount,desc";
  const {
    data: albumsSearchResponse,
    isLoading: isLoadingAlbumsSearch,
    isError: isErrorAlbumsSearch,
  } = useQuery({
    queryKey: ["searchIndividualAlbums", keyword, pageParam, albumSort],
    queryFn: () =>
      getPublicAlbums({
        keyword: keyword.trim(),
        page: pageParam,
        size: 18,
        sort: albumSort,
      }),
    enabled: hasKeyword && activeTab === "albums",
    staleTime: 1000 * 60 * 2,
  });

  const albumsPageData = albumsSearchResponse?.data;
  const individualAlbums = albumsPageData?.content || [];
  const albumsTotalPages = albumsPageData?.totalPages || 0;
  const albumsTotalElements = albumsPageData?.totalElements || 0;

  // ─── Handlers điều hướng & bộ lọc ───────────────────────────────────────────
  const handleTabChange = (tabId) => {
    const next = new URLSearchParams(searchParams);
    if (tabId === "all") {
      next.delete("type");
    } else {
      next.set("type", tabId);
    }
    next.delete("page");
    next.delete("sort");
    setSearchParams(next);
  };

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    if (newPage === 0) {
      next.delete("page");
    } else {
      next.set("page", String(newPage));
    }
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (newSort) => {
    const next = new URLSearchParams(searchParams);
    next.set("sort", newSort);
    next.delete("page"); // Reset về trang đầu khi đổi cách sắp xếp
    setSearchParams(next);
  };

  const handleClearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    next.delete("type");
    next.delete("page");
    next.delete("sort");
    setSearchParams(next);
  };

  const handleSelectGenre = (genre) => {
    const next = new URLSearchParams(searchParams);
    next.set("genre", genre.id);
    setSearchParams(next);
  };

  const handleBackToAllGenres = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("genre");
    setSearchParams(next);
  };

  // ─── Handlers phát nhạc thông minh ──────────────────────────────────────────
  const handlePlaySongItem = (song, songList = [], index = 0) => {
    if (!song) return;
    const list = songList.length > 0 ? songList : [song];
    playSongWithContext(song, list, index);
  };

  const handlePlayArtist = async (artist) => {
    if (!artist?.id) return;
    try {
      const res = await getArtistSongs(artist.id, {
        size: 50,
        sort: "likeCount,desc",
      });
      const songs = res?.data?.content || [];
      if (songs.length > 0) {
        const randomIndex = Math.floor(Math.random() * songs.length);
        playSongWithContext(songs[randomIndex], songs, randomIndex);
        toast.success(`Đang phát nhạc của nghệ sĩ ${artist.stageName || "này"}`);
      } else {
        toast.info(`Nghệ sĩ ${artist.stageName || ""} chưa có bài hát khả dụng`);
      }
    } catch (err) {
      console.error("Lỗi khi phát nhạc nghệ sĩ:", err);
      toast.error("Không thể phát nhạc nghệ sĩ vào lúc này");
    }
  };

  const handlePlayAlbum = async (album) => {
    if (!album?.id) return;
    try {
      const res = await getAlbumSongs(album.id, {
        size: 50,
        sort: "createdAt,asc",
      });
      const songs = res?.data?.content || [];
      if (songs.length > 0) {
        playSongWithContext(songs[0], songs, 0);
        toast.success(`Đang phát album "${album.title || ""}"`);
      } else {
        toast.info(`Album "${album.title || ""}" chưa có bài hát khả dụng`);
      }
    } catch (err) {
      console.error("Lỗi khi phát album:", err);
      toast.error("Không thể phát album vào lúc này");
    }
  };

  const handlePlayGenreAll = (isRandom = false) => {
    if (!genreSongs || genreSongs.length === 0) return;
    const startIndex = isRandom
      ? Math.floor(Math.random() * genreSongs.length)
      : 0;
    playSongWithContext(genreSongs[startIndex], genreSongs, startIndex);
  };

  return (
    <div className="min-h-full pb-20">
      {/* =========================================================================
          TRƯỜNG HỢP 1: ĐANG TÌM KIẾM THEO TỪ KHÓA (hasKeyword = true)
         ========================================================================= */}
      {hasKeyword ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header kết quả tìm kiếm */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-spotify-sub mb-1">
                <Search size={14} className="text-[#fa2d48]" />
                <span>Kết quả tìm kiếm cho</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight break-words">
                "{keyword}"
              </h1>
            </div>

            <button
              onClick={handleClearSearch}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer border border-white/5 active:scale-95"
            >
              <X size={14} />
              Xóa tìm kiếm
            </button>
          </div>

          {/* Thanh Tabs phân loại kết quả (Tất cả, Bài hát, Nghệ sĩ, Album) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SEARCH_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap select-none ${
                    isActive
                      ? "bg-white text-black shadow-lg scale-105"
                      : "bg-[#1e1e1e] hover:bg-[#282828] text-neutral-300 hover:text-white border border-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* =====================================================================
              TAB 1: TẤT CẢ (UNIFIED SEARCH) - HIỂN THỊ THEO MỨC ĐỘ ƯU TIÊN
             ===================================================================== */}
          {activeTab === "all" && (
            <div className="space-y-10">
              {isLoadingUnified ? (
                /* Skeleton Loading cho Unified Search */
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 h-72 rounded-2xl bg-[#181818] animate-pulse" />
                    <div className="lg:col-span-7 space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-14 rounded-lg bg-[#181818] animate-pulse" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-6 w-32 bg-[#181818] animate-pulse rounded" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-44 rounded-xl bg-[#181818] animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : isErrorUnified ? (
                /* Lỗi gọi API Unified Search */
                <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-center">
                  <AlertCircle size={40} className="mx-auto text-red-400 mb-2" />
                  <h3 className="text-lg font-bold text-white mb-1">
                    Đã xảy ra lỗi khi tìm kiếm
                  </h3>
                  <p className="text-red-200 text-sm mb-4">
                    Không thể kết nối đến máy chủ tìm kiếm. Vui lòng thử lại sau.
                  </p>
                  <button
                    onClick={() => refetchUnified()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-800/50 hover:bg-red-800 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <RefreshCw size={14} /> Thử lại
                  </button>
                </div>
              ) : !topResult &&
                unifiedSongs.length === 0 &&
                unifiedArtists.length === 0 &&
                unifiedAlbums.length === 0 ? (
                /* Trạng thái không có kết quả */
                <div className="text-center py-20 bg-[#141414] rounded-2xl border border-white/5 p-8">
                  <SearchX size={52} className="mx-auto text-neutral-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Không tìm thấy kết quả phù hợp cho "{keyword}"
                  </h3>
                  <p className="text-spotify-sub max-w-md mx-auto text-sm">
                    Hãy kiểm tra lại chính tả hoặc thử tìm kiếm với tên nghệ sĩ, bài hát hoặc thể loại khác.
                  </p>
                </div>
              ) : (
                /* Kết quả Unified Search phong phú */
                <div className="space-y-10">
                  {/* Hàng 1: Kết quả hàng đầu (Top Result) & Top Bài hát */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Top Result Card - Hiển thị ở vị trí ưu tiên cao nhất */}
                    {topResult && (
                      <div className="lg:col-span-5 flex flex-col">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                          Kết quả hàng đầu
                        </h2>
                        <TopResultCard
                          topResult={topResult}
                          onPlaySong={(song) => handlePlaySongItem(song, unifiedSongs)}
                          onPlayArtist={handlePlayArtist}
                          onPlayAlbum={handlePlayAlbum}
                          className="flex-1"
                        />
                      </div>
                    )}

                    {/* Danh sách bài hát hàng đầu */}
                    <div
                      className={`flex flex-col ${
                        topResult ? "lg:col-span-7" : "lg:col-span-12"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                          Bài hát
                        </h2>
                        {unifiedSongs.length > 0 && (
                          <button
                            onClick={() => handleTabChange("songs")}
                            className="text-xs sm:text-sm font-bold text-spotify-sub hover:text-white transition-colors cursor-pointer"
                          >
                            Xem tất cả
                          </button>
                        )}
                      </div>

                      {unifiedSongs.length > 0 ? (
                        <div className="space-y-1 bg-[#141414]/60 p-2 sm:p-3 rounded-2xl border border-white/5 flex-1">
                          {unifiedSongs.slice(0, 5).map((song, idx) => (
                            <SongRow
                              key={song.id}
                              index={idx + 1}
                              song={song}
                              isPlaying={isPlaying && currentSong?.id === song.id}
                              onPlayClick={() =>
                                handlePlaySongItem(song, unifiedSongs, idx)
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 rounded-2xl bg-[#141414] border border-white/5 text-center text-spotify-sub text-sm flex-1 flex items-center justify-center">
                          Không tìm thấy bài hát nào khớp.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hàng 2: Nghệ sĩ phù hợp */}
                  {unifiedArtists.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-white">
                            Nghệ sĩ
                          </h2>
                          <p className="text-xs sm:text-sm text-spotify-sub mt-0.5">
                            Nghệ sĩ khớp với từ khóa tìm kiếm
                          </p>
                        </div>
                        <button
                          onClick={() => handleTabChange("artists")}
                          className="text-xs sm:text-sm font-bold text-spotify-sub hover:text-white transition-colors cursor-pointer"
                        >
                          Xem tất cả
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {unifiedArtists.slice(0, 6).map((artist) => (
                          <ArtistCard
                            key={artist.id}
                            artist={artist}
                            onPlayClick={handlePlayArtist}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Hàng 3: Album phù hợp */}
                  {unifiedAlbums.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-white">
                            Album & EP
                          </h2>
                          <p className="text-xs sm:text-sm text-spotify-sub mt-0.5">
                            Bộ sưu tập album và single khớp với từ khóa
                          </p>
                        </div>
                        <button
                          onClick={() => handleTabChange("albums")}
                          className="text-xs sm:text-sm font-bold text-spotify-sub hover:text-white transition-colors cursor-pointer"
                        >
                          Xem tất cả
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {unifiedAlbums.slice(0, 6).map((album) => (
                          <AlbumCard
                            key={album.id}
                            album={album}
                            onPlayClick={handlePlayAlbum}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB 2: BÀI HÁT (SONGS) - TÍCH HỢP API TÌM KIẾM RIÊNG LẺ
             ===================================================================== */}
          {activeTab === "songs" && (
            <div className="space-y-6">
              {/* Header điều khiển sắp xếp và thống kê */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141414] p-4 rounded-xl border border-white/5">
                <span className="text-xs sm:text-sm text-neutral-400">
                  Tìm thấy{" "}
                  <strong className="text-white">
                    {songsTotalElements.toLocaleString("vi-VN")}
                  </strong>{" "}
                  bài hát phù hợp
                </span>

                <div className="flex items-center gap-2">
                  <ArrowUpDown size={14} className="text-spotify-sub" />
                  <span className="text-xs text-spotify-sub">Sắp xếp:</span>
                  <select
                    value={songSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-[#202020] hover:bg-[#282828] text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 outline-none cursor-pointer transition-colors"
                  >
                    {SONG_SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#181818]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoadingSongsSearch ? (
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </div>
              ) : isErrorSongsSearch ? (
                <div className="p-8 rounded-2xl bg-red-950/40 border border-red-800/60 text-center">
                  <AlertCircle size={40} className="mx-auto text-red-400 mb-2" />
                  <h3 className="text-lg font-bold text-white mb-1">
                    Lỗi tải danh sách bài hát
                  </h3>
                  <p className="text-red-200 text-sm">
                    Không thể tìm kiếm bài hát lúc này. Vui lòng thử lại.
                  </p>
                </div>
              ) : individualSongs.length === 0 ? (
                <div className="text-center py-20 bg-[#141414] rounded-2xl border border-white/5 p-8">
                  <SearchX size={52} className="mx-auto text-neutral-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Không tìm thấy bài hát nào
                  </h3>
                  <p className="text-spotify-sub max-w-md mx-auto text-sm">
                    Hãy thử từ khóa khác hoặc chuyển sang tab Tất cả để xem các gợi ý phù hợp.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="space-y-1 bg-[#141414]/40 p-2 sm:p-3 rounded-2xl border border-white/5">
                    {individualSongs.map((song, idx) => (
                      <SongRow
                        key={song.id}
                        index={pageParam * 20 + idx + 1}
                        song={song}
                        isPlaying={isPlaying && currentSong?.id === song.id}
                        onPlayClick={() =>
                          handlePlaySongItem(song, individualSongs, idx)
                        }
                      />
                    ))}
                  </div>

                  {/* Phân trang */}
                  <Pagination
                    currentPage={pageParam}
                    totalPages={songsTotalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB 3: NGHỆ SĨ (ARTISTS) - TÍCH HỢP API TÌM KIẾM RIÊNG LẺ
             ===================================================================== */}
          {activeTab === "artists" && (
            <div className="space-y-6">
              {/* Header điều khiển sắp xếp và thống kê */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141414] p-4 rounded-xl border border-white/5">
                <span className="text-xs sm:text-sm text-neutral-400">
                  Tìm thấy{" "}
                  <strong className="text-white">
                    {artistsTotalElements.toLocaleString("vi-VN")}
                  </strong>{" "}
                  nghệ sĩ phù hợp
                </span>

                <div className="flex items-center gap-2">
                  <ArrowUpDown size={14} className="text-spotify-sub" />
                  <span className="text-xs text-spotify-sub">Sắp xếp:</span>
                  <select
                    value={artistSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-[#202020] hover:bg-[#282828] text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 outline-none cursor-pointer transition-colors"
                  >
                    {ARTIST_SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#181818]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoadingArtistsSearch ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <SkeletonCard key={i} isArtist={true} />
                  ))}
                </div>
              ) : isErrorArtistsSearch ? (
                <div className="p-8 rounded-2xl bg-red-950/40 border border-red-800/60 text-center">
                  <AlertCircle size={40} className="mx-auto text-red-400 mb-2" />
                  <h3 className="text-lg font-bold text-white mb-1">
                    Lỗi tải danh sách nghệ sĩ
                  </h3>
                  <p className="text-red-200 text-sm">
                    Không thể tìm kiếm nghệ sĩ lúc này. Vui lòng thử lại.
                  </p>
                </div>
              ) : individualArtists.length === 0 ? (
                <div className="text-center py-20 bg-[#141414] rounded-2xl border border-white/5 p-8">
                  <SearchX size={52} className="mx-auto text-neutral-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Không tìm thấy nghệ sĩ nào
                  </h3>
                  <p className="text-spotify-sub max-w-md mx-auto text-sm">
                    Không có nghệ sĩ nào khớp với từ khóa "{keyword}".
                  </p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {individualArtists.map((artist) => (
                      <ArtistCard
                        key={artist.id}
                        artist={artist}
                        onPlayClick={handlePlayArtist}
                      />
                    ))}
                  </div>

                  {/* Phân trang */}
                  <Pagination
                    currentPage={pageParam}
                    totalPages={artistsTotalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB 4: ALBUM (ALBUMS) - TÍCH HỢP API TÌM KIẾM RIÊNG LẺ
             ===================================================================== */}
          {activeTab === "albums" && (
            <div className="space-y-6">
              {/* Header điều khiển sắp xếp và thống kê */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141414] p-4 rounded-xl border border-white/5">
                <span className="text-xs sm:text-sm text-neutral-400">
                  Tìm thấy{" "}
                  <strong className="text-white">
                    {albumsTotalElements.toLocaleString("vi-VN")}
                  </strong>{" "}
                  album phù hợp
                </span>

                <div className="flex items-center gap-2">
                  <ArrowUpDown size={14} className="text-spotify-sub" />
                  <span className="text-xs text-spotify-sub">Sắp xếp:</span>
                  <select
                    value={albumSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-[#202020] hover:bg-[#282828] text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 outline-none cursor-pointer transition-colors"
                  >
                    {ALBUM_SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#181818]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoadingAlbumsSearch ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <SkeletonCard key={i} isArtist={false} />
                  ))}
                </div>
              ) : isErrorAlbumsSearch ? (
                <div className="p-8 rounded-2xl bg-red-950/40 border border-red-800/60 text-center">
                  <AlertCircle size={40} className="mx-auto text-red-400 mb-2" />
                  <h3 className="text-lg font-bold text-white mb-1">
                    Lỗi tải danh sách album
                  </h3>
                  <p className="text-red-200 text-sm">
                    Không thể tìm kiếm album lúc này. Vui lòng thử lại.
                  </p>
                </div>
              ) : individualAlbums.length === 0 ? (
                <div className="text-center py-20 bg-[#141414] rounded-2xl border border-white/5 p-8">
                  <SearchX size={52} className="mx-auto text-neutral-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Không tìm thấy album nào
                  </h3>
                  <p className="text-spotify-sub max-w-md mx-auto text-sm">
                    Không có album nào khớp với từ khóa "{keyword}".
                  </p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {individualAlbums.map((album) => (
                      <AlbumCard
                        key={album.id}
                        album={album}
                        onPlayClick={handlePlayAlbum}
                      />
                    ))}
                  </div>

                  {/* Phân trang */}
                  <Pagination
                    currentPage={pageParam}
                    totalPages={albumsTotalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
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
                  <SkeletonRow key={i} />
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
