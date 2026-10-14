import { Library } from 'lucide-react';

export default function LibraryPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <div className="w-20 h-20 bg-[#282828] rounded-full flex items-center justify-center mb-4">
        <Library size={32} className="text-[#a7a7a7]" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Thư viện của bạn</h2>
      <p className="text-[#a7a7a7] text-sm max-w-xs">
        Các playlist và bài hát yêu thích sẽ xuất hiện ở đây.
      </p>
    </div>
  );
}
