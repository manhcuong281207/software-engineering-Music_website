import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Users,
  Mail,
  Fingerprint,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getArtistProfileApi, updateArtistProfileApi } from "../api/artist";
import { getErrorMessage } from "../api/auth";
import { useArtistAuthStore } from "../store/useArtistAuthStore";
import { Button } from "../components/ui/Button";
import { ArtistAvatar } from "../components/ui/ArtistAvatar";

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { artist: cachedArtist, updateArtist } = useArtistAuthStore();

  // File input refs
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Form states
  const [stageName, setStageName] = useState(() => cachedArtist?.stageName || "");
  const [biography, setBiography] = useState(() => cachedArtist?.biography || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [hasCopiedId, setHasCopiedId] = useState(false);

  // 1. Fetch thông tin Profile từ API Backend GET /api/artist/me
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
    refetch,
  } = useQuery({
    queryKey: ["artistProfile"],
    queryFn: getArtistProfileApi,
    staleTime: 1000 * 60 * 5, // 5 phút
  });

  const profile = profileData?.data || cachedArtist;
  const lastSyncedProfileId = useRef(null);

  // Đồng bộ dữ liệu vào form khi ID profile mới được nạp
  useEffect(() => {
    if (profile?.id && lastSyncedProfileId.current !== profile.id) {
      lastSyncedProfileId.current = profile.id;
      setStageName(profile.stageName || "");
      setBiography(profile.biography || "");
      setAvatarPreview(null);
      setCoverPreview(null);
      setAvatarFile(null);
      setCoverFile(null);
    }
  }, [profile?.id, profile?.stageName, profile?.biography]);

  // 2. Mutation cập nhật Profile PUT /api/artist/me (multipart/form-data)
  const updateMutation = useMutation({
    mutationFn: (formData) => updateArtistProfileApi(formData),
    onSuccess: (response) => {
      const updatedData = response.data;
      toast.success("Cập nhật hồ sơ nghệ sĩ thành công!");

      // Cập nhật ngay vào Auth Store để Sidebar & Topbar đồng bộ
      updateArtist(updatedData);

      // Invalidate queries để refetch dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: ["artistProfile"] });
      queryClient.invalidateQueries({ queryKey: ["artistDashboard"] });

      // Reset các preview file tạm
      setAvatarFile(null);
      setCoverFile(null);
      setAvatarPreview(null);
      setCoverPreview(null);
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Không thể cập nhật hồ sơ nghệ sĩ");
      toast.error(message);
    },
  });

  // Xử lý chọn ảnh đại diện (Avatar)
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh đại diện không được vượt quá 5MB");
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  // Xử lý chọn ảnh bìa (Cover)
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Kích thước ảnh bìa không được vượt quá 8MB");
      return;
    }

    setCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
  };

  // Submit cập nhật hồ sơ
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!stageName.trim()) {
      toast.error("Tên nghệ danh không được để trống");
      return;
    }

    const formData = new FormData();
    formData.append("stageName", stageName.trim());
    formData.append("biography", biography ? biography.trim() : "");

    if (avatarFile) {
      formData.append("avatarFile", avatarFile);
    }
    if (coverFile) {
      formData.append("coverFile", coverFile);
    }

    updateMutation.mutate(formData);
  };

  // Đặt lại form về ban đầu
  const handleReset = () => {
    if (profile) {
      setStageName(profile.stageName || "");
      setBiography(profile.biography || "");
    }
    setAvatarFile(null);
    setCoverFile(null);
    setAvatarPreview(null);
    setCoverPreview(null);
    toast.info("Đã khôi phục các thay đổi chưa lưu");
  };

  const copyArtistId = () => {
    if (!profile?.id) return;
    navigator.clipboard.writeText(profile.id);
    setHasCopiedId(true);
    toast.success("Đã sao chép Artist UUID vào bộ nhớ tạm");
    setTimeout(() => setHasCopiedId(false), 2000);
  };

  const isFormDirty =
    stageName !== (profile?.stageName || "") ||
    biography !== (profile?.biography || "") ||
    avatarFile !== null ||
    coverFile !== null;

  if (isLoadingProfile && !profile) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 animate-pulse p-4">
        <div className="h-64 rounded-3xl bg-neutral-800/40" />
        <div className="h-96 rounded-3xl bg-neutral-800/40" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fadeIn pb-12">
      {/* ─── BANNER VÀ AVATAR HEADER ──────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl border border-neutral-800/80 bg-[#141418] shadow-2xl">
        {/* Cover Banner Area */}
        <div className="relative h-56 sm:h-72 w-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 overflow-hidden">
          {(coverPreview || profile?.coverUrl) ? (
            <img
              src={coverPreview || profile?.coverUrl}
              alt="Ảnh bìa nghệ sĩ"
              className="h-full w-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1416] via-[#121215] to-[#0a0a0c]">
              <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium">
                <ImageIcon className="h-5 w-5" />
                <span>Chưa có ảnh bìa</span>
              </div>
            </div>
          )}

          {/* Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-black/30" />

          {/* Cover upload button */}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-black/80 hover:border-white/20 transition-all active:scale-95"
          >
            <Camera className="h-4 w-4" />
            <span>{coverPreview ? "Đổi ảnh bìa khác" : "Thay đổi ảnh bìa"}</span>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
        </div>

        {/* Profile Info Row below Banner */}
        <div className="relative px-6 sm:px-8 pb-8 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Avatar with Camera Trigger */}
            <div className="relative inline-block">
              <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-full ring-4 ring-[#141418] overflow-hidden bg-neutral-900 shadow-2xl">
                <ArtistAvatar
                  src={avatarPreview || profile?.avatarUrl}
                  alt={stageName || profile?.stageName}
                  size="xl"
                  className="h-full w-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                title="Thay đổi ảnh đại diện"
                className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#fa2d48] text-white shadow-lg hover:bg-[#ff4b63] transition active:scale-95 border-2 border-[#141418]"
              >
                <Camera className="h-5 w-5" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Quick Public Link */}
            {profile?.id && (
              <a
                href={`http://localhost:5173/artist/${profile.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/80 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700 transition"
              >
                <span>Xem trang công khai trên User Web</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Quick Header Metadata */}
          <div className="mt-5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {profile?.stageName || "Hồ sơ nghệ sĩ"}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fa2d48]/15 px-2.5 py-0.5 text-xs font-bold text-[#fa2d48] border border-[#fa2d48]/30">
                <Sparkles className="h-3 w-3" />
                Xác thực
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-white">
                  {Number(profile?.followerCount || 0).toLocaleString("vi-VN")}
                </span>
                <span>người theo dõi</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>{profile?.email || "Chưa có email"}</span>
              </div>

              {profile?.id && (
                <button
                  type="button"
                  onClick={copyArtistId}
                  className="flex items-center gap-1.5 rounded-md bg-neutral-800/60 px-2 py-1 text-neutral-400 hover:text-white transition"
                  title="Click để sao chép UUID"
                >
                  <Fingerprint className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="font-mono text-[11px] truncate max-w-[120px]">
                    {profile.id}
                  </span>
                  {hasCopiedId ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── FORM CHỈNH SỬA PROFILE NGHỆ SĨ ──────────────────────────────── */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#141418] p-6 sm:p-8 shadow-xl">
        <div className="border-b border-neutral-800 pb-5">
          <h2 className="text-xl font-bold text-white">Chỉnh sửa thông tin hồ sơ</h2>
          <p className="mt-1 text-xs text-neutral-400">
            Thông tin này sẽ được hiển thị công khai trên ứng dụng MC Music để thính giả tìm kiếm và lắng nghe.
          </p>
        </div>

        {isErrorProfile && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Không thể đồng bộ hồ sơ từ Backend Artists Service.</span>
            </div>
            <Button variant="danger" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Nghệ danh (stageName) */}
          <div>
            <label
              htmlFor="stageName"
              className="block text-sm font-semibold text-neutral-200"
            >
              Nghệ danh chính thức <span className="text-[#fa2d48]">*</span>
            </label>
            <p className="mt-0.5 text-xs text-neutral-500">
              Tên nghệ sĩ sẽ được đồng bộ tự động sang Catalog Service và hiển thị trên tất cả bài hát, album.
            </p>
            <input
              id="stageName"
              type="text"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="VD: Sơn Tùng M-TP, Đen Vâu, Vũ..."
              maxLength={100}
              required
              className="mt-2 block w-full rounded-xl border border-neutral-700 bg-neutral-900/90 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none focus:ring-1 focus:ring-[#fa2d48] transition"
            />
          </div>

          {/* Tiểu sử (biography) */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="biography"
                className="block text-sm font-semibold text-neutral-200"
              >
                Tiểu sử nghệ sĩ (Biography)
              </label>
              <span className="text-xs text-neutral-500">
                {biography.length} / 1000 ký tự
              </span>
            </div>
            <p className="mt-0.5 text-xs text-neutral-500">
              Giới thiệu phong cách âm nhạc, hành trình nghệ thuật và lời chào đến người hâm mộ.
            </p>
            <textarea
              id="biography"
              rows={5}
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Chia sẻ về câu chuyện âm nhạc và đam mê của bạn..."
              maxLength={1000}
              className="mt-2 block w-full rounded-xl border border-neutral-700 bg-neutral-900/90 p-4 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none focus:ring-1 focus:ring-[#fa2d48] transition resize-y"
            />
          </div>

          {/* Thông tin tài khoản chỉ đọc (Readonly Email & UUID) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 p-4">
            <div>
              <span className="text-xs font-medium text-neutral-500">Email đăng nhập:</span>
              <p className="mt-1 font-mono text-sm text-neutral-300">{profile?.email || "..."}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-500">Vai trò hệ thống:</span>
              <p className="mt-1 text-sm font-semibold text-emerald-400">ARTIST (Nghệ sĩ)</p>
            </div>
          </div>

          {/* Các nút hành động Lưu / Hủy */}
          <div className="flex items-center justify-between border-t border-neutral-800 pt-6">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isFormDirty || updateMutation.isPending}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Khôi phục chưa lưu</span>
            </button>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!isFormDirty || updateMutation.isPending}
                className="gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang lưu lên Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Lưu thay đổi hồ sơ</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
