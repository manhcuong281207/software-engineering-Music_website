/**
 * Mock API Service
 * Simulates backend API calls with realistic delays.
 * Replace fetch() calls here when real API is ready.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 'user-001',
  full_name: 'Nguyễn Văn A',
  email: 'user@mcmusic.vn',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
};

const MOCK_FEATURED_SONGS = [
  {
    id: 's001',
    title: 'Nơi Này Có Anh',
    owner_name: 'Sơn Tùng M-TP',
    cover_image: 'https://picsum.photos/seed/song1/300/300',
    duration_seconds: 247,
    play_count: 12500000,
    like_count: 450000,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 's002',
    title: 'Chạy Ngay Đi',
    owner_name: 'Sơn Tùng M-TP',
    cover_image: 'https://picsum.photos/seed/song2/300/300',
    duration_seconds: 213,
    play_count: 10200000,
    like_count: 380000,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 's003',
    title: 'Bước Qua Mùa Cô Đơn',
    owner_name: 'Vũ.',
    cover_image: 'https://picsum.photos/seed/song3/300/300',
    duration_seconds: 275,
    play_count: 8900000,
    like_count: 320000,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 's004',
    title: 'Hào Quang',
    owner_name: 'Wren Evans',
    cover_image: 'https://picsum.photos/seed/song4/300/300',
    duration_seconds: 195,
    play_count: 7600000,
    like_count: 280000,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 's005',
    title: 'Waiting For You',
    owner_name: 'MONO',
    cover_image: 'https://picsum.photos/seed/song5/300/300',
    duration_seconds: 238,
    play_count: 6800000,
    like_count: 250000,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: 's006',
    title: 'Anh Đang Nhớ Em',
    owner_name: 'Đức Phúc',
    cover_image: 'https://picsum.photos/seed/song6/300/300',
    duration_seconds: 224,
    play_count: 5500000,
    like_count: 200000,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
];

const MOCK_NEW_RELEASES = [
  {
    id: 'a001',
    title: 'Sky Tour',
    owner_name: 'Sơn Tùng M-TP',
    album_type: 'ALBUM',
    cover_image: 'https://picsum.photos/seed/album1/300/300',
    release_date: '2024-01-15',
    total_tracks: 12,
  },
  {
    id: 'a002',
    title: 'Ngủ Một Mình',
    owner_name: 'Vũ.',
    album_type: 'EP',
    cover_image: 'https://picsum.photos/seed/album2/300/300',
    release_date: '2024-02-20',
    total_tracks: 6,
  },
  {
    id: 'a003',
    title: 'Ý Nghĩa Của Sự Im Lặng',
    owner_name: 'MONO',
    album_type: 'ALBUM',
    cover_image: 'https://picsum.photos/seed/album3/300/300',
    release_date: '2024-03-10',
    total_tracks: 10,
  },
  {
    id: 'a004',
    title: 'Yellow Pepper',
    owner_name: 'Wren Evans',
    album_type: 'ALBUM',
    cover_image: 'https://picsum.photos/seed/album4/300/300',
    release_date: '2024-04-05',
    total_tracks: 8,
  },
  {
    id: 'a005',
    title: 'Tự Tình',
    owner_name: 'Hoàng Dũng',
    album_type: 'EP',
    cover_image: 'https://picsum.photos/seed/album5/300/300',
    release_date: '2024-05-01',
    total_tracks: 5,
  },
  {
    id: 'a006',
    title: 'Indochine',
    owner_name: 'Tlinh',
    album_type: 'ALBUM',
    cover_image: 'https://picsum.photos/seed/album6/300/300',
    release_date: '2024-06-15',
    total_tracks: 9,
  },
];

const MOCK_ARTISTS = [
  {
    id: 'ar001',
    stage_name: 'Sơn Tùng M-TP',
    avatar_url: 'https://picsum.photos/seed/artist1/300/300',
    follower_count: 5200000,
    biography: 'Ca sĩ, nhạc sĩ người Việt Nam nổi tiếng.',
  },
  {
    id: 'ar002',
    stage_name: 'Vũ.',
    avatar_url: 'https://picsum.photos/seed/artist2/300/300',
    follower_count: 2100000,
    biography: 'Nghệ sĩ indie Việt Nam với âm nhạc sâu lắng.',
  },
  {
    id: 'ar003',
    stage_name: 'MONO',
    avatar_url: 'https://picsum.photos/seed/artist3/300/300',
    follower_count: 1800000,
    biography: 'Chàng trai trẻ với giọng hát trầm ấm.',
  },
  {
    id: 'ar004',
    stage_name: 'Wren Evans',
    avatar_url: 'https://picsum.photos/seed/artist4/300/300',
    follower_count: 1500000,
    biography: 'Ca sĩ trẻ với phong cách R&B độc đáo.',
  },
  {
    id: 'ar005',
    stage_name: 'Tlinh',
    avatar_url: 'https://picsum.photos/seed/artist5/300/300',
    follower_count: 1200000,
    biography: 'Rapper nữ nổi bật của rap Việt.',
  },
  {
    id: 'ar006',
    stage_name: 'Hoàng Dũng',
    avatar_url: 'https://picsum.photos/seed/artist6/300/300',
    follower_count: 980000,
    biography: 'Nghệ sĩ đa tài với âm nhạc đẹp và cảm xúc.',
  },
];

const MOCK_TRENDING = [
  {
    id: 's007',
    title: 'Đừng Làm Trái Tim Anh Đau',
    owner_name: 'Sơn Tùng M-TP',
    cover_image: 'https://picsum.photos/seed/trend1/300/300',
    duration_seconds: 260,
    play_count: 15000000,
    like_count: 600000,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  },
  {
    id: 's008',
    title: 'Trốn Tìm',
    owner_name: 'Đen Vâu',
    cover_image: 'https://picsum.photos/seed/trend2/300/300',
    duration_seconds: 194,
    play_count: 14200000,
    like_count: 520000,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    id: 's009',
    title: 'Có Chắc Yêu Là Đây',
    owner_name: 'Sơn Tùng M-TP',
    cover_image: 'https://picsum.photos/seed/trend3/300/300',
    duration_seconds: 187,
    play_count: 13800000,
    like_count: 490000,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  },
  {
    id: 's010',
    title: 'Buồn Làm Chi Em Ơi',
    owner_name: 'Vũ.',
    cover_image: 'https://picsum.photos/seed/trend4/300/300',
    duration_seconds: 218,
    play_count: 11900000,
    like_count: 430000,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  },
  {
    id: 's011',
    title: 'Nắng Ấm Xa Dần',
    owner_name: 'MONO',
    cover_image: 'https://picsum.photos/seed/trend5/300/300',
    duration_seconds: 235,
    play_count: 10500000,
    like_count: 385000,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
  },
  {
    id: 's012',
    title: 'Thích Em Hơi Nhiều',
    owner_name: 'Wren Evans',
    cover_image: 'https://picsum.photos/seed/trend6/300/300',
    duration_seconds: 208,
    play_count: 9800000,
    like_count: 355000,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
  },
];

const MOCK_GENRES = [
  { id: 'g001', name: 'V-Pop', cover_image: 'https://picsum.photos/seed/genre1/300/300' },
  { id: 'g002', name: 'R&B', cover_image: 'https://picsum.photos/seed/genre2/300/300' },
  { id: 'g003', name: 'Indie', cover_image: 'https://picsum.photos/seed/genre3/300/300' },
  { id: 'g004', name: 'Rap/Hip-Hop', cover_image: 'https://picsum.photos/seed/genre4/300/300' },
  { id: 'g005', name: 'Acoustic', cover_image: 'https://picsum.photos/seed/genre5/300/300' },
  { id: 'g006', name: 'EDM', cover_image: 'https://picsum.photos/seed/genre6/300/300' },
  { id: 'g007', name: 'Ballad', cover_image: 'https://picsum.photos/seed/genre7/300/300' },
  { id: 'g008', name: 'K-Pop', cover_image: 'https://picsum.photos/seed/genre8/300/300' },
];

const MOCK_PLAYLISTS = [
  { id: 'p001', name: 'Nhạc Yêu Thích', cover_image: 'https://picsum.photos/seed/pl1/300/300', total: 24 },
  { id: 'p002', name: 'Chill Buổi Sáng', cover_image: 'https://picsum.photos/seed/pl2/300/300', total: 15 },
  { id: 'p003', name: 'Workout Mix', cover_image: 'https://picsum.photos/seed/pl3/300/300', total: 30 },
  { id: 'p004', name: 'Study Lofi', cover_image: 'https://picsum.photos/seed/pl4/300/300', total: 20 },
];

// ─── API Functions ────────────────────────────────────────────────────────────

export const mockApi = {
  getCurrentUser: async () => {
    await delay(300);
    return { data: MOCK_USER };
  },

  getFeaturedSongs: async () => {
    await delay(600);
    return { data: MOCK_FEATURED_SONGS };
  },

  getNewReleases: async () => {
    await delay(700);
    return { data: MOCK_NEW_RELEASES };
  },

  getTrendingSongs: async () => {
    await delay(500);
    return { data: MOCK_TRENDING };
  },

  getFeaturedArtists: async () => {
    await delay(650);
    return { data: MOCK_ARTISTS };
  },

  getGenres: async () => {
    await delay(400);
    return { data: MOCK_GENRES };
  },

  getUserPlaylists: async () => {
    await delay(450);
    return { data: MOCK_PLAYLISTS };
  },

  searchSongs: async (query) => {
    await delay(400);
    const q = query.toLowerCase();
    const results = [...MOCK_FEATURED_SONGS, ...MOCK_TRENDING].filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.owner_name.toLowerCase().includes(q),
    );
    return { data: results };
  },
};
