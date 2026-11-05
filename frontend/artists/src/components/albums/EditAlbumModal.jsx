import React, { useState, useRef } from "react";
import {
  X,
  Edit,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { updateAlbumApi } from "../../api/catalog";
import { Button } from "../ui/Button";
import { toast } from "sonner";

const EditAlbumModalContent = ({ album, onClose, onSuccess }) => {
  const [title, setTitle] = useState(album?.title || "");
  const [description, setDescription] = useState(album?.description || "");
  const [albumType, setAlbumType] = useState(album?.albumType || "ALBUM");
  const [releaseDate, setReleaseDate] = useState(album?.releaseDate || "");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(album?.coverImage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const coverInputRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!title.trim()) {
      setValidationError("Vui lòng nhập tên Album.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    if (description !== undefined) {
      formData.append("description", description.trim());
    }
    formData.append("albumType", albumType);
    if (releaseDate) {
      formData.append("releaseDate", releaseDate);
    }
    if (coverFile) {
      formData.append("coverImage", coverFile);
    }

    setIsSubmitting(true);
    try {
      await updateAlbumApi(album.id, formData);
      toast.success("Cập nhật Album thành công! Album chuyển về trạng thái Chờ duyệt.");
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể cập nhật album.";
      toast.error(msg);
      setValidationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-[#18181c] border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fa2d48]/10 text-[#fa2d48] border border-[#fa2d48]/20">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Chỉnh sửa Album</h2>
              <p className="text-xs text-neutral-400 truncate max-w-sm">{album.title}</p>
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
            <strong>Lưu ý:</strong> Sau khi cập nhật, Album sẽ chuyển về trạng thái <strong>Chờ duyệt (PENDING)</strong> để Ban quản trị kiểm duyệt lại.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {validationError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ảnh bìa */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Ảnh bìa Album
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

            {/* Thông tin Album */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Tên Album <span className="text-[#fa2d48]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tên Album..."
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-neutral-700 bg-[#121215] px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Phân loại */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Phân loại
                  </label>
                  <select
                    value={albumType}
                    onChange={(e) => setAlbumType(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-700 bg-[#121215] px-3.5 py-2.5 text-sm text-white focus:border-[#fa2d48] focus:outline-none transition-colors"
                  >
                    <option value="ALBUM">Album (Đầy đủ)</option>
                    <option value="EP">EP (Đĩa mở rộng)</option>
                    <option value="SINGLE">Single (Đĩa đơn)</option>
                  </select>
                </div>

                {/* Ngày phát hành */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Ngày phát hành
                  </label>
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-700 bg-[#121215] px-3.5 py-2.5 text-sm text-white focus:border-[#fa2d48] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Mô tả Album
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-neutral-700 bg-[#121215] px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>
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

export const EditAlbumModal = ({ isOpen, onClose, album, onSuccess }) => {
  if (!isOpen || !album) return null;
  return (
    <EditAlbumModalContent
      key={album.id}
      album={album}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};
