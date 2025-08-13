import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { colors, radius, spacing } from '../theme/theme';
import { ScreenContainer } from '../components/ScreenContainer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/PrimaryButton';

const PROMPT_PRESETS = [
  {
    name: 'Explicação em 60s',
    text: 'Explique o tópico TARGET em até 60 segundos, use linguagem simples, 3 passos (definição, exemplo prático, curiosidade final), finalize com uma pergunta.'
  },
  {
    name: 'Resumo de Paper',
    text: 'Resuma o paper TARGET em 5 pontos objetivos. Destaque método, achados principais e impacto. Use frases curtas e dados concretos.'
  },
  {
    name: 'Debunking Mitos',
    text: 'Liste 3 mitos comuns sobre TARGET e explique rapidamente por que estão errados, com fontes confiáveis.'
  }
];

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

  const copyPreset = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copiado', 'Prompt copiado para a área de transferência.');
  };

  return (
    <ScreenContainer>
      <View style={styles.wrapper}>
        <View style={styles.row}>
          <PrimaryButton title="Gravar" iconName="record-rec" onPress={handleRecord} style={{ flex: 1 }} />
          <PrimaryButton title="Upload" iconName="tray-arrow-up" onPress={handlePick} style={{ flex: 1 }} />
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
            <PrimaryButton title="Gerar Vídeo" iconName="magic-staff" onPress={handleGenerate} />
          </View>
          {videoUri ? <Text style={styles.hint}>Selecionado: {videoUri}</Text> : null}
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.cardTitle}>Prompts poderosos</Text>
          <View style={styles.promptGrid}>
            {PROMPT_PRESETS.map((p) => (
              <Pressable key={p.name} style={styles.promptTile} onPress={() => copyPreset(p.text)}>
                <Text style={styles.promptName}>{p.name}</Text>
                <Text style={styles.promptText} numberOfLines={3}>{p.text}</Text>
                <Text style={styles.copyHint}>Toque para copiar</Text>
              </Pressable>
            ))}
          </View>
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
  buttonText: {
    color: colors.text,
    fontWeight: '600',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
  },
  cardTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  promptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  promptTile: {
    flexBasis: '48%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  promptName: { color: colors.text, fontWeight: '700' },
  promptText: { color: colors.textMuted, fontSize: 12 },
  copyHint: { color: colors.accent, fontSize: 12, fontWeight: '700' },
});