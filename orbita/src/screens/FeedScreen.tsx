import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { VideoCard } from '../components/VideoCard';
import { spacing } from '../theme/theme';
import { Header } from '../components/Header';
import { Stories } from '../components/Stories';
import { PrimaryButton } from '../components/PrimaryButton';
import { fetchTrendingBrazil, YouTubeVideo } from '../services/youtube';
import { YouTubeCard } from '../components/YouTubeCard';
import { TikTokCard } from '../components/TikTokCard';

const FAMOUS_STORIES = [
  { id: 's1', name: 'Neymar Jr', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop', verified: true },
  { id: 's2', name: 'Anitta', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop', verified: true },
  { id: 's3', name: 'Casimiro', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop', verified: true },
  { id: 's4', name: 'Ivete', avatar: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=200&auto=format&fit=crop', verified: true },
];

const LOCAL_FEED = [
  {
    id: '1',
    title: 'Buracos negros: como eles dobram o espaço-tempo',
    duration: '0:45',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    author: { name: 'Astro News', handle: 'astronews', avatar: FAMOUS_STORIES[0].avatar, verified: true },
  },
  {
    id: '2',
    title: 'O que é computação quântica em 60 segundos',
    duration: '1:00',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    author: { name: 'Tech Hoje', handle: 'techhoje', avatar: FAMOUS_STORIES[1].avatar, verified: true },
  },
];

export function FeedScreen() {
  const navigation = useNavigation();
  const [yt, setYt] = useState<YouTubeVideo[]>([]);

  useEffect(() => {
    fetchTrendingBrazil(6).then(setYt).catch(() => setYt([]));
  }, []);

  const data = [
    ...yt.map((v) => ({ type: 'yt', data: v } as const)),
    { type: 'tt' as const, data: { url: 'https://www.tiktok.com/@sciencemadesimple/video/726838965', title: 'TikTok de ciência' } },
    ...LOCAL_FEED.map((v) => ({ type: 'local', data: v } as const)),
  ];

  return (
    <ScreenContainer>
      <FlatList
        data={data}
        keyExtractor={(item, idx) => (item.type === 'yt' ? `yt-${(item as any).data.id}` : `${item.type}-${idx}`)}
        contentContainerStyle={{ padding: spacing.md, paddingTop: 0 }}
        ListHeaderComponent={
          <>
            <Header />
            <Stories items={FAMOUS_STORIES} />
          </>
        }
        renderItem={({ item }) => {
          if (item.type === 'yt') {
            return <YouTubeCard id={(item as any).data.id} title={(item as any).data.title} thumbnail={(item as any).data.thumbnail} channel={(item as any).data.channel} duration={(item as any).data.duration} />;
          }
          if (item.type === 'tt') {
            return <TikTokCard url={(item as any).data.url} title={(item as any).data.title} />;
          }
          return (
            <VideoCard
              id={(item as any).data.id}
              title={(item as any).data.title}
              duration={(item as any).data.duration}
              videoUrl={(item as any).data.videoUrl}
              author={(item as any).data.author}
            />
          );
        }}
      />
      <View style={{ height: spacing.xxl }} />
      <PrimaryButton title="Abrir Reels" iconName="play-circle" onPress={() => navigation.navigate('Reels' as never)} style={styles.fab} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xxl,
  },
});