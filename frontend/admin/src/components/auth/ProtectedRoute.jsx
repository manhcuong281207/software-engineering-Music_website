import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";

export const ProtectedRoute = () => {
  const { isAuthenticated, accessToken, refreshToken, hasValidAdminRole, isTokenExpired, logout } =
    useAuthStore();
  const location = useLocation();

  // 1. Chưa đăng nhập hoặc không có Access Token -> Chuyển hướng tới trang Đăng nhập
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Kiểm tra quyền hạn Admin (phải thuộc danh sách ALLOWED_ADMIN_ROLES)
  if (!hasValidAdminRole()) {
    logout();
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          error: "Tài khoản của bạn không có quyền truy cập khu vực Quản trị.",
        }}
        replace
      />
    );
  }

  // 3. Token đã hết hạn và không còn Refresh Token để làm mới -> Yêu cầu đăng nhập lại
  if (isTokenExpired() && !refreshToken) {
    logout();
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          error: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
        }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
