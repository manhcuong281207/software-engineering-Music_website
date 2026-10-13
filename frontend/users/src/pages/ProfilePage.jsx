import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <div className="w-20 h-20 bg-[#282828] rounded-full flex items-center justify-center mb-4">
        <User size={32} className="text-[#a7a7a7]" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Hồ sơ</h2>
      <p className="text-[#a7a7a7] text-sm max-w-xs">
        Thông tin cá nhân và hoạt động của bạn.
      </p>
    </div>
  );
}
