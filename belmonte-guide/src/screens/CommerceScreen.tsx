import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { colors, typography } from '@/theme';
import { GlassCard } from '@/components/GlassCard';
import Constants from 'expo-constants';
import WebView from 'react-native-webview';

const vendors = [
  { id: 'v1', name: 'Moqueca da D. Marta', type: 'Restaurante', sponsored: true },
  { id: 'v2', name: 'Artesanato do Jequitinhonha', type: 'Artesão', sponsored: false },
  { id: 'v3', name: 'Pousada Rio Azul', type: 'Pousada', sponsored: true },
];

export default function CommerceScreen() {
  const [showOnline, setShowOnline] = useState(false);
  const { domain, token, id } = (Constants.expoConfig?.extra as any) || {};
  const onlineUri = useMemo(() => {
    if (!domain || !token || !id) return undefined;
    const url = new URL(`https://${domain}/`);
    url.searchParams.set('id', String(id));
    url.searchParams.set('token', String(token));
    return url.toString();
  }, [domain, token, id]);

  if (showOnline && onlineUri) {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: onlineUri }}
          userAgent={Platform.select({ ios: undefined, android: 'Mozilla/5.0 (Linux; Android 12; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36' })}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
        />
        <View style={styles.switchBar}>
          <TouchableOpacity style={styles.switchBtn} onPress={() => setShowOnline(false)}>
            <Text style={styles.switchText}>Ver lista local</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
      <View style={styles.switchBar}>
        <TouchableOpacity style={styles.switchBtn} onPress={() => setShowOnline(true)}>
          <Text style={styles.switchText}>Ver versão online</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  sponsored: { borderWidth: 2, borderColor: colors.sunsetGold },
  title: { fontFamily: typography.bodyBold, color: colors.deepBlue, fontSize: 16 },
  subtitle: { fontFamily: typography.body, color: '#5E6B85' },
  contact: { alignSelf: 'flex-start', backgroundColor: colors.sunsetGold, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  contactText: { color: colors.white, fontFamily: typography.bodyBold },
  switchBar: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  switchBtn: { backgroundColor: colors.sunsetGold, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignSelf: 'center' },
  switchText: { color: '#fff', fontFamily: typography.bodyBold },
});

