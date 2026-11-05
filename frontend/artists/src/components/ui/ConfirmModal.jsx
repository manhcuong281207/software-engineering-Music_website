import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "danger", // danger | primary | warning
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#18181c] border border-neutral-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-[#fa2d48] mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-bold text-white">{title}</h3>
        <div className="mt-2 text-sm text-neutral-400 space-y-1">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="dark" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "primary" : variant}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={variant === "danger" ? "!bg-[#fa2d48] hover:!bg-[#e0223e]" : ""}
          >
            {isLoading ? "Đang xử lý..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

