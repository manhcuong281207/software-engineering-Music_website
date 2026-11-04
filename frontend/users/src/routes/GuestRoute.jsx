import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Route guard dành riêng cho khách chưa đăng nhập (Trang Login, Register).
 * Nếu người dùng đã đăng nhập từ trước, tự động chuyển hướng về trang chủ
 * hoặc trang mà người dùng định truy cập trước đó.
 */
export const GuestRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get('redirect') || location.state?.from?.pathname || '/';
    return <Navigate to={redirectUrl} replace />;
  }

  return children ? children : <Outlet />;
};

export default GuestRoute;

