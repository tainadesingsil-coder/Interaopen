import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import * as Speech from 'expo-speech';
import { colors, typography } from '@/theme';
import BelMascot from '@/components/BelMascot';
import { MotiView } from 'moti';
import { GlassCard } from '@/components/GlassCard';

type Message = { id: string; role: 'user' | 'bel'; text: string };

export default function BelAIScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bel', text: 'Oi! Quer um roteiro histórico ou um dia de praia?' },
  ]);
  const [input, setInput] = useState('');

  function handleSend() {
    if (!input.trim()) return;
    const newMsg: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
    const belReply: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bel',
      text: 'Sugestão: Tour histórico pelas igrejas coloniais e pôr do sol no rio.',
    };
    setMessages((prev) => [...prev, newMsg, belReply]);
    setInput('');
    Speech.speak(belReply.text, { language: 'pt-BR' });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MotiView from={{ translateY: -6, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }}>
          <BelMascot size={48} glow={false} />
        </MotiView>
        <Text style={styles.headerTitle}>Bel, sua guia</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'bel' ? styles.bel : styles.user]}>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      />
      <GlassCard style={styles.inputBar}>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Escreva sua mensagem"
            placeholderTextColor="#7A8AA3"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.send} onPress={handleSend}>
            <Text style={styles.sendText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  headerTitle: { fontFamily: typography.bodyBold, color: colors.deepBlue, fontSize: 16 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 12 },
  bel: { backgroundColor: '#EAF2FF', alignSelf: 'flex-start' },
  user: { backgroundColor: colors.sunsetGold, alignSelf: 'flex-end' },
  text: { fontFamily: typography.body, color: colors.deepBlue },
  inputBar: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, padding: 12, fontFamily: typography.body },
  send: { backgroundColor: colors.sunsetGold, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  sendText: { color: colors.white, fontFamily: typography.bodyBold },
});

