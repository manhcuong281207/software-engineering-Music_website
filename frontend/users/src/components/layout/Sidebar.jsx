import { NavLink } from 'react-router-dom';
import {
  Home,
  Search,
  Library,
  Heart,
  PlusSquare,
  Music2,
  Radio,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Trang chủ', exact: true },
  { to: '/search', icon: Search, label: 'Tìm kiếm' },
  { to: '/library', icon: Library, label: 'Thư viện' },
];

const PLAYLISTS_MOCK = [
  'Nhạc Yêu Thích',
  'Chill Buổi Sáng',
  'Workout Mix',
  'Study Lofi',
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-[240px] min-w-[240px] h-full bg-[#121212] overflow-hidden">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#fa2d48] rounded-full flex items-center justify-center shadow-lg shadow-[#fa2d48]/30">
            <Music2 size={16} className="text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            MC <span className="text-[#fa2d48]">Music</span>
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="px-3 mb-6">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-md text-sm font-semibold transition-all duration-200 mb-1 ${
                isActive
                  ? 'text-white bg-[#282828]'
                  : 'text-[#a7a7a7] hover:text-white hover:bg-[#1a1a1a]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  className={isActive ? 'text-[#fa2d48]' : ''}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-6 border-t border-[#282828] mb-4" />

      {/* Library actions */}
      <div className="px-3 mb-4">
        <button className="flex items-center gap-4 px-3 py-3 rounded-md text-sm font-semibold text-[#a7a7a7] hover:text-white hover:bg-[#1a1a1a] transition-all duration-200 w-full">
          <PlusSquare size={22} />
          Tạo playlist mới
        </button>
        <button className="flex items-center gap-4 px-3 py-3 rounded-md text-sm font-semibold text-[#a7a7a7] hover:text-white hover:bg-[#1a1a1a] transition-all duration-200 w-full">
          <Heart size={22} className="text-[#fa2d48]" />
          Bài hát đã thích
        </button>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-[#282828] mb-4" />

      {/* Playlists */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 mb-2 text-xs font-bold text-[#6d6d6d] uppercase tracking-wider">
          Playlist của bạn
        </p>
        {PLAYLISTS_MOCK.map((name, i) => (
          <button
            key={i}
            className="w-full text-left px-3 py-2.5 text-sm text-[#a7a7a7] hover:text-white transition-colors duration-200 rounded-md hover:bg-[#1a1a1a] truncate"
          >
            {name}
          </button>
        ))}
      </div>
    </aside>
  );
}
