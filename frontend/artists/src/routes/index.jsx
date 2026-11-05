import React from "react";
import { Routes, Route } from "react-router";

import { ArtistLayout } from "../layouts/ArtistLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { ProfilePage } from "../pages/ProfilePage";
import { SongsPage } from "../pages/SongsPage";
import { AlbumsPage } from "../pages/AlbumsPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { NotFoundPage } from "../pages/NotFoundPage";

import { ProtectedRoute } from "./ProtectedRoute";
import { GuestRoute } from "./GuestRoute";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Nhóm Route Nghệ sĩ được bảo vệ (Bắt buộc đăng nhập tài khoản Artist) ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ArtistLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/songs" element={<SongsPage />} />
          <Route path="/albums" element={<AlbumsPage />} />
        </Route>
      </Route>

      {/* ── Nhóm Route Xác thực (Chỉ dành cho khách chưa đăng nhập) ── */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* ── Route 404 Không tìm thấy trang ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
