import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { colors, typography } from '@/theme';
import { BelGradient } from '@/components/BelGradient';
import { GlassCard } from '@/components/GlassCard';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // preload assets if needed
  }, []);

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1501973801540-537f08ccae7b?q=80&w=2000&auto=format&fit=crop' }}
      style={styles.bg}
      resizeMode="cover"
    >
      <BelGradient style={styles.overlay}>
        <View style={styles.content}>
          <GlassCard style={styles.heroCard}>
            <Text style={styles.title}>Olá, eu sou a Bel</Text>
            <Text style={styles.subtitle}>sua guia em Belmonte</Text>
            <Text style={styles.body}>Quer que eu monte um roteiro para você?</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Main') }>
                <Text style={styles.primaryText}>Explorar Belmonte</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Main', { screen: 'Roteiros' }) }>
                <Text style={styles.secondaryText}>Criar meu roteiro</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </BelGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { flex: 1 },
  content: { flex: 1, justifyContent: 'flex-end', padding: 24 },
  heroCard: { marginBottom: 48 },
  title: { fontFamily: typography.heading, color: colors.white, fontSize: 32 },
  subtitle: { fontFamily: typography.bodyBold, color: colors.white, fontSize: 18, opacity: 0.9 },
  body: { fontFamily: typography.body, color: colors.white, fontSize: 16, marginTop: 12, opacity: 0.9 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  primaryBtn: { backgroundColor: colors.sunsetGold, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  primaryText: { color: colors.white, fontFamily: typography.bodyBold, fontSize: 16 },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  secondaryText: { color: colors.white, fontFamily: typography.bodyBold, fontSize: 16 },
});

