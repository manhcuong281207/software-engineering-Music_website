import React from 'react';
import { Routes, Route } from 'react-router';

import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { SearchPage } from '../pages/SearchPage';
import { AlbumPage } from '../pages/AlbumPage';
import { ArtistPage } from '../pages/ArtistPage';
import { PlaylistPage } from '../pages/PlaylistPage';
import { LikedSongsPage } from '../pages/LikedSongsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { LogoutPage } from '../pages/LogoutPage';
import { NotFoundPage } from '../pages/NotFoundPage';

import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';

/**
 * Cấu hình toàn bộ hệ thống định tuyến (Routing) cho ứng dụng User Web
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Group 1: Các trang có giao diện chính (Sidebar, Header, Bottom Player) ── */}
      <Route element={<MainLayout />}>
        {/* Công khai: Mọi người đều có thể khám phá và nghe thử */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/browse" element={<SearchPage />} />
        <Route path="/album/:id" element={<AlbumPage />} />
        <Route path="/artist/:id" element={<ArtistPage />} />
        <Route path="/playlist/:id" element={<PlaylistPage />} />

        {/* Bảo vệ: Chỉ người dùng đã đăng nhập mới truy cập được */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/collection/tracks" element={<LikedSongsPage />} />
          <Route path="/liked" element={<LikedSongsPage />} />
        </Route>
      </Route>

      {/* ── Group 2: Các trang xác thực (Chỉ dành cho khách chưa đăng nhập) ── */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* ── Group 3: Trang đăng xuất chuyên dụng ── */}
      <Route path="/logout" element={<LogoutPage />} />

      {/* ── Group 4: Xử lý 404 Không tìm thấy trang ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;

