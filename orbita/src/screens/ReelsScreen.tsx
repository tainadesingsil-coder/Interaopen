import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Text, Pressable, Image } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, radius, spacing } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchTrendingBrazil } from '../services/youtube';
import { CommentsTicker } from '../components/CommentsTicker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const YT_IDS = ['dQw4w9WgXcQ', '9bZkp7q19f0', '3JZ_D3ELwOQ', 'kJQP7kiw5Fk'];

export function ReelsScreen() {
  const listRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      if (typeof idx === 'number') setActiveIndex(idx);
    }
  }).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

  const renderItem = useCallback(({ item, index }: { item: string; index: number }) => {
    const isActive = index === activeIndex;
    return (
      <View style={styles.slide}>
        <YoutubePlayer height={SCREEN_HEIGHT} play={isActive} videoId={item} />
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(120)} style={styles.overlay}>
          <Text style={styles.title}>Reels YouTube • {item}</Text>
          <View style={styles.rightColumn}>
            <Pressable style={styles.iconBtn}>
              <MaterialCommunityIcons name="heart-outline" size={26} color={colors.text} />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <MaterialCommunityIcons name="comment-outline" size={26} color={colors.text} />
            </Pressable>
            <Pressable style={[styles.iconFab]}>
              <MaterialCommunityIcons name="robot-outline" size={26} color={'#0A0B0E'} />
            </Pressable>
          </View>
        </Animated.View>
        <View style={styles.commentsBox}>
          <CommentsTicker comments={MOCK_COMMENTS} />
        </View>
      </View>
    );
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={YT_IDS}
        keyExtractor={(i) => i}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({ length: SCREEN_HEIGHT, offset: SCREEN_HEIGHT * index, index })}
      />
    </View>
  );
}

const MOCK_COMMENTS = [
  { id: 'c1', author: 'Ana', text: 'Uau, que trilha!', highlighted: true },
  { id: 'c2', author: 'João', text: 'Aprendi algo novo agora.' },
  { id: 'c3', author: 'Bianca', text: 'Cadê a parte 2?' },
  { id: 'c4', author: 'Leo', text: 'Muito bom! 🔥', highlighted: true },
  { id: 'c5', author: 'Rafa', text: 'Recomenda mais canais assim?' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  slide: { width: '100%', height: SCREEN_HEIGHT, backgroundColor: 'black' },
  overlay: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: { color: colors.text, fontSize: 16, fontWeight: '700', flex: 1, marginRight: spacing.lg },
  rightColumn: { alignItems: 'center', gap: spacing.lg },
  iconBtn: { backgroundColor: 'rgba(0,0,0,0.4)', padding: spacing.md, borderRadius: radius.pill },
  iconFab: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.pill },
  commentsBox: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: 90 },
});