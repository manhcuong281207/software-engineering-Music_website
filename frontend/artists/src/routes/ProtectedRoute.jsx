import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useArtistAuthStore } from "../store/useArtistAuthStore";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useArtistAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

