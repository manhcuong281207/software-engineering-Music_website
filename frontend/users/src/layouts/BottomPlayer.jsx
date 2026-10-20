import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFavoriteStore } from "../store/useFavoriteStore";
import { Button } from "../components/ui/Button";
import { addPlayHistory, getUserPlayHistory } from "../api/users/history";
import { getSongById } from "../api/catalog/public";

export const BottomPlayer = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    playNext,
    setPreviousSong,
    popPlaybackHistory,
  } = usePlayerStore();

  const isSongLiked = useFavoriteStore((state) => state.isSongLiked);
  const toggleLikeSong = useFavoriteStore((state) => state.toggleLikeSong);

  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Refs theo dõi việc ghi nhận lịch sử nghe (tránh ghi nhận nhiều lần cho 1 lượt nghe)
  const hasRecordedRef = useRef(false);
  const currentSongIdRef = useRef(null);

  // Reset trạng thái ghi nhận khi chuyển bài hát mới
  useEffect(() => {
    const currentSongId = currentSong
      ? currentSong.id || currentSong.songId
      : null;
    if (currentSongIdRef.current !== currentSongId) {
      currentSongIdRef.current = currentSongId;
      hasRecordedRef.current = false;
      setCurrentTime(0);
    }
  }, [currentSong]);

  // Xử lý Play/Pause khi state isPlaying thay đổi
  useEffect(() => {
    if (!audioRef.current) return;

    // Đảm bảo audio load lại source mới khi bài hát thay đổi
    if (audioRef.current.src !== currentSong?.audioUrl) {
      audioRef.current.src = currentSong?.audioUrl;
      audioRef.current.load();
    }

    if (isPlaying) {
      audioRef.current.play().catch((e) => console.error("Lỗi phát nhạc:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  // Cập nhật âm lượng
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Hàm ghi nhận lịch sử nghe nhạc và tăng lượt nghe (playCount)
  const recordPlayHistory = async (timeListened) => {
    if (hasRecordedRef.current) return;
    hasRecordedRef.current = true;

    const songId = currentSong?.id || currentSong?.songId;
    if (!songId || !isAuthenticated) return;

    try {
      await addPlayHistory({
        songId,
        durationListened: Math.max(1, Math.round(timeListened)),
      });
      // Invalidate query để cập nhật danh sách "Đã nghe gần đây" trên UI
      queryClient.invalidateQueries({ queryKey: ["userPlayHistory"] });
    } catch (err) {
      console.error("Lỗi khi ghi nhận lịch sử nghe nhạc:", err);
    }
  };

  // Xử lý sự kiện từ Audio Element
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);

    // Kích hoạt ghi nhận khi đã nghe >= 30s hoặc bài hát ngắn < 30s đã nghe >= 80% thời lượng
    if (
      isAuthenticated &&
      currentSong &&
      !hasRecordedRef.current &&
      (cur >= 30 || (duration > 0 && duration < 30 && cur >= duration * 0.8))
    ) {
      recordPlayHistory(cur);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    // Nếu nghe xong bài mà chưa được ghi nhận (nghe tối thiểu 5s)
    if (
      isAuthenticated &&
      currentSong &&
      !hasRecordedRef.current &&
      currentTime >= 5
    ) {
      recordPlayHistory(currentTime);
    }
    // Tự động phát bài tiếp theo trong queue nếu có
    playNext();
  };

  // Tua nhạc (Seek)
  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (vol > 0) setIsMuted(false);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isLiked = currentSong
    ? isSongLiked(currentSong.id || currentSong.songId)
    : false;

  const handleLike = () => {
    if (!currentSong) return;
    toggleLikeSong(currentSong, {
      onLogin: () => navigate("/login"),
    });
  };

  /**
   * Xử lý quay lại bài trước đó:
   * 1. Ưu tiên queue nếu đang ở giữa playlist (currentIndex > 0).
   * 2. Nếu không, kiểm tra session playbackHistory stack.
   * 3. Nếu đã đăng nhập và có lịch sử nghe, tra cứu bài trước đó từ backend play_history.
   * 4. Fallback: tua lại đầu bài hiện tại.
   */
  const handlePlayPrevious = async () => {
    if (!currentSong) return;

    // Helper kiểm tra và nạp audioUrl nếu bị thiếu (do dữ liệu phi chuẩn hóa từ history)
    const prepareAndPlay = async (targetSong) => {
      const sId = targetSong.id || targetSong.songId;
      let full = targetSong;
      if (!full.audioUrl) {
        try {
          const res = await getSongById(sId);
          if (res?.data) {
            full = {
              ...targetSong,
              ...res.data,
              id: res.data.id || sId,
              songId: res.data.id || sId,
            };
          }
        } catch (e) {
          console.error("Không thể lấy chi tiết bài hát:", e);
        }
      }
      if (!full.audioUrl) {
        toast.error("Không tìm thấy nguồn âm thanh cho bài trước đó.");
        return false;
      }
      setPreviousSong(full);
      return true;
    };

    // 1. Kiểm tra queue hiện tại nếu có bài trước
    const queue = usePlayerStore.getState().queue;
    const currentId = currentSong.id || currentSong.songId;
    const currentIndex = queue.findIndex(
      (s) => (s.id || s.songId) === currentId
    );

    if (currentIndex > 0) {
      await prepareAndPlay(queue[currentIndex - 1]);
      return;
    }

    // 2. Kiểm tra playbackHistory trong session store
    const prevFromSession = popPlaybackHistory();
    if (prevFromSession) {
      await prepareAndPlay(prevFromSession);
      return;
    }

    // 3. Nếu đã đăng nhập, tra cứu từ lịch sử nghe nhạc (Backend play_history)
    if (isAuthenticated) {
      try {
        let historyList = queryClient.getQueryData(["userPlayHistory"])?.content;
        if (!historyList || historyList.length === 0) {
          const res = await getUserPlayHistory({ page: 0, size: 30 });
          historyList = res?.content || [];
        }

        // Lọc trùng theo thứ tự gần đây nhất
        const seen = new Set();
        const uniqueHistory = [];
        for (const item of historyList) {
          const sId = String(item.songId || item.id);
          if (!seen.has(sId)) {
            seen.add(sId);
            uniqueHistory.push(item);
          }
        }

        // Tìm vị trí bài hát hiện tại trong lịch sử lọc trùng
        const currIdxInHistory = uniqueHistory.findIndex(
          (item) => String(item.songId || item.id) === String(currentId)
        );

        let targetHistorySong = null;
        if (currIdxInHistory !== -1 && currIdxInHistory < uniqueHistory.length - 1) {
          // Bài nghe liền trước bài hiện tại (nằm kế sau trong danh sách DESC)
          targetHistorySong = uniqueHistory[currIdxInHistory + 1];
        } else if (currIdxInHistory === -1 && uniqueHistory.length > 0) {
          // Bài hiện tại chưa có trong history (mới bắt đầu nghe) -> lấy bài gần nhất
          targetHistorySong = uniqueHistory[0];
        }

        if (targetHistorySong) {
          const success = await prepareAndPlay(targetHistorySong);
          if (success) {
            toast.info(`Đang phát bài trước đó: ${targetHistorySong.title}`);
            return;
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải bài trước đó từ lịch sử:", err);
      }
    }

    // 4. Fallback: tua lại đầu bài hiện tại nếu không có bài trước
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <footer className="h-20 bg-spotify-black flex items-center justify-between px-4 z-50">
      {/* Thẻ audio ẩn xử lý luồng phát nhạc */}
      <audio
        key={currentSong.id || currentSong.audioUrl}
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* 1. Thông tin bài hát (Bên trái) */}
      <div className="w-[30%] flex items-center gap-3">
        <img
          src={currentSong.coverUrl || currentSong.coverImage}
          alt="Cover"
          className="w-14 h-14 rounded-md object-cover"
        />
        <div className="hidden sm:block">
          <h4 className="text-sm font-bold text-white line-clamp-1 cursor-pointer hover:underline">
            {currentSong.title}
          </h4>
          <p className="text-xs text-spotify-sub line-clamp-1 cursor-pointer hover:underline hover:text-white">
            {currentSong.artist || currentSong.ownerName || currentSong.artistName}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          className={`ml-2 hover:bg-transparent transition-all active:scale-125 ${
            isLiked
              ? "text-spotify-primary hover:text-spotify-primary-hover"
              : "text-spotify-sub hover:text-white"
          }`}
          tooltip={isLiked ? "Xóa khỏi Bài hát đã thích" : "Lưu vào Bài hát đã thích"}
          tooltipPosition="top"
          onClick={handleLike}
        >
          <Heart
            size={18}
            className={isLiked ? "fill-spotify-primary text-spotify-primary" : ""}
          />
        </Button>
      </div>

      {/* 2. Điều khiển trung tâm (Player Controls) */}
      <div className="flex-1 max-w-2xl flex flex-col items-center justify-center gap-2">
        {/* Nút bấm */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            className="hover:bg-transparent text-spotify-sub hover:text-white"
            tooltip="Trộn bài"
            tooltipPosition="top"
          >
            <Shuffle size={18} />
          </Button>

          <Button
            onClick={handlePlayPrevious}
            variant="ghost"
            size="sm"
            iconOnly
            className="hover:bg-transparent text-spotify-sub hover:text-white"
            tooltip={isAuthenticated ? "Trước (Hoặc bài đã nghe)" : "Trước"}
            tooltipPosition="top"
          >
            <SkipBack size={20} fill="currentColor" />
          </Button>

          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            variant="white"
            size="sm"
            iconOnly
            tooltip={isPlaying ? "Tạm dừng" : "Phát"}
            tooltipPosition="top"
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play
                size={18}
                fill="currentColor"
                strokeWidth={0}
                className="translate-x-[2px]"
              />
            )}
          </Button>

          <Button
            onClick={playNext}
            variant="ghost"
            size="sm"
            iconOnly
            className="hover:bg-transparent text-spotify-sub hover:text-white"
            tooltip="Tiếp"
            tooltipPosition="top"
          >
            <SkipForward size={20} fill="currentColor" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            iconOnly
            className="hover:bg-transparent text-spotify-sub hover:text-white"
            tooltip="Lặp lại"
            tooltipPosition="top"
          >
            <Repeat size={18} />
          </Button>
        </div>

        {/* Thanh Progress (Tua bài hát) */}
        <div className="w-full flex items-center gap-2 text-xs text-spotify-sub">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 flex items-center group relative h-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Thanh hiển thị (Background xám) */}
            <div className="w-full h-1 bg-spotify-hover rounded-full overflow-hidden">
              {/* Phần đã phát (Màu trắng -> Đỏ khi hover) */}
              <div
                className="h-full bg-white group-hover:bg-spotify-primary rounded-full transition-colors"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            {/* Nút kéo (Thumb) ẩn, chỉ hiện khi hover */}
            <div
              className="absolute h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transform -translate-x-1/2 pointer-events-none transition-opacity"
              style={{ left: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Điều khiển Âm lượng (Bên phải) */}
      <div className="w-[30%] flex items-center justify-end gap-2 text-spotify-sub">
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          className="hover:bg-transparent text-spotify-sub hover:text-white"
          tooltip={isMuted || volume === 0 ? "Bật âm" : "Tắt âm"}
          tooltipPosition="top"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted || volume === 0 ? (
            <VolumeX size={20} />
          ) : (
            <Volume2 size={20} />
          )}
        </Button>
        <div className="w-24 flex items-center group relative h-1">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {/* Thanh background âm lượng */}
          <div className="w-full h-1 bg-spotify-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-white group-hover:bg-spotify-primary rounded-full transition-colors"
              style={{ width: `${volumePercent}%` }}
            ></div>
          </div>
          <div
            className="absolute h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transform -translate-x-1/2 pointer-events-none transition-opacity"
            style={{ left: `${volumePercent}%` }}
          ></div>
        </div>
      </div>
    </footer>
  );
};
