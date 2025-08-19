import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/theme';

export type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
  gradientColors?: string[];
};

export function PrimaryButton({ title, onPress, iconName, style, gradientColors }: PrimaryButtonProps) {
  const palette = (gradientColors ?? ['#6EA8FE', '#7CD4FD']) as [string, string, ...string[]];
  return (
    <Pressable onPress={onPress} style={[styles.wrapper, style]}>
      <LinearGradient colors={palette} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.content}> 
          {iconName ? <MaterialCommunityIcons name={iconName as any} size={18} color={'#0A0B0E'} /> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: radius.md, overflow: 'hidden' },
  gradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center' },
  title: { color: '#0A0B0E', fontWeight: '800' },
});