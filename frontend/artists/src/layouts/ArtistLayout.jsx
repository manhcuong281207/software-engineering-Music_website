import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  UserCircle2,
  Music2,
  Disc3,
  ExternalLink,
  LogOut,
  Radio,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useArtistAuthStore } from "../store/useArtistAuthStore";
import { logoutApi } from "../api/auth";
import { ArtistAvatar } from "../components/ui/ArtistAvatar";
import { LogoutModal } from "../components/ui/LogoutModal";
import { toast } from "sonner";

export const ArtistLayout = () => {
  const navigate = useNavigate();
  const { artist, refreshToken, logout } = useArtistAuthStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch {
      // Bỏ qua lỗi nếu token đã hết hạn
    } finally {
      logout();
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      toast.success("Đã đăng xuất thành công");
      navigate("/login");
    }
  };

  const navLinks = [
    {
      to: "/",
      label: "Trang chủ / Tổng quan",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/profile",
      label: "Hồ sơ nghệ sĩ",
      icon: UserCircle2,
      end: false,
    },
    {
      to: "/songs",
      label: "Quản lý bài hát",
      icon: Music2,
      badge: "Giai đoạn tiếp theo",
      disabled: true,
    },
    {
      to: "/albums",
      label: "Quản lý Album",
      icon: Disc3,
      badge: "Giai đoạn tiếp theo",
      disabled: true,
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c0c0e] text-white">
      {/* ─── SIDEBAR DESKTOP ──────────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-64 flex-col justify-between border-r border-neutral-800/80 bg-[#121215] p-5">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fa2d48] to-[#ff6b81] shadow-lg shadow-[#fa2d48]/30">
              <Radio className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white">MC MUSIC</span>
              <span className="block text-[10px] font-bold tracking-widest text-[#fa2d48] uppercase">
                For Artists
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;

              if (item.disabled) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-neutral-500 cursor-not-allowed select-none opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/25"
                        : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Portal Switcher to Public User Web */}
          <div className="mt-8 rounded-xl border border-neutral-800/60 bg-[#17171c]/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
              <Sparkles className="h-4 w-4 text-[#fa2d48]" />
              <span>Trang nghe nhạc công khai</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-400">
              Khám phá trải nghiệm dưới góc nhìn của thính giả.
            </p>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-800/80 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700"
            >
              <span>Mở User Web</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* User Mini Profile & Logout */}
        <div className="rounded-xl border border-neutral-800 bg-[#16161a] p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <ArtistAvatar
                src={artist?.avatarUrl}
                alt={artist?.stageName}
                size="sm"
              />
              <div className="overflow-hidden">
                <p className="truncate text-xs font-bold text-white">
                  {artist?.stageName || "Nghệ sĩ"}
                </p>
                <p className="truncate text-[10px] text-neutral-400">
                  {artist?.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              title="Đăng xuất"
              className="rounded-lg p-2 text-neutral-400 hover:bg-red-500/10 hover:text-[#fa2d48] transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT WRAPPER ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar for Mobile & Tablet */}
        <header className="flex h-16 items-center justify-between border-b border-neutral-800/80 bg-[#121215] px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-neutral-300 hover:bg-neutral-800 md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <span className="text-sm font-bold text-neutral-400 md:hidden">
              MC Music for Artists
            </span>
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Trạng thái tài khoản: Đang hoạt động</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {artist?.id && (
              <a
                href={`http://localhost:5173/artist/${artist.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-neutral-700/80 bg-neutral-800/60 px-4 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-500 hover:text-white transition"
              >
                <span>Xem trang công khai</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            <NavLink
              to="/profile"
              className="flex items-center gap-2.5 rounded-full bg-neutral-800/50 py-1 pl-1 pr-3 hover:bg-neutral-800 transition"
            >
              <ArtistAvatar
                src={artist?.avatarUrl}
                alt={artist?.stageName}
                size="sm"
              />
              <span className="hidden sm:inline text-xs font-bold text-white">
                {artist?.stageName || "Hồ sơ của tôi"}
              </span>
            </NavLink>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="border-b border-neutral-800 bg-[#141418] p-4 md:hidden animate-fadeIn">
            <nav className="space-y-2">
              {navLinks
                .filter((i) => !i.disabled)
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold ${
                        isActive ? "bg-[#fa2d48] text-white" : "text-neutral-400"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </div>
        )}

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-[#15151a] to-[#0b0b0d]">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
};

