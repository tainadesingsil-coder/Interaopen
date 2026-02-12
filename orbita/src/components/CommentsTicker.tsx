import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/theme';

export type CommentItem = { id: string; author: string; text: string; highlighted?: boolean };

export function CommentsTicker({ comments }: { comments: CommentItem[] }) {
  const [windowIdx, setWindowIdx] = useState(0);
  const windowSize = 4;
  useEffect(() => {
    const id = setInterval(() => setWindowIdx((i) => (i + 1) % comments.length), 1500);
    return () => clearInterval(id);
  }, [comments.length]);
  const visible = comments.slice(windowIdx, windowIdx + windowSize);
  return (
    <View style={styles.container}>
      {visible.map((c) => (
        <Text key={c.id} style={[styles.line, c.highlighted && styles.highlight]}>
          <Text style={styles.author}>{c.author}: </Text>
          {c.text}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  line: { color: colors.text, fontSize: 12 },
  author: { color: colors.textMuted },
  highlight: { color: '#7CD4FD', fontWeight: '700' },
});