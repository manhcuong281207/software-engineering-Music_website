import React from "react";
import { Routes, Route, Navigate } from "react-router";

import { AdminLayout } from "../layouts/AdminLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { UsersPage } from "../pages/UsersPage";
import { ArtistsPage } from "../pages/ArtistsPage";
import { SongModerationPage } from "../pages/SongModerationPage";
import { AlbumModerationPage } from "../pages/AlbumModerationPage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";

import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { GuestRoute } from "../components/auth/GuestRoute";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ── 1. Giao diện xác thực (Chỉ dành cho Quản trị viên chưa đăng nhập) ── */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* ── 2. Không gian quản trị: Yêu cầu đăng nhập & nằm trong AdminLayout ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/moderation" element={<Navigate to="/moderation/songs" replace />} />
          <Route path="/moderation/songs" element={<SongModerationPage />} />
          <Route path="/moderation/albums" element={<AlbumModerationPage />} />
        </Route>
      </Route>

      {/* ── 3. Trang 404 Not Found ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
