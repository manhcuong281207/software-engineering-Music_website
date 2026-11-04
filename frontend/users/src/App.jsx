import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AppRoutes } from './routes';
import { useAuthStore } from './store/useAuthStore';

// Khởi tạo React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Tránh refetch liên tục khi chuyển tab
      retry: 1, // Chỉ retry 1 lần nếu API lỗi
    },
  },
});

function App() {
  const { accessToken, fetchProfile } = useAuthStore();

  // Tự động kiểm tra và đồng bộ lại thông tin profile mới nhất khi mở web
  useEffect(() => {
    if (accessToken) {
      fetchProfile();
    }
  }, [accessToken, fetchProfile]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Toaster hiển thị thông báo góc trên bên phải */}
        <Toaster theme="dark" position="top-right" richColors />
        
        {/* Hệ thống định tuyến ứng dụng */}
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
