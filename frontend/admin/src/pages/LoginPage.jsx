import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router";
import { Shield, Lock, Mail, Eye, EyeOff, AlertTriangle, KeyRound } from "lucide-react";
import { loginAdminApi } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "../components/ui/Button";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email quản trị viên")
    .email("Email không đúng định dạng"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Nhận thông báo lỗi nếu được chuyển hướng từ ProtectedRoute (vd: hết hạn phiên hoặc không đủ quyền)
  const routeError = location.state?.error;
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@mcmusic.com",
      password: "",
    },
  });

  const displayedError = serverError || routeError;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      const response = await loginAdminApi({
        email: data.email.trim(),
        password: data.password,
      });

      if (response && response.data) {
        // Lưu thông tin admin & token vào store (có kiểm tra quyền role hợp lệ)
        login(response.data);
        showSuccessToast("Đăng nhập quyền Quản trị thành công!");
        navigate(from, { replace: true });
      } else {
        throw new Error(response?.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập admin:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Email hoặc mật khẩu không chính xác.";
      setServerError(msg);
      showErrorToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nút điền nhanh tài khoản mặc định phục vụ kiểm thử
  const handleQuickFill = () => {
    setValue("email", "admin@mcmusic.com", { shouldValidate: true });
    setValue("password", "admin123", { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Hiệu ứng nền phát sáng chuẩn thiết kế MC Music */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#fa2d48]/15 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#fa2d48]/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#121212] border border-neutral-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        {/* Header Icon & Tiêu đề */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-[#fa2d48]/15 border border-[#fa2d48]/30 flex items-center justify-center text-[#fa2d48] shadow-[0_4px_20px_rgba(250,45,72,0.3)] mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            MC MUSIC ADMIN
          </h1>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-xs">
            Hệ thống quản trị tài khoản, kiểm duyệt bài hát & album nền tảng
          </p>
        </div>

        {/* Thông báo lỗi từ Server / Điều hướng nếu có */}
        {displayedError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-500" />
            <span className="leading-relaxed">{displayedError}</span>
          </div>
        )}

        {/* Form Đăng nhập */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Email Quản trị viên <span className="text-[#fa2d48]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                {...register("email")}
                placeholder="admin@mcmusic.com"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-3 bg-[#181818] border rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                  errors.email
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-neutral-800 focus:border-[#fa2d48]"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1 pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Mật khẩu <span className="text-[#fa2d48]">*</span>
              </label>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] text-[#fa2d48] hover:underline flex items-center gap-1 cursor-pointer"
                title="Tự động điền tài khoản mẫu để kiểm thử"
              >
                <KeyRound size={12} />
                Điền mẫu
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Nhập mật khẩu quản trị"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-10 py-3 bg-[#181818] border rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                  errors.password
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-neutral-800 focus:border-[#fa2d48]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-500 mt-1 pl-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Nút gửi */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-3 font-bold tracking-wide"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xác thực..." : "Đăng nhập hệ thống"}
          </Button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center">
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Khu vực hạn chế: Chỉ dành cho các tài khoản Quản trị viên được phân quyền hợp lệ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
