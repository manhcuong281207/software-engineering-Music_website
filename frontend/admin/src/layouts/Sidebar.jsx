import React from "react";
import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  Mic2,
  Music,
  Disc3,
  Shield,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Tổng quan",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/users",
    label: "Người dùng",
    icon: Users,
  },
  {
    to: "/artists",
    label: "Nghệ sĩ",
    icon: Mic2,
  },
  {
    to: "/moderation/songs",
    label: "Duyệt bài hát",
    icon: Music,
  },
  {
    to: "/moderation/albums",
    label: "Duyệt album",
    icon: Disc3,
  },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#121212] border-r border-neutral-800/70 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo & Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-800/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fa2d48] flex items-center justify-center shadow-[0_2px_12px_rgba(250,45,72,0.4)]">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <span className="font-black text-white text-base tracking-wide">
                MC MUSIC
              </span>
              <span className="block text-[10px] font-bold text-[#fa2d48] tracking-widest uppercase -mt-1">
                Admin Portal
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto scrollbar-thin">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Hệ thống quản trị
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#fa2d48] text-white shadow-[0_4px_14px_rgba(250,45,72,0.35)]"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/70"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-neutral-800/70 text-center">
          <p className="text-[11px] text-neutral-500">
            MC Music Admin Platform v1.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

