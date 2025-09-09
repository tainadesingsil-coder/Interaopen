import React, { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '../theme/theme';

export function ScreenContainer({ children }: PropsWithChildren) {
  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(220)} style={styles.inner}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
  },
});