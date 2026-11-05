import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router";
import { Radio, Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { registerApi, getErrorMessage } from "../api/auth";
import { useArtistAuthStore } from "../store/useArtistAuthStore";
import { Button } from "../components/ui/Button";

const registerSchema = z
  .object({
    stageName: z
      .string()
      .min(2, { message: "Nghệ danh phải từ 2 ký tự trở lên" })
      .max(100, { message: "Nghệ danh không được vượt quá 100 ký tự" }),
    email: z
      .string()
      .min(1, { message: "Email không được để trống" })
      .email({ message: "Địa chỉ email không đúng định dạng" }),
    password: z
      .string()
      .min(6, { message: "Mật khẩu phải từ 6 ký tự trở lên" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Vui lòng xác nhận lại mật khẩu" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useArtistAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      stageName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const response = await registerApi({
        stageName: data.stageName.trim(),
        email: data.email.trim(),
        password: data.password,
      });

      const authData = response?.data;
      if (authData?.accessToken) {
        login(authData.accessToken, authData.refreshToken, {
          id: authData.artistId,
          email: authData.email,
          stageName: authData.stageName,
        });
        toast.success("Đăng ký tài khoản nghệ sĩ thành công! Chào mừng bạn gia nhập.");
        navigate("/");
      } else {
        toast.success("Tạo tài khoản thành công! Vui lòng đăng nhập.");
        navigate("/login");
      }
    } catch (err) {
      const message = getErrorMessage(err, "Đăng ký không thành công. Email hoặc nghệ danh có thể đã tồn tại.");
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0c0c0e] px-4 py-12 text-white">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-neutral-800/80 bg-[#141418] p-8 shadow-2xl animate-fadeIn">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fa2d48] to-[#ff6b81] shadow-xl shadow-[#fa2d48]/25 mb-4">
            <Radio className="h-8 w-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fa2d48]/10 px-3 py-1 text-xs font-bold text-[#fa2d48] border border-[#fa2d48]/20 mb-2">
            <Sparkles className="h-3 w-3" />
            Trở thành Nhà Sáng Tạo
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Đăng ký Tài khoản Nghệ sĩ
          </h2>
          <p className="mt-2 text-xs text-neutral-400">
            Khởi đầu sự nghiệp âm nhạc, phát hành tác phẩm tới hàng triệu người nghe trên MC Music.
          </p>
        </div>

        {serverError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Stage Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300">
              Nghệ danh chính thức <span className="text-[#fa2d48]">*</span>
            </label>
            <div className="relative mt-1.5">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                {...register("stageName")}
                placeholder="VD: Tuấn Hưng, Mono, Wren Evans..."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none focus:ring-1 focus:ring-[#fa2d48]"
              />
            </div>
            {errors.stageName && (
              <p className="mt-1 text-xs text-red-400">{errors.stageName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300">
              Địa chỉ Email <span className="text-[#fa2d48]">*</span>
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="email"
                {...register("email")}
                placeholder="artist@example.com"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none focus:ring-1 focus:ring-[#fa2d48]"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300">
              Mật khẩu <span className="text-[#fa2d48]">*</span>
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900/80 py-2.5 pl-10 pr-10 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none focus:ring-1 focus:ring-[#fa2d48]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300">
              Xác nhận mật khẩu <span className="text-[#fa2d48]">*</span>
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Nhập lại mật khẩu"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none focus:ring-1 focus:ring-[#fa2d48]"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="w-full font-bold mt-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang khởi tạo tài khoản...</span>
              </div>
            ) : (
              <span>Đăng ký hồ sơ Nghệ sĩ</span>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-neutral-400">
          Đã có tài khoản nghệ sĩ?{" "}
          <Link to="/login" className="font-bold text-[#fa2d48] hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
