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
  if (!API_KEY) {
    return MOCK_TRENDING.slice(0, maxResults);
  }
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
  return items.map((it: any) => ({
    id: it.id,
    title: it.snippet?.title ?? 'Vídeo',
    thumbnail: it.snippet?.thumbnails?.medium?.url ?? '',
    channel: it.snippet?.channelTitle ?? 'Canal',
    duration: 'short',
  }));
}

const MOCK_TRENDING: YouTubeVideo[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Viral do momento 1',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    channel: 'Canal XYZ',
    duration: '0:45',
  },
  {
    id: 'oHg5SJYRHA0',
    title: 'Viral do momento 2',
    thumbnail: 'https://i.ytimg.com/vi/oHg5SJYRHA0/hqdefault.jpg',
    channel: 'Canal ABC',
    duration: '0:50',
  },
];