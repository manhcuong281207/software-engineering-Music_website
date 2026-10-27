import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Loader2,
  Play,
  Pause,
  AlertCircle,
  RefreshCw,
  SearchX,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { searchCatalogApi } from '../../api/catalog/public';
import { useDebounce } from '../../hooks/useDebounce';
import { usePlayerStore } from '../../store/usePlayerStore';
import { CoverImage } from '../ui/CoverImage';

/**
 * Định dạng thời lượng bài hát (giây hoặc mili-giây -> mm:ss)
 */
const formatDuration = (val) => {
  if (!val && val !== 0) return '--:--';
  const totalSeconds = val > 1000 ? Math.floor(val / 1000) : Math.floor(val);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Component Tìm kiếm hoàn chỉnh gồm:
 * - Ô nhập từ khóa (Search Input)
 * - Kỹ thuật Debounce để giảm thiểu request API
 * - Popup danh sách gợi ý kết quả (Search Suggestions Popup)
 * - Xử lý đầy đủ: Loading (Skeleton), Error (Retry), Empty Results và hiển thị kết quả phân loại (Top Result, Songs, Artists, Albums)
 */
export const SearchAutocomplete = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === '/search' || location.pathname === '/browse';

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [keyword, setKeyword] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') || '';
    }
    return '';
  });
  const [isOpen, setIsOpen] = useState(false);

  // Áp dụng kỹ thuật Debounce: chỉ gọi API sau khi người dùng ngừng gõ 350ms
  const debouncedKeyword = useDebounce(keyword, 350);

  const { playSongWithContext, currentSong, isPlaying } = usePlayerStore();

  // Đồng bộ giá trị input từ URL khi người dùng ở trang /search?q=... và URL thay đổi từ ngoài
  useEffect(() => {
    if (isSearchPage) {
      const q = new URLSearchParams(location.search).get('q') || '';
      if (q !== keyword) {
        setKeyword(q);
      }
    }
  }, [location.pathname, location.search, isSearchPage, keyword]);

  // Khi đang ở trang /search, tự động đồng bộ debouncedKeyword lên URL query param để trang SearchPage cập nhật
  useEffect(() => {
    if (isSearchPage) {
      const currentQ = new URLSearchParams(location.search).get('q') || '';
      const cleanDebounced = debouncedKeyword.trim();
      if (cleanDebounced && cleanDebounced !== currentQ) {
        navigate(`/search?q=${encodeURIComponent(cleanDebounced)}`, { replace: true });
      } else if (!cleanDebounced && currentQ) {
        navigate('/search', { replace: true });
      }
    }
  }, [debouncedKeyword, isSearchPage, location.search, navigate]);

  // Đóng popup khi click ra bên ngoài container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gọi API tìm kiếm trong backend qua TanStack Query với debouncedKeyword
  const {
    data: searchResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['searchSuggestions', debouncedKeyword.trim()],
    queryFn: () => searchCatalogApi(debouncedKeyword.trim(), 5),
    enabled: debouncedKeyword.trim().length > 0,
    staleTime: 1000 * 60 * 2, // Cache 2 phút cho các từ khóa đã tra cứu
    retry: 1,
  });

  // Trích xuất dữ liệu kết quả từ response
  const searchResults = searchResponse?.data || searchResponse;
  const songs = Array.isArray(searchResults?.songs) ? searchResults.songs : [];
  const albums = Array.isArray(searchResults?.albums) ? searchResults.albums : [];
  const artists = Array.isArray(searchResults?.artists) ? searchResults.artists : [];
  const rawTopResult = searchResults?.topResult;

  // Chuẩn hóa dữ liệu cho Top Result
  const topResult = useMemo(() => {
    if (!rawTopResult) return null;
    const item = rawTopResult.item || rawTopResult;
    const type = rawTopResult.type || (item.stageName ? 'ARTIST' : item.albumType ? 'ALBUM' : 'SONG');
    const id = item.id || rawTopResult.id;
    const title = item.title || item.stageName || item.name || rawTopResult.title || 'Không có tên';
    const imageUrl = item.coverImage || item.avatarUrl || item.imageUrl || rawTopResult.imageUrl;
    let subtitle = rawTopResult.subtitle;

    if (!subtitle) {
      if (type === 'ARTIST') {
        subtitle = item.followerCount
          ? `${Number(item.followerCount).toLocaleString('vi-VN')} người theo dõi`
          : 'Nghệ sĩ';
      } else if (type === 'ALBUM') {
        subtitle = `${item.ownerName || 'Nghệ sĩ'} • ${item.albumType || 'Album'}`;
      } else {
        subtitle = item.ownerName ? `Bài hát • ${item.ownerName}` : 'Bài hát';
      }
    }

    return { id, type, item, title, imageUrl, subtitle };
  }, [rawTopResult]);

  // Đang gõ phím nhưng debounce chưa kích hoạt hoặc query đang load
  const isDebouncing = keyword.trim().length > 0 && keyword.trim() !== debouncedKeyword.trim();
  const showLoading = isLoading || isFetching || isDebouncing;

  const hasResults = Boolean(
    topResult || songs.length > 0 || albums.length > 0 || artists.length > 0
  );

  const showEmpty =
    !showLoading && !isError && debouncedKeyword.trim().length > 0 && !hasResults;

  // Xử lý thay đổi ô nhập từ khóa
  const handleInputChange = (e) => {
    const val = e.target.value;
    setKeyword(val);
    if (!isOpen && val.trim().length > 0) {
      setIsOpen(true);
    }
  };

  // Focus ô tìm kiếm: hiển thị lại gợi ý nếu đã có từ khóa
  const handleInputFocus = () => {
    if (keyword.trim().length > 0) {
      setIsOpen(true);
    }
  };

  // Xử lý bàn phím: Enter -> Điều hướng sang full SearchPage, Escape -> Đóng popup
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (keyword.trim()) {
        setIsOpen(false);
        navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Nút xóa từ khóa (X)
  const handleClear = () => {
    setKeyword('');
    setIsOpen(false);
    if (isSearchPage) {
      navigate('/search', { replace: true });
    }
    inputRef.current?.focus();
  };

  // Chọn phát một bài hát từ gợi ý
  const handlePlaySong = (song, e) => {
    e?.stopPropagation();
    const songList = songs.length > 0 ? songs : [song];
    const songIndex = songList.findIndex((s) => s.id === song.id);
    playSongWithContext(song, songList, songIndex !== -1 ? songIndex : 0);
    setIsOpen(false);
  };

  // Chọn nghệ sĩ -> Điều hướng trang nghệ sĩ
  const handleSelectArtist = (artistId) => {
    setIsOpen(false);
    navigate(`/artist/${artistId}`);
  };

  // Chọn album -> Điều hướng trang album
  const handleSelectAlbum = (albumId) => {
    setIsOpen(false);
    navigate(`/album/${albumId}`);
  };

  // Xem tất cả kết quả trên trang SearchPage
  const handleViewAllResults = () => {
    if (keyword.trim()) {
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Ô nhập từ khóa tìm kiếm */}
      <div className="relative w-full group">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-spotify-sub group-focus-within:text-white transition-colors"
        />

        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Bạn muốn nghe gì?"
          className="w-full bg-spotify-card hover:bg-spotify-card-hover text-spotify-text placeholder-spotify-sub rounded-full pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-white transition-all border border-white/5 text-sm"
          autoComplete="off"
          spellCheck="false"
        />

        {/* Trạng thái Spinner hoặc nút Xóa X */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {showLoading && (
            <Loader2
              size={16}
              className="animate-spin text-[#fa2d48] transition-opacity"
            />
          )}

          {keyword && (
            <button
              type="button"
              onClick={handleClear}
              className="text-spotify-sub hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* POPUP KẾT QUẢ GỢI Ý (Search Suggestions Popup) */}
      {isOpen && keyword.trim().length > 0 && (
        <div className="absolute left-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[480px] md:w-[540px] max-w-[92vw] bg-[#181818]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150">
          {/* Header thanh gợi ý */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-black/20 flex-shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-spotify-sub flex items-center gap-1.5">
              <Search size={13} className="text-[#fa2d48]" />
              Gợi ý tìm kiếm
            </span>
            <button
              onClick={handleViewAllResults}
              className="text-xs font-semibold text-[#fa2d48] hover:text-[#ff4b63] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
            >
              Xem tất cả
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Vùng nội dung cuộn */}
          <div className="p-3 overflow-y-auto scrollbar-thin space-y-4 flex-1">
            {/* TRƯỜNG HỢP 1: LOADING (SKELETON) */}
            {showLoading && (
              <div className="space-y-4 py-1">
                {/* Skeleton Top Result */}
                <div className="p-3 bg-white/5 rounded-xl flex items-center gap-3 animate-pulse">
                  <div className="w-14 h-14 bg-white/10 rounded-lg flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                  </div>
                </div>

                {/* Skeleton Song Rows */}
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded w-20 mb-2" />
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white/5 animate-pulse"
                    >
                      <div className="w-10 h-10 bg-white/10 rounded flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-white/10 rounded w-2/5" />
                        <div className="h-2.5 bg-white/5 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TRƯỜNG HỢP 2: LỖI KHI GỌI API */}
            {!showLoading && isError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 text-[#fa2d48] flex items-center justify-center mx-auto">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Đã xảy ra lỗi khi tìm kiếm
                  </p>
                  <p className="text-xs text-spotify-sub mt-0.5">
                    Không thể kết nối đến máy chủ hoặc máy chủ gặp sự cố.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fa2d48] hover:bg-[#ff4b63] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-md"
                >
                  <RefreshCw size={13} />
                  Thử lại
                </button>
              </div>
            )}

            {/* TRƯỜNG HỢP 3: KHÔNG CÓ KẾT QUẢ PHÙ HỢP */}
            {showEmpty && (
              <div className="py-8 px-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/5 text-spotify-sub flex items-center justify-center mx-auto">
                  <SearchX size={24} />
                </div>
                <h4 className="text-sm font-bold text-white">
                  Không tìm thấy kết quả cho "{debouncedKeyword}"
                </h4>
                <p className="text-xs text-spotify-sub max-w-xs mx-auto">
                  Hãy thử kiểm tra lại chính tả hoặc tìm kiếm tên bài hát, nghệ sĩ hoặc album khác.
                </p>
              </div>
            )}

            {/* TRƯỜNG HỢP 4: HIỂN THỊ KẾT QUẢ GỢI Ý */}
            {!showLoading && !isError && hasResults && (
              <div className="space-y-4">
                {/* 1. Kết quả hàng đầu (Top Result) */}
                {topResult && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-spotify-sub px-1 mb-1.5 block">
                      Kết quả hàng đầu
                    </span>
                    <div
                      onClick={() => {
                        if (topResult.type === 'ARTIST') {
                          handleSelectArtist(topResult.id);
                        } else if (topResult.type === 'ALBUM') {
                          handleSelectAlbum(topResult.id);
                        } else if (topResult.type === 'SONG') {
                          handlePlaySong(topResult.item || topResult);
                        }
                      }}
                      className="p-3 bg-[#222222] hover:bg-[#2a2a2a] rounded-xl flex items-center justify-between group transition-all duration-200 cursor-pointer border border-white/5 hover:border-white/10 shadow-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CoverImage
                          src={topResult.imageUrl}
                          alt={topResult.title}
                          isArtist={topResult.type === 'ARTIST'}
                          className={`w-14 h-14 object-cover flex-shrink-0 shadow-md ${
                            topResult.type === 'ARTIST' ? 'rounded-full' : 'rounded-lg'
                          }`}
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white group-hover:text-[#fa2d48] transition-colors truncate">
                            {topResult.title}
                          </h4>
                          <p className="text-xs text-spotify-sub truncate mt-0.5">
                            {topResult.subtitle}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/40 text-neutral-300 border border-white/10">
                            {topResult.type === 'ARTIST'
                              ? 'Nghệ sĩ'
                              : topResult.type === 'ALBUM'
                              ? 'Album'
                              : 'Bài hát'}
                          </span>
                        </div>
                      </div>

                      {topResult.type === 'SONG' ? (
                        <button
                          type="button"
                          onClick={(e) => handlePlaySong(topResult.item || topResult, e)}
                          className="w-9 h-9 rounded-full bg-[#fa2d48] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform flex-shrink-0 ml-2 cursor-pointer"
                          title="Phát bài hát"
                        >
                          <Play size={16} fill="currentColor" className="translate-x-0.5" />
                        </button>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 text-spotify-sub group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0 ml-2">
                          <ArrowRight size={15} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Danh sách Bài hát gợi ý */}
                {songs.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-spotify-sub px-1 mb-1.5 block">
                      Bài hát
                    </span>
                    <div className="space-y-1">
                      {songs.slice(0, 4).map((song, idx) => {
                        const isCurrentPlaying =
                          isPlaying && currentSong?.id === song.id;

                        return (
                          <div
                            key={song.id || idx}
                            onClick={() => handlePlaySong(song)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 group transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-neutral-800">
                                <CoverImage
                                  src={song.coverImage}
                                  alt={song.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  {isCurrentPlaying ? (
                                    <Pause size={16} className="text-white" fill="currentColor" />
                                  ) : (
                                    <Play size={16} className="text-white" fill="currentColor" />
                                  )}
                                </div>
                              </div>

                              <div className="min-w-0">
                                <p
                                  className={`text-sm font-semibold truncate ${
                                    isCurrentPlaying
                                      ? 'text-[#fa2d48]'
                                      : 'text-white group-hover:text-[#fa2d48]'
                                  } transition-colors`}
                                >
                                  {song.title}
                                </p>
                                <p className="text-xs text-spotify-sub truncate">
                                  {song.ownerName || 'Nghệ sĩ'}
                                </p>
                              </div>
                            </div>

                            <span className="text-xs text-spotify-sub font-mono flex-shrink-0 ml-3">
                              {formatDuration(song.durationSeconds)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Danh sách Nghệ sĩ gợi ý */}
                {artists.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-spotify-sub px-1 mb-1.5 block">
                      Nghệ sĩ
                    </span>
                    <div className="space-y-1">
                      {artists.slice(0, 3).map((artist, idx) => (
                        <div
                          key={artist.id || idx}
                          onClick={() => handleSelectArtist(artist.id)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 group transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <CoverImage
                              src={artist.avatarUrl}
                              alt={artist.stageName}
                              isArtist={true}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white/10"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white group-hover:text-[#fa2d48] truncate transition-colors">
                                {artist.stageName}
                              </p>
                              <p className="text-xs text-spotify-sub truncate">
                                Nghệ sĩ
                                {artist.followerCount
                                  ? ` • ${Number(artist.followerCount).toLocaleString('vi-VN')} người theo dõi`
                                  : ''}
                              </p>
                            </div>
                          </div>

                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-spotify-sub group-hover:text-white transition-colors flex-shrink-0">
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Danh sách Album gợi ý */}
                {albums.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-spotify-sub px-1 mb-1.5 block">
                      Album
                    </span>
                    <div className="space-y-1">
                      {albums.slice(0, 3).map((album, idx) => (
                        <div
                          key={album.id || idx}
                          onClick={() => handleSelectAlbum(album.id)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 group transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <CoverImage
                              src={album.coverImage}
                              alt={album.title}
                              className="w-10 h-10 rounded-md object-cover flex-shrink-0 shadow-sm"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white group-hover:text-[#fa2d48] truncate transition-colors">
                                {album.title}
                              </p>
                              <p className="text-xs text-spotify-sub truncate">
                                {album.albumType || 'Album'} • {album.ownerName || 'Nghệ sĩ'}
                              </p>
                            </div>
                          </div>

                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-spotify-sub group-hover:text-white transition-colors flex-shrink-0">
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer: Phím tắt Enter để xem toàn bộ kết quả */}
          <div className="px-4 py-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs text-spotify-sub flex-shrink-0">
            <span className="truncate">
              Nhấn{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px] border border-white/10">
                Enter
              </kbd>{' '}
              để xem đầy đủ kết quả
            </span>
            <button
              onClick={handleViewAllResults}
              className="text-neutral-300 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0 ml-2"
            >
              <span>Xem trang tìm kiếm</span>
              <CornerDownLeft size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
