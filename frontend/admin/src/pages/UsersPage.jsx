import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Lock, Unlock, Search } from "lucide-react";
import { getUsersApi, toggleUserStatusApi } from "../api/users";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Pagination } from "../components/ui/Pagination";
import { SkeletonRow } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { formatDate } from "../utils/formatters";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // 1. Fetch Users List
  const { data: usersRes, isLoading } = useQuery({
    queryKey: ["adminUsers", page],
    queryFn: () => getUsersApi({ page, size: 10, sort: "createdAt,desc" }),
  });

  const usersList = usersRes?.data?.content || [];
  const totalPages = usersRes?.data?.totalPages || 0;

  // Filter by local search keyword
  const filteredUsers = usersList.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // 2. Mutation: Toggle User Status (Lock / Unlock)
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => toggleUserStatusApi(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminUsersCount"] });
      showSuccessToast(
        variables.isActive
          ? "Đã mở khóa tài khoản người dùng thành công"
          : "Đã khóa tài khoản người dùng thành công"
      );
      setIsConfirmModalOpen(false);
      setSelectedUser(null);
    },
    onError: (err) => {
      showErrorToast(
        err.response?.data?.message || "Không thể cập nhật trạng thái người dùng"
      );
    },
  });

  const handleOpenConfirm = (user) => {
    setSelectedUser(user);
    setIsConfirmModalOpen(true);
  };

  const handleExecuteToggle = () => {
    if (!selectedUser) return;
    const nextStatus = !selectedUser.isActive;
    toggleMutation.mutate({ id: selectedUser.id, isActive: nextStatus });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users size={26} className="text-[#fa2d48]" /> Quản lý Người dùng
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Danh sách tất cả tài khoản người nghe trong hệ sinh thái MC Music
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
            placeholder="Tìm theo tên hoặc email..."
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
                <th className="py-4 px-6">Người dùng</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6">Ngày tạo</th>
                <th className="py-4 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={5} />
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-neutral-800/30 transition-colors"
                  >
                    {/* User info */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center text-xs">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm">
                            {user.fullName || "Chưa cập nhật tên"}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            {user.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-6 text-neutral-300">
                      {user.email}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-6">
                      <StatusBadge isActive={user.isActive ?? true} />
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-6 text-neutral-400">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <Button
                        variant={user.isActive ? "danger" : "secondary"}
                        size="sm"
                        onClick={() => handleOpenConfirm(user)}
                        className="ml-auto text-xs"
                      >
                        {user.isActive ? (
                          <>
                            <Lock size={13} /> Khóa tài khoản
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
                    colSpan={5}
                    className="py-12 text-center text-xs text-neutral-500"
                  >
                    Không tìm thấy người dùng nào phù hợp
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
          selectedUser?.isActive
            ? "Xác nhận khóa tài khoản"
            : "Xác nhận mở khóa tài khoản"
        }
      >
        <p className="text-sm text-neutral-300 mb-6">
          Bạn có chắc chắn muốn{" "}
          <span className="font-bold text-white">
            {selectedUser?.isActive ? "khóa" : "mở khóa"}
          </span>{" "}
          tài khoản của người dùng{" "}
          <span className="text-[#fa2d48] font-bold">
            {selectedUser?.fullName || selectedUser?.email}
          </span>
          ?
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
            variant={selectedUser?.isActive ? "danger" : "primary"}
            size="sm"
            onClick={handleExecuteToggle}
            isLoading={toggleMutation.isPending}
          >
            {selectedUser?.isActive ? "Khóa tài khoản" : "Mở khóa"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
