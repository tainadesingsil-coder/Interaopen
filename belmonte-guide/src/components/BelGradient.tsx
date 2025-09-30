import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme';
import { ViewStyle } from 'react-native';

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export function BelGradient({ children, style }: Props) {
  return (
    <LinearGradient
      colors={[colors.deepBlue, colors.lightBlue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style as any}
    >
      {children}
    </LinearGradient>
  );
}

