import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { colors, typography } from '@/theme';
import { GlassCard } from '@/components/GlassCard';

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <Text style={styles.title}>Meu Perfil</Text>
        <Text style={styles.item}>Roteiros feitos: 3</Text>
        <Text style={styles.item}>Favoritos: 7</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.item}>Notificações</Text>
          <Switch value={notifications} onValueChange={setNotifications} thumbColor={notifications ? colors.sunsetGold : '#ccc'} />
        </View>
        <Text style={styles.points}>Pontuação: 240</Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { gap: 8 },
  title: { fontFamily: typography.bodyBold, color: colors.deepBlue, fontSize: 18 },
  item: { fontFamily: typography.body, color: '#5E6B85' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  points: { marginTop: 12, fontFamily: typography.bodyBold, color: colors.sunsetGold },
});

