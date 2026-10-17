import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Library, 
  FolderPlus, 
  AlertCircle, 
  RefreshCw, 
  Lock,
  Globe
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PlaylistCard, SkeletonPlaylistCard } from '../components/music/PlaylistCard';
import { getUserPlaylists } from '../api/users/playlist';
import { useAuthStore } from '../store/useAuthStore';
import { usePlaylistModalStore } from '../store/usePlaylistModalStore';
import { showLoginToast } from '../utils/toastUtils';

export const LibraryPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openCreate } = usePlaylistModalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'public' | 'private'

  // Fetch danh sách playlist từ API
  const {
    data: playlists = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['userPlaylists'],
    queryFn: getUserPlaylists,
    enabled: isAuthenticated,
  });

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      showLoginToast('tạo danh sách phát mới', () => navigate('/login'));
      return;
    }
    openCreate();
  };

  // Lọc playlist theo từ khóa và chế độ hiển thị
  const filteredPlaylists = useMemo(() => {
    return playlists.filter((pl) => {
      const matchesSearch =
        !searchQuery.trim() ||
        pl.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (pl.description && pl.description.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      if (!matchesSearch) return false;

      if (filterType === 'public') return pl.isPublic;
      if (filterType === 'private') return !pl.isPublic;
      return true;
    });
  }, [playlists, searchQuery, filterType]);

  // Nếu người dùng chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-spotify-sub mb-4">
          <Library size={36} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Thư viện của bạn</h2>
        <p className="text-spotify-sub text-sm max-w-md mb-6">
          Đăng nhập để xem danh sách phát, bài hát đã lưu và những nội dung cá nhân hóa dành riêng cho bạn.
        </p>
        <Button variant="white" size="md" onClick={() => navigate('/login')}>
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full pb-10">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-spotify-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Library size={16} />
            <span>Thư viện cá nhân</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Danh sách phát của bạn
          </h1>
          <p className="text-spotify-sub text-sm mt-0.5">
            Quản lý, tạo mới và thưởng thức các playlist cá nhân hóa
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleCreateClick}
            className="shadow-[0_8px_20px_rgba(250,45,72,0.35)]"
          >
            <Plus size={20} className="mr-1.5" />
            Tạo playlist
          </Button>
        </div>
      </div>

      {/* ── CONTROLS: Search & Filter Chips ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-spotify-sub" />
          <input
            type="text"
            placeholder="Tìm kiếm trong danh sách phát..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-spotify-card hover:bg-spotify-card-hover border border-white/5 focus:border-white/20 rounded-full text-white placeholder-spotify-sub text-sm outline-none focus:ring-2 focus:ring-spotify-primary/40 transition"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-white text-black'
                : 'bg-white/5 text-spotify-sub hover:text-white hover:bg-white/10'
            }`}
          >
            Tất cả ({playlists.length})
          </button>
          <button
            onClick={() => setFilterType('public')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              filterType === 'public'
                ? 'bg-white text-black'
                : 'bg-white/5 text-spotify-sub hover:text-white hover:bg-white/10'
            }`}
          >
            <Globe size={13} />
            Công khai
          </button>
          <button
            onClick={() => setFilterType('private')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              filterType === 'private'
                ? 'bg-white text-black'
                : 'bg-white/5 text-spotify-sub hover:text-white hover:bg-white/10'
            }`}
          >
            <Lock size={13} />
            Riêng tư
          </button>

          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => refetch()}
            disabled={isFetching}
            className="ml-auto"
            tooltip="Làm mới danh sách"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* ── API ERROR STATE ─────────────────────────────────────────────────── */}
      {isError && (
        <div className="p-4 mb-6 bg-red-950/40 border border-red-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={22} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold text-sm">
                Không thể tải danh sách playlist từ máy chủ
              </p>
              <p className="text-xs text-red-200/80 mt-0.5">
                {error?.response?.data?.message || error?.message || 'Lỗi kết nối API Gateway (GET /api/user/playlists).'}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            className="flex-shrink-0 border-red-500/40 hover:border-red-400 text-xs"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Thử lại
          </Button>
        </div>
      )}

      {/* ── LOADING SKELETONS ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonPlaylistCard key={i} />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        /* ── EMPTY STATE ─────────────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center p-12 my-6 bg-spotify-card/40 border border-white/5 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-spotify-primary/10 border border-spotify-primary/20 flex items-center justify-center text-spotify-primary mb-4">
            <FolderPlus size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Chưa có danh sách phát nào
          </h3>
          <p className="text-spotify-sub text-sm max-w-sm mb-5">
            Tạo danh sách phát đầu tiên để lưu lại những bài hát bạn yêu thích và nghe bất cứ khi nào.
          </p>
          <Button variant="primary" size="md" onClick={handleCreateClick}>
            <Plus size={18} className="mr-1.5" />
            Tạo danh sách phát đầu tiên
          </Button>
        </div>
      ) : filteredPlaylists.length === 0 ? (
        /* ── SEARCH NO RESULTS ───────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center p-12 text-center text-spotify-sub">
          <Search size={36} className="opacity-30 mb-2" />
          <p className="text-base font-medium text-white mb-1">
            Không tìm thấy playlist phù hợp
          </p>
          <p className="text-xs">
            Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        /* ── PLAYLISTS GRID ──────────────────────────────────────────────── */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredPlaylists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      )}
    </div>
  );
};
