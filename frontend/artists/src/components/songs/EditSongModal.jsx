import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Edit3,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { updateSongApi, getPublicGenresApi, getArtistAlbumsApi } from "../../api/catalog";
import { Button } from "../ui/Button";
import { toast } from "sonner";

const EditSongModalContent = ({ song, onClose, onSuccess }) => {
  const [title, setTitle] = useState(song?.title || "");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(song?.coverImage || null);
  const [selectedGenreIds, setSelectedGenreIds] = useState(
    song?.genres?.map((g) => g.id) || []
  );
  const [albumId, setAlbumId] = useState(song?.albumId || "");
  const [clearAlbum, setClearAlbum] = useState(false);
  const [trackNumber, setTrackNumber] = useState(
    song?.trackNumber ? String(song.trackNumber) : ""
  );
  const [explicit, setExplicit] = useState(Boolean(song?.explicit));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const coverInputRef = useRef(null);

  // Fetch genres
  const { data: genresData, isLoading: isLoadingGenres } = useQuery({
    queryKey: ["publicGenres"],
    queryFn: getPublicGenresApi,
    staleTime: 1000 * 60 * 10,
  });

  // Fetch albums
  const { data: albumsData } = useQuery({
    queryKey: ["artistActiveAlbumsForSelect"],
    queryFn: () => getArtistAlbumsApi({ isDeleted: false, size: 50 }),
    staleTime: 1000 * 60 * 2,
  });

  const genres = genresData?.data || [];
  const albums = albumsData?.data?.content || [];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

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

    if (coverFile) {
      formData.append("coverImage", coverFile);
    }

    if (clearAlbum) {
      formData.append("clearAlbum", "true");
    } else if (albumId && albumId !== song.albumId) {
      formData.append("albumId", albumId);
      if (trackNumber) {
        formData.append("trackNumber", trackNumber);
      }
    } else if (albumId && trackNumber && trackNumber !== String(song.trackNumber || "")) {
      formData.append("trackNumber", trackNumber);
    }

    selectedGenreIds.forEach((id) => {
      formData.append("genreIds", id);
    });

    formData.append("explicit", explicit ? "true" : "false");

    setIsSubmitting(true);
    try {
      await updateSongApi(song.id, formData);
      toast.success("Cập nhật bài hát thành công! Trạng thái chuyển về chờ duyệt (PENDING).");
      onSuccess?.();
      onClose();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Cập nhật bài hát thất bại. Vui lòng thử lại sau.";
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fa2d48]/10 text-[#fa2d48] border border-[#fa2d48]/20">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Chỉnh sửa bài hát</h2>
              <p className="text-xs text-neutral-400 truncate max-w-md">
                {song.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="flex items-center gap-3 border-b border-amber-500/20 bg-amber-500/10 px-6 py-3 text-xs text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            <strong>Quy tắc kiểm duyệt:</strong> Sau khi cập nhật, bài hát sẽ tự động chuyển trạng thái về <strong>Chờ duyệt (PENDING)</strong> để Ban quản trị kiểm duyệt lại.
          </span>
        </div>

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {validationError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Tiêu đề & Ảnh bìa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ảnh bìa */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Ảnh bìa
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
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-medium transition-opacity">
                      Thay đổi ảnh
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center p-3 text-neutral-500 group-hover:text-neutral-300">
                    <ImageIcon className="h-8 w-8 mb-1.5" />
                    <span className="text-xs font-medium">Tải ảnh bìa</span>
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
                  placeholder="Nhập tên bài hát..."
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-neutral-700 bg-[#121215] px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none transition-colors"
                />
              </div>

              {/* Điều chuyển Album */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Thuộc Album
                </label>
                {song.albumId && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300 pb-1">
                    <input
                      type="checkbox"
                      checked={clearAlbum}
                      onChange={(e) => setClearAlbum(e.target.checked)}
                      disabled={isSubmitting}
                      className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-[#fa2d48] accent-[#fa2d48]"
                    />
                    <span className="text-amber-400 font-medium">
                      Gỡ khỏi album hiện tại (tách thành Single độc lập)
                    </span>
                  </label>
                )}

                {!clearAlbum && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <select
                        value={albumId}
                        onChange={(e) => setAlbumId(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-neutral-700 bg-[#121215] px-3.5 py-2.5 text-sm text-white focus:border-[#fa2d48] focus:outline-none transition-colors"
                      >
                        <option value="">-- Single độc lập (Không có album) --</option>
                        {albums.map((alb) => (
                          <option key={alb.id} value={alb.id}>
                            {alb.title} ({alb.albumType || "ALBUM"})
                          </option>
                        ))}
                      </select>
                    </div>

                    {albumId && (
                      <div className="col-span-1">
                        <input
                          type="number"
                          min="1"
                          value={trackNumber}
                          onChange={(e) => setTrackNumber(e.target.value)}
                          placeholder="Số Track"
                          disabled={isSubmitting}
                          className="w-full rounded-xl border border-neutral-700 bg-[#121215] px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Explicit */}
              <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={explicit}
                  onChange={(e) => setExplicit(e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-[#fa2d48] accent-[#fa2d48]"
                />
                <div>
                  <span className="text-sm font-medium text-neutral-200">
                    Đánh dấu nội dung 18+ (Explicit)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Thể loại */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Thể loại âm nhạc <span className="text-[#fa2d48]">*</span>
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-800/80 px-6 py-4 bg-[#141418]">
          <Button variant="dark" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const EditSongModal = ({ isOpen, onClose, song, onSuccess }) => {
  if (!isOpen || !song) return null;
  return (
    <EditSongModalContent
      key={song.id}
      song={song}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};
