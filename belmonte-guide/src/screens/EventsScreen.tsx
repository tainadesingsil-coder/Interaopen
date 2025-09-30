import React, { useEffect } from 'react';
import { Text, StyleSheet, FlatList } from 'react-native';
import * as Notifications from 'expo-notifications';
import { MotiView } from 'moti';
import { colors, typography } from '@/theme';
import { GlassCard } from '@/components/GlassCard';

const events = [
  { id: 'e1', title: 'São João na Praça Central', time: 'Hoje às 19h' },
  { id: 'e2', title: 'Feira de Artesanato', time: 'Sábado às 10h' },
];

async function scheduleReminder(evTitle: string) {
  await Notifications.requestPermissionsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Lembrete de evento', body: `${evTitle} começa em breve!` },
    trigger: { seconds: 5 },
  });
}

export default function EventsScreen() {
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
    });
  }, []);

  return (
    <FlatList
      data={events}
      keyExtractor={(e) => e.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item, index }) => (
        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: index * 80 }}>
          <GlassCard>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.time}>{item.time}</Text>
            <Text style={styles.link} onPress={() => scheduleReminder(item.title)}>Ativar alerta inteligente</Text>
          </GlassCard>
        </MotiView>
      )}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: typography.bodyBold, color: colors.deepBlue },
  time: { fontFamily: typography.body, color: '#5E6B85', marginTop: 4 },
  link: { marginTop: 8, color: colors.sunsetGold, fontFamily: typography.bodyBold },
});

