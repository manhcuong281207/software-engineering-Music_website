import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Music, Check, X, Play, Pause, Disc } from "lucide-react";
import { getPendingSongsApi, updateSongStatusApi } from "../api/catalog";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Pagination } from "../components/ui/Pagination";
import { SkeletonRow } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { formatDuration } from "../utils/formatters";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

export const SongModerationPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [activeAudioUrl, setActiveAudioUrl] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [actionType, setActionType] = useState(null); // 'REJECTED' | 'TAKEDOWN' | 'APPROVED'
  const [reason, setReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch Pending Songs
  const { data: songsRes, isLoading } = useQuery({
    queryKey: ["adminPendingSongs", page],
    queryFn: () => getPendingSongsApi({ page, size: 10 }),
  });

  const pendingSongs = songsRes?.data?.content || [];
  const totalPages = songsRes?.data?.totalPages || 0;

  // 2. Mutation: Update Song Status
  const updateStatusMutation = useMutation({
    mutationFn: ({ songId, status, reason }) =>
      updateSongStatusApi(songId, status, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminPendingSongs"] });
      queryClient.invalidateQueries({ queryKey: ["adminPendingSongsCount"] });
      const statusMap = {
        APPROVED: "Đã duyệt và công khai bài hát thành công!",
        REJECTED: "Đã từ chối bài hát thành công!",
        TAKEDOWN: "Đã gỡ bỏ bài hát vi phạm!",
      };
      showSuccessToast(statusMap[variables.status] || "Thao tác thành công");
      setIsModalOpen(false);
      setSelectedSong(null);
      setReason("");
    },
    onError: (err) => {
      showErrorToast(
        err.response?.data?.message || "Không thể cập nhật trạng thái bài hát"
      );
    },
  });

  const handleOpenActionModal = (song, type) => {
    setSelectedSong(song);
    setActionType(type);
    setReason("");
    if (type === "APPROVED") {
      // Approve direct or confirm
      updateStatusMutation.mutate({
        songId: song.id,
        status: "APPROVED",
        reason: "",
      });
    } else {
      setIsModalOpen(true);
    }
  };

  const handleConfirmAction = () => {
    if (!selectedSong || !actionType) return;
    updateStatusMutation.mutate({
      songId: selectedSong.id,
      status: actionType,
      reason,
    });
  };

  const toggleAudio = (audioUrl) => {
    if (activeAudioUrl === audioUrl) {
      setActiveAudioUrl(null);
    } else {
      setActiveAudioUrl(audioUrl);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Music size={26} className="text-[#fa2d48]" /> Kiểm duyệt Bài hát
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Danh sách bài hát do các nghệ sĩ đăng tải đang chờ Quản trị viên duyệt để hiển thị công khai
          </p>
        </div>
      </div>

      {/* Hidden audio element for preview */}
      {activeAudioUrl && (
        <audio
          src={activeAudioUrl}
          autoPlay
          onEnded={() => setActiveAudioUrl(null)}
          className="hidden"
        />
      )}

      {/* ── TABLE CARD ── */}
      <div className="bg-[#181818] border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800/80 bg-neutral-900/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-4 px-6">Bài hát</th>
                <th className="py-4 px-6">Nghệ sĩ</th>
                <th className="py-4 px-6">Thời lượng</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6">Nghe thử</th>
                <th className="py-4 px-6 text-right">Phê duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={6} />
                ))
              ) : pendingSongs.length > 0 ? (
                pendingSongs.map((song) => (
                  <tr
                    key={song.id}
                    className="hover:bg-neutral-800/30 transition-colors"
                  >
                    {/* Song cover + Title */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        {song.coverImage ? (
                          <img
                            src={song.coverImage}
                            alt={song.title}
                            className="w-10 h-10 rounded-lg object-cover border border-neutral-700 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-800 text-neutral-400 flex items-center justify-center">
                            <Disc size={20} />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm">
                            {song.title}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            {song.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Artist */}
                    <td className="py-3.5 px-6 font-semibold text-neutral-300">
                      {song.ownerName || "Nghệ sĩ chưa rõ"}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-6 text-neutral-400">
                      {formatDuration(song.durationSeconds)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-6">
                      <StatusBadge status={song.status} />
                    </td>

                    {/* Audio Preview */}
                    <td className="py-3.5 px-6">
                      {song.audioUrl ? (
                        <button
                          type="button"
                          onClick={() => toggleAudio(song.audioUrl)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            activeAudioUrl === song.audioUrl
                              ? "bg-[#fa2d48] text-white shadow-[0_2px_10px_rgba(250,45,72,0.5)]"
                              : "bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700"
                          }`}
                          title={activeAudioUrl === song.audioUrl ? "Dừng" : "Phát thử"}
                        >
                          {activeAudioUrl === song.audioUrl ? (
                            <Pause size={14} />
                          ) : (
                            <Play size={14} className="ml-0.5" />
                          )}
                        </button>
                      ) : (
                        <span className="text-neutral-500 text-[11px]">Không có audio</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="white"
                          size="sm"
                          onClick={() => handleOpenActionModal(song, "APPROVED")}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-[0_2px_10px_rgba(16,185,129,0.3)] text-xs"
                          isLoading={
                            updateStatusMutation.isPending &&
                            selectedSong?.id === song.id &&
                            actionType === "APPROVED"
                          }
                        >
                          <Check size={14} /> Duyệt
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleOpenActionModal(song, "REJECTED")}
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
                    Tuyệt vời! Hiện tại không có bài hát nào đang chờ duyệt.
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

      {/* ── MODAL LÝ DO TỪ CHỐI / GỠ BÀI ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          actionType === "REJECTED" ? "Từ chối duyệt bài hát" : "Gỡ bỏ bài hát"
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-300">
            Bạn đang từ chối bài hát{" "}
            <span className="font-bold text-white">{selectedSong?.title}</span> của
            nghệ sĩ{" "}
            <span className="text-[#fa2d48] font-bold">
              {selectedSong?.ownerName}
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
              placeholder="VD: Chất lượng âm thanh không đạt chuẩn, vi phạm bản quyền..."
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

export default SongModerationPage;
