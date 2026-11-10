import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Disc3,
  Layers,
  Calendar,
  Clock,
  Play,
  Pause,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Music,
  ListMusic,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { formatDuration, formatDate, formatRelativeTime } from "../../utils/formatters";
import { getAdminAlbumSongsApi } from "../../api/catalog";

export const AlbumDetailModal = ({
  isOpen,
  onClose,
  album,
  onApprove,
  onReject,
  onTakedown,
}) => {
  const [activeAudioUrl, setActiveAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const audioRef = useRef(null);

  // Fetch tracklist (songs inside this album)
  const { data: songsRes, isLoading: isLoadingSongs } = useQuery({
    queryKey: ["adminAlbumSongs", album?.id],
    queryFn: () => getAdminAlbumSongsApi(album.id),
    enabled: !!album?.id && isOpen,
  });

  const albumSongs = songsRes?.data || [];

  // Stop audio on close or album switch
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setActiveAudioUrl(null);
      setIsPlaying(false);
    }
  }, [isOpen, album?.id]);

  const toggleTrackAudio = (url) => {
    if (!url) return;
    if (activeAudioUrl === url && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      setActiveAudioUrl(url);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch((err) => console.error("Audio error:", err));
      }
    }
  };

  const handleCopyId = () => {
    if (!album?.id) return;
    navigator.clipboard.writeText(album.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!album) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết Album cần kiểm duyệt"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Hidden Audio Element for previewing tracks */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />

        {/* ── HEADER CARD ── */}
        <div className="flex flex-col sm:flex-row gap-5 items-start bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800">
          {album.coverImage ? (
            <img
              src={album.coverImage}
              alt={album.title}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-neutral-700 shadow-xl shrink-0"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-neutral-800 text-neutral-400 flex items-center justify-center shrink-0 border border-neutral-700">
              <Layers size={44} />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={album.status} />
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 uppercase">
                {album.albumType || "ALBUM"}
              </span>
            </div>

            <h3 className="text-xl font-black text-white truncate">
              {album.title}
            </h3>

            <p className="text-sm font-semibold text-[#fa2d48]">
              {album.ownerName || "Nghệ sĩ chưa rõ"}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[260px]">
                ID: {album.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Sao chép ID album"
              >
                {isCopied ? (
                  <Check size={13} className="text-emerald-400" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── METADATA GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
            <div className="text-[11px] font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar size={13} className="text-[#fa2d48]" /> Gửi duyệt
            </div>
            <div className="text-xs font-bold text-white">
              {formatDate(album.createdAt)}
            </div>
            <div className="text-[10px] text-neutral-500">
              {formatRelativeTime(album.createdAt)}
            </div>
          </div>

          <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
            <div className="text-[11px] font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock size={13} className="text-blue-400" /> Ngày phát hành
            </div>
            <div className="text-xs font-bold text-white">
              {album.releaseDate ? formatDate(album.releaseDate) : "Phát hành ngay"}
            </div>
            <div className="text-[10px] text-neutral-500">
              {album.releaseDate ? "Lịch ra mắt dự kiến" : "Khi được duyệt"}
            </div>
          </div>

          <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
            <div className="text-[11px] font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
              <ListMusic size={13} className="text-emerald-400" /> Số lượng track
            </div>
            <div className="text-xs font-bold text-white">
              {album.totalTracks || albumSongs.length || 0} bài hát
            </div>
            <div className="text-[10px] text-neutral-500">
              Đã đính kèm trong album
            </div>
          </div>
        </div>

        {/* Description if present */}
        {album.description && (
          <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Mô tả Album
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {album.description}
            </p>
          </div>
        )}

        {/* ── TRACKLIST SECTION ── */}
        <div className="bg-[#121212] border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc3 size={18} className="text-[#fa2d48]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Danh sách bài hát trong Album ({albumSongs.length})
              </h4>
            </div>
            <span className="text-[11px] text-neutral-400">
              Nghe thử từng bài trước khi quyết định duyệt
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-neutral-800/50 scrollbar-thin">
            {isLoadingSongs ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                Đang tải danh sách bài hát trong album...
              </div>
            ) : albumSongs.length > 0 ? (
              albumSongs.map((track, index) => {
                const isThisPlaying =
                  activeAudioUrl === track.audioUrl && isPlaying;
                return (
                  <div
                    key={track.id || index}
                    className="p-3 px-4 flex items-center justify-between gap-3 hover:bg-neutral-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Track number / Play button */}
                      <button
                        type="button"
                        onClick={() => toggleTrackAudio(track.audioUrl)}
                        disabled={!track.audioUrl}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          isThisPlaying
                            ? "bg-[#fa2d48] text-white"
                            : "bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700"
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                        title={isThisPlaying ? "Dừng" : "Phát thử bài này"}
                      >
                        {isThisPlaying ? (
                          <Pause size={12} />
                        ) : (
                          <Play size={12} className="ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                          <span className="text-neutral-500 font-mono text-[11px]">
                            #{track.trackNumber || index + 1}
                          </span>
                          <span>{track.title}</span>
                          {track.explicit && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-neutral-800 text-amber-400 font-bold border border-amber-500/30">
                              18+
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {track.ownerName || album.ownerName}
                        </div>
                      </div>
                    </div>

                    {/* Status & Duration */}
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={track.status} />
                      <span className="text-xs text-neutral-400 font-mono">
                        {formatDuration(track.durationSeconds)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-neutral-500">
                Album này hiện chưa có bài hát nào được gán vào.
              </div>
            )}
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Đóng
          </Button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="white"
              size="sm"
              onClick={() => onApprove(album)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-[0_2px_12px_rgba(16,185,129,0.35)]"
            >
              <CheckCircle2 size={16} /> Duyệt Album
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => onReject(album)}
            >
              <XCircle size={16} /> Từ chối
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onTakedown(album)}
              className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            >
              <AlertTriangle size={15} /> Gỡ vi phạm
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AlbumDetailModal;

