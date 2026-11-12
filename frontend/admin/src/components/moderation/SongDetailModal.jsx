import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Music,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  Tag,
  Users,
  FileText,
  Copy,
  Check,
  Disc,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { formatDuration, formatDate, formatRelativeTime } from "../../utils/formatters";
import { getAdminSongLyricsApi } from "../../api/catalog";

export const SongDetailModal = ({
  isOpen,
  onClose,
  song,
  onApprove,
  onReject,
  onTakedown,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const audioRef = useRef(null);

  // Fetch lyrics
  const { data: lyricsRes, isLoading: isLoadingLyrics } = useQuery({
    queryKey: ["adminSongLyrics", song?.id],
    queryFn: () => getAdminSongLyricsApi(song.id),
    enabled: !!song?.id && isOpen,
  });

  const lyrics = lyricsRes?.data;

  // Reset audio when modal opens/closes or song changes
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen, song?.id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Playback error:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || song?.durationSeconds || 0);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleCopyId = () => {
    if (!song?.id) return;
    navigator.clipboard.writeText(song.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!song) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết bài hát cần kiểm duyệt"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Hidden Audio Element */}
        {song.audioUrl && (
          <audio
            ref={audioRef}
            src={song.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {/* ── HEADER CARD ── */}
        <div className="flex flex-col sm:flex-row gap-5 items-start bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800">
          {/* Cover image */}
          {song.coverImage ? (
            <img
              src={song.coverImage}
              alt={song.title}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-neutral-700 shadow-xl shrink-0"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-neutral-800 text-neutral-400 flex items-center justify-center shrink-0 border border-neutral-700">
              <Disc size={44} />
            </div>
          )}

          {/* Title + Artist + ID */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={song.status} />
              {song.explicit && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
                  18+ Explicit
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-white truncate">
              {song.title}
            </h3>

            <p className="text-sm font-semibold text-[#fa2d48]">
              {song.ownerName || "Nghệ sĩ chưa rõ"}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[260px]">
                ID: {song.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Sao chép ID bài hát"
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

        {/* ── AUDIO PREVIEW PLAYER ── */}
        <div className="bg-[#121212] border border-neutral-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Music size={14} className="text-[#fa2d48]" /> Nghe thử trước khi duyệt
            </span>
            <span>
              {formatDuration(currentTime)} / {formatDuration(duration || song.durationSeconds)}
            </span>
          </div>

          {song.audioUrl ? (
            <div className="flex items-center gap-3">
              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#fa2d48] text-white flex items-center justify-center hover:scale-105 active:scale-95 shadow-[0_2px_12px_rgba(250,45,72,0.4)] transition-all shrink-0 cursor-pointer"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>

              {/* Progress Slider */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || song.durationSeconds || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#fa2d48]"
                />
              </div>

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#fa2d48]"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-neutral-500">
              Không tìm thấy URL file âm thanh của bài hát này
            </div>
          )}
        </div>

        {/* ── METADATA GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Thời gian gửi duyệt */}
          <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
            <div className="text-[11px] font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar size={13} className="text-[#fa2d48]" /> Thời gian gửi duyệt
            </div>
            <div className="text-sm font-bold text-white">
              {formatDate(song.createdAt)}
            </div>
            <div className="text-[11px] text-neutral-500">
              {formatRelativeTime(song.createdAt)}
            </div>
          </div>

          {/* Thời lượng */}
          <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
            <div className="text-[11px] font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock size={13} className="text-blue-400" /> Thời lượng bài hát
            </div>
            <div className="text-sm font-bold text-white">
              {formatDuration(song.durationSeconds)}
            </div>
            <div className="text-[11px] text-neutral-500">
              {song.durationSeconds || 0} giây
            </div>
          </div>

          {/* Thể loại */}
          <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1 sm:col-span-2">
            <div className="text-[11px] font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Tag size={13} className="text-purple-400" /> Thể loại âm nhạc
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {song.genres && song.genres.length > 0 ? (
                song.genres.map((g) => (
                  <span
                    key={g.id || g.name}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 text-xs font-semibold text-neutral-200 border border-neutral-700/60"
                  >
                    {g.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-500">
                  Chưa gắn thể loại cụ thể
                </span>
              )}
            </div>
          </div>

          {/* Nghệ sĩ hợp tác / Feat */}
          {song.artists && song.artists.length > 0 && (
            <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1 sm:col-span-2">
              <div className="text-[11px] font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Users size={13} className="text-emerald-400" /> Nghệ sĩ tham gia
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {song.artists.map((a, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 text-xs text-neutral-300 font-medium border border-neutral-700/60"
                  >
                    <strong className="text-white">{a.artistName}</strong>{" "}
                    <span className="text-[10px] text-neutral-400">({a.role})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── LỜI BÀI HÁT (LYRICS) ── */}
        <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-2">
          <div className="text-[11px] font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
            <FileText size={13} className="text-amber-400" /> Lời bài hát (Lyrics)
          </div>

          {isLoadingLyrics ? (
            <div className="text-xs text-neutral-500 py-3 text-center">
              Đang tải lời bài hát...
            </div>
          ) : lyrics?.content ? (
            <div className="max-h-40 overflow-y-auto p-3 bg-[#121212] rounded-xl text-xs text-neutral-300 leading-relaxed whitespace-pre-line border border-neutral-800/80 font-sans scrollbar-thin">
              {lyrics.content}
            </div>
          ) : (
            <div className="text-xs text-neutral-500 py-2 italic">
              Nghệ sĩ chưa đính kèm lời cho bài hát này.
            </div>
          )}
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
              onClick={() => onApprove(song)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-[0_2px_12px_rgba(16,185,129,0.35)]"
            >
              <CheckCircle2 size={16} /> Duyệt bài hát
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => onReject(song)}
            >
              <XCircle size={16} /> Từ chối
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onTakedown(song)}
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

export default SongDetailModal;

