import { createContext, useContext, useState, useRef, useCallback } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none' | 'all' | 'one'

  const audioRef = useRef(new Audio());

  const playSong = useCallback(
    (song, songList = []) => {
      const audio = audioRef.current;
      if (currentSong?.id === song.id && isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      audio.src = song.audio_url;
      audio.volume = isMuted ? 0 : volume;
      audio.play().catch(console.error);

      setCurrentSong(song);
      setIsPlaying(true);
      setCurrentTime(0);

      if (songList.length > 0) {
        setQueue(songList);
        setCurrentIndex(songList.findIndex((s) => s.id === song.id));
      }

      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.ondurationchange = () => setDuration(audio.duration);
      audio.onended = () => {
        if (repeatMode === 'one') {
          audio.currentTime = 0;
          audio.play();
        } else {
          playNext();
        }
      };
    },
    [currentSong, isPlaying, volume, isMuted, repeatMode],
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const changeVolume = useCallback(
    (val) => {
      setVolume(val);
      if (!isMuted) audioRef.current.volume = val;
    },
    [isMuted],
  );

  const toggleMute = useCallback(() => {
    const muted = !isMuted;
    setIsMuted(muted);
    audioRef.current.volume = muted ? 0 : volume;
  }, [isMuted, volume]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    const nextIdx = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIdx);
    playSong(queue[nextIdx], queue);
  }, [queue, currentIndex, playSong]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      seek(0);
      return;
    }
    const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentIndex(prevIdx);
    playSong(queue[prevIdx], queue);
  }, [queue, currentIndex, currentTime, playSong, seek]);

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    playSong,
    togglePlay,
    seek,
    changeVolume,
    toggleMute,
    playNext,
    playPrev,
    setIsShuffled,
    setRepeatMode,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
