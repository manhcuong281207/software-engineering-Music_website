import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Music2,
  Plus,
  Search,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Headphones,
  Heart,
  MoreVertical,
  Edit,
  AlignLeft,
  Users,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Disc,
  ShieldAlert,
} from "lucide-react";
import { getArtistSongsApi, deleteSongApi, restoreSongApi } from "../api/catalog";
import { Button } from "../components/ui/Button";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { UploadSongModal } from "../components/songs/UploadSongModal";
import { EditSongModal } from "../components/songs/EditSongModal";
import { SongLyricsModal } from "../components/songs/SongLyricsModal";
import { FeatArtistsModal } from "../components/songs/FeatArtistsModal";
import { toast } from "sonner";

export const SongsPage = () => {
  // Tabs: "ALL" | "APPROVED" | "PENDING" | "REJECTED" | "TAKEDOWN" | "TRASH"
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [lyricsSong, setLyricsSong] = useState(null);
  const [featSong, setFeatSong] = useState(null);
  const [deletingSong, setDeletingSong] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoringSongId, setRestoringSongId] = useState(null);

  // Dropdown menu state per song row
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

  const isTrashTab = activeTab === "TRASH";
  const statusParam =
    activeTab !== "ALL" && activeTab !== "TRASH" ? activeTab : undefined;

  // Query songs
  const {
    data: songsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["artistSongs", activeTab, page],
    queryFn: () =>
      getArtistSongsApi({
        status: statusParam,
        isDeleted: isTrashTab,
        page,
        size: pageSize,
      }),
    staleTime: 1000 * 60,
  });

  const songsList = songsData?.data?.content || [];
  const totalPages = songsData?.data?.totalPages || 0;
  const totalElements = songsData?.data?.totalElements || 0;

  // Filter by search term on client side if needed
  const filteredSongs = songsList.filter((song) =>
    song.title?.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const renderStatusBadge = (status, isDeleted) => {
    if (isDeleted) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-neutral-400 border border-neutral-700">
          <Trash2 className="h-3 w-3" />
          Trong thùng rác
        </span>
      );
    }

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
            Chờ duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20">
            <AlertCircle className="h-3 w-3" />
            Bị từ chối
          </span>
        );
      case "TAKEDOWN":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-neutral-400 border border-neutral-700">
            <ShieldAlert className="h-3 w-3 text-red-400" />
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

  const handleDeleteConfirm = async () => {
    if (!deletingSong) return;
    setIsDeleting(true);
    try {
      await deleteSongApi(deletingSong.id);
      toast.success(`Đã chuyển bài hát "${deletingSong.title}" vào Thùng rác`);
      setDeletingSong(null);
      refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể xóa bài hát";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreSong = async (song) => {
    setRestoringSongId(song.id);
    try {
      await restoreSongApi(song.id);
      toast.success(`Đã khôi phục bài hát "${song.title}" thành công!`);
      refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể khôi phục bài hát";
      toast.error(msg);
    } finally {
      setRestoringSongId(null);
    }
  };

  const tabs = [
    { id: "ALL", label: "Tất cả" },
    { id: "APPROVED", label: "Đã duyệt" },
    { id: "PENDING", label: "Chờ duyệt" },
    { id: "REJECTED", label: "Bị từ chối" },
    { id: "TAKEDOWN", label: "Gỡ bài" },
    { id: "TRASH", label: "Thùng rác", isTrash: true },
  ];

  return (
    <div className="space-y-6">
      {/* ─── PAGE HEADER ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Quản lý bài hát
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fa2d48]/10 px-3 py-0.5 text-xs font-bold text-[#fa2d48] border border-[#fa2d48]/20">
              <Music2 className="h-3.5 w-3.5" />
              {totalElements} bản ghi
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Đăng tải, theo dõi trạng thái kiểm duyệt và quản lý danh mục âm nhạc của bạn
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Đăng tải bài hát mới</span>
        </Button>
      </div>

      {/* ─── FILTER TABS & SEARCH BAR ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(0);
                }}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? tab.isTrash
                      ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm"
                      : "bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/20"
                    : "bg-[#18181c] text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800"
                }`}
              >
                {tab.isTrash && <Trash2 className="h-3 w-3" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên bài hát..."
            className="w-full rounded-full border border-neutral-800 bg-[#141418] pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* ─── SONGS TABLE ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-800/80 bg-[#121215] overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#18181c] text-[#fa2d48] mb-4">
              <Music2 className="h-6 w-6 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-neutral-400">Đang tải danh sách bài hát...</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#18181c] text-neutral-500 mb-4">
              <Music2 className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">Chưa có bài hát nào phù hợp</h3>
            <p className="mt-1 text-xs text-neutral-400 max-w-sm mx-auto">
              {isTrashTab
                ? "Thùng rác hiện đang trống. Những bài hát bị xóa mềm sẽ hiển thị ở đây."
                : "Không tìm thấy bài hát nào trong mục này. Bạn có thể đăng tải bài hát mới ngay bây giờ."}
            </p>
            {!isTrashTab && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsUploadOpen(true)}
                className="mt-5"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Đăng bài hát đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-800 bg-[#18181c]/50 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="py-3.5 pl-6 pr-3 w-12 text-center">#</th>
                  <th className="py-3.5 px-3">Bài hát</th>
                  <th className="py-3.5 px-3">Album</th>
                  <th className="py-3.5 px-3 text-center">Lượt nghe</th>
                  <th className="py-3.5 px-3 text-center">Lượt thích</th>
                  <th className="py-3.5 px-3 text-center">Trạng thái</th>
                  <th className="py-3.5 px-3 text-right">Ngày tải</th>
                  <th className="py-3.5 pl-3 pr-6 text-center w-20">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredSongs.map((song, idx) => {
                  const isActionMenuOpen = actionMenuOpenId === song.id;

                  return (
                    <tr
                      key={song.id}
                      className="group hover:bg-neutral-800/30 transition-colors"
                    >
                      {/* # Index */}
                      <td className="py-4 pl-6 pr-3 text-center text-xs text-neutral-500 font-medium">
                        {page * pageSize + idx + 1}
                      </td>

                      {/* Song info */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-800 border border-neutral-700/50">
                            {song.coverImage ? (
                              <img
                                src={song.coverImage}
                                alt={song.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-neutral-500">
                                <Music2 className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white truncate max-w-xs group-hover:text-[#fa2d48] transition-colors">
                                {song.title}
                              </span>
                              {song.explicit && (
                                <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[9px] font-bold text-neutral-400">
                                  18+
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                              <span>{formatDuration(song.durationSeconds)}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1 truncate max-w-xs">
                                {song.genres?.map((g) => (
                                  <span
                                    key={g.id}
                                    className="rounded-full bg-neutral-800/80 px-2 py-0.2 text-[10px] text-neutral-300"
                                  >
                                    {g.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Album */}
                      <td className="py-4 px-3 text-xs text-neutral-300">
                        {song.albumTitle ? (
                          <span className="inline-flex items-center gap-1.5 text-neutral-200">
                            <Disc className="h-3.5 w-3.5 text-[#fa2d48]" />
                            <span className="truncate max-w-[140px]">{song.albumTitle}</span>
                          </span>
                        ) : (
                          <span className="text-neutral-500 italic">Single độc lập</span>
                        )}
                      </td>

                      {/* Play count */}
                      <td className="py-4 px-3 text-center text-xs text-neutral-300">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Headphones className="h-3.5 w-3.5 text-neutral-500" />
                          {(song.playCount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Like count */}
                      <td className="py-4 px-3 text-center text-xs text-neutral-300">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Heart className="h-3.5 w-3.5 text-[#fa2d48]" />
                          {(song.likeCount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3 text-center">
                        {renderStatusBadge(song.status, song.isDeleted)}
                      </td>

                      {/* Created date */}
                      <td className="py-4 px-3 text-right text-xs text-neutral-400 whitespace-nowrap">
                        {song.createdAt
                          ? new Date(song.createdAt).toLocaleDateString("vi-VN")
                          : "---"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-3 pr-6 text-center relative">
                        {isTrashTab ? (
                          <Button
                            variant="white"
                            size="sm"
                            onClick={() => handleRestoreSong(song)}
                            disabled={restoringSongId === song.id}
                            className="!h-8 !px-3 text-xs"
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            Khôi phục
                          </Button>
                        ) : (
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() =>
                                setActionMenuOpenId(isActionMenuOpen ? null : song.id)
                              }
                              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {isActionMenuOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-20"
                                  onClick={() => setActionMenuOpenId(null)}
                                />
                                <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-neutral-700 bg-[#1c1c21] p-1.5 shadow-2xl animate-in fade-in zoom-in-95">
                                  <button
                                    onClick={() => {
                                      setActionMenuOpenId(null);
                                      setEditingSong(song);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                                  >
                                    <Edit className="h-3.5 w-3.5 text-neutral-400" />
                                    Chỉnh sửa bài hát
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActionMenuOpenId(null);
                                      setLyricsSong(song);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                                  >
                                    <AlignLeft className="h-3.5 w-3.5 text-purple-400" />
                                    Lời bài hát (Lyrics)
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActionMenuOpenId(null);
                                      setFeatSong(song);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                                  >
                                    <Users className="h-3.5 w-3.5 text-blue-400" />
                                    Nghệ sĩ hợp tác (Feat)
                                  </button>
                                  <div className="my-1 border-t border-neutral-800" />
                                  <button
                                    onClick={() => {
                                      setActionMenuOpenId(null);
                                      setDeletingSong(song);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Xóa vào thùng rác
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── PAGINATION BAR ─────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-4 bg-[#141418]">
            <span className="text-xs text-neutral-400">
              Trang {page + 1} / {totalPages} (Tổng số {totalElements} bài hát)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="dark"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="!h-8 !px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Trước
              </Button>
              <Button
                variant="dark"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="!h-8 !px-3"
              >
                Sau
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────── */}
      {/* Upload Song Modal */}
      <UploadSongModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Edit Song Modal */}
      <EditSongModal
        isOpen={Boolean(editingSong)}
        song={editingSong}
        onClose={() => setEditingSong(null)}
        onSuccess={() => refetch()}
      />

      {/* Lyrics Modal */}
      <SongLyricsModal
        isOpen={Boolean(lyricsSong)}
        song={lyricsSong}
        onClose={() => setLyricsSong(null)}
      />

      {/* Feat Artists Modal */}
      <FeatArtistsModal
        isOpen={Boolean(featSong)}
        song={featSong}
        onClose={() => setFeatSong(null)}
        onUpdate={() => refetch()}
      />

      {/* Confirm Soft Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingSong)}
        title="Xác nhận chuyển vào thùng rác"
        message={`Bạn có chắc chắn muốn xóa bài hát "${deletingSong?.title}" không? Bài hát sẽ được chuyển vào Thùng rác và có thể khôi phục lại bất kỳ lúc nào.`}
        confirmText="Xác nhận xóa"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingSong(null)}
      />
    </div>
  );
};

