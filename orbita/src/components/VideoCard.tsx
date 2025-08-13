import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AIExplainModal } from './AIExplainModal';
import { Video, ResizeMode } from 'expo-av';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { shareLink } from '../utils/share';
export type VideoCardProps = {
  id: string;
  title: string;
  thumbnailUrl?: string; // kept for compatibility if needed in future
  duration: string;
  videoUrl: string;
  author?: { name: string; handle: string; avatar: string; verified?: boolean };
};

export function VideoCard({ id, title, videoUrl, duration, author }: VideoCardProps) {
  const videoRef = useRef<Video>(null);
  const navigation = useNavigation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const lastTapRef = useRef<number>(0);

  const togglePlay = async () => {
    try {
      if (isPlaying) {
        await videoRef.current?.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current?.playAsync();
        setIsPlaying(true);
      }
    } catch {}
  };

  const onMediaPress = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setLiked(true);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 700);
    } else {
      togglePlay();
    }
    lastTapRef.current = now;
  };

  const playIcon = useMemo(() => (
    <View style={styles.centerIcon}>
      <MaterialCommunityIcons
        name={isPlaying ? 'pause-circle' : 'play-circle'}
        size={56}
        color="rgba(255,255,255,0.8)"
      />
    </View>
  ), [isPlaying]);

  return (
    <View style={styles.card}>
      {author ? (
        <View style={styles.headerRow}>
          <Image source={{ uri: author.avatar }} style={styles.headerAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName}>{author.name} {author.verified ? '✓' : ''}</Text>
            <Text style={styles.headerHandle}>@{author.handle}</Text>
          </View>
          <MaterialCommunityIcons name="dots-horizontal" size={18} color={colors.textMuted} />
        </View>
      ) : null}
      <Pressable style={styles.mediaWrapper} onPress={onMediaPress}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: videoUrl }}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping
        />
        {!isPlaying && playIcon}
        {showHeart && (
          <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut.duration(300)} style={styles.heartOverlay}>
            <MaterialCommunityIcons name="heart" size={72} color="#ff3b5c" />
          </Animated.View>
        )}
        <View style={styles.durationPill}>
          <MaterialCommunityIcons name="clock-outline" color={colors.text} size={14} />
          <Text style={styles.durationText}>{duration}</Text>
        </View>
      </Pressable>

      <View style={styles.row}>
        <Text numberOfLines={2} style={styles.title}>{title}</Text>
        <Pressable style={styles.aiButton} onPress={() => setShowExplain(true)}>
          <MaterialCommunityIcons name="robot-love-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.actionBtn} onPress={() => setLiked((v) => !v)}>
          <MaterialCommunityIcons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#ff3b5c' : colors.text} />
          <Text style={styles.actionText}>{liked ? 'Curtido' : 'Curtir'}</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Watch' as never)}>
          <MaterialCommunityIcons name="comment-outline" size={20} color={colors.text} />
          <Text style={styles.actionText}>Comentar</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.shareBtn]} onPress={() => shareLink(videoUrl, title)}>
          <MaterialCommunityIcons name="share-variant" size={20} color="#0A0B0E" />
          <Text style={styles.shareText}>Compartilhar</Text>
        </Pressable>
      </View>

      <AIExplainModal
        visible={showExplain}
        onClose={() => setShowExplain(false)}
        title={title}
        reasons={[
          'Baseado nos seus interesses em ciência e tecnologia.',
          'Conteúdo curto com alta taxa de conclusão por usuários semelhantes.',
          'Criador que você segue publicou recentemente vídeos similares.',
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  mediaWrapper: {
    position: 'relative',
    aspectRatio: 9 / 16,
    backgroundColor: colors.surfaceAlt,
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  centerIcon: {
    position: 'absolute',
    top: '45%',
    left: '45%',
  },
  heartOverlay: {
    position: 'absolute',
    top: '40%',
    left: '40%',
  },
  durationPill: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  aiButton: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  actionText: { color: colors.text },
  shareBtn: { backgroundColor: colors.primary },
  shareText: { color: '#0A0B0E', fontWeight: '800' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.md },
  headerAvatar: { width: 28, height: 28, borderRadius: 14 },
  headerName: { color: colors.text, fontWeight: '700' },
  headerHandle: { color: colors.textMuted, fontSize: 12 },
});