import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Disc3,
  Plus,
  Search,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Heart,
  Music2,
  Trash2,
  RotateCcw,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Edit,
  ListMusic,
} from "lucide-react";
import { getArtistAlbumsApi, deleteAlbumApi, restoreAlbumApi } from "../api/catalog";
import { Button } from "../components/ui/Button";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { CreateAlbumModal } from "../components/albums/CreateAlbumModal";
import { EditAlbumModal } from "../components/albums/EditAlbumModal";
import { AlbumDetailModal } from "../components/albums/AlbumDetailModal";
import { toast } from "sonner";

export const AlbumsPage = () => {
  const [activeTab, setActiveTab] = useState("ACTIVE"); // "ACTIVE" | "TRASH"
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [detailAlbum, setDetailAlbum] = useState(null);
  const [deletingAlbum, setDeletingAlbum] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoringAlbumId, setRestoringAlbumId] = useState(null);

  const isTrashTab = activeTab === "TRASH";

  // Fetch albums
  const {
    data: albumsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["artistAlbums", activeTab, page],
    queryFn: () =>
      getArtistAlbumsApi({
        isDeleted: isTrashTab,
        page,
        size: pageSize,
      }),
    staleTime: 1000 * 60,
  });

  const albumsList = albumsData?.data?.content || [];
  const totalPages = albumsData?.data?.totalPages || 0;
  const totalElements = albumsData?.data?.totalElements || 0;

  const filteredAlbums = albumsList.filter((album) =>
    album.title?.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const renderStatusBadge = (status, isDeleted) => {
    if (isDeleted) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-400 border border-neutral-700">
          <Trash2 className="h-3 w-3" />
          Thùng rác
        </span>
      );
    }

    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Đã duyệt
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
            <Clock3 className="h-3 w-3" />
            Chờ duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
            <AlertCircle className="h-3 w-3" />
            Từ chối
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-400">
            {status || "Mới"}
          </span>
        );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAlbum) return;
    setIsDeleting(true);
    try {
      await deleteAlbumApi(deletingAlbum.id);
      toast.success(
        `Đã chuyển Album "${deletingAlbum.title}" và toàn bộ bài hát trong album vào Thùng rác!`
      );
      setDeletingAlbum(null);
      refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể xóa album";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreAlbum = async (album) => {
    setRestoringAlbumId(album.id);
    try {
      await restoreAlbumApi(album.id);
      toast.success(
        `Đã khôi phục Album "${album.title}" và toàn bộ bài hát trong album thành công!`
      );
      refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể khôi phục album";
      toast.error(msg);
    } finally {
      setRestoringAlbumId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── PAGE HEADER ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Quản lý Album
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fa2d48]/10 px-3 py-0.5 text-xs font-bold text-[#fa2d48] border border-[#fa2d48]/20">
              <Disc3 className="h-3.5 w-3.5" />
              {totalElements} album
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Tạo tuyển tập phát hành, quản lý thứ tự tracklist và chia sẻ âm nhạc của bạn
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Tạo Album mới</span>
        </Button>
      </div>

      {/* ─── FILTER TABS & SEARCH BAR ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("ACTIVE");
              setPage(0);
            }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              !isTrashTab
                ? "bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/20"
                : "bg-[#18181c] text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Đang hoạt động
          </button>

          <button
            onClick={() => {
              setActiveTab("TRASH");
              setPage(0);
            }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              isTrashTab
                ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm"
                : "bg-[#18181c] text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Thùng rác
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên album..."
            className="w-full rounded-full border border-neutral-800 bg-[#141418] pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* ─── ALBUMS GRID ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="rounded-2xl border border-neutral-800 bg-[#121215] p-16 text-center">
          <Disc3 className="h-10 w-10 animate-spin mx-auto text-[#fa2d48] mb-4" />
          <p className="text-sm font-medium text-neutral-400">Đang tải danh sách album...</p>
        </div>
      ) : filteredAlbums.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-[#121215] p-16 text-center shadow-xl">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#18181c] text-neutral-500 mb-4">
            <Disc3 className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-white">Chưa có Album nào</h3>
          <p className="mt-1 text-xs text-neutral-400 max-w-sm mx-auto">
            {isTrashTab
              ? "Thùng rác không có album nào bị xóa mềm."
              : "Bạn chưa có album nào. Hãy tạo tuyển tập đầu tiên để gắn kết các bài hát!"}
          </p>
          {!isTrashTab && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="mt-5"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Tạo Album đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              className="group flex flex-col justify-between rounded-2xl border border-neutral-800/80 bg-[#141418] p-4 hover:border-neutral-700 hover:bg-[#18181d] transition-all duration-200 shadow-lg"
            >
              <div>
                {/* Album Cover */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800">
                  {album.coverImage ? (
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-600">
                      <Disc3 className="h-16 w-16" />
                    </div>
                  )}

                  {/* Badges on Cover */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white border border-white/10 uppercase">
                      {album.albumType || "ALBUM"}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    {renderStatusBadge(album.status, album.isDeleted)}
                  </div>
                </div>

                {/* Album Details */}
                <div className="mt-3.5 space-y-1">
                  <h3 className="font-bold text-white text-base truncate group-hover:text-[#fa2d48] transition-colors">
                    {album.title}
                  </h3>
                  {album.description && (
                    <p className="text-xs text-neutral-400 line-clamp-1">{album.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Music2 className="h-3.5 w-3.5 text-neutral-500" />
                      {album.totalTracks || 0} bài hát
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-[#fa2d48]" />
                      {(album.likeCount || 0).toLocaleString()}
                    </span>
                  </div>
                  {album.releaseDate && (
                    <p className="text-[11px] text-neutral-500 flex items-center gap-1 pt-0.5">
                      <Calendar className="h-3 w-3" />
                      {album.releaseDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                {isTrashTab ? (
                  <Button
                    variant="white"
                    size="sm"
                    onClick={() => handleRestoreAlbum(album)}
                    disabled={restoringAlbumId === album.id}
                    className="w-full !h-8 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Khôi phục
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="dark"
                      size="sm"
                      onClick={() => setDetailAlbum(album)}
                      className="flex-1 !h-8 text-xs flex items-center justify-center gap-1"
                      title="Quản lý bài hát trong album"
                    >
                      <ListMusic className="h-3.5 w-3.5" />
                      Bài hát ({album.totalTracks || 0})
                    </Button>

                    <button
                      onClick={() => setEditingAlbum(album)}
                      className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                      title="Sửa album"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingAlbum(album)}
                      className="rounded-lg p-2 text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Xóa vào thùng rác"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── PAGINATION BAR ─────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-[#121215] px-6 py-4">
          <span className="text-xs text-neutral-400">
            Trang {page + 1} / {totalPages} (Tổng số {totalElements} album)
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

      {/* ─── MODALS ─────────────────────────────────────────────────── */}
      {/* Create Album Modal */}
      <CreateAlbumModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Edit Album Modal */}
      <EditAlbumModal
        isOpen={Boolean(editingAlbum)}
        album={editingAlbum}
        onClose={() => setEditingAlbum(null)}
        onSuccess={() => refetch()}
      />

      {/* Album Detail / Songs Manager Modal */}
      <AlbumDetailModal
        isOpen={Boolean(detailAlbum)}
        album={detailAlbum}
        onClose={() => setDetailAlbum(null)}
        onUpdate={() => refetch()}
      />

      {/* Confirm Soft Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingAlbum)}
        title="Xác nhận xóa Album"
        message={
          <div>
            <p>
              Bạn có chắc chắn muốn xóa album <strong>"{deletingAlbum?.title}"</strong> không?
            </p>
            <p className="mt-2 text-xs text-amber-400">
              ⚠️ Quy tắc hệ thống: Khi xóa mềm Album, toàn bộ các bài hát thuộc album này cũng sẽ
              được chuyển vào Thùng rác. Bạn có thể khôi phục lại bất kỳ lúc nào.
            </p>
          </div>
        }
        confirmText="Xác nhận xóa"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingAlbum(null)}
      />
    </div>
  );
};

