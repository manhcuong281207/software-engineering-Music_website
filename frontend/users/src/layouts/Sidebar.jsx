import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Library,
  Plus,
  List,
  ChevronLeft,
  ChevronRight,
  Music,
  MoreVertical,
  Edit3,
  Trash2,
  ListPlus,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/useAuthStore";
import { usePlaylistModalStore } from "../store/usePlaylistModalStore";
import { getUserPlaylists } from "../api/users/playlist";
import { showLoginToast } from "../utils/toastUtils";

const filters = ["Playlist", "Album", "Nghệ sĩ"];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openCreate, openEdit, openDelete, openAddSong } = usePlaylistModalStore();

  const [width, setWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Fetch playlist thật của user
  const { data: playlists = [], isLoading: isPlaylistsLoading } = useQuery({
    queryKey: ["userPlaylists"],
    queryFn: () => getUserPlaylists({ page: 0, size: 50 }),
    enabled: isAuthenticated,
  });

  const handleProtectedAction = (actionName, cb) => {
    if (!isAuthenticated) {
      showLoginToast(actionName, () => navigate('/login'));
      return false;
    }
    if (cb) cb();
    return true;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      let newWidth = e.clientX - 8;
      if (newWidth < 280) newWidth = 280;
      if (newWidth > 420) newWidth = 420;
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    } else {
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // Click outside to close context menu
  useEffect(() => {
    const handleCloseMenu = () => setActiveMenuId(null);
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, []);

  // --- Scroll Logic cho Filters ---
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  useEffect(() => {
    handleScroll();
  }, [width]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -150 : 150;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Filter playlists
  const visiblePlaylists = playlists.filter((pl) => {
    if (!sidebarSearch.trim()) return true;
    return pl.name.toLowerCase().includes(sidebarSearch.toLowerCase().trim());
  });

  return (
    <aside
      className="flex-shrink-0 flex flex-col gap-2 h-full z-10 relative group"
      style={{ width: `${width}px` }}
    >
      {/* Library Container */}
      <div className="bg-spotify-base rounded-lg flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2 text-spotify-sub font-bold">
          <div
            onClick={() => navigate('/library')}
            className="flex items-center gap-2 flex-1 min-w-0 hover:text-white transition cursor-pointer"
            title="Xem toàn bộ thư viện"
          >
            <Library size={24} className="flex-shrink-0" />
            <span className="text-base truncate">Thư viện</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <Button
              variant="dark"
              size="sm"
              tooltip="Tạo danh sách phát mới"
              tooltipPosition="bottom-right"
              onClick={() => handleProtectedAction("tạo danh sách phát mới", openCreate)}
            >
              <Plus size={16} />
              Tạo
            </Button>
          </div>
        </div>

        {/* Filters */}
        {isAuthenticated && (
          <div className="relative group/filter flex-shrink-0">
            {showLeft && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-spotify-base from-30% to-transparent z-[5] pointer-events-none" />
                <Button
                  variant="glass"
                  size="sm"
                  iconOnly
                  onClick={() => scroll("left")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                >
                  <ChevronLeft size={20} />
                </Button>
              </>
            )}

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex items-center gap-2 px-4 py-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {filters.map((filter) => (
                <Button key={filter} variant="dark" size="sm">
                  {filter}
                </Button>
              ))}
            </div>

            {showRight && (
              <>
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-spotify-base from-30% to-transparent z-[5] pointer-events-none" />
                <Button
                  variant="glass"
                  size="sm"
                  iconOnly
                  onClick={() => scroll("right")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                >
                  <ChevronRight size={20} />
                </Button>
              </>
            )}
          </div>
        )}

        {/* Sub-header (Search & Sort) */}
        {isAuthenticated && (
          <div className="flex items-center justify-between px-4 py-2 flex-shrink-0 mt-1 h-10">
            {isSearchExpanded ? (
              <div className="relative flex items-center bg-[#2a2a2a] rounded-md h-8 px-2 flex-1 mr-2">
                <Search size={16} className="text-spotify-sub flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Tìm kiếm trong Thư viện"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-sm ml-2 w-full placeholder-spotify-sub"
                  onBlur={() => {
                    if (!sidebarSearch.trim()) setIsSearchExpanded(false);
                  }}
                />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                onClick={() => setIsSearchExpanded(true)}
                tooltip="Tìm kiếm trong thư viện"
                tooltipPosition="bottom-left"
              >
                <Search size={18} />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="px-2 hover:bg-transparent hover:scale-105 flex-shrink-0"
              tooltip="Sắp xếp"
              tooltipPosition="bottom-right"
            >
              {!isSearchExpanded && <span>Gần đây</span>}
              <List size={18} />
            </Button>
          </div>
        )}

        {/* List Items */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2">
          {isAuthenticated ? (
            isPlaylistsLoading ? (
              <div className="flex flex-col gap-2 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-lg bg-[#242424] flex-shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="w-3/4 h-3.5 bg-[#242424] rounded" />
                      <div className="w-1/2 h-2.5 bg-[#242424] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visiblePlaylists.length === 0 ? (
              <div className="bg-[#242424] rounded-lg p-5 mt-2 flex flex-col gap-4 text-white">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-base">Tạo danh sách phát đầu tiên của bạn</span>
                  <span className="text-sm font-medium text-neutral-400">Rất dễ! Bắt đầu lưu lại nhạc bạn yêu thích</span>
                </div>
                <div className="mt-1">
                  <Button
                    variant="white"
                    size="sm"
                    className="font-bold text-black rounded-full px-4 w-max"
                    onClick={() => handleProtectedAction("tạo danh sách phát mới", openCreate)}
                  >
                    Tạo danh sách phát
                  </Button>
                </div>
              </div>
            ) : (
              visiblePlaylists.map((pl) => {
                const isActive = location.pathname === `/playlist/${pl.id}`;

                return (
                  <div
                    key={pl.id}
                    onClick={() => navigate(`/playlist/${pl.id}`)}
                    className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer group transition-colors relative ${
                      isActive ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-md bg-[#282828] border border-white/5 flex items-center justify-center overflow-hidden">
                        {pl.coverImage ? (
                          <img
                            src={pl.coverImage}
                            alt={pl.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music size={20} className="text-[#fa2d48]" />
                        )}
                      </div>

                      {/* Text Content */}
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isActive ? 'text-[#fa2d48]' : 'text-white'
                          }`}
                        >
                          {pl.name}
                        </span>
                        <span className="text-xs text-spotify-sub truncate mt-0.5">
                          Danh sách phát • {pl.ownerName || 'Bạn'}
                        </span>
                      </div>
                    </div>

                    {/* Context menu button */}
                    <div className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === pl.id ? null : pl.id);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === pl.id && (
                        <div
                          className="absolute right-0 top-full mt-1 w-40 bg-[#282828] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              openAddSong(pl);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-white/10 text-left transition"
                          >
                            <ListPlus size={14} />
                            Thêm bài hát
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              openEdit(pl);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-white/10 text-left transition"
                          >
                            <Edit3 size={14} />
                            Đổi tên / Sửa
                          </button>
                          <div className="h-px bg-white/10 my-1" />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              openDelete(pl);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 text-left transition"
                          >
                            <Trash2 size={14} />
                            Xóa playlist
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <div className="bg-[#242424] rounded-lg p-5 mt-2 flex flex-col gap-4 text-white">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-base">Tạo danh sách phát đầu tiên của bạn</span>
                <span className="text-sm font-medium">Rất dễ! Chúng tôi sẽ giúp bạn</span>
              </div>
              <div className="mt-1">
                <Button
                  variant="white"
                  size="sm"
                  className="font-bold text-black rounded-full px-4 w-max"
                  onClick={() => handleProtectedAction("tạo danh sách phát mới", openCreate)}
                >
                  Tạo danh sách phát
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resizer Handle */}
      <div
        className="absolute top-0 -right-2 w-4 h-full cursor-col-resize z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
      >
        <div
          className={`h-full w-[2px] transition-colors ${
            isResizing ? "bg-white/60" : "hover:bg-white/30"
          }`}
        />
      </div>
    </aside>
  );
};
