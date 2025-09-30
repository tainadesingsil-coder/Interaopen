import React from 'react';
import { Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, typography } from '@/theme';
import { GlassCard } from '@/components/GlassCard';

const vendors = [
  { id: 'v1', name: 'Moqueca da D. Marta', type: 'Restaurante', sponsored: true },
  { id: 'v2', name: 'Artesanato do Jequitinhonha', type: 'Artesão', sponsored: false },
  { id: 'v3', name: 'Pousada Rio Azul', type: 'Pousada', sponsored: true },
];

export default function CommerceScreen() {
  return (
    <FlatList
      data={vendors}
      keyExtractor={(v) => v.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <GlassCard style={[styles.card, item.sponsored && styles.sponsored] }>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>{item.type}</Text>
          <TouchableOpacity style={styles.contact}><Text style={styles.contactText}>Contato/Reserva</Text></TouchableOpacity>
        </GlassCard>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  sponsored: { borderWidth: 2, borderColor: colors.sunsetGold },
  title: { fontFamily: typography.bodyBold, color: colors.deepBlue, fontSize: 16 },
  subtitle: { fontFamily: typography.body, color: '#5E6B85' },
  contact: { alignSelf: 'flex-start', backgroundColor: colors.sunsetGold, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  contactText: { color: colors.white, fontFamily: typography.bodyBold },
});

