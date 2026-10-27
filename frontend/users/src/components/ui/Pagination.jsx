import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Component phân trang Pagination chuẩn phong cách MC Music
 * @param {number} currentPage - Trang hiện tại (0-indexed từ Backend Spring Data)
 * @param {number} totalPages - Tổng số trang
 * @param {function} onPageChange - Callback khi chuyển trang (nhận pageIndex 0-indexed)
 */
export const Pagination = ({ currentPage = 0, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Thuật toán tạo danh sách số trang thông minh
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(0, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);

      if (currentPage < 2) {
        end = maxVisible - 1;
      } else if (currentPage > totalPages - 3) {
        start = totalPages - maxVisible;
      }

      if (start > 0) {
        pages.push(0);
        if (start > 1) pages.push("ellipsis-1");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        if (end < totalPages - 2) pages.push("ellipsis-2");
        pages.push(totalPages - 1);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 my-8 select-none">
      {/* Nút Trước (Previous) */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 0}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1e1e1e] hover:bg-[#282828] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer border border-white/5"
        title="Trang trước"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Trước</span>
      </button>

      {/* Danh sách các số trang */}
      {pages.map((p, idx) => {
        if (typeof p === "string") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1 text-xs text-neutral-500 tracking-widest"
            >
              ...
            </span>
          );
        }

        const isCurrent = p === currentPage;

        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
              isCurrent
                ? "bg-[#fa2d48] text-white shadow-[0_4px_12px_rgba(250,45,72,0.4)] scale-105"
                : "bg-[#181818] hover:bg-[#282828] text-neutral-300 hover:text-white border border-white/5"
            }`}
          >
            {p + 1}
          </button>
        );
      })}

      {/* Nút Sau (Next) */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1e1e1e] hover:bg-[#282828] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer border border-white/5"
        title="Trang sau"
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
