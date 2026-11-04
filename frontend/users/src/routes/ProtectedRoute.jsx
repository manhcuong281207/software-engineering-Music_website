import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Route guard dành cho các trang yêu cầu đăng nhập (Profile, Liked, Playlists cá nhân...).
 * Nếu chưa đăng nhập, chuyển hướng người dùng đến trang /login
 * và lưu lại đường dẫn hiện tại vào state để sau khi đăng nhập có thể quay lại.
 */
export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;

