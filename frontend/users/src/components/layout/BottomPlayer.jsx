import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  ListMusic,
  Maximize2,
} from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { formatDuration } from '../../utils/formatters';

export default function BottomPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    togglePlay,
    seek,
    changeVolume,
    toggleMute,
    playNext,
    playPrev,
    setIsShuffled,
    setRepeatMode,
  } = usePlayer();

  const [liked, setLiked] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    seek(pct * duration);
  };

  const toggleRepeat = () => {
    const modes = ['none', 'all', 'one'];
    const idx = modes.indexOf(repeatMode);
    setRepeatMode(modes[(idx + 1) % modes.length]);
  };

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-[#181818] border-t border-[#282828] z-50 flex items-center justify-center">
        <p className="text-[#6d6d6d] text-sm">Chọn một bài hát để phát</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#181818] border-t border-[#282828] z-50 px-4">
      {/* Progress bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 cursor-pointer group"
        onClick={handleSeek}
      >
        <div className="h-full bg-[#4d4d4d] relative">
          <div
            className="h-full bg-[#fa2d48] transition-none relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between h-full">
        {/* Left: Song info */}
        <div className="flex items-center gap-3 w-[30%] min-w-0">
          <img
            src={currentSong.cover_image}
            alt={currentSong.title}
            className="w-14 h-14 rounded-md object-cover shadow-lg flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{currentSong.title}</p>
            <p className="text-xs text-[#a7a7a7] truncate">{currentSong.owner_name}</p>
          </div>
          <button
            onClick={() => setLiked((p) => !p)}
            className={`ml-2 flex-shrink-0 transition-all duration-200 hover:scale-110 ${
              liked ? 'text-[#fa2d48]' : 'text-[#a7a7a7] hover:text-white'
            }`}
          >
            <Heart size={18} fill={liked ? '#fa2d48' : 'none'} />
          </button>
        </div>

        {/* Center: Controls */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-[400px]">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Shuffle */}
            <button
              onClick={() => setIsShuffled((p) => !p)}
              className={`transition-colors duration-200 ${
                isShuffled ? 'text-[#fa2d48]' : 'text-[#a7a7a7] hover:text-white'
              }`}
            >
              <Shuffle size={18} />
            </button>

            {/* Prev */}
            <button
              onClick={playPrev}
              className="text-[#a7a7a7] hover:text-white transition-colors duration-200"
            >
              <SkipBack size={22} />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-white hover:scale-105 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
            >
              {isPlaying ? (
                <Pause size={18} fill="black" className="text-black" />
              ) : (
                <Play size={18} fill="black" className="text-black ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={playNext}
              className="text-[#a7a7a7] hover:text-white transition-colors duration-200"
            >
              <SkipForward size={22} />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`transition-colors duration-200 relative ${
                repeatMode !== 'none' ? 'text-[#fa2d48]' : 'text-[#a7a7a7] hover:text-white'
              }`}
            >
              <Repeat size={18} />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-[#fa2d48] text-white rounded-full w-3 h-3 flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Time + Seekbar */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-[10px] text-[#a7a7a7] w-8 text-right flex-shrink-0">
              {formatDuration(currentTime)}
            </span>
            <div
              className="flex-1 h-1 bg-[#4d4d4d] rounded-full cursor-pointer group/seek relative"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-[#a7a7a7] group-hover/seek:bg-[#fa2d48] rounded-full transition-colors"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-[#a7a7a7] w-8 flex-shrink-0">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume */}
        <div className="flex items-center gap-2 justify-end w-[30%]">
          <button className="hidden md:block text-[#a7a7a7] hover:text-white">
            <ListMusic size={18} />
          </button>
          <button
            className="hidden md:block text-[#a7a7a7] hover:text-white"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            className="hidden md:block w-20 accent-[#fa2d48] h-1 cursor-pointer"
          />
          <button className="text-[#a7a7a7] hover:text-white hidden md:block">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
