import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVocabulary } from '@/lib/vocabulary-context';
import { useSpacedRepetition } from '@/lib/spaced-repetition-context';
import { useNikaTheme } from '@/lib/nika-theme-context';
import * as Haptics from 'expo-haptics';

export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { words } = useVocabulary();
  const { getDueWords, startReviewSession, reviews } = useSpacedRepetition();
  const { colors, font, space, radius, isDark } = useNikaTheme();

  const dueWords = getDueWords(words);
  const dueCount = dueWords.length;
  const reviewedCount = reviews.size;
  const totalCount = words.length;
  const masteredCount = Math.max(0, reviewedCount - dueCount);

  const handleStartReview = async () => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startReviewSession(words);
    router.push('/review/quiz' as never);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg1, paddingTop: insets.top }]}>
      <View style={[styles.orb1, { backgroundColor: colors.neonBlue + '1A' }]} pointerEvents="none" />
      <View style={[styles.orb2, { backgroundColor: colors.gold + '0F' }]} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Wiederholen</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>Spaced Repetition (SM-2)</Text>
        </View>

        {/* ── Due Banner ── */}
        <View style={[
          styles.dueBanner,
          dueCount > 0
            ? { borderColor: colors.gold + '66', backgroundColor: colors.gold + '12' }
            : { borderColor: colors.neonGreen + '66', backgroundColor: colors.neonGreen + '12' },
        ]}>
          <View style={styles.dueBannerLeft}>
            <Text style={[styles.dueNumber, { color: dueCount > 0 ? colors.gold : colors.neonGreen }]}>
              {dueCount > 0 ? dueCount : '✓'}
            </Text>
            <Text style={[styles.dueLabel, { color: dueCount > 0 ? colors.goldLight : colors.neonGreen }]}>
              {dueCount > 0 ? 'Wörter warten' : 'Alles erledigt!'}
            </Text>
            {dueCount > 0 && <Text style={[styles.dueSub, { color: colors.textMuted }]}>Jetzt wiederholen empfohlen</Text>}
          </View>
          <Text style={styles.dueBannerIcon}>{dueCount > 0 ? '⏰' : '🎉'}</Text>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {[
            { label: 'Gesamt', value: totalCount, icon: '📚', color: colors.neonBlue },
            { label: 'Im System', value: reviewedCount, icon: '🔄', color: colors.neonPurple },
            { label: 'Warten', value: dueCount, icon: '⏰', color: colors.gold },
          ].map(item => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: colors.glass1, borderColor: item.color + '33' }]}>
              <Text style={styles.statIcon}>{item.icon}</Text>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Progress ── */}
        <View style={[styles.progressCard, { backgroundColor: colors.glass1, borderColor: colors.glassBorder }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.textPrimary }]}>Lernfortschritt</Text>
            <Text style={[styles.progressPct, { color: colors.neonGreen }]}>
              {totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.glass2 }]}>
            <View style={[styles.progressFill, {
              width: totalCount > 0 ? `${(masteredCount / totalCount) * 100}%` as any : '0%',
              backgroundColor: colors.neonGreen,
            }]} />
          </View>
          <Text style={[styles.progressSub, { color: colors.textMuted }]}>
            {masteredCount} von {totalCount} Wörtern gemeistert
          </Text>
        </View>

        {/* ── Start Button ── */}
        <Pressable
          onPress={handleStartReview}
          disabled={dueCount === 0}
          style={({ pressed }) => [
            styles.startBtn,
            dueCount > 0
              ? { backgroundColor: colors.purple700, borderColor: colors.purple400 + '80' }
              : { backgroundColor: colors.glass2, borderColor: colors.glassBorder },
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.startBtnIcon}>{dueCount > 0 ? '🔄' : '✓'}</Text>
          <View>
            <Text style={[styles.startBtnTitle, { color: colors.textPrimary }]}>
              {dueCount > 0 ? `${dueCount} Wörter wiederholen` : 'Alles erledigt!'}
            </Text>
            <Text style={[styles.startBtnSub, { color: colors.purple300 }]}>
              {dueCount > 0 ? 'Sitzung starten →' : 'Komm morgen wieder'}
            </Text>
          </View>
        </Pressable>

        {/* ── Info Cards ── */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Wie funktioniert es?</Text>
        <View style={styles.infoGrid}>
          {[
            { icon: '🃏', title: 'Wort sehen', desc: 'Karte zeigt das Wort auf Deutsch.' },
            { icon: '🔄', title: 'Selbst bewerten', desc: 'Leicht, mittel oder schwer — du entscheidest.' },
            { icon: '📅', title: 'Algorithmus rechnet', desc: 'Nächste Wiederholung in 1–30 Tagen.' },
            { icon: '🧠', title: 'Langzeitgedächtnis', desc: 'Wörter bleiben dauerhaft im Gedächtnis.' },
          ].map(item => (
            <View key={item.title} style={[styles.infoCard, { backgroundColor: colors.glass1, borderColor: colors.glassBorder }]}>
              <Text style={styles.infoIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.infoDesc, { color: colors.textMuted }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb1: { position: 'absolute', top: -80, left: -60, width: 260, height: 260, borderRadius: 130 },
  orb2: { position: 'absolute', bottom: 200, right: -80, width: 200, height: 200, borderRadius: 100 },
  scroll: { paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, marginTop: 3 },
  dueBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 16 },
  dueBannerLeft: { flex: 1 },
  dueNumber: { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  dueLabel: { fontSize: 17, fontWeight: '700', marginTop: 2 },
  dueSub: { fontSize: 11, marginTop: 4 },
  dueBannerIcon: { fontSize: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 12, alignItems: 'center', gap: 3 },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, textAlign: 'center' },
  progressCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 13, fontWeight: '700' },
  progressPct: { fontSize: 13, fontWeight: '700' },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 999 },
  progressSub: { fontSize: 11 },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 20, overflow: 'hidden' },
  startBtnIcon: { fontSize: 32 },
  startBtnTitle: { fontSize: 17, fontWeight: '800' },
  startBtnSub: { fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 },
  infoGrid: { gap: 10, marginBottom: 20 },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  infoIcon: { fontSize: 24 },
  infoTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  infoDesc: { fontSize: 11, lineHeight: 16 },
});
