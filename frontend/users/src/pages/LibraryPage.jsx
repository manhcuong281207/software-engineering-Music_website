import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Library, Music, AlertCircle, RefreshCw } from 'lucide-react';
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

  const {
    data: playlists = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['userPlaylists'],
    queryFn: () => getUserPlaylists({ page: 0, size: 50 }),
    enabled: isAuthenticated,
  });

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      showLoginToast('tạo danh sách phát mới', () => navigate('/login'));
      return;
    }
    openCreate();
  };

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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="p-4 rounded-full bg-[#fa2d48]/10 text-[#fa2d48]">
          <Library size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white">Thư viện của bạn</h2>
        <p className="text-sm text-neutral-400 max-w-sm">
          Đăng nhập để xem danh sách phát, bài hát yêu thích và nghệ sĩ bạn theo dõi.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/login')}>
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full p-4 sm:p-8 pb-28 gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#fa2d48]/15 text-[#fa2d48]">
            <Library size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Thư viện của bạn
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Quản lý tất cả danh sách phát bạn đã tạo
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleCreateClick}
          className="shadow-lg shadow-[#fa2d48]/25 w-full sm:w-auto"
        >
          <Plus size={18} className="mr-1.5" />
          Tạo danh sách phát
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm kiếm trong danh sách phát..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#fa2d48] transition text-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'public', label: 'Công khai' },
            { id: 'private', label: 'Riêng tư' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                filterType === tab.id
                  ? 'bg-white text-black'
                  : 'bg-[#242424] text-neutral-300 hover:bg-[#2e2e2e]'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition ml-1"
            title="Làm mới"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-[#fa2d48]' : ''} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {isError && (
        <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-500/20 rounded-xl text-red-200 text-sm">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
          <span className="flex-1">
            {error?.message || 'Có lỗi xảy ra khi tải danh sách phát.'}
          </span>
          <Button variant="dark" size="sm" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Playlists Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonPlaylistCard key={i} />
          ))}
        </div>
      ) : filteredPlaylists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
          <div className="p-4 rounded-full bg-[#fa2d48]/10 text-[#fa2d48] mb-3">
            <Music size={36} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {searchQuery
              ? `Không tìm thấy danh sách phát phù hợp với "${searchQuery}"`
              : 'Chưa có danh sách phát nào'}
          </h3>
          <p className="text-sm text-neutral-400 max-w-sm mb-6">
            {searchQuery
              ? 'Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.'
              : 'Tạo danh sách phát đầu tiên để lưu lại những bản nhạc yêu thích của bạn!'}
          </p>
          {!searchQuery && (
            <Button variant="primary" size="md" onClick={openCreate}>
              <Plus size={18} className="mr-1.5" />
              Tạo danh sách phát ngay
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPlaylists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      )}
    </div>
  );
};
