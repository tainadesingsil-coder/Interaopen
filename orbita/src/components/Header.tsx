import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LogoMark } from './LogoMark';

export function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <LogoMark />
        <View style={{ flexDirection: 'row', gap: spacing.lg, marginLeft: 'auto' }}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.text} />
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
        </View>
      </View>
      <LinearGradient colors={["#6EA8FE", "#7CD4FD", "#34D399"] as [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  accent: { height: 3, borderRadius: 3 },
});