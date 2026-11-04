import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate, useLocation } from "react-router";
import {
  Music2,
  Check,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { registerApi, getErrorMessage } from "../api/auth/auth";
import { useAuthStore } from "../store/useAuthStore";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Họ và tên phải từ 2 ký tự trở lên" })
      .max(50, { message: "Họ và tên không quá 50 ký tự" }),
    email: z
      .string()
      .min(1, { message: "Email không được để trống" })
      .email({ message: "Địa chỉ email không đúng định dạng" }),
    password: z
      .string()
      .min(6, { message: "Mật khẩu phải từ 6 ký tự trở lên" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Vui lòng nhập lại mật khẩu" }),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "Bạn cần đồng ý với Điều khoản sử dụng để tiếp tục",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// Hàm tính toán độ mạnh mật khẩu
const computePasswordStrength = (pass) => {
  if (!pass) return { score: 0, label: "", color: "", text: "" };
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 25, label: "Yếu", color: "bg-red-500", text: "text-red-400" };
  if (score === 2) return { score: 50, label: "Trung bình", color: "bg-amber-500", text: "text-amber-400" };
  if (score === 3) return { score: 75, label: "Khá", color: "bg-blue-500", text: "text-blue-400" };
  return { score: 100, label: "Rất mạnh", color: "bg-emerald-500", text: "text-emerald-400" };
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get("redirect") || location.state?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: true,
    },
  });

  const watchedPassword = watch("password", "");
  const passwordStrength = computePasswordStrength(watchedPassword);

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const response = await registerApi({
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (response?.data) {
        // Tự động đăng nhập người dùng ngay sau khi đăng ký thành công
        login(response.data);
        toast.success("Đăng ký tài khoản thành công!", {
          description: `Chào mừng ${response.data.fullName || "bạn"} gia nhập MC Music!`,
        });
        navigate(redirectUrl, { replace: true });
      } else {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      const friendlyMessage = getErrorMessage(
        err,
        "Đăng ký thất bại. Email có thể đã được sử dụng hoặc thông tin không hợp lệ."
      );
      setServerError(friendlyMessage);
      toast.error("Không thể đăng ký tài khoản", {
        description: friendlyMessage,
      });
    }
  };

  const benefits = [
    "Nghe hàng triệu bài hát chất lượng cao hoàn toàn miễn phí",
    "Tạo và quản lý danh sách phát (Playlist) cá nhân không giới hạn",
    "Thả tim bài hát và tự động lưu vào mục Yêu thích",
    "Theo dõi nghệ sĩ yêu thích và nhận thông báo khi có nhạc mới",
    "Lời bài hát đồng bộ thời gian thực theo từng giai điệu",
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#0a0a0a] text-white">
      {/* ── CỘT TRÁI: BRANDING & LỢI ÍCH ── */}
      <div className="hidden md:flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden bg-gradient-to-br from-[#180a0e] via-[#0d0d0e] to-[#0a0a0a] border-r border-neutral-900">
        {/* Ambient Red Glow */}
        <div className="absolute w-[440px] h-[440px] bg-[#fa2d48]/12 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-md text-center">
          {/* Logo icon */}
          <Link to="/" className="w-16 h-16 rounded-2xl bg-[#2a1217] border border-[#fa2d48]/30 flex items-center justify-center shadow-[0_0_35px_rgba(250,45,72,0.3)] mb-8 hover:scale-105 transition-transform cursor-pointer">
            <Music2 size={32} className="text-[#fa2d48]" />
          </Link>

          {/* Heading */}
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Âm nhạc không giới hạn
          </h2>

          {/* Description */}
          <p className="text-spotify-sub text-sm leading-relaxed mb-9 max-w-sm">
            Tham gia cộng đồng người yêu âm nhạc MC Music để đắm mình vào không gian giai điệu tuyệt vời nhất.
          </p>

          {/* Benefit list */}
          <div className="flex flex-col gap-3.5 w-full max-w-sm text-left">
            {benefits.map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                <div className="w-5 h-5 rounded-full bg-[#fa2d48]/20 border border-[#fa2d48] flex items-center justify-center text-[#fa2d48] flex-shrink-0 mt-0.5">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-white/90 text-xs sm:text-sm font-medium leading-tight">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck size={16} className="text-[#fa2d48]" />
            <span>Thông tin tài khoản được bảo mật với mã hóa cao cấp</span>
          </div>
        </div>
      </div>

      {/* ── CỘT PHẢI: FORM ĐĂNG KÝ ── */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 max-w-xl mx-auto w-full relative">
        {/* Link quay về trang chủ */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-spotify-sub hover:text-white text-sm mb-7 transition-colors self-start group cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span>Về trang chủ</span>
        </Link>

        {/* Tiêu đề & Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Tạo tài khoản
          </h1>
          <p className="text-spotify-sub text-sm">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-[#fa2d48] font-bold hover:underline transition-colors ml-1"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Server error banner */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Không thể đăng ký</p>
              <p className="text-xs text-red-400/90 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* Form đăng ký */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-1.5">
              Họ và tên
            </label>
            <div className="relative flex items-center">
              <User size={18} className="absolute left-3.5 text-neutral-500" />
              <input
                {...register("fullName")}
                type="text"
                placeholder="Nguyễn Văn A"
                disabled={isSubmitting}
                className={`w-full bg-[#1e1e1e] hover:bg-[#252525] focus:bg-[#252525] text-white rounded-xl pl-10 pr-4 py-3 text-sm outline-none border ${
                  errors.fullName ? "border-[#fa2d48]" : "border-neutral-800"
                } focus:border-[#fa2d48] transition-all placeholder:text-neutral-500 disabled:opacity-50`}
              />
            </div>
            {errors.fullName && (
              <p className="text-[#fa2d48] text-xs mt-1.5 font-medium">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-1.5">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-3.5 text-neutral-500" />
              <input
                {...register("email")}
                type="email"
                placeholder="name@example.com"
                disabled={isSubmitting}
                className={`w-full bg-[#1e1e1e] hover:bg-[#252525] focus:bg-[#252525] text-white rounded-xl pl-10 pr-4 py-3 text-sm outline-none border ${
                  errors.email ? "border-[#fa2d48]" : "border-neutral-800"
                } focus:border-[#fa2d48] transition-all placeholder:text-neutral-500 disabled:opacity-50`}
              />
            </div>
            {errors.email && (
              <p className="text-[#fa2d48] text-xs mt-1.5 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3.5 text-neutral-500" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
                disabled={isSubmitting}
                className={`w-full bg-[#1e1e1e] hover:bg-[#252525] focus:bg-[#252525] text-white rounded-xl pl-10 pr-11 py-3 text-sm outline-none border ${
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

            {/* Thước đo độ mạnh mật khẩu */}
            {watchedPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Độ mạnh:</span>
                  <span className={`font-semibold ${passwordStrength.text}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
              </div>
            )}

            {errors.password && (
              <p className="text-[#fa2d48] text-xs mt-1.5 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Nhập lại mật khẩu */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-1.5">
              Xác nhận mật khẩu
            </label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3.5 text-neutral-500" />
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                disabled={isSubmitting}
                className={`w-full bg-[#1e1e1e] hover:bg-[#252525] focus:bg-[#252525] text-white rounded-xl pl-10 pr-11 py-3 text-sm outline-none border ${
                  errors.confirmPassword ? "border-[#fa2d48]" : "border-neutral-800"
                } focus:border-[#fa2d48] transition-all placeholder:text-neutral-500 disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[#fa2d48] text-xs mt-1.5 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Điều khoản sử dụng checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs text-neutral-400 cursor-pointer select-none">
              <input
                {...register("agreeTerms")}
                type="checkbox"
                className="w-4 h-4 mt-0.5 rounded border-neutral-700 bg-[#1e1e1e] text-[#fa2d48] accent-[#fa2d48] cursor-pointer"
              />
              <span>
                Tôi đồng ý với{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Điều khoản sử dụng của MC Music.");
                  }}
                  className="text-white hover:underline"
                >
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Chính sách bảo mật của MC Music.");
                  }}
                  className="text-white hover:underline"
                >
                  Chính sách bảo mật
                </a>.
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-[#fa2d48] text-xs mt-1 font-medium">
                {errors.agreeTerms.message}
              </p>
            )}
          </div>

          {/* Nút Đăng ký miễn phí */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3.5 rounded-full bg-[#fa2d48] hover:bg-[#e0223e] text-white font-bold text-base shadow-[0_8px_20px_rgba(250,45,72,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Đang tạo tài khoản...</span>
              </>
            ) : (
              <span>Đăng ký miễn phí</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
