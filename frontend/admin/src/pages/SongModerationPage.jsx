import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Music,
  Check,
  X,
  Play,
  Pause,
  Disc,
  Eye,
  AlertTriangle,
  Calendar,
  Volume2,
} from "lucide-react";
import { getPendingSongsApi, updateSongStatusApi } from "../api/catalog";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Pagination } from "../components/ui/Pagination";
import { SkeletonRow } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { ModerationTabs } from "../components/moderation/ModerationTabs";
import { SongDetailModal } from "../components/moderation/SongDetailModal";
import { ModerationConfirmModal } from "../components/moderation/ModerationConfirmModal";
import { formatDuration, formatDate, formatRelativeTime } from "../utils/formatters";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

export const SongModerationPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  // Audio Preview state
  const [activeAudioUrl, setActiveAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef(null);

  // Detail Modal state
  const [detailSong, setDetailSong] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Action / Confirm Modal state
  const [selectedSong, setSelectedSong] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVED' | 'REJECTED' | 'TAKEDOWN'
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // 1. Fetch Pending Songs
  const { data: songsRes, isLoading } = useQuery({
    queryKey: ["adminPendingSongs", page],
    queryFn: () => getPendingSongsApi({ page, size: 10 }),
  });

  const pendingSongs = songsRes?.data?.content || [];
  const totalPages = songsRes?.data?.totalPages || 0;
  const totalElements = songsRes?.data?.totalElements || 0;

  // 2. Mutation: Update Song Status (Approve / Reject / Takedown)
  const updateStatusMutation = useMutation({
    mutationFn: ({ songId, status, reason }) =>
      updateSongStatusApi(songId, status, reason),
    onSuccess: (_, variables) => {
      // Invalidate and refresh all related queries
      queryClient.invalidateQueries({ queryKey: ["adminPendingSongs"] });
      queryClient.invalidateQueries({ queryKey: ["adminPendingSongsCount"] });
      queryClient.invalidateQueries({ queryKey: ["adminTotalSongsCount"] });
      queryClient.invalidateQueries({ queryKey: ["adminPendingAlbumsCount"] });

      const statusMap = {
        APPROVED: "Đã duyệt và công khai bài hát thành công!",
        REJECTED: "Đã từ chối bài hát thành công!",
        TAKEDOWN: "Đã gỡ bỏ bài hát vi phạm thành công!",
      };
      showSuccessToast(statusMap[variables.status] || "Thao tác thành công");

      // Close modals and reset state
      setIsConfirmOpen(false);
      setIsDetailOpen(false);
      setSelectedSong(null);
      setDetailSong(null);
    },
    onError: (err) => {
      showErrorToast(
        err.response?.data?.message || "Không thể cập nhật trạng thái bài hát"
      );
    },
  });

  // Open confirmation dialog
  const handleOpenConfirm = (song, type) => {
    setSelectedSong(song);
    setActionType(type);
    setIsConfirmOpen(true);
  };

  // Perform confirmed action
  const handleConfirmAction = ({ status, reason }) => {
    if (!selectedSong) return;
    updateStatusMutation.mutate({
      songId: selectedSong.id,
      status,
      reason,
    });
  };

  // Open detail modal
  const handleOpenDetail = (song) => {
    setDetailSong(song);
    setIsDetailOpen(true);
  };

  // Toggle inline audio playback
  const toggleAudio = (audioUrl) => {
    if (!audioUrl) return;

    if (activeAudioUrl === audioUrl && isPlayingAudio) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsPlayingAudio(false);
    } else {
      setActiveAudioUrl(audioUrl);
      setIsPlayingAudio(true);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play().catch((err) => {
          console.error("Playback error:", err);
          setIsPlayingAudio(false);
        });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hidden Audio Element for inline table playback */}
      <audio
        ref={audioPlayerRef}
        onEnded={() => setIsPlayingAudio(false)}
        className="hidden"
      />

      {/* ── HEADER & TABS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Music size={26} className="text-[#fa2d48]" /> Kiểm duyệt Nội dung
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Xem xét, nghe thử và phê duyệt hoặc gỡ bỏ các bài hát, album do nghệ sĩ đăng tải
          </p>
        </div>

        {/* Tab switcher: Songs vs Albums */}
        <ModerationTabs activeTab="songs" />
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-[#181818] border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl">
        {/* Table summary bar */}
        <div className="p-4 px-6 border-b border-neutral-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-300 font-semibold">
            <span>Danh sách bài hát chờ kiểm duyệt</span>
            <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-mono text-[11px]">
              {totalElements} bài
            </span>
          </div>
          <span className="text-neutral-500 text-[11px]">
            Nhấn vào biểu tượng con mắt để xem đầy đủ lời, thể loại và nghe thử chi tiết
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800/80 bg-neutral-900/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-4 px-6">Bài hát</th>
                <th className="py-4 px-6">Nghệ sĩ đăng tải</th>
                <th className="py-4 px-6">Thời lượng</th>
                <th className="py-4 px-6">Thời gian gửi duyệt</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6">Nghe thử</th>
                <th className="py-4 px-6 text-right">Thao tác duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={7} />
                ))
              ) : pendingSongs.length > 0 ? (
                pendingSongs.map((song) => {
                  const isThisPlaying =
                    activeAudioUrl === song.audioUrl && isPlayingAudio;

                  return (
                    <tr
                      key={song.id}
                      className="hover:bg-neutral-800/30 transition-colors group"
                    >
                      {/* Song cover + Title + ID */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          {song.coverImage ? (
                            <img
                              src={song.coverImage}
                              alt={song.title}
                              className="w-11 h-11 rounded-xl object-cover border border-neutral-700 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center shrink-0 border border-neutral-700">
                              <Disc size={20} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-white text-sm truncate max-w-[200px] flex items-center gap-1.5">
                              <span className="truncate">{song.title}</span>
                              {song.explicit && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-neutral-800 text-amber-400 font-bold border border-amber-500/30 shrink-0">
                                  18+
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono truncate max-w-[180px]">
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
                      <td className="py-3.5 px-6 text-neutral-400 font-mono">
                        {formatDuration(song.durationSeconds)}
                      </td>

                      {/* Thời gian gửi duyệt */}
                      <td className="py-3.5 px-6">
                        <div className="text-white font-medium">
                          {formatDate(song.createdAt)}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {formatRelativeTime(song.createdAt)}
                        </div>
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
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                              isThisPlaying
                                ? "bg-[#fa2d48] text-white shadow-[0_2px_12px_rgba(250,45,72,0.5)] scale-105"
                                : "bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700"
                            }`}
                            title={isThisPlaying ? "Dừng nghe thử" : "Nghe thử bài hát"}
                          >
                            {isThisPlaying ? (
                              <Pause size={15} />
                            ) : (
                              <Play size={15} className="ml-0.5" />
                            )}
                          </button>
                        ) : (
                          <span className="text-neutral-500 text-[11px]">Không có audio</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(song)}
                            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
                            title="Xem chi tiết nội dung bài hát"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Duyệt (Approve) */}
                          <Button
                            variant="white"
                            size="sm"
                            onClick={() => handleOpenConfirm(song, "APPROVED")}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-[0_2px_10px_rgba(16,185,129,0.3)] text-xs h-8 px-3"
                          >
                            <Check size={14} /> Duyệt
                          </Button>

                          {/* Từ chối (Reject) */}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenConfirm(song, "REJECTED")}
                            className="text-xs h-8 px-3"
                          >
                            <X size={14} /> Từ chối
                          </Button>

                          {/* Gỡ vi phạm (Takedown) */}
                          <button
                            type="button"
                            onClick={() => handleOpenConfirm(song, "TAKEDOWN")}
                            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all cursor-pointer"
                            title="Gỡ bỏ nội dung vi phạm (Takedown)"
                          >
                            <AlertTriangle size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-xs text-neutral-500 space-y-2"
                  >
                    <Music size={32} className="mx-auto text-neutral-600 mb-2 opacity-50" />
                    <p className="font-semibold text-neutral-400">
                      Tuyệt vời! Hiện tại không có bài hát nào đang chờ duyệt.
                    </p>
                    <p className="text-[11px] text-neutral-600">
                      Khi nghệ sĩ tải lên bài hát mới, nội dung sẽ xuất hiện tại đây để bạn kiểm duyệt.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-800/80">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ── MODAL XEM CHI TIẾT BÀI HÁT ── */}
      <SongDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailSong(null);
        }}
        song={detailSong}
        onApprove={(song) => handleOpenConfirm(song, "APPROVED")}
        onReject={(song) => handleOpenConfirm(song, "REJECTED")}
        onTakedown={(song) => handleOpenConfirm(song, "TAKEDOWN")}
      />

      {/* ── MODAL XÁC NHẬN HÀNH ĐỘNG (DUYỆT / TỪ CHỐI / GỠ VI PHẠM) ── */}
      <ModerationConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setSelectedSong(null);
        }}
        onConfirm={handleConfirmAction}
        item={selectedSong}
        itemType="bài hát"
        actionType={actionType}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default SongModerationPage;
