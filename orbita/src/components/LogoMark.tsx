import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/theme';

export function LogoMark() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#6EA8FE", "#7CD4FD"] as [string, string, ...string[]]} style={styles.orb} />
      <View style={styles.ring} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 28, height: 28, position: 'relative' },
  orb: { width: 24, height: 24, borderRadius: 12 },
  ring: {
    position: 'absolute',
    borderColor: 'rgba(255,255,255,0.35)',
    borderWidth: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    top: 0,
    left: 0,
  },
});