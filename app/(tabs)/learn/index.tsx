import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVocabulary } from '@/lib/vocabulary-context';
import { learningSets } from '@/lib/vocabulary-data';
import { useNikaTheme } from '@/lib/nika-theme-context';

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { words, userWordStates, setCurrentSet } = useVocabulary();
  const { colors, font, space, radius } = useNikaTheme();

  const learnedCount = userWordStates.size;
  const totalCount = words.length;
  const progress = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  const LEARN_MODES = [
    { id: 'cards', title: 'Lernkarten', emoji: '🃏', description: 'Wörter mit Karteikarten lernen', route: '/learn/learn-card', accent: colors.neonBlue, bg: colors.neonBlue + '1A', border: colors.neonBlue + '44' },
    { id: 'grammar', title: 'Grammatik', emoji: '📖', description: 'Regeln & Erklärungen', route: '/learn/grammar', accent: colors.neonPurple, bg: colors.neonPurple + '1A', border: colors.neonPurple + '44' },
    { id: 'sentence', title: 'Satz bauen', emoji: '🧩', description: 'Richtige Reihenfolge finden', route: '/learn/sentence-builder', accent: colors.neonCyan, bg: colors.neonCyan + '1A', border: colors.neonCyan + '3A' },
    { id: 'exam', title: 'Prüfung A1–B2', emoji: '📝', description: 'Dein Niveau testen', route: '/learn/exam-mode', accent: colors.gold, bg: colors.gold + '1A', border: colors.gold + '3A' },
  ];

  const handleStartSet = async (setId: string) => {
    const set = learningSets.find(s => s.id === setId);
    if (set) {
      await setCurrentSet(set);
      router.push('/learn/learn-card' as never);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg1, paddingTop: insets.top }]}>
      <View style={[styles.orb1, { backgroundColor: colors.neonBlue + '1A' }]} pointerEvents="none" />
      <View style={[styles.orb2, { backgroundColor: colors.orb3 }]} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Lernen</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>{learnedCount} von {totalCount} Wörtern gelernt</Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.glass2 }]}>
            <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: colors.purple500 }]} />
          </View>
          <Text style={[styles.progressPct, { color: colors.purple400 }]}>{progress}% abgeschlossen</Text>
        </View>

        {/* ── Audio Banner ── */}
        <Pressable
          onPress={() => router.push('/audio' as never)}
          style={({ pressed }) => [
            styles.audioBanner,
            { backgroundColor: colors.glass2, borderColor: colors.purple400 + '44' },
            pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          ]}
        >
          <View style={[styles.audioIconWrap, { backgroundColor: colors.purple500 + '33', borderColor: colors.purple400 + '44' }]}>
            <Text style={styles.audioIcon}>🎧</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.audioBannerTitle, { color: colors.textPrimary }]}>Audio-Lernen</Text>
            <Text style={[styles.audioBannerSub, { color: colors.textMuted }]}>Wörter hören · Niveau & Tempo wählen · Kategorien</Text>
            <View style={[styles.audioCTA, { backgroundColor: colors.purple600 }]}>
              <Text style={styles.audioCTAText}>▶ Anhören</Text>
            </View>
          </View>
        </Pressable>

        {/* ── Learn Modes ── */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Lernmodi</Text>
        <View style={styles.modesGrid}>
          {LEARN_MODES.map(mode => (
            <Pressable
              key={mode.id}
              onPress={() => router.push(mode.route as never)}
              style={({ pressed }) => [
                styles.modeCard,
                { backgroundColor: mode.bg, borderColor: mode.border },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <View style={[styles.modeIconWrap, { backgroundColor: mode.accent + '22' }]}>
                <Text style={styles.modeIcon}>{mode.emoji}</Text>
              </View>
              <Text style={[styles.modeTitle, { color: mode.accent }]}>{mode.title}</Text>
              <Text style={[styles.modeDesc, { color: colors.textMuted }]}>{mode.description}</Text>
              <View style={[styles.modeAccentBar, { backgroundColor: mode.accent }]} />
            </Pressable>
          ))}
        </View>

        {/* ── Learning Sets ── */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Themen</Text>
        <View style={[styles.setsWrap, { backgroundColor: colors.glass1, borderColor: colors.glassBorder }]}>
          {learningSets.map((set, i) => {
            const setWords = words.filter((w: any) => w.category === set.category);
            const learnedInSet = setWords.filter((w: any) => userWordStates.has(w.id)).length;
            const setPct = setWords.length > 0 ? Math.round((learnedInSet / setWords.length) * 100) : 0;
            return (
              <Pressable
                key={set.id}
                onPress={() => handleStartSet(set.id)}
                style={({ pressed }) => [
                  styles.setRow,
                  i < learningSets.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
                  pressed && { backgroundColor: colors.glass2 },
                ]}
              >
                <View style={[styles.setIconWrap, { backgroundColor: colors.glass2 }]}>
                  <Text style={styles.setIcon}>📚</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.setRowTop}>
                    <Text style={[styles.setTitle, { color: colors.textPrimary }]}>{set.name}</Text>
                    <Text style={[styles.setPct, { color: colors.purple400 }]}>{setPct}%</Text>
                  </View>
                  <Text style={[styles.setMeta, { color: colors.textMuted }]}>{set.wordCount} Wörter · {set.category}</Text>
                  <View style={[styles.setProgressTrack, { backgroundColor: colors.glass2 }]}>
                    <View style={[styles.setProgressFill, { width: `${setPct}%` as any, backgroundColor: colors.purple500 }]} />
                  </View>
                </View>
                <Text style={[styles.setArrow, { color: colors.textMuted }]}>→</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb1: { position: 'absolute', top: -60, right: -80, width: 240, height: 240, borderRadius: 120 },
  orb2: { position: 'absolute', bottom: 300, left: -60, width: 180, height: 180, borderRadius: 90 },
  scroll: { paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, marginTop: 3, marginBottom: 12 },
  progressTrack: { height: 6, borderRadius: 999, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 999 },
  progressPct: { fontSize: 11, fontWeight: '600' },
  audioBanner: { flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20, overflow: 'hidden' },
  audioIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  audioIcon: { fontSize: 28 },
  audioBannerTitle: { fontSize: 17, fontWeight: '800' },
  audioBannerSub: { fontSize: 11, marginTop: 3, lineHeight: 16 },
  audioCTA: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginTop: 8 },
  audioCTAText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 },
  modesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  modeCard: { width: '47.5%', borderRadius: 18, borderWidth: 1, padding: 16, minHeight: 110, position: 'relative', overflow: 'hidden' },
  modeIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  modeIcon: { fontSize: 20 },
  modeTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  modeDesc: { fontSize: 11 },
  modeAccentBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, opacity: 0.6 },
  setsWrap: { borderRadius: 20, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  setIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  setIcon: { fontSize: 18 },
  setRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  setTitle: { fontSize: 13, fontWeight: '600' },
  setPct: { fontSize: 11, fontWeight: '700' },
  setMeta: { fontSize: 11, marginBottom: 6 },
  setProgressTrack: { height: 3, borderRadius: 999, overflow: 'hidden' },
  setProgressFill: { height: 3, borderRadius: 999 },
  setArrow: { fontSize: 15 },
});
