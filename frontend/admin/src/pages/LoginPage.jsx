import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router";
import { Shield, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { loginAdminApi } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "../components/ui/Button";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@mcmusic.com",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await loginAdminApi(data);
      if (response && response.data) {
        login(response.data);
        showSuccessToast("Đăng nhập quyền Quản trị thành công!");
        navigate(from, { replace: true });
      } else {
        throw new Error(response.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập admin:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Tài khoản hoặc mật khẩu không chính xác";
      showErrorToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#fa2d48]/15 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#fa2d48]/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#121212] border border-neutral-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#fa2d48]/15 border border-[#fa2d48]/30 flex items-center justify-center text-[#fa2d48] shadow-[0_4px_20px_rgba(250,45,72,0.3)] mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            MC MUSIC ADMIN
          </h1>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-xs">
            Hệ thống quản lý người dùng, nghệ sĩ và kiểm duyệt nội dung âm nhạc
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Email Quản trị viên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                {...register("email")}
                placeholder="admin@mcmusic.com"
                className="w-full pl-10 pr-4 py-3 bg-[#181818] border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#fa2d48] transition-colors"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1 pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Nhập mật khẩu"
                className="w-full pl-10 pr-10 py-3 bg-[#181818] border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#fa2d48] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2 font-bold tracking-wide"
            isLoading={isSubmitting}
          >
            Đăng nhập hệ thống
          </Button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center">
          <p className="text-[11px] text-neutral-500">
            Dành riêng cho Quản trị viên được cấp quyền truy cập.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

