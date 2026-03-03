import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, TextInput, Alert, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { colors, radius, spacing } from '../theme/theme';
import { ScreenContainer } from '../components/ScreenContainer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/PrimaryButton';
import { shareLink } from '../utils/share';

export function CreateContentScreen() {
  const [script, setScript] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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
    if (!script.trim() && !videoUri) {
      Alert.alert('Adicione conteúdo', 'Grave/importe um vídeo ou escreva um roteiro para gerar.');
      return;
    }
    setPreviewOpen(true);
  };

  const shareGenerated = () => {
    const url = videoUri ?? 'https://orbita.app/preview/demo';
    shareLink(url, 'Meu vídeo curto', 'Gerado no Órbita');
  };

  return (
    <ScreenContainer>
      <View style={styles.wrapper}>
        <View style={styles.row}>
          <PrimaryButton title="Gravar vídeo" iconName="record-rec" onPress={handleRecord} style={{ flex: 1 }} />
          <PrimaryButton title="Importar vídeo" iconName="tray-arrow-up" onPress={handlePick} style={{ flex: 1 }} />
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Roteiro</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            placeholder="Descreva a cena, narração ou pontos-chave..."
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
      </View>

      <Modal visible={previewOpen} animationType="slide" onRequestClose={() => setPreviewOpen(false)}>
        <View style={styles.previewRoot}>
          <Text style={styles.previewTitle}>Pré‑visualização</Text>
          {videoUri ? (
            <Text style={styles.previewText}>Pré‑visualização do seu vídeo importado:</Text>
          ) : (
            <Text style={styles.previewText}>Vídeo gerado a partir do roteiro (demo):</Text>
          )}
          <View style={{ height: 200, backgroundColor: '#000', width: '100%', borderRadius: radius.md }} />
          <View style={{ height: spacing.lg }} />
          <PrimaryButton title="Compartilhar" iconName="share-variant" onPress={shareGenerated} />
          <View style={{ height: spacing.md }} />
          <Pressable onPress={() => setPreviewOpen(false)} style={[styles.button, styles.aiBtn]}>
            <Text style={styles.buttonText}>Fechar</Text>
          </Pressable>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: spacing.lg, gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  inputCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  label: { color: colors.textMuted, fontSize: 13, letterSpacing: 0.2 },
  input: { minHeight: 120, color: colors.text, padding: spacing.md, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, textAlignVertical: 'top' },
  button: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.md },
  aiBtn: { backgroundColor: colors.surfaceAlt },
  buttonText: { color: colors.text, fontWeight: '600' },
  hint: { color: colors.textMuted, fontSize: 12 },
  previewRoot: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  previewTitle: { color: colors.text, fontWeight: '800', fontSize: 18 },
  previewText: { color: colors.textMuted },
});