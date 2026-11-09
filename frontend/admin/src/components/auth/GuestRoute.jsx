import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";

export const GuestRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;

