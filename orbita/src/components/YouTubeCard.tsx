import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { colors, radius, spacing } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AIExplainModal } from './AIExplainModal';

export type YouTubeCardProps = {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: string;
};

export function YouTubeCard({ id, title, duration }: YouTubeCardProps) {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showExplain, setShowExplain] = useState(false);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') setPlaying(false);
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.mediaWrapper}>
        <YoutubePlayer
          height={360}
          play={playing}
          videoId={id}
          onChangeState={onStateChange}
        />
        {duration ? (
          <View style={styles.durationPill}>
            <MaterialCommunityIcons name="clock-outline" color={colors.text} size={14} />
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        ) : null}
      </View>

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
        <Pressable style={styles.actionBtn} onPress={() => setPlaying((p) => !p)}>
          <MaterialCommunityIcons name={playing ? 'pause' : 'play'} size={20} color={colors.text} />
          <Text style={styles.actionText}>{playing ? 'Pausar' : 'Reproduzir'}</Text>
        </Pressable>
      </View>

      <AIExplainModal
        visible={showExplain}
        onClose={() => setShowExplain(false)}
        title={title}
        reasons={[
          'Tendência no YouTube Brasil nas últimas 24h.',
          'Alta taxa de retenção e engajamento para usuários com perfil similar ao seu.',
          'Relaciona-se com tópicos que você interagiu recentemente.',
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
    backgroundColor: 'black',
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
});