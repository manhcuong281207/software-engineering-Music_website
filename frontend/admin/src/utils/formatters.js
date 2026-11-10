/**
 * Định dạng số thành chuỗi dễ đọc (VD: 12500 -> 12,500)
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("vi-VN").format(num);
};

/**
 * Định dạng thời gian ISO thành dd/mm/yyyy hh:mm
 */
export const formatDate = (dateString) => {
  if (!dateString) return "--";
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
};

/**
 * Định dạng số giây sang phút:giây (VD: 185s -> 03:05)
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

/**
 * Định dạng khoảng thời gian tương đối (VD: 5 phút trước, 2 giờ trước)
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 60) return "Vừa xong";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} ngày trước`;
    const diffMonth = Math.floor(diffDay / 30);
    return `${diffMonth} tháng trước`;
  } catch {
    return "";
  }
};

