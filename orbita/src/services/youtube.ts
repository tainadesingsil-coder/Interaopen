import Constants from 'expo-constants';

const API_KEY = (Constants.expoConfig?.extra as any)?.YOUTUBE_API_KEY as string | null;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export type YouTubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: string;
};

export async function fetchTrendingBrazil(maxResults = 10): Promise<YouTubeVideo[]> {
  // Use curated stable set if no API key (consistency without external dependency)
  if (!API_KEY) {
    return CURATED_TRENDING.slice(0, maxResults);
  }
  try {
    const params = new URLSearchParams({
      part: 'snippet',
      chart: 'mostPopular',
      regionCode: 'BR',
      videoCategoryId: '0',
      maxResults: String(maxResults),
      key: API_KEY,
    });
    const res = await fetch(`${BASE_URL}/videos?${params.toString()}`);
    const data = await res.json();
    const items = data.items ?? [];
    if (!Array.isArray(items) || items.length === 0) return CURATED_TRENDING.slice(0, maxResults);
    return items.map((it: any) => ({
      id: it.id,
      title: it.snippet?.title ?? 'Vídeo',
      thumbnail: it.snippet?.thumbnails?.medium?.url ?? '',
      channel: it.snippet?.channelTitle ?? 'Canal',
      duration: 'short',
    }));
  } catch {
    return CURATED_TRENDING.slice(0, maxResults);
  }
}

// Curated set: stable, recognizable, safe for demo. Thumbnails via i.ytimg.com
const CURATED_TRENDING: YouTubeVideo[] = [
  { id: 'dQw4w9WgXcQ', title: 'Hit clássico que todos conhecem', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', channel: 'Artist', duration: '3:33' },
  { id: '9bZkp7q19f0', title: 'Fenômeno global de dança', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg', channel: 'Musician', duration: '4:13' },
  { id: '3JZ_D3ELwOQ', title: 'Performance ao vivo inesquecível', thumbnail: 'https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg', channel: 'Live Channel', duration: '5:04' },
  { id: 'kJQP7kiw5Fk', title: 'Vídeo mais visto por anos', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg', channel: 'Top Music', duration: '4:42' },
  { id: 'fRh_vgS2dFE', title: 'Coreografia viral', thumbnail: 'https://i.ytimg.com/vi/fRh_vgS2dFE/hqdefault.jpg', channel: 'Dance Hub', duration: '4:07' },
  { id: 'tVj0ZTS4WF4', title: 'Electro-pop icônico', thumbnail: 'https://i.ytimg.com/vi/tVj0ZTS4WF4/hqdefault.jpg', channel: 'Electro', duration: '3:21' },
  { id: 'CevxZvSJLk8', title: 'Clipe alto-astral', thumbnail: 'https://i.ytimg.com/vi/CevxZvSJLk8/hqdefault.jpg', channel: 'Pop Star', duration: '4:11' },
  { id: 'LsoLEjrDogU', title: 'Hino empolgante', thumbnail: 'https://i.ytimg.com/vi/LsoLEjrDogU/hqdefault.jpg', channel: 'Anthem', duration: '3:55' },
  { id: 'OPf0YbXqDm0', title: 'Clássico contemporâneo', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg', channel: 'Band', duration: '4:16' },
  { id: 'uelHwf8o7_U', title: 'Balada famosa', thumbnail: 'https://i.ytimg.com/vi/uelHwf8o7_U/hqdefault.jpg', channel: 'Singer', duration: '4:29' },
  { id: 'hT_nvWreIhg', title: 'Rock alternativo viral', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg', channel: 'Alt Rock', duration: '3:55' },
  { id: 'RgKAFK5djSk', title: 'Rap com refrão inesquecível', thumbnail: 'https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg', channel: 'Rap Star', duration: '4:13' },
];