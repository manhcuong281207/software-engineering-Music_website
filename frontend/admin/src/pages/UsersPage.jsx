import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Lock,
  Unlock,
  Search,
  Eye,
  ShieldCheck,
  Calendar,
  Mail,
  Fingerprint,
  AlertCircle,
} from "lucide-react";
import { getUsersApi, toggleUserStatusApi, getUserDetailApi } from "../api/users";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Pagination } from "../components/ui/Pagination";
import { SkeletonRow } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { formatDate } from "../utils/formatters";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { useAuthStore } from "../store/useAuthStore";

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const currentAdmin = useAuthStore((state) => state.admin);

  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Modal Chi tiết tài khoản
  const [detailUser, setDetailUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 1. Fetch Users List
  const { data: usersRes, isLoading, isError } = useQuery({
    queryKey: ["adminUsers", page],
    queryFn: () => getUsersApi({ page, size: 10, sort: "createdAt,desc" }),
  });

  const usersList = usersRes?.data?.content || [];
  const totalPages = usersRes?.data?.totalPages || 0;
  const totalElements = usersRes?.data?.totalElements || 0;

  // Lọc cục bộ theo từ khóa
  const filteredUsers = usersList.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      u.id?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // 2. Mutation: Khóa / Mở khóa tài khoản
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

      // Nếu đang mở modal chi tiết của chính user này thì cập nhật trạng thái hiển thị
      if (detailUser && detailUser.id === variables.id) {
        setDetailUser((prev) => ({ ...prev, isActive: variables.isActive }));
      }
      setSelectedUser(null);
    },
    onError: (err) => {
      showErrorToast(
        err.response?.data?.message || "Không thể cập nhật trạng thái người dùng"
      );
    },
  });

  const handleOpenConfirm = (user, e) => {
    if (e) e.stopPropagation();
    setSelectedUser(user);
    setIsConfirmModalOpen(true);
  };

  const handleExecuteToggle = () => {
    if (!selectedUser) return;
    const nextStatus = !selectedUser.isActive;
    toggleMutation.mutate({ id: selectedUser.id, isActive: nextStatus });
  };

  // Mở modal xem thông tin chi tiết
  const handleOpenDetail = async (user) => {
    setDetailUser(user);
    setIsDetailModalOpen(true);
    try {
      const res = await getUserDetailApi(user.id);
      if (res?.data) {
        setDetailUser(res.data);
      }
    } catch {
      // Giữ dữ liệu hiện tại từ bảng nếu API chi tiết gặp lỗi nhẹ
    }
  };

  // Kiểm tra an toàn: Admin có phải đang thao tác trên tài khoản của chính mình không
  const isSelf = (user) => {
    if (!user || !currentAdmin) return false;
    return (
      (currentAdmin.id && currentAdmin.id === user.id) ||
      (currentAdmin.email && currentAdmin.email === user.email)
    );
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
            Tổng cộng {totalElements} tài khoản người nghe trong hệ sinh thái MC Music
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
            placeholder="Tìm theo tên, email, ID..."
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
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-rose-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={22} />
                      <span>Không thể tải danh sách người dùng từ hệ thống</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const selfUser = isSelf(user);
                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleOpenDetail(user)}
                      className="hover:bg-neutral-800/30 transition-colors cursor-pointer"
                    >
                      {/* User info */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.fullName}
                              className="w-9 h-9 rounded-full object-cover border border-neutral-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center text-xs shrink-0">
                              {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                              {user.fullName || "Chưa cập nhật tên"}
                              {selfUser && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono truncate">
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
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetail(user)}
                            className="text-xs text-neutral-400 hover:text-white"
                            title="Xem chi tiết"
                          >
                            <Eye size={14} /> Chi tiết
                          </Button>

                          <Button
                            variant={user.isActive ? "danger" : "secondary"}
                            size="sm"
                            onClick={(e) => handleOpenConfirm(user, e)}
                            disabled={selfUser}
                            className="text-xs"
                            title={selfUser ? "Không thể khóa tài khoản của chính mình" : undefined}
                          >
                            {user.isActive ? (
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
                    colSpan={5}
                    className="py-12 text-center text-xs text-neutral-500"
                  >
                    Không tìm thấy người dùng nào phù hợp với từ khóa
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

      {/* ── MODAL 1: XEM CHI TIẾT TÀI KHOẢN (USER PROFILE MODAL) ── */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Thông tin chi tiết Người dùng"
      >
        {detailUser && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
              {detailUser.avatarUrl ? (
                <img
                  src={detailUser.avatarUrl}
                  alt={detailUser.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#fa2d48]/40"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-neutral-800 text-white text-xl font-bold flex items-center justify-center border-2 border-neutral-700">
                  {detailUser.fullName ? detailUser.fullName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white truncate">
                    {detailUser.fullName || "Chưa cập nhật tên"}
                  </h3>
                  {isSelf(detailUser) && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">
                      Tài khoản của bạn
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 truncate flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} className="text-neutral-500" /> {detailUser.email}
                </p>
                <div className="mt-2">
                  <StatusBadge isActive={detailUser.isActive ?? true} />
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/80">
                <span className="text-neutral-500 flex items-center gap-1.5 mb-1 font-medium">
                  <Fingerprint size={14} className="text-[#fa2d48]" /> ID Người dùng
                </span>
                <span className="text-white font-mono text-[11px] break-all select-all">
                  {detailUser.id}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/80">
                <span className="text-neutral-500 flex items-center gap-1.5 mb-1 font-medium">
                  <ShieldCheck size={14} className="text-blue-400" /> Vai trò hệ thống
                </span>
                <span className="text-white font-semibold">
                  Tài khoản Người nghe (User)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/80 sm:col-span-2">
                <span className="text-neutral-500 flex items-center gap-1.5 mb-1 font-medium">
                  <Calendar size={14} className="text-emerald-400" /> Thời gian đăng ký tài khoản
                </span>
                <span className="text-white font-semibold">
                  {formatDate(detailUser.createdAt)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <div>
                {!isSelf(detailUser) && (
                  <Button
                    variant={detailUser.isActive ? "danger" : "secondary"}
                    size="sm"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenConfirm(detailUser);
                    }}
                    className="text-xs"
                  >
                    {detailUser.isActive ? (
                      <>
                        <Lock size={13} /> Khóa tài khoản này
                      </>
                    ) : (
                      <>
                        <Unlock size={13} /> Mở khóa tài khoản
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
