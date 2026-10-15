import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Music2, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { register as registerApi } from '../api/users/auth';
import { useAuthStore } from '../store/useAuthStore';

// ── Schema Zod ────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: 'Tên phải có ít nhất 2 ký tự' })
      .max(50, { message: 'Tên không được vượt quá 50 ký tự' }),
    email: z
      .string()
      .min(1, { message: 'Email không được để trống' })
      .email({ message: 'Email không hợp lệ' }),
    password: z
      .string()
      .min(6, { message: 'Mật khẩu phải từ 6 ký tự' })
      .max(100, { message: 'Mật khẩu quá dài' }),
    confirmPassword: z.string().min(1, { message: 'Vui lòng nhập lại mật khẩu' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
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
export const RegisterPage = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({ resolver: zodResolver(registerSchema) });

  const passwordValue = watch('password', '');

  const onSubmit = async (formData) => {
    try {
      const response = await registerApi({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      });

      const { accessToken, refreshToken, user } = response.data;
      loginStore(user, accessToken, refreshToken);

      toast.success(`Chào mừng ${user?.fullName || formData.fullName} đến với MC Music! 🎵`, {
        duration: 4000,
      });
      navigate('/', { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 409) {
        toast.error('Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.');
      } else if (status === 400) {
        toast.error(message || 'Thông tin đăng ký không hợp lệ.');
      } else {
        toast.error('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.');
      }
    }
  };

  // Kiểm tra độ mạnh mật khẩu
  const passwordStrength = (() => {
    if (!passwordValue) return null;
    if (passwordValue.length < 6) return { label: 'Yếu', color: 'bg-red-500', width: 'w-1/4' };
    if (passwordValue.length < 10) return { label: 'Trung bình', color: 'bg-yellow-500', width: 'w-2/4' };
    if (/[A-Z]/.test(passwordValue) && /[0-9]/.test(passwordValue))
      return { label: 'Mạnh', color: 'bg-green-500', width: 'w-full' };
    return { label: 'Khá tốt', color: 'bg-blue-500', width: 'w-3/4' };
  })();

  return (
    <div className="min-h-screen bg-spotify-black flex">
      {/* Bảng bên trái - minh họa */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#1a0610] via-[#0d0d1a] to-spotify-black">
        {/* Hiệu ứng vòng ánh sáng nền */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-spotify-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-900/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-spotify-primary/5 blur-3xl" />

        {/* Nội dung minh họa */}
        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-spotify-primary/20 border border-spotify-primary/30 mb-8 shadow-[0_0_40px_rgba(250,45,72,0.2)]">
            <Music2 size={40} className="text-spotify-primary" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Âm nhạc không giới hạn
          </h2>
          <p className="text-spotify-sub text-base leading-relaxed">
            Tham gia MC Music để khám phá hàng triệu bài hát, tạo playlist cá nhân và theo dõi nghệ sĩ yêu thích của bạn.
          </p>

          {/* Feature bullets */}
          <div className="mt-8 flex flex-col gap-3 text-left">
            {[
              'Nghe nhạc không giới hạn',
              'Tạo playlist cá nhân',
              'Theo dõi nghệ sĩ yêu thích',
              'Lưu bài hát yêu thích',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-spotify-primary flex-shrink-0" />
                <span className="text-white/70 text-sm">{feat}</span>
              </div>
            ))}
          </div>
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
            <h1 className="text-3xl font-black text-white mb-2">Tạo tài khoản</h1>
            <p className="text-spotify-sub text-sm">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="text-white font-semibold hover:text-spotify-primary transition-colors underline underline-offset-2"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {/* Họ tên */}
            <FormInput
              label="Họ và tên"
              icon={User}
              type="text"
              placeholder="Nguyễn Văn A"
              error={errors.fullName}
              {...register('fullName')}
            />

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
            <div className="flex flex-col gap-1.5">
              <FormInput
                label="Mật khẩu"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                error={errors.password}
                autoComplete="new-password"
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
              {/* Thanh độ mạnh mật khẩu */}
              {passwordStrength && (
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1 bg-[#383838] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${passwordStrength.color} ${passwordStrength.width}`}
                    />
                  </div>
                  <span className="text-xs text-spotify-sub whitespace-nowrap">{passwordStrength.label}</span>
                </div>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <FormInput
              label="Nhập lại mật khẩu"
              icon={Lock}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              error={errors.confirmPassword}
              autoComplete="new-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-spotify-sub hover:text-white transition-colors p-1"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('confirmPassword')}
            />

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
                  Đang xử lý...
                </span>
              ) : (
                'Đăng ký miễn phí'
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-spotify-sub leading-relaxed">
            Khi đăng ký, bạn đồng ý với{' '}
            <span className="text-white underline cursor-pointer hover:text-spotify-primary transition-colors">
              Điều khoản sử dụng
            </span>{' '}
            và{' '}
            <span className="text-white underline cursor-pointer hover:text-spotify-primary transition-colors">
              Chính sách bảo mật
            </span>{' '}
            của MC Music.
          </p>
        </div>
      </div>
    </div>
  );
};
