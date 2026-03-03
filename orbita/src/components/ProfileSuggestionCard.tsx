import React from 'react';
import { View, StyleSheet, Text, Image, Pressable, Linking } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type ProfileSuggestion = {
  name: string;
  avatar: string;
  instagram?: string;
  verified?: boolean;
};

export function ProfileSuggestionCard({ name, avatar, instagram, verified }: ProfileSuggestion) {
  const openInsta = () => {
    if (!instagram) return;
    const url = `https://instagram.com/${instagram}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.name}>{name}</Text>
          {verified ? <MaterialCommunityIcons name="check-decagram" size={16} color={colors.accent} /> : null}
        </View>
        {instagram ? (
          <Pressable onPress={openInsta}>
            <Text style={styles.handle}>@{instagram}</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable style={styles.followBtn}>
        <Text style={styles.followText}>Seguir</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  name: { color: colors.text, fontWeight: '700' },
  handle: { color: colors.textMuted, marginTop: 2, fontSize: 12 },
  followBtn: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: spacing.md, borderRadius: radius.md },
  followText: { color: '#0A0B0E', fontWeight: '800' },
});