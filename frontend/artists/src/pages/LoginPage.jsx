import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate, useLocation } from "react-router";
import { Radio, Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { loginApi, getErrorMessage } from "../api/auth";
import { getArtistProfileApi } from "../api/artist";
import { useArtistAuthStore } from "../store/useArtistAuthStore";
import { Button } from "../components/ui/Button";

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
  const { isAuthenticated, login, updateArtist } = useArtistAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get("redirect") || "/";

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
        email: data.email.trim(),
        password: data.password,
      });

      const authData = response?.data;
      if (!authData?.accessToken) {
        throw new Error("Phản hồi đăng nhập không hợp lệ");
      }

      // Lưu thông tin cơ bản từ AuthResponse
      const basicArtist = {
        id: authData.artistId,
        email: authData.email,
        stageName: authData.stageName,
      };

      login(authData.accessToken, authData.refreshToken, basicArtist);

      // Cố gắng fetch profile đầy đủ (avatar, cover, bio, followerCount)
      try {
        const profileRes = await getArtistProfileApi();
        if (profileRes?.data) {
          updateArtist(profileRes.data);
        }
      } catch {
        // ignore nếu fetch ngay lập tức bị chậm
      }

      toast.success(`Chào mừng trở lại, ${authData.stageName}!`);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      const message = getErrorMessage(err, "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0c0c0e] px-4 py-12 text-white">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-neutral-800/80 bg-[#141418] p-8 shadow-2xl animate-fadeIn">
        {/* Logo & Heading */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fa2d48] to-[#ff6b81] shadow-xl shadow-[#fa2d48]/25 mb-4">
            <Radio className="h-8 w-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fa2d48]/10 px-3 py-1 text-xs font-bold text-[#fa2d48] border border-[#fa2d48]/20 mb-2">
            <Sparkles className="h-3 w-3" />
            Dành cho Nghệ sĩ
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Đăng nhập Nghệ sĩ
          </h2>
          <p className="mt-2 text-xs text-neutral-400">
            Quản lý tác phẩm, theo dõi lượt nghe và kết nối với cộng đồng người hâm mộ MC Music.
          </p>
        </div>

        {serverError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300">
              Địa chỉ Email
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="email"
                {...register("email")}
                placeholder="artist@mcmusic.com"
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
              Mật khẩu
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
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

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="w-full font-bold gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-neutral-400">
          Chưa có tài khoản nghệ sĩ?{" "}
          <Link
            to="/register"
            className="font-bold text-[#fa2d48] hover:underline"
          >
            Đăng ký làm nghệ sĩ ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

