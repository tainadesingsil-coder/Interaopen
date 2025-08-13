import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, Switch, Pressable, TextInput, Alert } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { ScreenContainer } from '../components/ScreenContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const STORAGE_KEY = 'profile.v1';

export function ProfileScreen() {
  const [privateAccount, setPrivateAccount] = useState(false);
  const [contentScience, setContentScience] = useState(true);
  const [contentTech, setContentTech] = useState(true);
  const [memoryOn, setMemoryOn] = useState(true);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setName(saved.name ?? '');
          setBio(saved.bio ?? '');
          setAvatar(saved.avatar ?? null);
        }
      } catch {}
    })();
  }, []);

  const pickAvatar = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
    if (!res.canceled) {
      setAvatar(res.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ name, bio, avatar }));
      setEditing(false);
      Alert.alert('Salvo', 'Perfil atualizado.');
    } catch {}
  };

  return (
    <ScreenContainer>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Pressable onPress={pickAvatar} style={{ borderRadius: 36, overflow: 'hidden' }}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ color: colors.textMuted }}>Foto</Text>
              </View>
            )}
          </Pressable>
          <View style={{ flex: 1 }}>
            {editing ? (
              <>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
                <TextInput
                  style={styles.bioInput}
                  placeholder="Sua bio"
                  placeholderTextColor={colors.textMuted}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                />
              </>
            ) : (
              <>
                <Text style={styles.name}>{name || 'Seu nome'}</Text>
                <Text style={styles.bio}>{bio || 'Toque em editar para adicionar uma bio.'}</Text>
              </>
            )}
          </View>
          {editing ? (
            <Pressable onPress={saveProfile} style={styles.editBtn}><Text style={styles.editText}>Salvar</Text></Pressable>
          ) : (
            <Pressable onPress={() => setEditing(true)} style={styles.editBtn}><Text style={styles.editText}>Editar</Text></Pressable>
          )}
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
  wrapper: { padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  name: { color: colors.text, fontSize: 18, fontWeight: '700' },
  bio: { color: colors.textMuted, marginTop: 4, lineHeight: 20 },
  nameInput: { color: colors.text, fontSize: 18, fontWeight: '700' },
  bioInput: { color: colors.text, marginTop: 4, lineHeight: 20 },
  editBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  editText: { color: colors.text, fontWeight: '700' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemText: { color: colors.text },
  logoutBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center' },
  logoutText: { color: colors.danger, fontWeight: '800' },
});