import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  Users,
  Mic2,
  Music,
  Disc3,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { getUsersApi } from "../api/users";
import { getArtistsApi } from "../api/artists";
import { getPendingSongsApi, getPendingAlbumsApi } from "../api/catalog";
import { Button } from "../components/ui/Button";
import { formatNumber } from "../utils/formatters";
import { useAuthStore } from "../store/useAuthStore";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const admin = useAuthStore((state) => state.admin);

  // 1. Fetch Users Count
  const { data: usersRes, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["adminUsersCount"],
    queryFn: () => getUsersApi({ page: 0, size: 1 }),
  });

  // 2. Fetch Artists Count
  const { data: artistsRes, isLoading: isLoadingArtists } = useQuery({
    queryKey: ["adminArtistsCount"],
    queryFn: () => getArtistsApi({ page: 0, size: 1 }),
  });

  // 3. Fetch Pending Songs Count
  const { data: pendingSongsRes, isLoading: isLoadingSongs } = useQuery({
    queryKey: ["adminPendingSongsCount"],
    queryFn: () => getPendingSongsApi({ page: 0, size: 5 }),
  });

  // 4. Fetch Pending Albums Count
  const { data: pendingAlbumsRes, isLoading: isLoadingAlbums } = useQuery({
    queryKey: ["adminPendingAlbumsCount"],
    queryFn: () => getPendingAlbumsApi({ page: 0, size: 5 }),
  });

  const totalUsers = usersRes?.data?.totalElements ?? 0;
  const totalArtists = artistsRes?.data?.totalElements ?? 0;
  const pendingSongsCount = pendingSongsRes?.data?.totalElements ?? 0;
  const pendingAlbumsCount = pendingAlbumsRes?.data?.totalElements ?? 0;

  const STAT_CARDS = [
    {
      title: "Tổng người dùng",
      value: totalUsers,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      path: "/users",
      isLoading: isLoadingUsers,
    },
    {
      title: "Tổng nghệ sĩ",
      value: totalArtists,
      icon: Mic2,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      path: "/artists",
      isLoading: isLoadingArtists,
    },
    {
      title: "Bài hát chờ duyệt",
      value: pendingSongsCount,
      icon: Music,
      color: "text-[#fa2d48]",
      bgColor: "bg-[#fa2d48]/10",
      borderColor: "border-[#fa2d48]/20",
      path: "/moderation/songs",
      isLoading: isLoadingSongs,
    },
    {
      title: "Album chờ duyệt",
      value: pendingAlbumsCount,
      icon: Disc3,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      path: "/moderation/albums",
      isLoading: isLoadingAlbums,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── 1. WELCOME BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#200d14] via-[#160a0f] to-[#121212] border border-[#fa2d48]/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fa2d48]/15 text-[#fa2d48] border border-[#fa2d48]/30 mb-3">
              <Sparkles size={13} /> Bảng điều khiển Quản trị viên
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Xin chào, {admin?.fullName || "Quản trị viên"}!
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
              Chào mừng bạn đến với trung tâm giám sát và điều hành nền tảng MC Music.
              Theo dõi người dùng, quản lý đối tác nghệ sĩ và kiểm duyệt nội dung phát hành.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/moderation/songs")}
              className="gap-2 shadow-[0_4px_16px_rgba(250,45,72,0.35)]"
            >
              <Clock size={16} /> Duyệt bài hát ({pendingSongsCount})
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate("/users")}
            >
              Quản lý Users
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. STATS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {STAT_CARDS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(stat.path)}
              className="group p-5 sm:p-6 rounded-2xl bg-[#181818] border border-neutral-800/80 hover:border-neutral-700 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${stat.bgColor} ${stat.color} border ${stat.borderColor} flex items-center justify-center`}
                >
                  <Icon size={24} />
                </div>
                <span className="text-xs text-neutral-500 group-hover:text-white transition-colors flex items-center gap-1">
                  Xem <ArrowRight size={13} />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {stat.isLoading ? "..." : formatNumber(stat.value)}
              </div>
              <div className="text-xs font-semibold text-neutral-400 mt-1">
                {stat.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. PENDING SUMMARY SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Songs */}
        <div className="p-6 rounded-2xl bg-[#181818] border border-neutral-800/80">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-4">
            <div className="flex items-center gap-2">
              <Music size={18} className="text-[#fa2d48]" />
              <h2 className="text-base font-bold text-white">
                Bài hát cần duyệt gần đây
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/moderation/songs")}
              className="text-xs"
            >
              Xem tất cả <ArrowRight size={13} />
            </Button>
          </div>

          {isLoadingSongs ? (
            <div className="space-y-3 py-4 text-center text-xs text-neutral-500">
              Đang tải danh sách chờ duyệt...
            </div>
          ) : pendingSongsRes?.data?.content?.length > 0 ? (
            <div className="divide-y divide-neutral-800/60">
              {pendingSongsRes.data.content.slice(0, 4).map((song) => (
                <div
                  key={song.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {song.ownerName || "Chưa có nghệ danh"}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                    Chờ duyệt
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
              <CheckCircle2 size={24} className="text-emerald-500/60" />
              <span>Không có bài hát nào đang chờ duyệt!</span>
            </div>
          )}
        </div>

        {/* Pending Albums */}
        <div className="p-6 rounded-2xl bg-[#181818] border border-neutral-800/80">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-4">
            <div className="flex items-center gap-2">
              <Disc3 size={18} className="text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Album cần duyệt gần đây
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/moderation/albums")}
              className="text-xs"
            >
              Xem tất cả <ArrowRight size={13} />
            </Button>
          </div>

          {isLoadingAlbums ? (
            <div className="space-y-3 py-4 text-center text-xs text-neutral-500">
              Đang tải danh sách album...
            </div>
          ) : pendingAlbumsRes?.data?.content?.length > 0 ? (
            <div className="divide-y divide-neutral-800/60">
              {pendingAlbumsRes.data.content.slice(0, 4).map((album) => (
                <div
                  key={album.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {album.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {album.ownerName || "Nghệ sĩ"} • {album.albumType || "ALBUM"}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                    Chờ duyệt
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
              <CheckCircle2 size={24} className="text-emerald-500/60" />
              <span>Không có album nào đang chờ duyệt!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
