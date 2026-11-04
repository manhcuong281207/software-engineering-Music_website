import React from "react";
import { Link } from "react-router";
import { Radio, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0c0e] px-4 text-center text-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fa2d48] to-[#ff6b81] shadow-2xl shadow-[#fa2d48]/30 mb-6">
        <Radio className="h-8 w-8 text-white" />
      </div>

      <span className="text-6xl font-black text-[#fa2d48]">404</span>
      <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
        Không tìm thấy trang
      </h1>
      <p className="mt-2 max-w-md text-sm text-neutral-400">
        Trang bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập vào khu vực này.
      </p>

      <div className="mt-8">
        <Link to="/">
          <Button variant="primary" size="md" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Quay về Trang chủ Nghệ sĩ</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

