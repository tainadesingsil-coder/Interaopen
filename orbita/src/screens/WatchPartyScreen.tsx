import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text, FlatList, TextInput, Pressable, Share, useWindowDimensions } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { ScreenContainer } from '../components/ScreenContainer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';

function getBotReply(text: string): string {
  const t = text.toLowerCase();
  if (/^oi|ol[aá]|hey|e[aá]i/.test(t)) return 'Oi! Aqui é o Órbita Bot. Pronto para a Watch Party! 🚀';
  if (t.includes('foguet') || t.includes('rocket')) return 'Foguetes funcionam pelo princípio da ação e reação (3ª lei de Newton) — empuxo vence a gravidade.';
  if (t.includes('marte')) return 'Sobre Marte: missões recentes buscam bioassinaturas em sedimentos antigos de crateras como Jezero.';
  if (t.includes('buraco') || t.includes('negro')) return 'Buracos negros deformam o espaço-tempo; discos de acreção podem emitir jatos relativísticos.';
  if (t.includes('telesc')) return 'Telescópios modernos usam óptica adaptativa e interferometria para “ver” mais longe e com mais detalhe.';
  if (t.endsWith('?')) return 'Boa pergunta! Vamos investigar juntos durante a sessão. 😉';
  return 'Legal! Se quiser, compartilhe o link para chamar mais gente. 👍';
}

export function WatchPartyScreen() {
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState(12);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(
    Array.from({ length: 8 }).map((_, i) => ({ id: String(i), author: i % 2 ? 'Você' : 'Ana', text: i % 2 ? 'Concordo!' : 'Isso é incrível!' }))
  );

  const dimensions = useWindowDimensions();
  const isWide = dimensions.width >= 900;

  const shareRoom = async () => {
    await Share.share({ message: 'Entre na minha Watch Party na Órbita: https://orbita.app/sala/abc123' });
  };

  const toggleJoin = () => {
    setJoined((prev) => !prev);
    setParticipants((p) => (joined ? Math.max(0, p - 1) : p + 1));
  };

  const sendMessage = () => {
    const text = message.trim();
    if (!text) return;
    setMessages((m) => [{ id: String(Date.now()), author: 'Você', text }, ...m]);
    setMessage('');
    setTimeout(() => {
      setMessages((m) => [{ id: String(Date.now() + 1), author: 'Órbita Bot', text: getBotReply(text) }, ...m]);
    }, 600);
  };

  const Layout = useMemo(() => (isWide ? RowLayout : ColumnLayout), [isWide]);

  return (
    <ScreenContainer>
      <Layout
        video={
          <View style={styles.videoCard}>
            <Video
              style={styles.video}
              source={{ uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={joined}
            />
            {joined ? (
              <View style={{ height: 360 }}>
                <WebView source={{ uri: 'https://www.tiktok.com/@sciencenews/live' }} style={{ flex: 1 }} />
              </View>
            ) : null}
            <View style={styles.participantsPill}>
              <MaterialCommunityIcons name="account-group-outline" size={16} color={colors.text} />
              <Text style={styles.participantsText}>{participants} conectados</Text>
            </View>
            <View style={styles.actions}>
              <Pressable style={[styles.actionBtn, joined ? styles.leaveBtn : styles.joinBtn]} onPress={toggleJoin}>
                <MaterialCommunityIcons name={joined ? 'door-closed' : 'door-open'} size={18} color={joined ? '#0A0B0E' : '#0A0B0E'} />
                <Text style={styles.actionBtnText}>{joined ? 'Sair' : 'Entrar'}</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, styles.shareBtn]} onPress={shareRoom}>
                <MaterialCommunityIcons name="share-variant" size={18} color="#0A0B0E" />
                <Text style={styles.actionBtnText}>Compartilhar</Text>
              </Pressable>
            </View>
          </View>
        }
        chat={
          <View style={styles.chatCard}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat</Text>
            </View>
            <FlatList
              inverted
              data={messages}
              keyExtractor={(m) => m.id}
              contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
              renderItem={({ item }) => (
                <View style={styles.msgRow}>
                  <Text style={styles.msgAuthor}>{item.author}</Text>
                  <Text style={styles.msgText}>{item.text}</Text>
                </View>
              )}
            />
            <View style={styles.chatInputRow}>
              <TextInput
                placeholder="Escreva uma mensagem"
                placeholderTextColor={colors.textMuted}
                style={styles.chatInput}
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
              <Pressable style={styles.sendBtn} onPress={sendMessage}>
                <MaterialCommunityIcons name="send" size={18} color="#0A0B0E" />
              </Pressable>
            </View>
          </View>
        }
      />
    </ScreenContainer>
  );
}

function RowLayout({ video, chat }: { video: React.ReactNode; chat: React.ReactNode }) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', gap: spacing.lg, padding: spacing.lg }}>
      <View style={{ flex: 2 }}>{video}</View>
      <View style={{ flex: 1 }}>{chat}</View>
    </View>
  );
}

function ColumnLayout({ video, chat }: { video: React.ReactNode; chat: React.ReactNode }) {
  return (
    <View style={{ flex: 1, gap: spacing.lg, padding: spacing.lg }}>
      {video}
      {chat}
    </View>
  );
}

const styles = StyleSheet.create({
  videoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: 240,
    backgroundColor: colors.surfaceAlt,
  },
  participantsPill: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantsText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  joinBtn: { backgroundColor: colors.success },
  leaveBtn: { backgroundColor: colors.warning },
  shareBtn: { backgroundColor: colors.accent },
  actionBtnText: { color: '#0A0B0E', fontWeight: '800' },

  chatCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    flex: 1,
  },
  chatHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  chatTitle: { color: colors.text, fontWeight: '700' },
  msgRow: { gap: 2 },
  msgAuthor: { color: colors.textMuted, fontSize: 12 },
  msgText: { color: colors.text, fontSize: 14 },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
  },
});