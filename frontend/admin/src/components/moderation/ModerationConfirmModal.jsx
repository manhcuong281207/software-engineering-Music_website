import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Disc, Music } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

const QUICK_REASONS = [
  "Chất lượng âm thanh không đạt chuẩn",
  "Hình ảnh cover vi phạm bản quyền / chính sách",
  "Nội dung chứa từ ngữ thô tục / phản cảm chưa gắn cờ",
  "Thông tin bài hát / album không chính xác hoặc sai lệch",
  "Trùng lặp với bản ghi đã tồn tại trong danh mục",
];

export const ModerationConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  itemType = "bài hát", // "bài hát" | "album"
  actionType = "APPROVED", // "APPROVED" | "REJECTED" | "TAKEDOWN"
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  if (!item) return null;

  const isApprove = actionType === "APPROVED";
  const isReject = actionType === "REJECTED";
  const isTakedown = actionType === "TAKEDOWN";

  const getTitle = () => {
    if (isApprove) return `Xác nhận duyệt ${itemType}`;
    if (isReject) return `Từ chối duyệt ${itemType}`;
    return `Gỡ bỏ ${itemType} vi phạm (Takedown)`;
  };

  const getIcon = () => {
    if (isApprove)
      return (
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 size={24} />
        </div>
      );
    if (isReject)
      return (
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
          <XCircle size={24} />
        </div>
      );
    return (
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
        <AlertTriangle size={24} />
      </div>
    );
  };

  const handleConfirm = () => {
    onConfirm({ status: actionType, reason: reason.trim() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} maxWidth="max-w-lg">
      <div className="space-y-5">
        {/* Item Summary Card */}
        <div className="flex items-center gap-4 p-3.5 bg-neutral-900/80 rounded-xl border border-neutral-800">
          {item.coverImage ? (
            <img
              src={item.coverImage}
              alt={item.title}
              className="w-14 h-14 rounded-xl object-cover border border-neutral-700 shadow-md shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
              {itemType === "album" ? <Disc size={24} /> : <Music size={24} />}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
            <p className="text-xs text-[#fa2d48] font-semibold truncate mt-0.5">
              {item.ownerName || "Nghệ sĩ chưa rõ"}
            </p>
            <p className="text-[11px] text-neutral-500 font-mono truncate mt-0.5">
              ID: {item.id}
            </p>
          </div>
        </div>

        {/* Action description */}
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="text-xs text-neutral-300 leading-relaxed pt-1">
            {isApprove && (
              <p>
                Sau khi được duyệt, {itemType}{" "}
                <strong className="text-white">"{item.title}"</strong> sẽ được
                công khai ngay lập tức trên nền tảng MC Music. Người dùng sẽ có thể
                nghe, tìm kiếm và thêm vào danh sách yêu thích.
              </p>
            )}
            {isReject && (
              <p>
                {itemType.charAt(0).toUpperCase() + itemType.slice(1)}{" "}
                <strong className="text-white">"{item.title}"</strong> sẽ bị từ
                chối phát hành và chuyển sang trạng thái{" "}
                <span className="text-rose-400 font-semibold">REJECTED</span>.
                Vui lòng cung cấp lý do để phản hồi đến nghệ sĩ.
              </p>
            )}
            {isTakedown && (
              <p>
                <strong className="text-amber-400">CẢNH BÁO QUAN TRỌNG:</strong>{" "}
                Thao tác này sẽ gỡ bỏ {itemType}{" "}
                <strong className="text-white">"{item.title}"</strong> khỏi hệ
                thống do vi phạm chính sách hoặc bản quyền. Nội dung sẽ không còn
                khả dụng đối với toàn bộ người dùng.
              </p>
            )}
          </div>
        </div>

        {/* Reason Input (for REJECT or TAKEDOWN) */}
        {!isApprove && (
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Lý do {isReject ? "từ chối" : "gỡ bỏ vi phạm"}{" "}
              {isTakedown && <span className="text-rose-500">*</span>}
            </label>

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700/60 text-left"
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isTakedown
                  ? "Bắt buộc: Nhập chi tiết lý do vi phạm bản quyền hoặc tiêu chuẩn cộng đồng..."
                  : "Nhập lý do phản hồi cho nghệ sĩ..."
              }
              rows={3}
              className="w-full p-3 bg-[#121212] border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#fa2d48] transition-colors resize-none"
            />
          </div>
        )}

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800/80">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>

          {isApprove && (
            <Button
              variant="white"
              size="sm"
              onClick={handleConfirm}
              isLoading={isLoading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-[0_2px_12px_rgba(16,185,129,0.35)]"
            >
              <CheckCircle2 size={16} /> Xác nhận duyệt
            </Button>
          )}

          {isReject && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirm}
              isLoading={isLoading}
              disabled={isTakedown && !reason.trim()}
            >
              <XCircle size={16} /> Xác nhận từ chối
            </Button>
          )}

          {isTakedown && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirm}
              isLoading={isLoading}
              disabled={!reason.trim()}
              className="bg-rose-700 hover:bg-rose-800"
            >
              <AlertTriangle size={16} /> Xác nhận gỡ bỏ
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModerationConfirmModal;

