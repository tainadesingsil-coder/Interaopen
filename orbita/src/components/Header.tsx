import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.side}>
          <MaterialCommunityIcons name="camera-outline" size={22} color={colors.text} />
        </View>
        <Text style={styles.wordmark}>ORBI</Text>
        <View style={[styles.side, { justifyContent: 'flex-end' }]}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: 48,
    alignItems: 'flex-start',
  },
  wordmark: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },
});