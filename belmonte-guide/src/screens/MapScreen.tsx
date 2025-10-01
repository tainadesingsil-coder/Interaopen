import React, { useState } from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, typography } from '@/theme';
import { GlassCard } from '@/components/GlassCard';

const samplePOIs = [
  { id: 'praia', title: 'Praia de Mogiquiçaba', type: 'natureza', latitude: -16.003, longitude: -39.301 },
  { id: 'igreja', title: 'Igreja Matriz', type: 'historico', latitude: -15.861, longitude: -38.880 },
];

export default function MapScreen() {
  const [offline, setOffline] = useState(false);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude: -15.864, longitude: -38.882, latitudeDelta: 0.5, longitudeDelta: 0.5 }}
      >
        {samplePOIs.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }} title={p.title} />
        ))}
      </MapView>

      <GlassCard style={styles.filterBar}>
        <Text style={styles.filterTitle}>Filtros</Text>
        <View style={styles.row}><Text style={styles.filterItem}>Natureza</Text></View>
        <View style={styles.row}><Text style={styles.filterItem}>Gastronomia</Text></View>
        <View style={styles.row}><Text style={styles.filterItem}>Eventos</Text></View>
        <View style={[styles.row, styles.offlineRow]}>
          <Text style={styles.filterItem}>Modo offline</Text>
          <Switch value={offline} onValueChange={setOffline} thumbColor={offline ? colors.sunsetGold : '#ccc'} />
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: { position: 'absolute', top: 16, left: 16, right: 16 },
  filterTitle: { fontFamily: typography.bodyBold, color: colors.deepBlue, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  filterItem: { fontFamily: typography.body, color: colors.deepBlue },
  offlineRow: { justifyContent: 'space-between' },
});

