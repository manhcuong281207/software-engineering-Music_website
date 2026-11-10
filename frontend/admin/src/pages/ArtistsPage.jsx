import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mic2, Lock, Unlock, Search, Users } from "lucide-react";
import { getArtistsApi, toggleArtistStatusApi } from "../api/artists";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Pagination } from "../components/ui/Pagination";
import { SkeletonRow } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { formatNumber, formatDate } from "../utils/formatters";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

export const ArtistsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // 1. Fetch Artists List
  const { data: artistsRes, isLoading } = useQuery({
    queryKey: ["adminArtists", page],
    queryFn: () => getArtistsApi({ page, size: 10, sort: "createdAt,desc" }),
  });

  const artistsList = artistsRes?.data?.content || [];
  const totalPages = artistsRes?.data?.totalPages || 0;

  // Filter by search keyword
  const filteredArtists = artistsList.filter(
    (a) =>
      a.stageName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // 2. Mutation: Toggle Artist Status
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
      setSelectedArtist(null);
    },
    onError: (err) => {
      showErrorToast(
        err.response?.data?.message || "Không thể cập nhật trạng thái nghệ sĩ"
      );
    },
  });

  const handleOpenConfirm = (artist) => {
    setSelectedArtist(artist);
    setIsConfirmModalOpen(true);
  };

  const handleExecuteToggle = () => {
    if (!selectedArtist) return;
    const nextStatus = !selectedArtist.isActive;
    toggleMutation.mutate({ id: selectedArtist.id, isActive: nextStatus });
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
            Danh sách tất cả đối tác sáng tạo và người đăng tải âm nhạc trên hệ thống
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
            placeholder="Tìm theo nghệ danh hoặc email..."
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
              ) : filteredArtists.length > 0 ? (
                filteredArtists.map((artist) => (
                  <tr
                    key={artist.id}
                    className="hover:bg-neutral-800/30 transition-colors"
                  >
                    {/* Artist info */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        {artist.avatarUrl ? (
                          <img
                            src={artist.avatarUrl}
                            alt={artist.stageName}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center text-xs">
                            {artist.stageName ? artist.stageName.charAt(0).toUpperCase() : "A"}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm">
                            {artist.stageName}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono">
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
                      <Button
                        variant={artist.isActive ? "danger" : "secondary"}
                        size="sm"
                        onClick={() => handleOpenConfirm(artist)}
                        className="ml-auto text-xs"
                      >
                        {artist.isActive ? (
                          <>
                            <Lock size={13} /> Khóa nghệ sĩ
                          </>
                        ) : (
                          <>
                            <Unlock size={13} /> Mở khóa
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-neutral-500"
                  >
                    Không tìm thấy nghệ sĩ nào phù hợp
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

      {/* ── CONFIRM MODAL ── */}
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
          ? Khi bị khóa, nghệ sĩ sẽ không thể đăng tải nhạc hoặc truy cập studio.
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

