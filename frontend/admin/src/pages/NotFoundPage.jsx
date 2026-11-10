import React from "react";
import { useNavigate } from "react-router";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "../components/ui/Button";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-[#fa2d48]/10 text-[#fa2d48] flex items-center justify-center mb-4">
        <AlertCircle size={32} />
      </div>
      <h1 className="text-4xl font-black text-white mb-2">404</h1>
      <p className="text-base text-neutral-300 font-bold mb-1">
        Trang không tồn tại
      </p>
      <p className="text-xs text-neutral-500 max-w-sm mb-6">
        Đường dẫn bạn yêu cầu không tồn tại trong hệ thống quản trị MC Music.
      </p>
      <Button variant="primary" size="md" onClick={() => navigate("/")}>
        <Home size={16} /> Về trang tổng quan
      </Button>
    </div>
  );
};

export default NotFoundPage;

