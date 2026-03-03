import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius, spacing } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type TikTokCardProps = {
  url: string; // full TikTok share URL
  title: string;
  cover?: string; // optional cover image
};

export function TikTokCard({ url, title, cover }: TikTokCardProps) {
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.mediaWrapper}>
        {showPlayer ? (
          <WebView source={{ uri: url }} style={styles.web} allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} />
        ) : (
          <Pressable style={styles.thumbPress} onPress={() => setShowPlayer(true)}>
            <Image source={{ uri: cover || 'https://images.unsplash.com/photo-1512446816042-444d641267ee?q=80&w=1200&auto=format&fit=crop' }} style={styles.thumbnail} />
            <View style={styles.centerPlay}>
              <MaterialCommunityIcons name="play-circle" size={72} color="rgba(255,255,255,0.9)" />
            </View>
            <View style={styles.bottomInfo}>
              <Text numberOfLines={2} style={styles.title}>{title}</Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.lg },
  mediaWrapper: { position: 'relative', backgroundColor: 'black' },
  thumbPress: { height: 360, position: 'relative' },
  thumbnail: { width: '100%', height: '100%' },
  centerPlay: { position: 'absolute', top: '40%', left: '42%' },
  bottomInfo: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md },
  title: { color: colors.text, fontWeight: '700', fontSize: 16 },
  web: { width: '100%', height: 560 },
});