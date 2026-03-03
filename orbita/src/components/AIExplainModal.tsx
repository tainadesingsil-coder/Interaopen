import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type AIExplainModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  reasons: string[];
};

export function AIExplainModal({ visible, onClose, title, reasons }: AIExplainModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="robot-outline" size={22} color={colors.primary} />
            <Text style={styles.headerText}>Por que você viu: {title}</Text>
          </View>
          <View style={styles.body}>
            {reasons.map((reason, idx) => (
              <View key={idx} style={styles.reasonRow}>
                <MaterialCommunityIcons name="information-outline" size={18} color={colors.accent} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Entendi</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 520,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    gap: spacing.sm,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reasonText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0A0B0E',
    fontWeight: '700',
    fontSize: 15,
  },
});