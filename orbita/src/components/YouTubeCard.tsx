import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { colors, radius, spacing } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AIExplainModal } from './AIExplainModal';
import { LinearGradient } from 'expo-linear-gradient';
import { shareLink } from '../utils/share';
export type YouTubeCardProps = {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration?: string;
};

export function YouTubeCard({ id, title, thumbnail, channel, duration }: YouTubeCardProps) {
  const [playing, setPlaying] = useState(false);
  const navigation = useNavigation();
  const [liked, setLiked] = useState(false);
  const [showExplain, setShowExplain] = useState(false);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') setPlaying(false);
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.mediaWrapper}>
        {playing ? (
          <YoutubePlayer height={360} play={true} videoId={id} onChangeState={onStateChange} />
        ) : (
          <Pressable style={styles.thumbPress} onPress={() => setPlaying(true)}>
            <Image source={{ uri: thumbnail }} style={styles.thumbnail} resizeMode="cover" />
            <View style={styles.centerPlay}>
              <MaterialCommunityIcons name="play-circle" size={72} color="rgba(255,255,255,0.9)" />
            </View>
            <LinearGradient
              colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.7)"] as [string, string, ...string[]]}
              style={styles.bottomGradient}
            />
            <View style={styles.bottomInfo}>
              <Text numberOfLines={2} style={styles.title}>{title}</Text>
              <Text numberOfLines={1} style={styles.channel}>{channel}</Text>
            </View>
            {duration ? (
              <View style={styles.durationPill}>
                <MaterialCommunityIcons name="clock-outline" color={colors.text} size={14} />
                <Text style={styles.durationText}>{duration}</Text>
              </View>
            ) : null}
          </Pressable>
        )}
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
        <Pressable style={styles.actionBtn} onPress={() => shareLink(`https://youtube.com/watch?v=${id}`, title)}>
          <MaterialCommunityIcons name="share-variant" size={20} color={colors.text} />
          <Text style={styles.actionText}>Compartilhar</Text>
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
  thumbPress: { height: 360, position: 'relative' },
  thumbnail: { width: '100%', height: '100%' },
  centerPlay: { position: 'absolute', top: '40%', left: '42%' },
  bottomGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 },
  bottomInfo: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md },
  title: { color: colors.text, fontWeight: '700', fontSize: 16 },
  channel: { color: colors.textMuted, marginTop: 4, fontSize: 12 },
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
  durationText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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