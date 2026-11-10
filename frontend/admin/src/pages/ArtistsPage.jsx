import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mic2,
  Lock,
  Unlock,
  Search,
  Users,
  Eye,
  Calendar,
  Mail,
  Fingerprint,
  Radio,
  AlertCircle,
} from "lucide-react";
import { getArtistsApi, toggleArtistStatusApi, getArtistDetailApi } from "../api/artists";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Pagination } from "../components/ui/Pagination";
import { SkeletonRow } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { formatNumber, formatDate } from "../utils/formatters";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { useAuthStore } from "../store/useAuthStore";

export const ArtistsPage = () => {
  const queryClient = useQueryClient();
  const currentAdmin = useAuthStore((state) => state.admin);

  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Modal Chi tiết Nghệ sĩ
  const [detailArtist, setDetailArtist] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 1. Fetch Artists List
  const { data: artistsRes, isLoading, isError } = useQuery({
    queryKey: ["adminArtists", page],
    queryFn: () => getArtistsApi({ page, size: 10, sort: "createdAt,desc" }),
  });

  const artistsList = artistsRes?.data?.content || [];
  const totalPages = artistsRes?.data?.totalPages || 0;
  const totalElements = artistsRes?.data?.totalElements || 0;

  // Lọc cục bộ theo từ khóa
  const filteredArtists = artistsList.filter(
    (a) =>
      a.stageName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      a.id?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // 2. Mutation: Khóa / Mở khóa Nghệ sĩ
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => toggleArtistStatusApi(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminArtists"] });
      queryClient.invalidateQueries({ queryKey: ["adminArtistsCount"] });
      showSuccessToast(
        variables.isActive
          ? "Đã mở khóa tài khoản nghệ sĩ thành công"
          : "Đã khóa tài khoản nghệ sĩ thành công"
      );
      setIsConfirmModalOpen(false);

      if (detailArtist && detailArtist.id === variables.id) {
        setDetailArtist((prev) => ({ ...prev, isActive: variables.isActive }));
      }
      setSelectedArtist(null);
    },
    onError: (err) => {
      showErrorToast(
        err.response?.data?.message || "Không thể cập nhật trạng thái nghệ sĩ"
      );
    },
  });

  const handleOpenConfirm = (artist, e) => {
    if (e) e.stopPropagation();
    setSelectedArtist(artist);
    setIsConfirmModalOpen(true);
  };

  const handleExecuteToggle = () => {
    if (!selectedArtist) return;
    const nextStatus = !selectedArtist.isActive;
    toggleMutation.mutate({ id: selectedArtist.id, isActive: nextStatus });
  };

  // Mở modal xem thông tin chi tiết nghệ sĩ
  const handleOpenDetail = async (artist) => {
    setDetailArtist(artist);
    setIsDetailModalOpen(true);
    try {
      const res = await getArtistDetailApi(artist.id);
      if (res?.data) {
        setDetailArtist(res.data);
      }
    } catch {
      // Giữ thông tin cơ bản hiện tại nếu API chi tiết trục trặc
    }
  };

  // Kiểm tra an toàn: nếu tài khoản trùng với admin
  const isSelf = (artist) => {
    if (!artist || !currentAdmin) return false;
    return (
      (currentAdmin.id && currentAdmin.id === artist.id) ||
      (currentAdmin.email && currentAdmin.email === artist.email)
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Mic2 size={26} className="text-[#fa2d48]" /> Quản lý Nghệ sĩ
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tổng cộng {totalElements} đối tác sáng tạo và người đăng tải âm nhạc trên hệ thống
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo nghệ danh, email, ID..."
            className="w-full pl-10 pr-4 py-2 bg-[#181818] border border-neutral-800 rounded-full text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#fa2d48] transition-colors"
          />
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-[#181818] border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800/80 bg-neutral-900/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-4 px-6">Nghệ sĩ</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Người theo dõi</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6">Ngày tham gia</th>
                <th className="py-4 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={6} />
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-rose-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={22} />
                      <span>Không thể tải danh sách nghệ sĩ từ hệ thống</span>
                    </div>
                  </td>
                </tr>
              ) : filteredArtists.length > 0 ? (
                filteredArtists.map((artist) => {
                  const selfUser = isSelf(artist);
                  return (
                    <tr
                      key={artist.id}
                      onClick={() => handleOpenDetail(artist)}
                      className="hover:bg-neutral-800/30 transition-colors cursor-pointer"
                    >
                      {/* Artist info */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          {artist.avatarUrl ? (
                            <img
                              src={artist.avatarUrl}
                              alt={artist.stageName}
                              className="w-9 h-9 rounded-full object-cover border border-neutral-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center text-xs shrink-0">
                              {artist.stageName ? artist.stageName.charAt(0).toUpperCase() : "A"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                              {artist.stageName}
                              {selfUser && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono truncate">
                              {artist.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-6 text-neutral-300">
                        {artist.email}
                      </td>

                      {/* Followers */}
                      <td className="py-3.5 px-6 text-neutral-300 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={13} className="text-neutral-500" />
                          {formatNumber(artist.followerCount || 0)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-6">
                        <StatusBadge isActive={artist.isActive ?? true} />
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-6 text-neutral-400">
                        {formatDate(artist.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetail(artist)}
                            className="text-xs text-neutral-400 hover:text-white"
                            title="Xem chi tiết"
                          >
                            <Eye size={14} /> Chi tiết
                          </Button>

                          <Button
                            variant={artist.isActive ? "danger" : "secondary"}
                            size="sm"
                            onClick={(e) => handleOpenConfirm(artist, e)}
                            disabled={selfUser}
                            className="text-xs"
                            title={selfUser ? "Không thể khóa tài khoản của chính mình" : undefined}
                          >
                            {artist.isActive ? (
                              <>
                                <Lock size={13} /> Khóa
                              </>
                            ) : (
                              <>
                                <Unlock size={13} /> Mở khóa
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-neutral-500"
                  >
                    Không tìm thấy nghệ sĩ nào phù hợp với từ khóa
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

      {/* ── MODAL 1: XEM CHI TIẾT NGHỆ SĨ (ARTIST PROFILE MODAL) ── */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Thông tin chi tiết Nghệ sĩ"
      >
        {detailArtist && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
              {detailArtist.avatarUrl ? (
                <img
                  src={detailArtist.avatarUrl}
                  alt={detailArtist.stageName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/40"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-neutral-800 text-white text-xl font-bold flex items-center justify-center border-2 border-neutral-700">
                  {detailArtist.stageName ? detailArtist.stageName.charAt(0).toUpperCase() : "A"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white truncate">
                    {detailArtist.stageName}
                  </h3>
                  {isSelf(detailArtist) && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">
                      Tài khoản của bạn
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 truncate flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} className="text-neutral-500" /> {detailArtist.email}
                </p>
                <div className="mt-2">
                  <StatusBadge isActive={detailArtist.isActive ?? true} />
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/80">
                <span className="text-neutral-500 flex items-center gap-1.5 mb-1 font-medium">
                  <Fingerprint size={14} className="text-[#fa2d48]" /> ID Nghệ sĩ
                </span>
                <span className="text-white font-mono text-[11px] break-all select-all">
                  {detailArtist.id}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/80">
                <span className="text-neutral-500 flex items-center gap-1.5 mb-1 font-medium">
                  <Users size={14} className="text-emerald-400" /> Người theo dõi
                </span>
                <span className="text-white font-bold text-sm">
                  {formatNumber(detailArtist.followerCount || 0)} người
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/80">
                <span className="text-neutral-500 flex items-center gap-1.5 mb-1 font-medium">
                  <Radio size={14} className="text-indigo-400" /> Vai trò sáng tạo
                </span>
                <span className="text-white font-semibold">
                  Đối tác Nghệ sĩ (Artist / Creator)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/80">
                <span className="text-neutral-500 flex items-center gap-1.5 mb-1 font-medium">
                  <Calendar size={14} className="text-amber-400" /> Ngày tham gia nền tảng
                </span>
                <span className="text-white font-semibold">
                  {formatDate(detailArtist.createdAt)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <div>
                {!isSelf(detailArtist) && (
                  <Button
                    variant={detailArtist.isActive ? "danger" : "secondary"}
                    size="sm"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenConfirm(detailArtist);
                    }}
                    className="text-xs"
                  >
                    {detailArtist.isActive ? (
                      <>
                        <Lock size={13} /> Khóa nghệ sĩ này
                      </>
                    ) : (
                      <>
                        <Unlock size={13} /> Mở khóa nghệ sĩ
                      </>
                    )}
                  </Button>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL 2: XÁC NHẬN KHÓA / MỞ KHÓA ── */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={
          selectedArtist?.isActive
            ? "Xác nhận khóa nghệ sĩ"
            : "Xác nhận mở khóa nghệ sĩ"
        }
      >
        <p className="text-sm text-neutral-300 mb-6">
          Bạn có chắc chắn muốn{" "}
          <span className="font-bold text-white">
            {selectedArtist?.isActive ? "khóa" : "mở khóa"}
          </span>{" "}
          tài khoản của nghệ sĩ{" "}
          <span className="text-[#fa2d48] font-bold">
            {selectedArtist?.stageName}
          </span>
          ? Khi bị khóa, nghệ sĩ sẽ không thể đăng tải nhạc hoặc truy cập studio quản lý.
        </p>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsConfirmModalOpen(false)}
            disabled={toggleMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            variant={selectedArtist?.isActive ? "danger" : "primary"}
            size="sm"
            onClick={handleExecuteToggle}
            isLoading={toggleMutation.isPending}
          >
            {selectedArtist?.isActive ? "Khóa nghệ sĩ" : "Mở khóa"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ArtistsPage;
