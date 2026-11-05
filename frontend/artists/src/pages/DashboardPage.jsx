import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  Headphones,
  Heart,
  Users,
  Music,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from "lucide-react";
import { getArtistDashboardApi } from "../api/artist";
import { getArtistSongsApi } from "../api/catalog";
import { useArtistAuthStore } from "../store/useArtistAuthStore";
import { StatCard } from "../components/ui/StatCard";
import { Button } from "../components/ui/Button";
import { ArtistAvatar } from "../components/ui/ArtistAvatar";

export const DashboardPage = () => {
  const { artist } = useArtistAuthStore();

  // 1. Fetch dữ liệu Thống kê Dashboard
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    isError: isErrorDashboard,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["artistDashboard"],
    queryFn: getArtistDashboardApi,
    staleTime: 1000 * 60 * 2, // 2 phút
  });

  // 2. Fetch danh sách bài hát gần đây của chính nghệ sĩ
  const {
    data: songsData,
    isLoading: isLoadingSongs,
  } = useQuery({
    queryKey: ["artistRecentSongs"],
    queryFn: () => getArtistSongsApi({ size: 5, sort: "createdAt,desc" }),
    staleTime: 1000 * 60 * 2,
  });

  const stats = dashboardData?.data || {
    totalFollowers: 0,
    totalSongs: 0,
    totalPlays: 0,
    totalLikes: 0,
  };

  const recentSongs = songsData?.data?.content || [];

  // Format giây thành phút:giây (03:45)
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Badge hiển thị trạng thái duyệt bài hát
  const renderStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Đã phát hành
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <Clock3 className="h-3 w-3" />
            Đang chờ duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20">
            <AlertCircle className="h-3 w-3" />
            Từ chối
          </span>
        );
      case "TAKEDOWN":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-neutral-400 border border-neutral-700">
            Gỡ bài hát
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-neutral-400">
            {status || "Mới"}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fadeIn">
      {/* ─── HERO HEADER BANNER ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800/80 bg-gradient-to-r from-[#1f1619] via-[#16161b] to-[#121216] p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#fa2d48]/15 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <ArtistAvatar
              src={artist?.avatarUrl}
              alt={artist?.stageName}
              size="lg"
              className="border-2 border-[#fa2d48]/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fa2d48]/10 px-2.5 py-0.5 text-xs font-bold text-[#fa2d48] border border-[#fa2d48]/20">
                  <Sparkles className="h-3 w-3" />
                  Nghệ sĩ chính thức
                </span>
              </div>
              <h1 className="mt-1.5 text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Chào mừng trở lại, {artist?.stageName || "Nghệ sĩ"}!
              </h1>
              <p className="mt-1 text-sm text-neutral-400 max-w-xl line-clamp-1">
                {artist?.biography || "Cập nhật tiểu sử và chia sẻ các tác phẩm mới nhất đến thính giả."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="secondary" size="md">
                Chỉnh sửa hồ sơ
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 4 THẺ THỐNG KÊ (STAT CARDS) ─────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#fa2d48]" />
            Chỉ số tăng trưởng tổng quan
          </h2>
          <span className="text-xs text-neutral-400">Dữ liệu thời gian thực</span>
        </div>

        {isErrorDashboard && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 flex items-center justify-between mb-4">
            <span>Không thể tải dữ liệu thống kê từ Catalog Service. Vui lòng thử lại.</span>
            <Button variant="danger" size="sm" onClick={() => refetchDashboard()}>
              Tải lại
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Tổng lượt nghe"
            value={stats.totalPlays}
            subtext="Tất cả bài hát phát hành"
            icon={Headphones}
            color="primary"
            isLoading={isLoadingDashboard}
          />

          <StatCard
            title="Lượt yêu thích"
            value={stats.totalLikes}
            subtext="Tổng số lượt thả tim từ fan"
            icon={Heart}
            color="purple"
            isLoading={isLoadingDashboard}
          />

          <StatCard
            title="Người theo dõi"
            value={stats.totalFollowers}
            subtext="Người dùng đăng ký theo dõi"
            icon={Users}
            color="emerald"
            isLoading={isLoadingDashboard}
          />

          <StatCard
            title="Số bài hát"
            value={stats.totalSongs}
            subtext="Tổng tác phẩm đã đăng tải"
            icon={Music}
            color="blue"
            isLoading={isLoadingDashboard}
          />
        </div>
      </div>

      {/* ─── DANH SÁCH BÀI HÁT GẦN ĐÂY ───────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-800/80 bg-[#141418] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Tác phẩm gần đây</h2>
            <p className="text-xs text-neutral-400">
              Bài hát mới nhất bạn đã tải lên nền tảng
            </p>
          </div>
          {artist?.id && (
            <a
              href={`http://localhost:5173/artist/${artist.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#fa2d48] hover:underline"
            >
              <span>Xem trên trang công khai</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>

        {isLoadingSongs ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 animate-pulse rounded-xl bg-neutral-800/50" />
            ))}
          </div>
        ) : recentSongs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-800 p-8 text-center">
            <Music className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
            <p className="text-sm font-semibold text-neutral-300">
              Chưa có tác phẩm nào được đăng tải
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Bạn có thể cập nhật thông tin hồ sơ và nghệ danh trước khi phát hành âm nhạc.
            </p>
            <Link to="/profile" className="inline-block mt-4">
              <Button variant="secondary" size="sm">
                Hoàn thiện hồ sơ nghệ sĩ
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="border-b border-neutral-800 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Bài hát</th>
                  <th className="py-3 px-4 font-semibold">Thời lượng</th>
                  <th className="py-3 px-4 font-semibold">Lượt nghe</th>
                  <th className="py-3 px-4 font-semibold">Lượt thích</th>
                  <th className="py-3 px-4 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-medium">
                {recentSongs.map((song) => (
                  <tr
                    key={song.id}
                    className="hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={song.coverImage || "https://res.cloudinary.com/demo/image/upload/v1/genres/pop.jpg"}
                        alt={song.title}
                        className="h-10 w-10 rounded-lg object-cover bg-neutral-800"
                      />
                      <div>
                        <p className="font-semibold text-white line-clamp-1">{song.title}</p>
                        <p className="text-xs text-neutral-500">
                          {song.albumTitle || "Single / Bài lẻ"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-neutral-500" />
                        <span>{formatDuration(song.durationSeconds)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white">
                      {Number(song.playCount || 0).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {Number(song.likeCount || 0).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-3 px-4">{renderStatusBadge(song.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── QUICK TIPS & GUIDELINES ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-neutral-800/80 bg-[#141418] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fa2d48]/10 text-[#fa2d48] mb-3">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Hoàn thiện hình ảnh</h3>
          <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
            Ảnh bìa và avatar chuẩn độ phân giải cao giúp hồ sơ của bạn nổi bật hơn trên các bảng xếp hạng công khai.
          </p>
          <Link to="/profile" className="mt-4 inline-flex items-center text-xs font-semibold text-[#fa2d48] hover:underline">
            Cập nhật ngay &rarr;
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#141418] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-3">
            <Music className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Kiểm duyệt chất lượng</h3>
          <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
            Mọi bài hát tải lên sẽ được chuyển sang trạng thái chờ duyệt (PENDING) để Quản trị viên thẩm định âm thanh.
          </p>
          <span className="mt-4 inline-flex items-center text-xs font-medium text-neutral-500">
            Hệ thống tự động đồng bộ
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#141418] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Gia tăng tương tác</h3>
          <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
            Số người theo dõi sẽ tăng khi người dùng trên User Web nhấn Theo dõi nghệ sĩ qua giao diện nghe nhạc.
          </p>
          <span className="mt-4 inline-flex items-center text-xs font-medium text-neutral-500">
            Kết nối trực tiếp với thính giả
          </span>
        </div>
      </div>
    </div>
  );
};
