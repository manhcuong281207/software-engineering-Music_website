import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate, useLocation } from "react-router";
import { Music2, ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { loginApi, getErrorMessage } from "../api/auth/auth";
import { useAuthStore } from "../store/useAuthStore";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email không được để trống" })
    .email({ message: "Địa chỉ email không đúng định dạng" }),
  password: z
    .string()
    .min(6, { message: "Mật khẩu phải từ 6 ký tự trở lên" }),
  rememberMe: z.boolean().optional(),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get("redirect") || location.state?.from?.pathname || "/";

  // Nếu người dùng đã đăng nhập từ trước, tự động chuyển về trang đích
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const response = await loginApi({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (response?.data) {
        login(response.data);
        toast.success("Đăng nhập thành công!", {
          description: `Chào mừng ${response.data.fullName || "bạn"} quay trở lại MC Music!`,
        });
        navigate(redirectUrl, { replace: true });
      } else {
        throw new Error("Không nhận được dữ liệu xác thực từ hệ thống");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      const friendlyMessage = getErrorMessage(
        err,
        "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại."
      );
      setServerError(friendlyMessage);
      toast.error("Đăng nhập thất bại", {
        description: friendlyMessage,
      });
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#0a0a0a] text-white">
      {/* ── CỘT TRÁI: HERO BRANDING ── */}
      <div className="hidden md:flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden bg-gradient-to-br from-[#180a0e] via-[#0d0d0e] to-[#0a0a0a] border-r border-neutral-900">
        {/* Ambient Red Glow */}
        <div className="absolute w-[440px] h-[440px] bg-[#fa2d48]/12 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-md text-center">
          {/* Logo & Brand text */}
          <Link to="/" className="flex items-center gap-3.5 mb-8 group">
            <div className="w-12 h-12 rounded-xl bg-[#fa2d48] flex items-center justify-center shadow-[0_0_24px_rgba(250,45,72,0.4)] group-hover:scale-105 transition-transform">
              <Music2 size={26} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-wide">
              MC Music
            </span>
          </Link>

          {/* Headline */}
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white text-center leading-[1.15] mb-5 tracking-tight">
            Triệu bài hát,<br />
            <span className="text-[#fa2d48]">một đích đến.</span>
          </h2>

          {/* Description */}
          <p className="text-spotify-sub text-center text-sm leading-relaxed max-w-sm">
            Đăng nhập để tiếp tục hành trình âm nhạc của bạn. Danh sách phát, nghệ sĩ yêu thích và lịch sử nghe nhạc đang chờ đón bạn.
          </p>

          <div className="mt-10 px-4 py-3 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Âm thanh chất lượng cao 320kbps miễn phí</span>
          </div>
        </div>
      </div>

      {/* ── CỘT PHẢI: FORM ĐĂNG NHẬP ── */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 max-w-xl mx-auto w-full relative">
        {/* Link quay về trang chủ */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-spotify-sub hover:text-white text-sm mb-8 transition-colors self-start group cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span>Về trang chủ</span>
        </Link>

        {/* Tiêu đề & Chuyển hướng sang Đăng ký */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Đăng nhập
          </h1>
          <p className="text-spotify-sub text-sm">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-[#fa2d48] font-bold hover:underline transition-colors ml-1"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Banner thông báo lỗi nếu có */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Không thể đăng nhập</p>
              <p className="text-xs text-red-400/90 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* Form đăng nhập */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-3.5 text-neutral-500" />
              <input
                {...register("email")}
                type="email"
                placeholder="name@example.com"
                disabled={isSubmitting}
                className={`w-full bg-[#1e1e1e] hover:bg-[#252525] focus:bg-[#252525] text-white rounded-xl pl-10 pr-4 py-3.5 text-sm outline-none border ${
                  errors.email ? "border-[#fa2d48]" : "border-neutral-800"
                } focus:border-[#fa2d48] transition-all placeholder:text-neutral-500 disabled:opacity-50`}
              />
            </div>
            {errors.email && (
              <p className="text-[#fa2d48] text-xs mt-1.5 font-medium flex items-center gap-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3.5 text-neutral-500" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isSubmitting}
                className={`w-full bg-[#1e1e1e] hover:bg-[#252525] focus:bg-[#252525] text-white rounded-xl pl-10 pr-11 py-3.5 text-sm outline-none border ${
                  errors.password ? "border-[#fa2d48]" : "border-neutral-800"
                } focus:border-[#fa2d48] transition-all placeholder:text-neutral-500 disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[#fa2d48] text-xs mt-1.5 font-medium">
                {errors.password.message}
              </p>
            )}

            {/* Quên mật khẩu & Ghi nhớ đăng nhập */}
            <div className="flex items-center justify-between mt-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-400 hover:text-white transition-colors select-none">
                <input
                  {...register("rememberMe")}
                  type="checkbox"
                  className="w-4 h-4 rounded border-neutral-700 bg-[#1e1e1e] text-[#fa2d48] focus:ring-0 focus:outline-none accent-[#fa2d48] cursor-pointer"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  toast.info("Tính năng Quên mật khẩu đang được phát triển.");
                }}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>
          </div>

          {/* Nút Đăng nhập */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3.5 rounded-full bg-[#fa2d48] hover:bg-[#e0223e] text-white font-bold text-base shadow-[0_8px_20px_rgba(250,45,72,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-7">
          <div className="border-t border-neutral-800 w-full" />
          <span className="bg-[#0a0a0a] px-3 text-xs text-neutral-500 uppercase tracking-wider absolute">
            hoặc
          </span>
        </div>

        {/* Nút Tạo tài khoản mới */}
        <Link
          to="/register"
          className="w-full py-3.5 rounded-full border border-neutral-700 hover:border-white text-white font-semibold text-center text-sm transition-all hover:bg-white/5 block"
        >
          Tạo tài khoản mới
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
