import React from 'react';
import { FlatList, View, Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { VideoCard } from '../components/VideoCard';
import { spacing } from '../theme/theme';

const MOCK_FEED = [
  {
    id: '1',
    title: 'Buracos negros: como eles dobram o espaço-tempo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    duration: '0:45',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  },
  {
    id: '2',
    title: 'O que é computação quântica em 60 segundos',
    thumbnailUrl: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop',
    duration: '1:00',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  },
  {
    id: '3',
    title: 'Vida em Marte? Evidências e hipóteses atuais',
    thumbnailUrl: 'https://images.unsplash.com/photo-1580424917961-3f65cf3a998b?q=80&w=1200&auto=format&fit=crop',
    duration: '0:30',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  },
  {
    id: '4',
    title: 'Telescópios: como enxergamos o invisível',
    thumbnailUrl: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop',
    duration: '0:50',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  },
  {
    id: '5',
    title: 'Física de foguetes: empuxo e gravidade',
    thumbnailUrl: 'https://images.unsplash.com/photo-1580424917961-3f65cf3a998b?q=80&w=1200&auto=format&fit=crop',
    duration: '0:40',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  },
];

export function FeedScreen() {
  const navigation = useNavigation();
  return (
    <ScreenContainer>
      <FlatList
        data={MOCK_FEED}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <VideoCard
            id={item.id}
            title={item.title}
            thumbnailUrl={item.thumbnailUrl}
            duration={item.duration}
            videoUrl={item.videoUrl}
          />
        )}
      />
      <View style={{ height: spacing.xxl }} />
      <Pressable style={styles.fab} onPress={() => navigation.navigate('Reels' as never)}>
        <Text style={styles.fabText}>Reels</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xxl,
    backgroundColor: '#0F1117',
    borderColor: '#202531',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  fabText: { color: '#E6EAF2', fontWeight: '700' },
});