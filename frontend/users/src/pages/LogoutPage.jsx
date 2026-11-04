import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { LogOut, ArrowLeft, ShieldAlert, CheckCircle2, Loader2, Music2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';

export const LogoutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, performLogout, logout } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setIsSubmitting(true);
      await performLogout();
      toast.success('Đăng xuất thành công!', {
        description: 'Hẹn gặp lại bạn trong những giai điệu tiếp theo.',
      });
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
      // Vẫn đảm bảo đăng xuất client nếu có lỗi mạng
      logout();
      toast.info('Đã đăng xuất khỏi thiết bị này.');
      navigate('/', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Red Glow */}
      <div className="absolute w-[460px] h-[460px] bg-[#fa2d48]/12 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#121212] border border-neutral-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Logo / Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fa2d48] flex items-center justify-center shadow-[0_0_16px_rgba(250,45,72,0.4)]">
              <Music2 size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-wide">MC Music</span>
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 font-medium">
            Xác thực
          </span>
        </div>

        {isAuthenticated ? (
          <>
            {/* Warning Icon & Heading */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#fa2d48]/10 border border-[#fa2d48]/30 flex items-center justify-center text-[#fa2d48] mb-4 shadow-[0_0_24px_rgba(250,45,72,0.25)]">
                <LogOut size={28} className="translate-x-0.5" />
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-2">
                Xác nhận đăng xuất
              </h1>
              <p className="text-spotify-sub text-sm leading-relaxed">
                Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này trên thiết bị hiện tại?
              </p>
            </div>

            {/* Current User Card */}
            <div className="bg-[#181818] border border-neutral-800/80 rounded-xl p-4 flex items-center gap-3.5 mb-6">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || 'User'}
                  className="w-12 h-12 rounded-full object-cover border border-neutral-700/80 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#282828] border border-neutral-700/80 flex items-center justify-center text-neutral-300 flex-shrink-0">
                  <svg className="w-7 h-7 text-neutral-400 translate-y-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold text-white truncate">
                  {user?.fullName || 'Người dùng MC Music'}
                </span>
                <span className="text-xs text-spotify-sub truncate">
                  {user?.email}
                </span>
              </div>
            </div>

            {/* Lời nhắc bảo lưu dữ liệu */}
            <div className="flex items-start gap-2.5 bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-400 mb-6">
              <CheckCircle2 size={16} className="text-[#fa2d48] flex-shrink-0 mt-0.5" />
              <span>
                Toàn bộ danh sách phát, bài hát đã lưu và lịch sử nghe nhạc của bạn vẫn được lưu giữ an toàn trên đám mây.
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="flex-1 order-2 sm:order-1 text-sm"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmLogout}
                disabled={isSubmitting}
                className="flex-1 order-1 sm:order-2 text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Đang đăng xuất...</span>
                  </>
                ) : (
                  <>
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-400 mb-4">
              <ShieldAlert size={28} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Bạn chưa đăng nhập
            </h2>
            <p className="text-spotify-sub text-sm mb-6 max-w-xs">
              Hiện không có phiên làm việc nào đang hoạt động trên trình duyệt này.
            </p>
            <div className="flex items-center gap-3 w-full">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/')}
                className="flex-1 text-sm"
              >
                Về Trang chủ
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/login')}
                className="flex-1 text-sm"
              >
                Đăng nhập
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Back button bottom */}
      <button
        onClick={() => navigate('/')}
        className="relative z-10 mt-6 text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft size={14} /> Trở về trang chủ
      </button>
    </div>
  );
};

export default LogoutPage;

