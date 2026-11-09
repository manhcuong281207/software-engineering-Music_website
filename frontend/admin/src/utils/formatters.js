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

