import React from "react";
import { Menu, LogOut, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "../components/ui/Button";

export const Topbar = ({ onOpenSidebar, onOpenLogoutModal }) => {
  const { admin } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#121212]/90 backdrop-blur-md border-b border-neutral-800/70 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hệ thống trực tuyến</span>
        </div>
      </div>

      {/* Right: Admin Info & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 bg-neutral-900/80 px-3 py-1.5 rounded-full border border-neutral-800">
          <div className="w-7 h-7 rounded-full bg-[#fa2d48]/20 text-[#fa2d48] flex items-center justify-center font-bold text-xs">
            {admin?.fullName ? admin.fullName.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="text-left hidden md:block pr-1">
            <div className="text-xs font-bold text-white leading-tight">
              {admin?.fullName || "Quản trị viên"}
            </div>
            <div className="text-[10px] text-neutral-400">
              {admin?.email || "admin@mcmusic.com"}
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-[#fa2d48] bg-[#fa2d48]/10 px-2 py-0.5 rounded-full border border-[#fa2d48]/20">
            <ShieldCheck size={11} /> {admin?.role || "SUPER_ADMIN"}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenLogoutModal}
          tooltip="Đăng xuất"
          tooltipPosition="bottom"
          className="text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
