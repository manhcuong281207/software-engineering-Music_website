import React from 'react';
import { useNavigate } from 'react-router';
import { Music2, Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute w-[500px] h-[500px] bg-[#fa2d48]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Logo Brand */}
        <div className="w-16 h-16 rounded-2xl bg-[#fa2d48]/10 border border-[#fa2d48]/30 flex items-center justify-center shadow-[0_0_30px_rgba(250,45,72,0.25)] mb-6">
          <Music2 size={32} className="text-[#fa2d48]" />
        </div>

        {/* 404 Text */}
        <h1 className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 mb-4 tracking-tighter">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          Không tìm thấy giai điệu này
        </h2>

        <p className="text-spotify-sub text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
          Trang bạn đang tìm kiếm có thể đã bị đổi tên, tạm thời không khả dụng hoặc không tồn tại trên hệ thống MC Music.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 flex items-center justify-center gap-2"
          >
            <Home size={18} />
            <span>Về Trang chủ</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/search')}
            className="w-full sm:w-auto px-6 flex items-center justify-center gap-2"
          >
            <Search size={18} />
            <span>Tìm kiếm nhạc</span>
          </Button>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-8 text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={14} /> Quay lại trang trước
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
