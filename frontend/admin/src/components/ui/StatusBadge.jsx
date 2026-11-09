import React from "react";
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck, Lock } from "lucide-react";

export const StatusBadge = ({ status, isActive, className = "" }) => {
  // 1. Trường hợp hiển thị trạng thái tài khoản User/Artist (isActive: true/false)
  if (typeof isActive === "boolean") {
    if (isActive) {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}>
          <ShieldCheck size={13} /> Hoạt động
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 ${className}`}>
        <Lock size={13} /> Bị khóa
      </span>
    );
  }

  // 2. Trường hợp hiển thị trạng thái kiểm duyệt nội dung Catalog (PENDING, APPROVED, REJECTED, TAKEDOWN)
  switch (status) {
    case "APPROVED":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}>
          <CheckCircle2 size={13} /> Đã duyệt
        </span>
      );
    case "PENDING":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}>
          <Clock size={13} /> Chờ duyệt
        </span>
      );
    case "REJECTED":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 ${className}`}>
          <XCircle size={13} /> Từ chối
        </span>
      );
    case "TAKEDOWN":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-600/20 text-neutral-400 border border-neutral-600/30 ${className}`}>
          <AlertTriangle size={13} /> Đã gỡ bỏ
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 ${className}`}>
          {status || "Không xác định"}
        </span>
      );
  }
};

export default StatusBadge;

