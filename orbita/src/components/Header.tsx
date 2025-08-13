import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme/theme';

export function Header() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Órbita</Text>
      <LinearGradient colors={["#6EA8FE", "#7CD4FD", "#34D399"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accent} />
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
  logo: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  accent: { height: 3, borderRadius: 3 },
});