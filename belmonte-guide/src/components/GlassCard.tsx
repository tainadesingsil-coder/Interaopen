import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@/theme';

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export function GlassCard({ children, style }: Props) {
  return (
    <BlurView intensity={40} tint="light" style={[styles.card, style as any]}>
      <View style={styles.inner}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.translucentWhite,
  },
  inner: {
    padding: 16,
  },
});

