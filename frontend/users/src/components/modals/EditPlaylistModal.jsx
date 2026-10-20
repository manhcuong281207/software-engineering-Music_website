import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { updatePlaylist } from '../../api/users/playlist';
import { usePlaylistModalStore } from '../../store/usePlaylistModalStore';

const EditPlaylistForm = ({ playlist, onClose }) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState(playlist.name || playlist.title || '');
  const [description, setDescription] = useState(playlist.description || '');
  const [coverImage, setCoverImage] = useState(playlist.coverImage || playlist.coverUrl || '');
  const [isPublic, setIsPublic] = useState(
    playlist.isPublic !== undefined ? Boolean(playlist.isPublic) : false
  );
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');

  const mutation = useMutation({
    mutationFn: (payload) => updatePlaylist(playlist.id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', playlist.id] });
      toast.success(`Đã cập nhật danh sách phát "${updated?.name || name}"!`);
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật danh sách phát.';
      setApiError(msg);
      toast.error(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Tên danh sách phát không được để trống.');
      return;
    }

    mutation.mutate({
      name: trimmedName,
      description: description.trim(),
      coverImage: coverImage.trim(),
      isPublic,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Thông báo lỗi nếu có */}
      {apiError && (
        <div className="flex items-start gap-2.5 p-3 text-sm text-red-200 bg-red-950/60 border border-red-500/30 rounded-xl">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Name input */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="edit-playlist-name" className="text-sm font-semibold text-white">
          Tên danh sách phát <span className="text-[#fa2d48]">*</span>
        </label>
        <input
          id="edit-playlist-name"
          type="text"
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (validationError) setValidationError('');
          }}
          disabled={mutation.isPending}
          className={`w-full px-4 py-2.5 bg-[#242424] border rounded-xl text-white placeholder-neutral-500 focus:outline-none transition ${
            validationError
              ? 'border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-white/10 focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]'
          }`}
        />
        {validationError && (
          <p className="text-xs text-red-400 mt-0.5">{validationError}</p>
        )}
      </div>

      {/* Description input */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="edit-playlist-desc" className="text-sm font-semibold text-white">
          Mô tả
        </label>
        <textarea
          id="edit-playlist-desc"
          rows={3}
          placeholder="Thêm mô tả..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={mutation.isPending}
          className="w-full px-4 py-2 bg-[#242424] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48] transition resize-none"
        />
      </div>

      {/* Cover image input */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="edit-playlist-cover" className="text-sm font-semibold text-white">
          URL ảnh bìa
        </label>
        <input
          id="edit-playlist-cover"
          type="url"
          placeholder="https://..."
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          disabled={mutation.isPending}
          className="w-full px-4 py-2 bg-[#242424] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#fa2d48] transition"
        />
      </div>

      {/* Privacy toggle */}
      <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">Công khai danh sách phát</span>
          <span className="text-xs text-neutral-400">
            {isPublic ? 'Mọi người đều có thể thấy playlist này' : 'Chỉ mình bạn có thể thấy playlist này'}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={() => setIsPublic(!isPublic)}
          disabled={mutation.isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isPublic ? 'bg-[#fa2d48]' : 'bg-neutral-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPublic ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
        <Button
          type="button"
          variant="dark"
          size="sm"
          onClick={onClose}
          disabled={mutation.isPending}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={mutation.isPending || !name.trim()}
          className="min-w-[110px]"
        >
          {mutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin mr-1.5" />
              Đang lưu...
            </>
          ) : (
            'Lưu thay đổi'
          )}
        </Button>
      </div>
    </form>
  );
};

export const EditPlaylistModal = () => {
  const { editingPlaylist, closeEdit } = usePlaylistModalStore();

  return (
    <Modal
      isOpen={!!editingPlaylist}
      onClose={closeEdit}
      title="Đổi tên / Chỉnh sửa danh sách phát"
    >
      {editingPlaylist && (
        <EditPlaylistForm
          key={editingPlaylist.id}
          playlist={editingPlaylist}
          onClose={closeEdit}
        />
      )}
    </Modal>
  );
};
