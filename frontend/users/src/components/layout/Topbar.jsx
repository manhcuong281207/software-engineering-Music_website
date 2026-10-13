import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Button from '../common/Button';

// Mock user
const MOCK_USER = {
  full_name: 'Nguyễn Văn A',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
};

export default function Topbar({ onSearch }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const mainEl = document.getElementById('main-content');
    if (!mainEl) return;
    const handler = () => setScrolled(mainEl.scrollTop > 20);
    mainEl.addEventListener('scroll', handler);
    return () => mainEl.removeEventListener('scroll', handler);
  }, []);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearchValue(v);
    onSearch?.(v);
  };

  const clearSearch = () => {
    setSearchValue('');
    onSearch?.('');
  };

  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-4 transition-all duration-300 ${
        scrolled
          ? 'bg-[#121212]/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      {/* Left: Navigation arrows (desktop) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="hidden md:flex w-8 h-8 bg-black/50 hover:bg-black/80 rounded-full items-center justify-center text-[#a7a7a7] hover:text-white transition-all duration-200"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="hidden md:flex w-8 h-8 bg-black/50 hover:bg-black/80 rounded-full items-center justify-center text-[#a7a7a7] hover:text-white transition-all duration-200"
        >
          <ChevronRight size={18} />
        </button>

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-7 h-7 bg-[#fa2d48] rounded-full flex items-center justify-center">
            <span className="text-white font-black text-xs">MC</span>
          </div>
          <span className="text-white font-bold text-base">Music</span>
        </div>
      </div>

      {/* Center: Search (visible on mobile toggle, always on md+) */}
      <div className={`flex-1 max-w-md mx-4 transition-all duration-300 ${showSearch ? 'block' : 'hidden md:block'}`}>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a7a7a7]"
          />
          <input
            type="text"
            placeholder="Tìm bài hát, nghệ sĩ, album..."
            value={searchValue}
            onChange={handleSearch}
            className="w-full bg-[#282828] text-white placeholder-[#a7a7a7] rounded-full pl-9 pr-9 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a7a7a7] hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Right: User actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile search toggle */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center text-[#a7a7a7] hover:text-white"
          onClick={() => setShowSearch((p) => !p)}
        >
          {showSearch ? <X size={20} /> : <Search size={20} />}
        </button>

        <button className="hidden md:flex w-9 h-9 items-center justify-center text-[#a7a7a7] hover:text-white transition-colors">
          <Bell size={18} />
        </button>

        {/* Avatar + name */}
        <div className="flex items-center gap-2 bg-[#282828] hover:bg-[#3d3d3d] transition-colors duration-200 rounded-full pl-0.5 pr-3 py-0.5 cursor-pointer">
          <img
            src={MOCK_USER.avatar_url}
            alt={MOCK_USER.full_name}
            className="w-8 h-8 rounded-full object-cover bg-[#fa2d48]/20"
          />
          <span className="hidden md:block text-sm font-semibold text-white max-w-[100px] truncate">
            {MOCK_USER.full_name.split(' ').slice(-1)[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
