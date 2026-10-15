import { toast } from "sonner";

/**
 * Hiển thị thông báo (toast) yêu cầu đăng nhập với nút điều hướng đến trang đăng nhập.
 * @param {string} actionName - Hành động người dùng muốn thực hiện (VD: "tạo danh sách phát mới")
 * @param {Function} [onLogin] - Callback khi người dùng nhấn "Đăng nhập" (thường là navigate('/login'))
 */
export const showLoginToast = (actionName, onLogin) => {
  toast("Bạn chưa đăng nhập", {
    description: `Vui lòng đăng nhập để ${actionName}.`,
    duration: 5000,
    style: {
      background: "#1f1f1f",
      color: "#ffffff",
      border: "1px solid #383838",
    },
    action: onLogin
      ? {
          label: "Đăng nhập",
          onClick: onLogin,
        }
      : undefined,
  });
};
