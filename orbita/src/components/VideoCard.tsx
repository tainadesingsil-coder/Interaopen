import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, Pressable } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AIExplainModal } from './AIExplainModal';

export type VideoCardProps = {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
};

export function VideoCard({ id, title, thumbnailUrl, duration }: VideoCardProps) {
  const [showExplain, setShowExplain] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.mediaWrapper}>
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
        <View style={styles.durationPill}>
          <MaterialCommunityIcons name="clock-outline" color={colors.text} size={14} />
          <Text style={styles.durationText}>{duration}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text numberOfLines={2} style={styles.title}>{title}</Text>
        <Pressable style={styles.aiButton} onPress={() => setShowExplain(true)}>
          <MaterialCommunityIcons name="robot-love-outline" size={20} color={colors.primary} />
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
  thumbnail: {
    width: '100%',
    height: '100%',
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
});