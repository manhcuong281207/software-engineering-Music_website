import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Home, LogOut, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { logout as logoutApi } from '../api/users/auth';

// ── Avatar chữ cái đầu ────────────────────────────────────────────────────────
function AvatarIcon({ name, avatarUrl, size = 36 }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="rounded-full object-cover border-2 border-transparent group-hover:border-spotify-primary transition-colors"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div
      className="rounded-full bg-spotify-primary flex items-center justify-center font-bold text-white text-sm border-2 border-transparent group-hover:border-white transition-colors flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

// ── Dropdown menu người dùng ──────────────────────────────────────────────────
function UserDropdown({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <div className="absolute top-full right-0 mt-2 w-52 bg-[#282828] rounded-lg shadow-2xl border border-white/10 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header thông tin user */}
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-white font-semibold text-sm truncate">{user?.fullName || 'Người dùng'}</p>
        <p className="text-spotify-sub text-xs truncate mt-0.5">{user?.email}</p>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <User size={16} className="text-spotify-sub" />
          Trang cá nhân
        </button>
      </div>

      <div className="border-t border-white/10 py-1">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={16} className="text-spotify-sub" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

// ── Topbar chính ──────────────────────────────────────────────────────────────
export const Topbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshToken: storedRefreshToken, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      if (storedRefreshToken) {
        await logoutApi({ refreshToken: storedRefreshToken });
      }
    } catch {
      // Dù API lỗi vẫn logout ở client
    } finally {
      logout();
      toast.success('Đã đăng xuất thành công.');
      navigate('/');
    }
  };

  return (
    <header className="absolute top-0 left-0 w-full h-16 bg-spotify-base/80 backdrop-blur-md z-40 flex items-center justify-between px-6 transition-all rounded-t-lg">
      {/* Điều hướng & Tìm kiếm */}
      <div className="flex items-center gap-4 flex-1">
        {/* Nút Back/Forward */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" iconOnly onClick={() => navigate(-1)} className="bg-black/50" tooltip="Quay lại" tooltipPosition="bottom-left">
            <ChevronLeft size={20} />
          </Button>
          <Button variant="ghost" size="sm" iconOnly onClick={() => navigate(1)} className="bg-black/50" tooltip="Tiếp theo" tooltipPosition="bottom">
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Nút Home */}
        <Button variant="white" size="md" iconOnly onClick={() => navigate('/')} className="ml-2" tooltip="Trang chủ" tooltipPosition="bottom">
          <Home size={24} />
        </Button>

        {/* Thanh tìm kiếm */}
        <div className="relative max-w-sm w-full hidden md:block group">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-spotify-sub group-focus-within:text-white" />
          <input
            type="text"
            placeholder="Bạn muốn nghe gì?"
            className="w-full bg-spotify-card hover:bg-spotify-card-hover text-spotify-text placeholder-spotify-sub rounded-full pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-white transition-all border-none"
          />
        </div>
      </div>

      {/* Khu vực Auth */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          /* ─── Đã đăng nhập: Hiển thị avatar + tên + dropdown ─── */
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 group bg-black/30 hover:bg-black/50 rounded-full pl-1 pr-3 py-1 transition-colors"
              id="user-menu-button"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <AvatarIcon name={user?.fullName} avatarUrl={user?.avatarUrl} size={32} />
              <span className="hidden sm:block text-sm font-semibold text-white max-w-[120px] truncate">
                {user?.fullName || 'Người dùng'}
              </span>
              <ChevronDown
                size={16}
                className={`text-spotify-sub transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <UserDropdown user={user} onLogout={handleLogout} />
            )}
          </div>
        ) : (
          /* ─── Chưa đăng nhập: Nút Đăng ký + Đăng nhập ─── */
          <>
            <Button variant="secondary" size="md" className="hidden sm:flex" onClick={() => navigate('/register')}>
              Đăng ký
            </Button>
            <Button variant="white" size="md" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
