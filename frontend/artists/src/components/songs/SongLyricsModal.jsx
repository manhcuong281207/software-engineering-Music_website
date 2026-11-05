import React, { useState, useEffect } from "react";
import { X, AlignLeft, Globe, Loader2, Sparkles, FileText } from "lucide-react";
import { getSongLyricsApi, updateSongLyricsApi } from "../../api/catalog";
import { Button } from "../ui/Button";
import { toast } from "sonner";

export const SongLyricsModal = ({ isOpen, onClose, song }) => {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("vi");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (song?.id && isOpen) {
      const fetchLyrics = async () => {
        setIsLoading(true);
        try {
          const res = await getSongLyricsApi(song.id);
          if (res?.data) {
            setContent(res.data.content || "");
            setLanguage(res.data.language || "vi");
          } else {
            setContent("");
            setLanguage("vi");
          }
        } catch {
          // Khi bài hát chưa có lời (404), để trống cho nghệ sĩ nhập
          setContent("");
          setLanguage("vi");
        } finally {
          setIsLoading(false);
        }
      };

      fetchLyrics();
    }
  }, [song, isOpen]);

  if (!isOpen || !song) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung lời bài hát");
      return;
    }

    setIsSaving(true);
    try {
      await updateSongLyricsApi(song.id, {
        content: content.trim(),
        language: language || "vi",
      });
      toast.success("Cập nhật lời bài hát thành công!");
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể cập nhật lời bài hát";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#18181c] border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <AlignLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Lời bài hát (Lyrics)</h2>
              <p className="text-xs text-neutral-400 truncate max-w-md">{song.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Sparkles className="h-4 w-4 text-[#fa2d48]" />
              <span>Hỗ trợ cả văn bản thường và định dạng đồng bộ thời gian LRC (.lrc)</span>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-neutral-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isSaving || isLoading}
                className="rounded-lg border border-neutral-700 bg-[#121215] px-3 py-1.5 text-xs text-white focus:border-[#fa2d48] focus:outline-none"
              >
                <option value="vi">Tiếng Việt (vi)</option>
                <option value="en">Tiếng Anh (en)</option>
                <option value="ko">Tiếng Hàn (ko)</option>
                <option value="ja">Tiếng Nhật (ja)</option>
                <option value="zh">Tiếng Trung (zh)</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-neutral-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#fa2d48]" />
              <p className="text-sm">Đang tải dữ liệu lời bài hát...</p>
            </div>
          ) : (
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`[00:15.20] Từng giọt mưa rơi tí tách bên thềm...\n[00:20.10] Hoặc bạn có thể dán toàn bộ lời bài hát dạng thông thường tại đây...`}
                rows={14}
                disabled={isSaving}
                className="w-full rounded-xl border border-neutral-700 bg-[#121215] p-4 font-mono text-sm leading-relaxed text-neutral-200 placeholder-neutral-600 focus:border-[#fa2d48] focus:outline-none transition-colors"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800/80 px-6 py-4 bg-[#141418]">
          <span className="text-xs text-neutral-500 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {content.split("\n").filter((l) => l.trim()).length} dòng lời ca
          </span>
          <div className="flex gap-3">
            <Button variant="dark" size="sm" onClick={onClose} disabled={isSaving}>
              Đóng
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSaving || isLoading}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                "Lưu lời bài hát"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

