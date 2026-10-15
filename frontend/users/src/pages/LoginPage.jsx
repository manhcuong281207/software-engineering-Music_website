import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router';
import { Eye, EyeOff, Music2, Mail, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { login as loginApi } from '../api/users/auth';
import { useAuthStore } from '../store/useAuthStore';

// ── Schema Zod ────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email không được để trống' })
    .email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu phải từ 6 ký tự' }),
});

// ── Input có icon ─────────────────────────────────────────────────────────────
function FormInput({ label, icon: Icon, rightIcon, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-white/90">{label}</label>
      <div className="relative group">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-spotify-sub group-focus-within:text-spotify-primary transition-colors pointer-events-none"
          />
        )}
        <input
          className={`
            w-full bg-[#1f1f1f] border rounded-lg py-3 pl-10 pr-${rightIcon ? '10' : '4'}
            text-white placeholder-spotify-sub text-sm
            focus:outline-none focus:ring-2 transition-all duration-200
            ${error
              ? 'border-spotify-primary ring-spotify-primary/30 focus:ring-spotify-primary/40'
              : 'border-transparent hover:border-[#383838] focus:border-spotify-primary focus:ring-spotify-primary/20'
            }
          `}
          {...props}
        />
        {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>}
      </div>
      {error && (
        <p className="text-xs text-spotify-primary flex items-center gap-1">
          <span>⚠</span> {error.message}
        </p>
      )}
    </div>
  );
}

// ── Page Component ────────────────────────────────────────────────────────────
export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginStore = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);

  // Quay lại trang trước nếu có, không thì về trang chủ
  const from = location.state?.from || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (formData) => {
    try {
      const response = await loginApi({
        email: formData.email,
        password: formData.password,
      });

      const { accessToken, refreshToken, user } = response.data;
      loginStore(user, accessToken, refreshToken);

      toast.success(`Chào mừng trở lại, ${user?.fullName || 'bạn'}! 🎵`, {
        duration: 3000,
      });
      navigate(from, { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 401) {
        toast.error('Email hoặc mật khẩu không chính xác.');
      } else if (status === 403) {
        toast.error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.');
      } else if (status === 400) {
        toast.error(message || 'Thông tin đăng nhập không hợp lệ.');
      } else {
        toast.error('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-spotify-black flex">
      {/* Bảng bên trái - Branding */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#1a0610] via-[#0d0d1a] to-spotify-black">
        {/* Hiệu ứng vòng ánh sáng nền */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-spotify-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-900/20 blur-3xl" />

        {/* Nội dung */}
        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="inline-flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-spotify-primary flex items-center justify-center shadow-[0_0_40px_rgba(250,45,72,0.4)]">
              <Music2 size={30} className="text-white" />
            </div>
            <span className="text-3xl font-black text-white tracking-tight">MC Music</span>
          </div>

          <h2 className="text-5xl font-black text-white mb-4 leading-tight">
            Triệu bài hát,<br />
            <span className="text-spotify-primary">một đích đến.</span>
          </h2>
          <p className="text-spotify-sub text-base leading-relaxed">
            Đăng nhập để tiếp tục hành trình âm nhạc của bạn. Playlist, nghệ sĩ yêu thích và lịch sử nghe nhạc đều đang chờ bạn.
          </p>
        </div>
      </div>

      {/* Bảng bên phải - Form */}
      <div className="flex-1 lg:max-w-[520px] flex flex-col items-center justify-center px-8 py-12 relative">
        {/* Nút về trang chủ */}
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-spotify-sub hover:text-white transition-colors text-sm group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Về trang chủ
        </Link>

        {/* Logo MC Music (mobile only) */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-spotify-primary flex items-center justify-center">
            <Music2 size={22} className="text-white" />
          </div>
          <span className="text-xl font-black text-white">MC Music</span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Đăng nhập</h1>
            <p className="text-spotify-sub text-sm">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="text-white font-semibold hover:text-spotify-primary transition-colors underline underline-offset-2"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {/* Email */}
            <FormInput
              label="Email"
              icon={Mail}
              type="email"
              placeholder="name@example.com"
              error={errors.email}
              autoComplete="email"
              {...register('email')}
            />

            {/* Mật khẩu */}
            <FormInput
              label="Mật khẩu"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="current-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-spotify-sub hover:text-white transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('password')}
            />

            {/* Quên mật khẩu */}
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                className="text-xs text-spotify-sub hover:text-white transition-colors underline underline-offset-2"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Nút Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#383838]" />
            <span className="text-xs text-spotify-sub">hoặc</span>
            <div className="flex-1 h-px bg-[#383838]" />
          </div>

          {/* Nút Đăng ký */}
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/register')}
          >
            Tạo tài khoản mới
          </Button>
        </div>
      </div>
    </div>
  );
};
