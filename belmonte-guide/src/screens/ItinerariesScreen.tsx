import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import * as Calendar from 'expo-calendar';
import { colors, typography } from '@/theme';
import { GlassCard } from '@/components/GlassCard';

const itineraries = [
  { id: 'i1', title: 'Belmonte em 1 dia', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop' },
  { id: 'i2', title: 'Fim de semana cultural', image: 'https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=1200&auto=format&fit=crop' },
  { id: 'i3', title: 'Passeio de barco no Jequitinhonha', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop' },
];

async function addToCalendar(title: string) {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return;
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCalendar = calendars.find((c) => c.source?.isLocalAccount) || calendars[0];
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  await Calendar.createEventAsync(defaultCalendar.id, {
    title,
    startDate,
    endDate,
    notes: 'Roteiro adicionado pelo Guia de Turismo de Belmonte',
  });
}

export default function ItinerariesScreen() {
  return (
    <FlatList
      data={itineraries}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      renderItem={({ item }) => (
        <GlassCard>
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{item.title}</Text>
              <TouchableOpacity style={styles.cta} onPress={() => addToCalendar(item.title)}>
                <Text style={styles.ctaText}>Adicionar ao calendário</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  image: { height: 160, borderRadius: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: typography.bodyBold, color: colors.deepBlue, fontSize: 16 },
  cta: { backgroundColor: colors.sunsetGold, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  ctaText: { color: colors.white, fontFamily: typography.bodyBold },
});

