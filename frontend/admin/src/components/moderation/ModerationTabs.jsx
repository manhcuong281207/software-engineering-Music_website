import React from "react";
import { NavLink } from "react-router";
import { Music, Disc3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPendingSongsApi, getPendingAlbumsApi } from "../../api/catalog";

export const ModerationTabs = ({ activeTab }) => {
  // Fetch pending songs count
  const { data: songsRes } = useQuery({
    queryKey: ["adminPendingSongsCount"],
    queryFn: () => getPendingSongsApi({ page: 0, size: 1 }),
  });

  // Fetch pending albums count
  const { data: albumsRes } = useQuery({
    queryKey: ["adminPendingAlbumsCount"],
    queryFn: () => getPendingAlbumsApi({ page: 0, size: 1 }),
  });

  const pendingSongsCount = songsRes?.data?.totalElements ?? 0;
  const pendingAlbumsCount = albumsRes?.data?.totalElements ?? 0;

  return (
    <div className="flex items-center gap-2 p-1.5 bg-[#141414] border border-neutral-800/80 rounded-2xl w-fit">
      <NavLink
        to="/moderation/songs"
        className={({ isActive }) =>
          `flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            isActive || activeTab === "songs"
              ? "bg-[#fa2d48] text-white shadow-[0_2px_12px_rgba(250,45,72,0.35)]"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
          }`
        }
      >
        <Music size={16} />
        <span>Bài hát chờ duyệt</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === "songs"
              ? "bg-white/20 text-white"
              : "bg-neutral-800 text-neutral-300"
          }`}
        >
          {pendingSongsCount}
        </span>
      </NavLink>

      <NavLink
        to="/moderation/albums"
        className={({ isActive }) =>
          `flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            isActive || activeTab === "albums"
              ? "bg-[#fa2d48] text-white shadow-[0_2px_12px_rgba(250,45,72,0.35)]"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
          }`
        }
      >
        <Disc3 size={16} />
        <span>Album chờ duyệt</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === "albums"
              ? "bg-white/20 text-white"
              : "bg-neutral-800 text-neutral-300"
          }`}
        >
          {pendingAlbumsCount}
        </span>
      </NavLink>
    </div>
  );
};

export default ModerationTabs;

