import React from "react";
import { Navigate, Outlet } from "react-router";
import { useArtistAuthStore } from "../store/useArtistAuthStore";

export const GuestRoute = () => {
  const { isAuthenticated } = useArtistAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

