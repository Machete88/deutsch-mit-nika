import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CorrectionCard as CorrectionCardType } from '@/lib/nika-types';
import { useColors } from '@/hooks/use-colors';

interface CorrectionCardProps {
  correction: CorrectionCardType;
}

export function CorrectionCard({ correction }: CorrectionCardProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  if (!correction.correctedSentence && !correction.naturalVersion) return null;

  return (
    <Pressable
      onPress={() => setExpanded(e => !e)}
      style={[styles.card, { backgroundColor: '#1a1040', borderColor: '#7C3AED' }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerIcon}>✨</Text>
        <Text style={[styles.headerText, { color: '#A78BFA' }]}>Nikas Korrektur</Text>
        <Text style={{ color: '#A78BFA', fontSize: 12 }}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {correction.correctedSentence ? (
        <View style={styles.row}>
          <Text style={[styles.label, { color: '#6EE7B7' }]}>Besser so</Text>
          <Text style={[styles.value, { color: '#F0FDF4' }]}>{correction.correctedSentence}</Text>
        </View>
      ) : null}

      {expanded && correction.naturalVersion ? (
        <View style={styles.row}>
          <Text style={[styles.label, { color: '#93C5FD' }]}>Natürlicher</Text>
          <Text style={[styles.value, { color: '#EFF6FF' }]}>{correction.naturalVersion}</Text>
        </View>
      ) : null}

      {expanded && correction.explanation ? (
        <View style={styles.row}>
          <Text style={[styles.label, { color: '#FCD34D' }]}>Warum?</Text>
          <Text style={[styles.value, { color: '#FFFBEB' }]}>{correction.explanation}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
    marginHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  headerIcon: { fontSize: 16 },
  headerText: { flex: 1, fontWeight: '700', fontSize: 14 },
  row: { marginBottom: 8 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 14, lineHeight: 20 },
});
