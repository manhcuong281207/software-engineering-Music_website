import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { mockApi } from '../services/mockApi';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { SectionCarousel } from '../components/ui/SectionCarousel';
import { SongCard } from '../components/ui/SongCard';
import { SkeletonCard } from '../components/ui/Skeleton';

const ITEM_CLASS = 'w-[140px] shrink-0 sm:w-[170px] md:w-[190px] lg:w-[210px]';

function LoadingCards({ count = 5, isArtist = false }) {
  return Array.from({ length: count }, (_, index) => (
    <div key={index} className={ITEM_CLASS}>
      <SkeletonCard isArtist={isArtist} />
    </div>
  ));
}

export function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const setQueue = usePlayerStore((state) => state.setQueue);

  const { data: songsResult, isLoading: songsLoading } = useQuery({
    queryKey: ['mock-home-songs'],
    queryFn: () => mockApi.getPublicSongs({ size: 10, sort: 'playCount,desc' }),
  });
  const { data: artistsResult, isLoading: artistsLoading } = useQuery({
    queryKey: ['mock-home-artists'],
    queryFn: () => mockApi.getPublicArtists({ size: 10, sort: 'followerCount,desc' }),
  });
  const { data: albumsResult, isLoading: albumsLoading } = useQuery({
    queryKey: ['mock-home-albums'],
    queryFn: () => mockApi.getPublicAlbums({ size: 10, sort: 'likeCount,desc' }),
  });

  const songs = songsResult?.data?.content ?? [];
  const artists = artistsResult?.data?.content ?? [];
  const albums = albumsResult?.data?.content ?? [];

  const playSong = (song, queue) => {
    setQueue(queue);
    setCurrentSong(song);
  };

  const playRelatedSongs = async (getSongs, id, emptyMessage) => {
    try {
      const result = await getSongs(id, { size: 50 });
      const list = result?.data?.content ?? [];
      if (list.length) playSong(list[0], list);
      else toast.info(emptyMessage);
    } catch {
      toast.error('Không thể tải nhạc mẫu.');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 sm:gap-10">
      {isAuthenticated && ['Nghe gần đây', 'Bài hát yêu thích', 'Nghệ sĩ bạn yêu thích'].map((title) => (
        <SectionCarousel key={title} title={title}>
          <p className="w-full py-8 text-center text-sm text-[#a7a7a7]">Tính năng “{title}” đang được phát triển.</p>
        </SectionCarousel>
      ))}

      <SectionCarousel title="Những bài hát thịnh hành">
        {songsLoading ? <LoadingCards /> : songs.length ? songs.map((song) => (
          <div key={song.id} className={ITEM_CLASS}>
            <SongCard
              title={song.title}
              subtitle={song.ownerName}
              imageUrl={song.coverImage}
              onClick={() => playSong(song, songs)}
              onPlayClick={() => playSong(song, songs)}
            />
          </div>
        )) : <p className="w-full py-8 text-center text-sm text-[#a7a7a7]">Chưa có bài hát nào thịnh hành.</p>}
      </SectionCarousel>

      <SectionCarousel title="Nghệ sĩ phổ biến">
        {artistsLoading ? <LoadingCards isArtist /> : artists.length ? artists.map((artist) => (
          <div key={artist.id} className={ITEM_CLASS}>
            <SongCard
              type="artist"
              title={artist.stageName}
              subtitle="Nghệ sĩ"
              imageUrl={artist.avatarUrl}
              onClick={() => navigate(`/artist/${artist.id}`)}
              onPlayClick={() => playRelatedSongs(mockApi.getArtistSongs, artist.id, 'Nghệ sĩ này chưa có bài hát.')}
            />
          </div>
        )) : <p className="w-full py-8 text-center text-sm text-[#a7a7a7]">Chưa có dữ liệu nghệ sĩ để hiển thị.</p>}
      </SectionCarousel>

      <SectionCarousel title="Album và đĩa đơn nổi tiếng">
        {albumsLoading ? <LoadingCards /> : albums.length ? albums.map((album) => (
          <div key={album.id} className={ITEM_CLASS}>
            <SongCard
              type="album"
              title={album.title}
              subtitle={`${album.albumType === 'EP' ? 'EP' : 'Album'} • ${album.ownerName}`}
              imageUrl={album.coverImage}
              onClick={() => navigate(`/album/${album.id}`, { state: { album } })}
              onPlayClick={() => playRelatedSongs(mockApi.getAlbumSongs, album.id, 'Album này chưa có bài hát.')}
            />
          </div>
        )) : <p className="w-full py-8 text-center text-sm text-[#a7a7a7]">Chưa có album nào được phát hành.</p>}
      </SectionCarousel>
    </div>
  );
}
