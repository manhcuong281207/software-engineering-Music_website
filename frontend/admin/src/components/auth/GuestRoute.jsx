import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";

export const GuestRoute = () => {
  const { isAuthenticated, accessToken, hasValidAdminRole } = useAuthStore();

  // Nếu đã đăng nhập với quyền Admin hợp lệ -> Chuyển thẳng về Dashboard
  if (isAuthenticated && accessToken && hasValidAdminRole()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
