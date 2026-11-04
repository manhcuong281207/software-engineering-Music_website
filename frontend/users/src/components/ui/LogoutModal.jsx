import React, { useState } from 'react';
import { LogOut, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from './Button';

export const LogoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, performLogout, logout } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    try {
      setIsSubmitting(true);
      await performLogout();
      toast.success('Đăng xuất thành công');
      onClose();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
      logout();
      onClose();
      navigate('/', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm bg-[#181818] border border-neutral-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-[#fa2d48]/10 border border-[#fa2d48]/30 flex items-center justify-center text-[#fa2d48] mb-3 shadow-[0_0_20px_rgba(250,45,72,0.25)]">
            <LogOut size={24} className="translate-x-0.5" />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-1.5">
            Đăng xuất tài khoản?
          </h3>
          <p className="text-xs text-spotify-sub leading-relaxed max-w-xs">
            Bạn có chắc chắn muốn đăng xuất khỏi <strong className="text-white">{user?.fullName || user?.email || 'tài khoản'}</strong> không?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 text-sm rounded-full"
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmLogout}
            disabled={isSubmitting}
            className="flex-1 py-2.5 text-sm rounded-full flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Đăng xuất</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;

