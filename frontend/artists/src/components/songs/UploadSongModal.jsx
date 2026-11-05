import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  UploadCloud,
  Music2,
  Image as ImageIcon,
  Check,
  Disc,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { uploadSongApi, getPublicGenresApi, getArtistAlbumsApi } from "../../api/catalog";
import { Button } from "../ui/Button";
import { toast } from "sonner";

export const UploadSongModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [selectedGenreIds, setSelectedGenreIds] = useState([]);
  const [albumId, setAlbumId] = useState("");
  const [trackNumber, setTrackNumber] = useState("");
  const [explicit, setExplicit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // 1. Fetch danh sách thể loại công khai
  const { data: genresData, isLoading: isLoadingGenres } = useQuery({
    queryKey: ["publicGenres"],
    queryFn: getPublicGenresApi,
    staleTime: 1000 * 60 * 10,
    enabled: isOpen,
  });

  // 2. Fetch danh sách Album của nghệ sĩ để tùy chọn gán bài hát vào album
  const { data: albumsData } = useQuery({
    queryKey: ["artistActiveAlbumsForSelect"],
    queryFn: () => getArtistAlbumsApi({ isDeleted: false, size: 50 }),
    staleTime: 1000 * 60 * 2,
    enabled: isOpen,
  });

  const genres = genresData?.data || [];
  const albums = albumsData?.data?.content || [];

  if (!isOpen) return null;

  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes("audio") && !file.name.match(/\.(mp3|wav|flac|m4a|aac)$/i)) {
        toast.error("Vui lòng chọn file âm thanh hợp lệ (.mp3, .wav, .flac)");
        return;
      }
      setAudioFile(file);
      // Tự động gợi ý tên bài hát từ tên file nếu chưa nhập tiêu đề
      if (!title.trim()) {
        const guessedTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(guessedTitle);
      }
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file hình ảnh hợp lệ (.jpg, .png, .webp)");
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const toggleGenre = (id) => {
    setSelectedGenreIds((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setTitle("");
    setAudioFile(null);
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setSelectedGenreIds([]);
    setAlbumId("");
    setTrackNumber("");
    setExplicit(false);
    setValidationError("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    handleReset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!audioFile) {
      setValidationError("Vui lòng chọn file âm thanh (.mp3, .wav, .flac).");
      return;
    }

    if (!title.trim()) {
      setValidationError("Vui lòng nhập tên bài hát.");
      return;
    }

    if (selectedGenreIds.length === 0) {
      setValidationError("Vui lòng chọn ít nhất một thể loại âm nhạc.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("audioFile", audioFile);
    if (coverFile) {
      formData.append("coverImage", coverFile);
    }
    if (albumId) {
      formData.append("albumId", albumId);
      if (trackNumber) {
        formData.append("trackNumber", trackNumber);
      }
    }
    selectedGenreIds.forEach((id) => {
      formData.append("genreIds", id);
    });
    formData.append("explicit", explicit ? "true" : "false");

    setIsSubmitting(true);
    try {
      await uploadSongApi(formData);
      toast.success("Tải lên bài hát thành công! Bài hát đang chờ duyệt.");
      handleReset();
      onSuccess?.();
      onClose();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Đăng tải bài hát thất bại. Vui lòng thử lại sau.";
      toast.error(errMsg);
      setValidationError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#18181c] border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fa2d48] to-[#ff5b73] text-white shadow-md shadow-[#fa2d48]/20">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Đăng tải bài hát mới</h2>
              <p className="text-xs text-neutral-400">
                Tải lên bản thu âm và thông tin phát hành của bạn
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {validationError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. Chọn file Audio (Bắt buộc) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              File âm thanh (Audio file) <span className="text-[#fa2d48]">*</span>
            </label>
            <input
              type="file"
              ref={audioInputRef}
              onChange={handleAudioChange}
              accept="audio/*,.mp3,.wav,.flac,.m4a"
              className="hidden"
            />
            {audioFile ? (
              <div className="flex items-center justify-between rounded-xl border border-[#fa2d48]/40 bg-[#fa2d48]/5 p-4">
                <div className="flex items-center gap-3 truncate">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fa2d48] text-white">
                    <Music2 className="h-5 w-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate">{audioFile.name}</p>
                    <p className="text-xs text-neutral-400">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="dark"
                  size="sm"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  Đổi file
                </Button>
              </div>
            ) : (
              <div
                onClick={() => audioInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-700 hover:border-[#fa2d48] bg-[#121215]/60 hover:bg-[#121215] p-6 text-center cursor-pointer transition-all duration-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 group-hover:bg-[#fa2d48]/10 group-hover:text-[#fa2d48] text-neutral-400 transition-colors mb-3">
                  <Music2 className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-neutral-200">
                  Nhấp để tải lên bài hát hoặc kéo thả vào đây
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Định dạng hỗ trợ: MP3, WAV, FLAC (Tối đa 50MB)
                </p>
              </div>
            )}
          </div>

          {/* 2. Tiêu đề bài hát & Ảnh bìa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ảnh bìa */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Ảnh bìa (Tùy chọn)
              </label>
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => coverInputRef.current?.click()}
                className="group relative aspect-square w-full rounded-xl overflow-hidden border border-neutral-700 hover:border-neutral-500 bg-[#121215] flex flex-col items-center justify-center cursor-pointer transition-all"
              >
                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-medium transition-opacity">
                      Thay đổi ảnh
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center p-3 text-neutral-500 group-hover:text-neutral-300">
                    <ImageIcon className="h-8 w-8 mb-1.5" />
                    <span className="text-xs font-medium">Tải ảnh bìa</span>
                    <span className="text-[10px] text-neutral-600">Vuông 1:1</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin bài hát */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Tên bài hát <span className="text-[#fa2d48]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Cơn Mưa Ngang Qua..."
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-neutral-700 bg-[#121215] px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none transition-colors"
                />
              </div>

              {/* Phân loại Album (Tùy chọn) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Thuộc Album (Tùy chọn)
                  </label>
                  <select
                    value={albumId}
                    onChange={(e) => setAlbumId(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-700 bg-[#121215] px-3.5 py-2.5 text-sm text-white focus:border-[#fa2d48] focus:outline-none transition-colors"
                  >
                    <option value="">-- Đĩa đơn độc lập (Single) --</option>
                    {albums.map((alb) => (
                      <option key={alb.id} value={alb.id}>
                        {alb.title} ({alb.albumType || "ALBUM"})
                      </option>
                    ))}
                  </select>
                </div>

                {albumId && (
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Số Track
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={trackNumber}
                      onChange={(e) => setTrackNumber(e.target.value)}
                      placeholder="Tự động"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-neutral-700 bg-[#121215] px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Explicit Content Toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={explicit}
                  onChange={(e) => setExplicit(e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-[#fa2d48] accent-[#fa2d48] focus:ring-0"
                />
                <div>
                  <span className="text-sm font-medium text-neutral-200">
                    Đánh dấu nội dung 18+ (Explicit)
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Bật nếu bài hát có ca từ nhạy cảm hoặc không dành cho trẻ em
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Thể loại âm nhạc (Genres) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Thể loại âm nhạc (Chọn ít nhất 1) <span className="text-[#fa2d48]">*</span>
            </label>
            {isLoadingGenres ? (
              <div className="flex items-center gap-2 text-xs text-neutral-400 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#fa2d48]" />
                Đang tải danh sách thể loại...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                {genres.map((g) => {
                  const isSelected = selectedGenreIds.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGenre(g.id)}
                      disabled={isSubmitting}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-[#fa2d48] text-white shadow-sm shadow-[#fa2d48]/30"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      <span>{g.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-neutral-800/80 px-6 py-4 bg-[#141418]">
          <p className="text-xs text-neutral-400 flex items-center gap-1.5">
            <Disc className="h-3.5 w-3.5 text-[#fa2d48]" />
            Bài hát tải lên sẽ ở trạng thái Chờ duyệt (PENDING)
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="dark"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang tải lên...
                </>
              ) : (
                "Đăng tải ngay"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

