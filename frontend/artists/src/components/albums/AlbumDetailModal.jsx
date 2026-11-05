import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Disc3,
  Music2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Calendar,
  Headphones,
} from "lucide-react";
import {
  getAlbumSongsApi,
  getArtistSongsApi,
  addSongToAlbumApi,
  removeSongFromAlbumApi,
  reorderAlbumSongsApi,
} from "../../api/catalog";
import { Button } from "../ui/Button";
import { toast } from "sonner";

export const AlbumDetailModal = ({ isOpen, onClose, album, onUpdate }) => {
  const [selectedSongToAdd, setSelectedSongToAdd] = useState("");
  const [trackNumberToAdd, setTrackNumberToAdd] = useState("");
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [removingSongId, setRemovingSongId] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderedTracks, setReorderedTracks] = useState(null);

  // 1. Fetch danh sách bài hát trong Album này
  const {
    data: albumSongsData,
    isLoading: isLoadingTracks,
    refetch: refetchTracks,
  } = useQuery({
    queryKey: ["albumSongs", album?.id],
    queryFn: () => getAlbumSongsApi(album?.id, { size: 100 }),
    enabled: Boolean(album?.id && isOpen),
  });

  // 2. Fetch danh sách bài hát của Artist (để chọn thêm vào album)
  const { data: allSongsData, refetch: refetchAllSongs } = useQuery({
    queryKey: ["artistAvailableSongsForAlbum"],
    queryFn: () => getArtistSongsApi({ isDeleted: false, size: 100 }),
    enabled: Boolean(isOpen),
  });

  const serverTracks = albumSongsData?.data?.content || [];
  const tracks = reorderedTracks ?? serverTracks;

  if (!isOpen || !album) return null;

  const currentTrackIds = tracks.map((t) => t.id);
  const availableSongs = (allSongsData?.data?.content || []).filter(
    (s) => !currentTrackIds.includes(s.id)
  );

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Thêm bài hát vào album
  const handleAddSong = async () => {
    if (!selectedSongToAdd) {
      toast.error("Vui lòng chọn bài hát để thêm vào album");
      return;
    }

    setIsAddingSong(true);
    try {
      await addSongToAlbumApi(album.id, {
        songId: selectedSongToAdd,
        trackNumber: trackNumberToAdd ? parseInt(trackNumberToAdd, 10) : undefined,
      });
      toast.success("Đã thêm bài hát vào album thành công!");
      setSelectedSongToAdd("");
      setTrackNumberToAdd("");
      await Promise.all([refetchTracks(), refetchAllSongs()]);
      onUpdate?.();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể thêm bài hát vào album";
      toast.error(msg);
    } finally {
      setIsAddingSong(false);
    }
  };

  // Gỡ bài hát khỏi album
  const handleRemoveSong = async (songId, songTitle) => {
    setRemovingSongId(songId);
    try {
      await removeSongFromAlbumApi(album.id, songId);
      toast.success(`Đã gỡ "${songTitle}" khỏi album (chuyển thành Single độc lập)`);
      await Promise.all([refetchTracks(), refetchAllSongs()]);
      onUpdate?.();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể gỡ bài hát khỏi album";
      toast.error(msg);
    } finally {
      setRemovingSongId(null);
    }
  };

  // Di chuyển bài hát lên / xuống
  const handleMove = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tracks.length) return;

    const newTracks = [...tracks];
    const temp = newTracks[index];
    newTracks[index] = newTracks[targetIndex];
    newTracks[targetIndex] = temp;

    // Cập nhật lại số thứ tự
    const songOrders = newTracks.map((song, i) => ({
      songId: song.id,
      trackNumber: i + 1,
    }));

    setReorderedTracks(newTracks);
    setIsReordering(true);
    try {
      await reorderAlbumSongsApi(album.id, { songOrders });
      toast.success("Đã cập nhật thứ tự bài hát");
      refetchTracks();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể lưu thứ tự bài hát";
      toast.error(msg);
      refetchTracks();
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#18181c] border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fa2d48]/10 text-[#fa2d48] border border-[#fa2d48]/20">
              <Disc3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Quản lý bài hát trong Album</h2>
              <p className="text-xs text-neutral-400">
                Thêm bớt và sắp xếp danh sách phát của Album
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Album Overview Hero */}
          <div className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-[#121215] p-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-800 border border-neutral-700">
              {album.coverImage ? (
                <img
                  src={album.coverImage}
                  alt={album.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-500">
                  <Disc3 className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#fa2d48]/20 px-2 py-0.5 text-[10px] font-bold text-[#fa2d48]">
                  {album.albumType || "ALBUM"}
                </span>
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {album.releaseDate || "Chưa phát hành"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white truncate mt-1">{album.title}</h3>
              {album.description && (
                <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                  {album.description}
                </p>
              )}
            </div>
          </div>

          {/* Form thêm bài hát vào album */}
          <div className="rounded-xl border border-neutral-800 bg-[#121215]/60 p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#fa2d48]" />
              Thêm bài hát đã có vào Album này
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <select
                  value={selectedSongToAdd}
                  onChange={(e) => setSelectedSongToAdd(e.target.value)}
                  disabled={isAddingSong}
                  className="w-full rounded-xl border border-neutral-700 bg-[#18181c] px-3.5 py-2.5 text-xs text-white focus:border-[#fa2d48] focus:outline-none"
                >
                  <option value="">-- Chọn bài hát của bạn để đưa vào album --</option>
                  {availableSongs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} {s.albumTitle ? `(Đang ở: ${s.albumTitle})` : "(Single)"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-28">
                <input
                  type="number"
                  min="1"
                  value={trackNumberToAdd}
                  onChange={(e) => setTrackNumberToAdd(e.target.value)}
                  placeholder="Thứ tự"
                  disabled={isAddingSong}
                  className="w-full rounded-xl border border-neutral-700 bg-[#18181c] px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none"
                />
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddSong}
                disabled={!selectedSongToAdd || isAddingSong}
                className="w-full sm:w-auto shrink-0 !h-10 text-xs"
              >
                {isAddingSong ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm vào Album
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Danh sách bài hát (Tracklist) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Danh sách bài hát ({tracks.length} tracks)
              </h4>
              {isReordering && (
                <span className="flex items-center gap-1.5 text-xs text-amber-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang lưu thứ tự...
                </span>
              )}
            </div>

            {isLoadingTracks ? (
              <div className="p-8 text-center text-neutral-500 text-sm">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#fa2d48]" />
                Đang tải danh sách bài hát...
              </div>
            ) : tracks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-800 p-8 text-center">
                <Music2 className="h-8 w-8 mx-auto text-neutral-600 mb-2" />
                <p className="text-sm font-semibold text-neutral-300">Album này chưa có bài hát nào</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Hãy dùng biểu mẫu phía trên để thêm bài hát vào album
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {tracks.map((track, idx) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-[#121215] p-3 hover:bg-neutral-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Track number & Reorder controls */}
                      <div className="flex items-center gap-1">
                        <span className="w-6 text-center text-xs font-bold text-neutral-500">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMove(idx, "up")}
                            disabled={idx === 0 || isReordering}
                            className="p-0.5 text-neutral-500 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-500 transition-colors"
                            title="Di chuyển lên"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleMove(idx, "down")}
                            disabled={idx === tracks.length - 1 || isReordering}
                            className="p-0.5 text-neutral-500 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-500 transition-colors"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Song thumbnail */}
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                        {track.coverImage ? (
                          <img
                            src={track.coverImage}
                            alt={track.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-500">
                            <Music2 className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Song info */}
                      <div className="truncate min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">
                            {track.title}
                          </span>
                          {track.explicit && (
                            <span className="rounded bg-neutral-800 px-1.5 py-0.2 text-[9px] font-bold text-neutral-400">
                              18+
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                          <span>{formatDuration(track.durationSeconds)}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Headphones className="h-3 w-3" />
                            {(track.playCount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveSong(track.id, track.title)}
                        disabled={removingSongId === track.id}
                        className="rounded-lg p-2 text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Gỡ khỏi Album (thành Single)"
                      >
                        {removingSongId === track.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-neutral-800/80 px-6 py-4 bg-[#141418]">
          <Button variant="dark" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

