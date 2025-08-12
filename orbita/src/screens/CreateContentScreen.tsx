import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing } from '../theme/theme';
import { ScreenContainer } from '../components/ScreenContainer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function CreateContentScreen() {
  const [script, setScript] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const requestPermissions = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  };

  const handleRecord = async () => {
    await requestPermissions();
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 0.8 });
    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handlePick = async () => {
    await requestPermissions();
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 0.8 });
    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleAISuggestion = () => {
    const suggestions = [
      'Explique o conceito em 3 etapas: definição, exemplo prático, curiosidade final.',
      'Use frases curtas e voz ativa. Termine com uma pergunta para engajar nos comentários.',
      'Estruture em 45-60s: introdução (10s), conteúdo (35s), call-to-action (10s).',
    ];
    Alert.alert('Sugestões da IA', suggestions.join('\n\n'));
  };

  const handleGenerate = () => {
    Alert.alert('Gerar vídeo automático', 'Funcionalidade demo: gerando vídeo a partir do roteiro.');
  };

  return (
    <ScreenContainer>
      <View style={styles.wrapper}>
        <View style={styles.row}>
          <Pressable style={styles.action} onPress={handleRecord}>
            <MaterialCommunityIcons name="record-rec" size={22} color={colors.danger} />
            <Text style={styles.actionText}>Gravar</Text>
          </Pressable>
          <Pressable style={styles.action} onPress={handlePick}>
            <MaterialCommunityIcons name="tray-arrow-up" size={22} color={colors.accent} />
            <Text style={styles.actionText}>Upload</Text>
          </Pressable>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Roteiro / Texto</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            placeholder="Escreva aqui para o app gerar um vídeo automático..."
            multiline
            value={script}
            onChangeText={setScript}
          />
          <View style={styles.row}>
            <Pressable style={[styles.button, styles.aiBtn]} onPress={handleAISuggestion}>
              <MaterialCommunityIcons name="robot-outline" size={18} color={colors.primary} />
              <Text style={styles.buttonText}>Sugestões da IA</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.primaryBtn]} onPress={handleGenerate}>
              <MaterialCommunityIcons name="magic-staff" size={18} color="#0A0B0E" />
              <Text style={styles.primaryBtnText}>Gerar Vídeo</Text>
            </Pressable>
          </View>
          {videoUri ? <Text style={styles.hint}>Selecionado: {videoUri}</Text> : null}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  action: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionText: {
    color: colors.text,
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  input: {
    minHeight: 120,
    color: colors.text,
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    textAlignVertical: 'top',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  aiBtn: {
    backgroundColor: colors.surfaceAlt,
  },
  primaryBtn: {
    marginLeft: 'auto',
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '600',
  },
  primaryBtnText: {
    color: '#0A0B0E',
    fontWeight: '800',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
  },
});