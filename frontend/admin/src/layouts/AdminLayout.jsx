import React, { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/useAuthStore";
import { logoutAdminApi } from "../api/auth";
import { showSuccessToast } from "../utils/toastUtils";

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { refreshToken, logout } = useAuthStore();

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (refreshToken) {
        await logoutAdminApi(refreshToken);
      }
    } catch (err) {
      console.warn("Lỗi server khi đăng xuất:", err);
    } finally {
      logout();
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      showSuccessToast("Đăng xuất thành công");
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex">
      {/* 1. Sidebar cố định */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar */}
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
        />

        {/* Nội dung trang thay đổi theo Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Modal Xác nhận Đăng xuất Toàn cục */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
        title="Xác nhận đăng xuất"
      >
        <p className="text-sm text-neutral-300 mb-6 leading-relaxed">
          Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc quản trị của MC Music? Bạn sẽ cần đăng nhập lại để tiếp tục quản trị hệ thống.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsLogoutModalOpen(false)}
            disabled={isLoggingOut}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmLogout}
            isLoading={isLoggingOut}
          >
            Đăng xuất
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLayout;
