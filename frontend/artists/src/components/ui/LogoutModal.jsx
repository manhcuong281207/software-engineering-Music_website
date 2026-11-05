import React from "react";
import { LogOut, X } from "lucide-react";
import { Button } from "./Button";

export const LogoutModal = ({ isOpen, onClose, onConfirm, isLoggingOut }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#18181c] border border-neutral-800 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-[#fa2d48] mb-4">
          <LogOut className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-bold text-white">Đăng xuất tài khoản?</h3>
        <p className="mt-2 text-sm text-neutral-400">
          Bạn có chắc chắn muốn đăng xuất khỏi Cổng thông tin Nghệ sĩ MC Music không?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="dark" size="sm" onClick={onClose} disabled={isLoggingOut}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="!bg-[#fa2d48] hover:!bg-[#e0223e]"
          >
            {isLoggingOut ? "Đang xử lý..." : "Đăng xuất"}
          </Button>
        </div>
      </div>
    </div>
  );
};

