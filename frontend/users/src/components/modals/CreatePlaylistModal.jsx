import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Loader2, Music } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { createPlaylist } from '../../api/users/playlist';
import { usePlaylistModalStore } from '../../store/usePlaylistModalStore';

export const CreatePlaylistModal = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isCreateOpen, closeCreate } = usePlaylistModalStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [validationError, setValidationError] = useState('');

  const mutation = useMutation({
    mutationFn: (payload) => createPlaylist(payload),
    onSuccess: (newPlaylist) => {
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
      toast.success(`Đã tạo danh sách phát "${newPlaylist.name}"!`);
      handleClose();
      if (newPlaylist?.id) {
        navigate(`/playlist/${newPlaylist.id}`);
      }
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể tạo danh sách phát.';
      toast.error(msg);
    },
  });

  const handleClose = () => {
    setName('');
    setDescription('');
    setCoverImage('');
    setIsPublic(false);
    setValidationError('');
    closeCreate();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Vui lòng nhập tên danh sách phát');
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
    <Modal isOpen={isCreateOpen} onClose={handleClose} title="Tạo danh sách phát mới">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Cover Preview & Helper */}
        <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded-xl">
          <div className="w-16 h-16 rounded-lg bg-[#282828] flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
            {coverImage ? (
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                }}
              />
            ) : (
              <Music size={28} className="text-neutral-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <label htmlFor="create-playlist-cover" className="block text-xs font-medium text-neutral-400 mb-1">
              URL ảnh bìa (tùy chọn)
            </label>
            <input
              id="create-playlist-cover"
              type="url"
              placeholder="https://..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              disabled={mutation.isPending}
              className="w-full px-3 py-1.5 text-xs bg-[#242424] border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#fa2d48] transition"
            />
          </div>
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="create-playlist-name" className="text-sm font-semibold text-white">
            Tên danh sách phát <span className="text-[#fa2d48]">*</span>
          </label>
          <input
            id="create-playlist-name"
            type="text"
            autoFocus
            placeholder="Danh sách phát của tôi..."
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
          <label htmlFor="create-playlist-desc" className="text-sm font-semibold text-white">
            Mô tả
          </label>
          <textarea
            id="create-playlist-desc"
            rows={3}
            placeholder="Thêm mô tả giới thiệu về danh sách phát của bạn..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={mutation.isPending}
            className="w-full px-4 py-2 bg-[#242424] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48] transition resize-none"
          />
        </div>

        {/* Privacy toggle */}
        <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Công khai danh sách phát</span>
            <span className="text-xs text-neutral-400">
              {isPublic ? 'Mọi người đều có thể tìm và nghe playlist này' : 'Chỉ mình bạn có thể thấy danh sách phát này'}
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
            className="min-w-[110px]"
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin mr-1.5" />
                Đang tạo...
              </>
            ) : (
              'Tạo danh sách'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
