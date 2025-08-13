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

const LOCAL_FEED = [
  {
    id: '1',
    title: 'Buracos negros: como eles dobram o espaço-tempo',
    duration: '0:45',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  },
  {
    id: '2',
    title: 'O que é computação quântica em 60 segundos',
    duration: '1:00',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  },
];

export function FeedScreen() {
  const navigation = useNavigation();
  const [yt, setYt] = useState<YouTubeVideo[]>([]);

  useEffect(() => {
    fetchTrendingBrazil(6).then(setYt).catch(() => setYt([]));
  }, []);

  return (
    <ScreenContainer>
      <FlatList
        data={[...yt.map((v) => ({ type: 'yt', data: v } as const)), ...LOCAL_FEED.map((v) => ({ type: 'local', data: v } as const))]}
        keyExtractor={(item, idx) => (item.type === 'yt' ? `yt-${item.data.id}` : `local-${item.data.id}-${idx}`)}
        contentContainerStyle={{ padding: spacing.md, paddingTop: 0 }}
        ListHeaderComponent={
          <>
            <Header />
            <Stories />
          </>
        }
        renderItem={({ item }) => {
          if (item.type === 'yt') {
            return <YouTubeCard id={item.data.id} title={item.data.title} thumbnail={item.data.thumbnail} channel={item.data.channel} duration={item.data.duration} />;
          }
          return (
            <VideoCard
              id={item.data.id}
              title={item.data.title}
              duration={item.data.duration}
              videoUrl={item.data.videoUrl}
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