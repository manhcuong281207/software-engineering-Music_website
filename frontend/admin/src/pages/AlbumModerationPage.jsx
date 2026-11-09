import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Disc3, Check, X, Layers } from "lucide-react";
import { getPendingAlbumsApi, updateAlbumStatusApi } from "../api/catalog";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Pagination } from "../components/ui/Pagination";
import { SkeletonRow } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

export const AlbumModerationPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVED' | 'REJECTED' | 'TAKEDOWN'
  const [reason, setReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch Pending Albums
  const { data: albumsRes, isLoading } = useQuery({
    queryKey: ["adminPendingAlbums", page],
    queryFn: () => getPendingAlbumsApi({ page, size: 10 }),
  });

  const pendingAlbums = albumsRes?.data?.content || [];
  const totalPages = albumsRes?.data?.totalPages || 0;

  // 2. Mutation: Update Album Status
  const updateStatusMutation = useMutation({
    mutationFn: ({ albumId, status, reason }) =>
      updateAlbumStatusApi(albumId, status, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminPendingAlbums"] });
      queryClient.invalidateQueries({ queryKey: ["adminPendingAlbumsCount"] });
      const statusMap = {
        APPROVED: "Đã duyệt và công khai album thành công!",
        REJECTED: "Đã từ chối album thành công!",
        TAKEDOWN: "Đã gỡ bỏ album vi phạm!",
      };
      showSuccessToast(statusMap[variables.status] || "Thao tác thành công");
      setIsModalOpen(false);
      setSelectedAlbum(null);
      setReason("");
    },
    onError: (err) => {
      showErrorToast(
        err.response?.data?.message || "Không thể cập nhật trạng thái album"
      );
    },
  });

  const handleOpenActionModal = (album, type) => {
    setSelectedAlbum(album);
    setActionType(type);
    setReason("");
    if (type === "APPROVED") {
      updateStatusMutation.mutate({
        albumId: album.id,
        status: "APPROVED",
        reason: "",
      });
    } else {
      setIsModalOpen(true);
    }
  };

  const handleConfirmAction = () => {
    if (!selectedAlbum || !actionType) return;
    updateStatusMutation.mutate({
      albumId: selectedAlbum.id,
      status: actionType,
      reason,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Disc3 size={26} className="text-[#fa2d48]" /> Kiểm duyệt Album
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Danh sách Album / EP do các nghệ sĩ đăng tải đang chờ phê duyệt
          </p>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-[#181818] border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800/80 bg-neutral-900/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-4 px-6">Album</th>
                <th className="py-4 px-6">Nghệ sĩ</th>
                <th className="py-4 px-6">Phân loại</th>
                <th className="py-4 px-6">Số bài</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Phê duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={6} />
                ))
              ) : pendingAlbums.length > 0 ? (
                pendingAlbums.map((album) => (
                  <tr
                    key={album.id}
                    className="hover:bg-neutral-800/30 transition-colors"
                  >
                    {/* Album cover + Title */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        {album.coverImage ? (
                          <img
                            src={album.coverImage}
                            alt={album.title}
                            className="w-10 h-10 rounded-lg object-cover border border-neutral-700 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-800 text-neutral-400 flex items-center justify-center">
                            <Layers size={20} />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm">
                            {album.title}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            {album.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Artist */}
                    <td className="py-3.5 px-6 font-semibold text-neutral-300">
                      {album.ownerName || "Nghệ sĩ chưa rõ"}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-6 text-neutral-400 font-mono">
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[11px]">
                        {album.albumType || "ALBUM"}
                      </span>
                    </td>

                    {/* Total tracks */}
                    <td className="py-3.5 px-6 text-neutral-400 font-medium">
                      {album.totalTracks || 0} bài hát
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-6">
                      <StatusBadge status={album.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="white"
                          size="sm"
                          onClick={() => handleOpenActionModal(album, "APPROVED")}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-[0_2px_10px_rgba(16,185,129,0.3)] text-xs"
                          isLoading={
                            updateStatusMutation.isPending &&
                            selectedAlbum?.id === album.id &&
                            actionType === "APPROVED"
                          }
                        >
                          <Check size={14} /> Duyệt
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleOpenActionModal(album, "REJECTED")}
                          className="text-xs"
                        >
                          <X size={14} /> Từ chối
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-neutral-500"
                  >
                    Tuyệt vời! Hiện tại không có album nào đang chờ duyệt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-neutral-800/80">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* ── MODAL LÝ DO TỪ CHỐI ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          actionType === "REJECTED" ? "Từ chối duyệt Album" : "Gỡ bỏ Album"
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-300">
            Bạn đang từ chối album{" "}
            <span className="font-bold text-white">{selectedAlbum?.title}</span> của
            nghệ sĩ{" "}
            <span className="text-[#fa2d48] font-bold">
              {selectedAlbum?.ownerName}
            </span>
            . Vui lòng nhập lý do để phản hồi lại cho nghệ sĩ.
          </p>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
              Lý do từ chối (tùy chọn)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Thông tin tracklist không hợp lệ, hình ảnh cover vi phạm quy chuẩn..."
              rows={3}
              className="w-full p-3 bg-[#121212] border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#fa2d48] transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={updateStatusMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmAction}
              isLoading={updateStatusMutation.isPending}
            >
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AlbumModerationPage;
