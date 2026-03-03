import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function LogoMark() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#6EA8FE", "#7CD4FD"] as [string, string, ...string[]]} style={styles.orb} />
      <View style={styles.ring} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 34, height: 34, position: 'relative' },
  orb: { width: 30, height: 30, borderRadius: 15 },
  ring: {
    position: 'absolute',
    borderColor: 'rgba(255,255,255,0.55)',
    borderWidth: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    top: 0,
    left: 0,
  },
});