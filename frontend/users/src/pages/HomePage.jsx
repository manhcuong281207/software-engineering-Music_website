import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { SongCard } from "../components/ui/SongCard";
import { SectionCarousel } from "../components/ui/SectionCarousel";
import { SkeletonCard } from "../components/ui/Skeleton";
import { useAuthStore } from "../store/useAuthStore";
import { usePlayerStore } from "../store/usePlayerStore";
import {
  getPublicSongs,
  getPublicAlbums,
  getArtistSongs,
  getAlbumSongs,
  getSongById,
} from "../api/catalog/public";
import { getPublicArtists } from "../api/artists/public";
import { getFavoriteSongs } from "../api/users/favorite";
import { getFollowedArtists } from "../api/users/follow";
import { getUserPlayHistory } from "../api/users/history";
import { Heart, UserPlus, History } from "lucide-react";
import { toast } from "sonner";

export const HomePage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { setCurrentSong, setIsPlaying, setQueue } = usePlayerStore();
  const navigate = useNavigate();

  const handlePlayArtistCard = async (artistId) => {
    try {
      const res = await getArtistSongs(artistId, {
        size: 50,
        sort: "likeCount,desc",
      });
      const songs = res.data?.content || [];
      if (songs.length > 0) {
        const randomIndex = Math.floor(Math.random() * songs.length);
        setCurrentSong(songs[randomIndex]);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayAlbumCard = async (albumId) => {
    try {
      const res = await getAlbumSongs(albumId, {
        size: 50,
        sort: "createdAt,asc",
      });
      const songs = res.data?.content || [];
      if (songs.length > 0) {
        const randomIndex = Math.floor(Math.random() * songs.length);
        setCurrentSong(songs[randomIndex]);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatAlbumType = (type) => {
    if (!type) return "Album";
    if (type.toUpperCase() === "EP") return "EP";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  // Fetch Public Songs
  const { data: songsData, isLoading: isLoadingSongs } = useQuery({
    queryKey: ["publicSongs", "trending"],
    queryFn: () => getPublicSongs({ size: 10, sort: "playCount,desc" }),
  });

  // Fetch Public Artists
  const { data: artistsData, isLoading: isLoadingArtists } = useQuery({
    queryKey: ["publicArtists", "popular"],
    queryFn: () => getPublicArtists({ size: 10, sort: "followerCount,desc" }),
  });

  const { data: albumsData, isLoading: isLoadingAlbums } = useQuery({
    queryKey: ["publicAlbums", "popular"],
    queryFn: () => getPublicAlbums({ size: 10, sort: "likeCount,desc" }),
  });

  // Fetch Favorite Songs (User)
  const { data: favoriteSongsData, isLoading: isLoadingFavoriteSongs } = useQuery({
    queryKey: ["userFavorites", "home"],
    queryFn: () => getFavoriteSongs({ size: 10 }),
    enabled: isAuthenticated,
  });

  // Fetch Followed Artists (User)
  const { data: followedArtistsData, isLoading: isLoadingFollowedArtists } = useQuery({
    queryKey: ["userFollowedArtists", "home"],
    queryFn: () => getFollowedArtists({ size: 10 }),
    enabled: isAuthenticated,
  });

  // Fetch Listening History (User)
  const { data: historySongsData, isLoading: isLoadingHistorySongs } = useQuery({
    queryKey: ["userPlayHistory"],
    queryFn: () => getUserPlayHistory({ page: 0, size: 30 }),
    enabled: isAuthenticated,
  });

  // Trích xuất dữ liệu từ response (chuẩn hóa API backend trả về format: data.data.content)
  const songs = songsData?.data?.content || [];
  const artists = artistsData?.data?.content || [];
  const albums = albumsData?.data?.content || [];
  const favoriteSongs = favoriteSongsData?.content || [];
  const followedArtists = followedArtistsData?.content || [];

  // Lọc trùng các bài hát đã nghe: giữ lại lần nghe gần nhất theo thời gian (playedAt DESC)
  const historySongs = useMemo(() => {
    const rawList = historySongsData?.content || [];
    const seen = new Set();
    const unique = [];
    for (const item of rawList) {
      const sId = String(item.songId || item.id);
      if (!seen.has(sId)) {
        seen.add(sId);
        unique.push(item);
      }
    }
    return unique;
  }, [historySongsData]);

  const handlePlayFavoriteSong = async (song) => {
    try {
      const songId = song.id || song.songId;
      let fullSong = song;
      if (!fullSong.audioUrl) {
        const detailRes = await getSongById(songId);
        if (detailRes?.data) {
          fullSong = {
            ...song,
            ...detailRes.data,
            id: detailRes.data.id || songId,
            songId: detailRes.data.id || songId,
          };
        }
      }
      if (!fullSong.audioUrl) {
        toast.error("Không tìm thấy nguồn âm thanh cho bài hát này.");
        return;
      }
      setQueue(favoriteSongs);
      setCurrentSong(fullSong);
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải bài hát.");
    }
  };

  const handlePlayHistorySong = async (song) => {
    try {
      const songId = song.id || song.songId;
      let fullSong = song;
      if (!fullSong.audioUrl) {
        const detailRes = await getSongById(songId);
        if (detailRes?.data) {
          fullSong = {
            ...song,
            ...detailRes.data,
            id: detailRes.data.id || songId,
            songId: detailRes.data.id || songId,
          };
        }
      }
      if (!fullSong.audioUrl) {
        toast.error("Không tìm thấy nguồn âm thanh cho bài hát này.");
        return;
      }
      setQueue(historySongs);
      setCurrentSong(fullSong);
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải bài hát.");
    }
  };

  // Tạo khung Skeleton khi đang tải (sử dụng component chuẩn mới)
  const renderSkeletons = (count = 5, isArtist = false) => {
    return Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px] flex-shrink-0"
      >
        <SkeletonCard isArtist={isArtist} />
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* 1. KHỐI PRIVATE (Chỉ hiện khi đăng nhập) */}
      {isAuthenticated && (
        <>
          {/* Section Lịch sử nghe gần đây (Đã lọc trùng) */}
          <SectionCarousel title="Đã nghe gần đây">
            {isLoadingHistorySongs ? (
              renderSkeletons()
            ) : historySongs.length > 0 ? (
              historySongs.map((song) => (
                <div
                  key={song.id || song.songId}
                  className="w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px] flex-shrink-0"
                >
                  <SongCard
                    id={song.id || song.songId}
                    type="song"
                    title={song.title}
                    subtitle={song.artistName}
                    artistName={song.artistName}
                    imageUrl={song.coverImage}
                    onClick={() => handlePlayHistorySong(song)}
                    onPlayClick={() => handlePlayHistorySong(song)}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-spotify-sub flex flex-col items-center justify-center gap-2 w-full bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-6">
                <History size={28} className="text-[#fa2d48] opacity-80" />
                <span className="text-sm text-white font-medium">Chưa có bài hát nào trong lịch sử nghe</span>
                <span className="text-xs text-spotify-sub">Bắt đầu khám phá và thưởng thức những giai điệu bạn yêu thích!</span>
              </div>
            )}
          </SectionCarousel>

          {/* Section Bài hát yêu thích */}
          <SectionCarousel title="Bài hát bạn yêu thích">
            {isLoadingFavoriteSongs ? (
              renderSkeletons()
            ) : favoriteSongs.length > 0 ? (
              favoriteSongs.map((song) => (
                <div
                  key={song.id || song.songId}
                  className="w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px] flex-shrink-0"
                >
                  <SongCard
                    id={song.id || song.songId}
                    type="song"
                    title={song.title}
                    subtitle={song.artistName}
                    artistName={song.artistName}
                    imageUrl={song.coverImage}
                    onClick={() => handlePlayFavoriteSong(song)}
                    onPlayClick={() => handlePlayFavoriteSong(song)}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-spotify-sub flex flex-col items-center justify-center gap-2 w-full bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-6">
                <Heart size={28} className="text-[#fa2d48] opacity-80" />
                <span className="text-sm text-white font-medium">Chưa có bài hát nào trong danh sách yêu thích</span>
                <span className="text-xs text-spotify-sub">Hãy thả tim những bài hát bên dưới để nghe lại bất cứ lúc nào!</span>
              </div>
            )}
          </SectionCarousel>

          {/* Section Nghệ sĩ theo dõi */}
          <SectionCarousel title="Nghệ sĩ bạn theo dõi">
            {isLoadingFollowedArtists ? (
              renderSkeletons(5, true)
            ) : followedArtists.length > 0 ? (
              followedArtists.map((artist) => (
                <div
                  key={artist.id || artist.artistId}
                  className="w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px] flex-shrink-0"
                >
                  <SongCard
                    type="artist"
                    id={artist.id || artist.artistId}
                    title={artist.stageName}
                    subtitle="Nghệ sĩ"
                    imageUrl={artist.avatarUrl}
                    onClick={() => navigate(`/artist/${artist.id || artist.artistId}`)}
                    onPlayClick={() => handlePlayArtistCard(artist.id || artist.artistId)}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-spotify-sub flex flex-col items-center justify-center gap-2 w-full bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-6">
                <UserPlus size={28} className="text-[#fa2d48] opacity-80" />
                <span className="text-sm text-white font-medium">Bạn chưa theo dõi nghệ sĩ nào</span>
                <span className="text-xs text-spotify-sub">Khám phá các nghệ sĩ bên dưới và bấm theo dõi để cập nhật nhạc mới!</span>
              </div>
            )}
          </SectionCarousel>
        </>
      )}

      {/* 2. KHỐI PUBLIC */}

      {/* Khối Bài Hát */}
      <SectionCarousel title="Những bài hát thịnh hành">
        {isLoadingSongs ? (
          renderSkeletons()
        ) : songs.length > 0 ? (
          songs.map((song) => (
            <div
              key={song.id}
              className="w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px] flex-shrink-0"
            >
              <SongCard
                type="song"
                title={song.title}
                subtitle={song.ownerName}
                artistName={song.ownerName}
                imageUrl={song.coverImage}
                onClick={() => {}}
                onPlayClick={() => {
                  setCurrentSong(song);
                  setIsPlaying(true);
                }}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-spotify-sub flex flex-col items-center justify-center gap-2 w-full">
            <span>Chưa có bài hát nào thịnh hành.</span>
          </div>
        )}
      </SectionCarousel>

      {/* Khối Nghệ sĩ */}
      <SectionCarousel title="Nghệ sĩ phổ biến">
        {isLoadingArtists ? (
          renderSkeletons(5, true)
        ) : artists.length > 0 ? (
          artists.map((artist) => (
            <div
              key={artist.id}
              className="w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px] flex-shrink-0"
            >
              <SongCard
                type="artist"
                title={artist.stageName}
                subtitle="Nghệ sĩ"
                artistName={artist.stageName}
                imageUrl={artist.avatarUrl}
                onClick={() => navigate(`/artist/${artist.id}`)}
                onPlayClick={() => handlePlayArtistCard(artist.id)}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-spotify-sub flex flex-col items-center justify-center gap-2 w-full">
            <span>Chưa có dữ liệu nghệ sĩ để hiển thị.</span>
          </div>
        )}
      </SectionCarousel>

      {/* Khối Album */}
      <SectionCarousel title="Album và đĩa đơn nổi tiếng">
        {isLoadingAlbums ? (
          renderSkeletons()
        ) : albums.length > 0 ? (
          albums.map((album) => (
            <div
              key={album.id}
              className="w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px] flex-shrink-0"
            >
              <SongCard
                type="album"
                title={album.title}
                subtitle={`${formatAlbumType(album.albumType)} • ${album.ownerName}`}
                artistName={album.ownerName}
                imageUrl={album.coverImage}
                onClick={() =>
                  navigate(`/album/${album.id}`, { state: { album } })
                }
                onPlayClick={() => handlePlayAlbumCard(album.id)}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-spotify-sub flex flex-col items-center justify-center gap-2 w-full">
            <span>Chưa có album nào được phát hành.</span>
          </div>
        )}
      </SectionCarousel>
    </div>
  );
};
