import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { deletePlaylist } from '../../api/users/playlist';
import { usePlaylistModalStore } from '../../store/usePlaylistModalStore';

export const DeletePlaylistModal = () => {
  const { deletingPlaylist, closeDelete } = usePlaylistModalStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const mutation = useMutation({
    mutationFn: () => deletePlaylist(deletingPlaylist.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
      toast.success(`Đã xóa playlist "${deletingPlaylist?.name || 'Playlist'}"!`);

      // Nếu đang ở trang chi tiết playlist đó, điều hướng về /library
      const currentPath = location.pathname;
      if (
        currentPath === `/playlist/${deletingPlaylist.id}` ||
        currentPath === `/library/playlist/${deletingPlaylist.id}`
      ) {
        navigate('/library', { replace: true });
      }

      closeDelete();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa playlist. Vui lòng thử lại!';
      toast.error(msg);
    },
  });

  const handleDelete = () => {
    if (!deletingPlaylist || mutation.isPending) return;
    mutation.mutate();
  };

  return (
    <Modal
      isOpen={!!deletingPlaylist}
      onClose={() => !mutation.isPending && closeDelete()}
      title="Xác nhận xóa danh sách phát"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200">
          <AlertTriangle size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-white">Bạn có chắc chắn muốn xóa?</p>
            <p className="mt-1 text-white/80">
              Danh sách phát <strong className="text-white font-bold">"{deletingPlaylist?.name}"</strong> sẽ bị xóa vĩnh viễn khỏi thư viện của bạn. Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={closeDelete}
            disabled={mutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="!bg-red-600 hover:!bg-red-700 !shadow-[0_8px_16px_rgba(220,38,38,0.3)] min-w-[120px]"
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin mr-1" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-1.5" />
                Xóa playlist
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
