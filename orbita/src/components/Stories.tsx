import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/theme';

const MOCK_STORIES = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  name: i === 0 ? 'Seu Story' : `Perfil ${i}`,
  avatar: `https://i.pravatar.cc/100?img=${(i + 3) % 70}`,
}));

export function Stories() {
  return (
    <View style={{ paddingVertical: spacing.md }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={MOCK_STORIES}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ gap: spacing.md, paddingHorizontal: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.ring}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            </View>
            <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: { alignItems: 'center', width: 72 },
  ring: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#7CD4FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  name: { color: colors.text, fontSize: 12, marginTop: 6 },
});