import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Text, Pressable } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, radius, spacing } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const REELS = [
  { id: 'r1', title: 'Órbita de Saturno em 30s', uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' },
  { id: 'r2', title: 'Como foguetes pousam?', uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' },
  { id: 'r3', title: 'Buracos negros e jatos relativísticos', uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' },
];

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

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isActive = index === activeIndex;
    return (
      <View style={styles.slide}>
        <Video
          style={styles.video}
          source={{ uri: item.uri }}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isActive}
          isLooping
          isMuted={false}
        />
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(120)} style={styles.overlay}>
          <Text style={styles.title}>{item.title}</Text>
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
      </View>
    );
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={REELS}
        keyExtractor={(i) => i.id}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  slide: { width: '100%', height: SCREEN_HEIGHT, backgroundColor: 'black' },
  video: { width: '100%', height: '100%', backgroundColor: '#000' },
  overlay: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.lg,
  },
  rightColumn: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconBtn: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: spacing.md,
    borderRadius: radius.pill,
  },
  iconFab: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.pill,
  },
});