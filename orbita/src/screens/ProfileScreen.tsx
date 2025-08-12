import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, Switch, Pressable } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { ScreenContainer } from '../components/ScreenContainer';

export function ProfileScreen() {
  const [privateAccount, setPrivateAccount] = useState(false);
  const [contentScience, setContentScience] = useState(true);
  const [contentTech, setContentTech] = useState(true);
  const [memoryOn, setMemoryOn] = useState(true);

  return (
    <ScreenContainer>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/200?img=13' }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Alex Souza</Text>
            <Text style={styles.bio}>Apaixonado por ciência e educação. Compartilho resumos de papers e curiosidades espaciais.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacidade</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.itemText}>Conta privada</Text>
            <Switch value={privateAccount} onValueChange={setPrivateAccount} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferências de conteúdo</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.itemText}>Ciência</Text>
            <Switch value={contentScience} onValueChange={setContentScience} />
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemText}>Tecnologia</Text>
            <Switch value={contentTech} onValueChange={setContentTech} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Memória personalizada</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.itemText}>Ativar memória de recomendações</Text>
            <Switch value={memoryOn} onValueChange={setMemoryOn} />
          </View>
        </View>

        <Pressable style={styles.logoutBtn} onPress={() => {}}>
          <Text style={styles.logoutText}>Sair do app</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  bio: {
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    color: colors.text,
  },
  logoutBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '800',
  },
});