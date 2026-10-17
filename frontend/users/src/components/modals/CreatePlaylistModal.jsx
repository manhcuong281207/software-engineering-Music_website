import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { createPlaylist } from '../../api/users/playlist';
import { usePlaylistModalStore } from '../../store/usePlaylistModalStore';

export const CreatePlaylistModal = () => {
  const { isCreateOpen, closeCreate } = usePlaylistModalStore();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');

  const mutation = useMutation({
    mutationFn: (payload) => createPlaylist(payload),
    onSuccess: (newPlaylist) => {
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
      toast.success(`Đã tạo playlist "${newPlaylist.name || name}" thành công!`);
      handleClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể tạo playlist. Vui lòng thử lại!';
      setApiError(msg);
    },
  });

  const handleClose = () => {
    if (mutation.isPending) return;
    setName('');
    setDescription('');
    setIsPublic(true);
    setValidationError('');
    setApiError('');
    closeCreate();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Tên playlist không được để trống.');
      return;
    }

    if (mutation.isPending) return;

    mutation.mutate({
      name: trimmedName,
      description: description.trim(),
      isPublic,
    });
  };

  return (
    <Modal isOpen={isCreateOpen} onClose={handleClose} title="Tạo playlist mới">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* API Error Alert */}
        {apiError && (
          <div className="flex items-start gap-2 p-3 text-sm text-red-200 bg-red-950/60 border border-red-500/30 rounded-xl">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="create-playlist-name" className="text-sm font-semibold text-white/90">
            Tên playlist <span className="text-spotify-primary">*</span>
          </label>
          <div className="relative">
            <input
              id="create-playlist-name"
              type="text"
              autoFocus
              placeholder="VD: Nhạc chill cuối tuần, Workout..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError('');
              }}
              disabled={mutation.isPending}
              className={`w-full px-4 py-2.5 bg-[#2a2a2a] border rounded-xl text-white placeholder-spotify-sub focus:outline-none focus:ring-2 transition ${
                validationError
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-white/10 focus:border-white/30 focus:ring-spotify-primary/40'
              }`}
            />
          </div>
          {validationError && (
            <p className="text-xs text-red-400 mt-0.5">{validationError}</p>
          )}
        </div>

        {/* Description input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="create-playlist-desc" className="text-sm font-semibold text-white/90">
            Mô tả <span className="text-xs font-normal text-spotify-sub">(không bắt buộc)</span>
          </label>
          <textarea
            id="create-playlist-desc"
            rows={3}
            placeholder="Thêm mô tả cho playlist của bạn..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={mutation.isPending}
            className="w-full px-4 py-2 bg-[#2a2a2a] border border-white/10 rounded-xl text-white placeholder-spotify-sub focus:outline-none focus:ring-2 focus:ring-spotify-primary/40 focus:border-white/30 transition resize-none"
          />
        </div>

        {/* Privacy toggle */}
        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Chế độ công khai</span>
            <span className="text-xs text-spotify-sub">
              {isPublic ? 'Bất kỳ ai cũng có thể xem playlist này' : 'Chỉ mình bạn có thể xem playlist này'}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => setIsPublic(!isPublic)}
            disabled={mutation.isPending}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isPublic ? 'bg-spotify-primary' : 'bg-[#404040]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={mutation.isPending || !name.trim()}
            className="min-w-[100px]"
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin mr-1" />
                Đang tạo...
              </>
            ) : (
              'Tạo playlist'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
