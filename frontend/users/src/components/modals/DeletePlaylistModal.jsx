import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { deletePlaylist } from '../../api/users/playlist';
import { usePlaylistModalStore } from '../../store/usePlaylistModalStore';

export const DeletePlaylistModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { deletingPlaylist, closeDelete } = usePlaylistModalStore();

  const mutation = useMutation({
    mutationFn: () => deletePlaylist(deletingPlaylist.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
      toast.success(`Đã xóa danh sách phát "${deletingPlaylist?.name || ''}"!`);
      
      // Nếu đang đứng ở trang của chính playlist vừa xóa thì chuyển hướng về trang chủ
      if (location.pathname === `/playlist/${deletingPlaylist?.id}`) {
        navigate('/');
      }
      closeDelete();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa danh sách phát.';
      toast.error(msg);
    },
  });

  if (!deletingPlaylist) return null;

  return (
    <Modal
      isOpen={!!deletingPlaylist}
      onClose={closeDelete}
      title="Xóa danh sách phát"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3.5 p-4 bg-red-950/30 border border-red-500/20 rounded-xl">
          <div className="p-2 bg-red-500/10 text-red-400 rounded-lg flex-shrink-0 mt-0.5">
            <AlertTriangle size={22} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-white">
              Bạn có chắc chắn muốn xóa danh sách phát này không?
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Danh sách phát <span className="font-semibold text-white">"{deletingPlaylist.name}"</span> sẽ bị xóa vĩnh viễn khỏi thư viện của bạn. Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="dark"
            size="sm"
            onClick={closeDelete}
            disabled={mutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white min-w-[100px] border-none"
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin mr-1.5" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-1.5" />
                Xóa vĩnh viễn
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
