import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View, Image } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

export function AssistantOrbi() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [responses, setResponses] = useState<string[]>([]);

  const ask = () => {
    if (!input.trim()) return;
    const t = input.trim();
    const reply = t.includes('?') ? 'Ótima pergunta! Vou te mostrar vídeos relacionados no feed.' : 'Entendi! Posso recomendar criadores e trends para você.';
    setResponses((r) => [reply, ...r]);
    setInput('');
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.fab}>
        <LinearGradient colors={["#6EA8FE", "#7CD4FD"] as [string, string, ...string[]]} style={styles.fabBg}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }} style={styles.avatar} />
        </LinearGradient>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }} style={styles.avatarLarge} />
              <Text style={styles.title}>ORbi Assistente</Text>
            </View>
            <View style={styles.chat}>
              {responses.map((r, i) => (
                <Text key={i} style={styles.botLine}>• {r}</Text>
              ))}
            </View>
            <View style={styles.row}>
              <TextInput style={styles.input} placeholder="Pergunte algo..." placeholderTextColor={colors.textMuted} value={input} onChangeText={setInput} onSubmitEditing={ask} />
              <Pressable style={styles.send} onPress={ask}><Text style={styles.sendText}>Enviar</Text></Pressable>
            </View>
            <Pressable onPress={() => setOpen(false)} style={styles.close}><Text style={styles.closeText}>Fechar</Text></Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', left: spacing.lg, bottom: spacing.xxl, zIndex: 1000 },
  fabBg: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 560, gap: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatarLarge: { width: 48, height: 48, borderRadius: 24 },
  title: { color: colors.text, fontWeight: '800', fontSize: 16 },
  chat: { minHeight: 80, gap: 6 },
  botLine: { color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  input: { flex: 1, backgroundColor: colors.surfaceAlt, color: colors.text, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  send: { backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.md },
  sendText: { color: '#0A0B0E', fontWeight: '800' },
  close: { alignSelf: 'flex-end' },
  closeText: { color: colors.textMuted },
});