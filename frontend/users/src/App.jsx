import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/MockHomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AlbumPage } from './pages/AlbumPage';
import { ArtistPage } from './pages/ArtistPage';
import { LibraryPage } from './pages/LibraryPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { PlaylistModals } from './components/modals/PlaylistModals';

// Khởi tạo React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Toaster dùng để hiển thị thông báo góc trên bên phải */}
        <Toaster theme="dark" position="top-right" richColors />

        {/* Global Modals cho Playlist (Tạo, Sửa, Xóa, Thêm bài hát) */}
        <PlaylistModals />

        <Routes>
          {/* Group 1: Các trang được bọc trong MainLayout (Có Sidebar & Player) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
            <Route path="/library/playlist/:id" element={<PlaylistDetailPage />} />
            <Route path="/album/:id" element={<AlbumPage />} />
            <Route path="/artist/:id" element={<ArtistPage />} />
          </Route>

          {/* Group 2: Các trang độc lập, toàn màn hình */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
