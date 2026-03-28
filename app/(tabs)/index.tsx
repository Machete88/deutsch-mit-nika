import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '@/lib/settings-context';
import { useVocabulary } from '@/lib/vocabulary-context';
import { useStatistics } from '@/lib/statistics-context';
import { useAchievements } from '@/lib/achievements-context';
import { useSpacedRepetition } from '@/lib/spaced-repetition-context';
import { useNika } from '@/lib/nika-context';
import { NikaAvatar } from '@/components/nika/nika-avatar';
import { useNikaTheme } from '@/lib/nika-theme-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NIKA_PREMIUM = require('@/assets/nika/nika_hero_premium.png');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { words } = useVocabulary();
  const { stats } = useStatistics();
  const { achievements } = useAchievements();
  const { getDueWords } = useSpacedRepetition();
  const { state: nikaState, currentOutfit, greeting: nikaGreeting } = useNika();
  const { colors, font, space, radius, isDark } = useNikaTheme();

  const dueCount = getDueWords(words).length;
  const unlockedCount = achievements.filter((a: any) => a.isUnlocked).length;

  const timeHour = new Date().getHours();
  const timeGreet = timeHour < 12 ? 'Guten Morgen' : timeHour < 18 ? 'Guten Tag' : 'Guten Abend';
  const userName = settings.userName ?? '';
  const greeting = userName ? `${timeGreet}, ${userName}!` : `${timeGreet}!`;

  const ACTION_CARDS = [
    { route: '/learn', icon: '📚', title: 'Lernen', sub: 'Neue Wörter', accent: colors.neonBlue, bg: colors.neonBlue + '1A', border: colors.neonBlue + '44' },
    { route: '/review', icon: '🔄', title: 'Wiederholen', sub: 'dueCount', accent: colors.neonPurple, bg: colors.neonPurple + '1A', border: colors.neonPurple + '44' },
    { route: '/(tabs)/nika/chat', icon: '💬', title: 'Nika Chat', sub: 'KI-Coach', accent: colors.neonCyan, bg: colors.neonCyan + '1A', border: colors.neonCyan + '3A' },
    { route: '/(tabs)/learn/exam-mode', icon: '🏆', title: 'Prüfung', sub: 'A1 – B2', accent: colors.gold, bg: colors.gold + '1A', border: colors.gold + '3A' },
  ];

  const TOOL_CARDS = [
    { route: '/dailyplan', icon: '📅', title: 'Tagesplan', accent: colors.neonBlue },
    { route: '/dictation', icon: '🎧', title: 'Diktat', accent: colors.neonPink },
    { route: '/export', icon: '📤', title: 'Export', accent: colors.neonGreen },
  ];

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg1 }, { paddingTop: insets.top }]}>
      {/* Ambient orbs */}
      <View style={[styles.orb1, { backgroundColor: colors.orb1 }]} pointerEvents="none" />
      <View style={[styles.orb2, { backgroundColor: colors.orb2 }]} pointerEvents="none" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.textPrimary }]}>{greeting}</Text>
            <View style={styles.headerMeta}>
              {nikaState.streak > 0 && (
                <View style={[styles.streakPill, { backgroundColor: 'rgba(251,146,60,0.15)', borderColor: 'rgba(251,146,60,0.35)' }]}>
                  <Text style={styles.streakPillText}>🔥 {nikaState.streak} Tage</Text>
                </View>
              )}
              <View style={[styles.xpPill, { backgroundColor: colors.neonPurple + '22', borderColor: colors.neonPurple + '55' }]}>
                <Text style={[styles.xpPillText, { color: colors.neonPurple }]}>⚡ {nikaState.xp} XP</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ThemeToggle size="sm" />
            <Pressable
              onPress={() => router.push('/(tabs)/nika' as never)}
              style={({ pressed }) => [
                styles.avatarBtn,
                { backgroundColor: colors.glass2, borderColor: colors.purple400 + '66' },
                pressed && { opacity: 0.8 },
              ]}
            >
              <NikaAvatar outfit={currentOutfit} size={52} />
            </Pressable>
          </View>
        </View>

        {/* ── Nika Hero Card ── */}
        <Pressable
          onPress={() => router.push('/(tabs)/nika' as never)}
          style={({ pressed }) => [
            styles.nikaCard,
            {
              borderColor: colors.purple400 + '55',
              backgroundColor: isDark ? 'rgba(124,58,237,0.10)' : 'rgba(124,58,237,0.07)',
            },
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
          ]}
        >
          <View style={styles.nikaCardInner}>
            <Image source={NIKA_PREMIUM} style={styles.nikaImg} resizeMode="contain" />
            <View style={styles.nikaTextBlock}>
              <View style={[styles.nikaLabel, { backgroundColor: colors.purple500 + '33' }]}>
                <Text style={[styles.nikaLabelText, { color: colors.purple300 }]}>NIKA SAGT:</Text>
              </View>
              <Text style={[styles.nikaGreeting, { color: colors.textPrimary }]} numberOfLines={3}>
                {nikaGreeting || 'Na los, sag was auf Deutsch! Ich höre zu und mach es noch besser.'}
              </Text>
              <View style={[styles.nikaCTA, { backgroundColor: colors.purple600 }]}>
                <Text style={styles.nikaCTAText}>Mit Nika lernen →</Text>
              </View>
            </View>
          </View>
        </Pressable>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          {[
            { label: 'STREAK', value: `🔥 ${stats.currentStreak}`, color: '#FB923C' },
            { label: 'WÖRTER', value: String(stats.totalWordsLearned), color: colors.neonGreen },
            { label: 'NIKA XP', value: `⚡ ${nikaState.xp}`, color: colors.neonPurple },
          ].map(item => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: colors.glass2, borderColor: item.color + '33' }]}>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Schnellstart</Text>
        <View style={styles.actionGrid}>
          {ACTION_CARDS.map(card => (
            <Pressable
              key={card.route}
              onPress={() => router.push(card.route as never)}
              style={({ pressed }) => [
                styles.actionCard,
                { backgroundColor: card.bg, borderColor: card.border },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: card.accent + '22' }]}>
                <Text style={styles.actionIcon}>{card.icon}</Text>
              </View>
              <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>{card.title}</Text>
              <Text style={[styles.actionSub, { color: colors.textMuted }]}>
                {card.sub === 'dueCount'
                  ? dueCount > 0 ? `${dueCount} warten` : 'Alles fertig!'
                  : card.sub}
              </Text>
              <View style={[styles.actionAccentLine, { backgroundColor: card.accent }]} />
            </Pressable>
          ))}
        </View>

        {/* ── Statistics ── */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Statistik</Text>
        <View style={styles.statsDetailRow}>
          {[
            { label: 'Wiederholt', value: stats.totalWordsReviewed, icon: '🔄', color: colors.neonBlue },
            { label: 'Gespräche', value: stats.totalSpeakingSessions, icon: '💬', color: colors.neonCyan },
            { label: 'Erfolge', value: `${unlockedCount}/${achievements.length}`, icon: '🏆', color: colors.gold },
          ].map(item => (
            <View key={item.label} style={[styles.statsDetailCard, { backgroundColor: colors.glass1, borderColor: item.color + '2A' }]}>
              <Text style={styles.statsDetailIcon}>{item.icon}</Text>
              <Text style={[styles.statsDetailValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.statsDetailLabel, { color: colors.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Tools ── */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Werkzeuge</Text>
        <View style={styles.toolsRow}>
          {TOOL_CARDS.map(tool => (
            <Pressable
              key={tool.route}
              onPress={() => router.push(tool.route as never)}
              style={({ pressed }) => [
                styles.toolCard,
                { backgroundColor: colors.glass1, borderColor: tool.accent + '33' },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.toolIcon}>{tool.icon}</Text>
              <Text style={[styles.toolTitle, { color: tool.accent }]}>{tool.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Due Alert ── */}
        {dueCount > 0 && (
          <Pressable
            onPress={() => router.push('/review' as never)}
            style={({ pressed }) => [
              styles.dueAlert,
              { backgroundColor: colors.warning + '15', borderColor: colors.warning + '44' },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={[styles.dueAlertLeft, { backgroundColor: colors.warning + '22' }]}>
              <Text style={styles.dueAlertIcon}>⏰</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dueAlertTitle, { color: colors.textPrimary }]}>{dueCount} Wörter warten auf Wiederholung</Text>
              <Text style={[styles.dueAlertSub, { color: colors.textMuted }]}>Tippe, um die Sitzung zu starten →</Text>
            </View>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  orb1: { position: 'absolute', top: -100, right: -80, width: 300, height: 300, borderRadius: 150 },
  orb2: { position: 'absolute', top: 300, left: -100, width: 220, height: 220, borderRadius: 110 },
  scroll: { paddingHorizontal: 16, paddingTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerMeta: { flexDirection: 'row', gap: 8, marginTop: 6 },
  streakPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  streakPillText: { color: '#FB923C', fontSize: 11, fontWeight: '600' },
  xpPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  xpPillText: { fontSize: 11, fontWeight: '600' },
  avatarBtn: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  nikaCard: { borderRadius: 24, borderWidth: 1, marginBottom: 16, overflow: 'hidden', minHeight: 130 },
  nikaCardInner: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  nikaImg: { width: 110, height: 130 },
  nikaTextBlock: { flex: 1, paddingLeft: 12, paddingRight: 8, paddingVertical: 8 },
  nikaLabel: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  nikaLabelText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  nikaGreeting: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  nikaCTA: { marginTop: 12, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start' },
  nikaCTAText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 12, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 17, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  actionCard: { width: '47.5%', borderRadius: 20, borderWidth: 1, padding: 16, minHeight: 120, position: 'relative', overflow: 'hidden' },
  actionIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionIcon: { fontSize: 22 },
  actionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  actionSub: { fontSize: 11 },
  actionAccentLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, opacity: 0.6 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  statsDetailRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statsDetailCard: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 16, alignItems: 'center', gap: 4 },
  statsDetailIcon: { fontSize: 22 },
  statsDetailValue: { fontSize: 20, fontWeight: '800' },
  statsDetailLabel: { fontSize: 11, textAlign: 'center', fontWeight: '500' },
  toolsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  toolCard: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 16, alignItems: 'center', gap: 6 },
  toolIcon: { fontSize: 24 },
  toolTitle: { fontSize: 11, fontWeight: '700' },
  dueAlert: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 8 },
  dueAlertLeft: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dueAlertIcon: { fontSize: 22 },
  dueAlertTitle: { fontSize: 14, fontWeight: '700' },
  dueAlertSub: { fontSize: 12, marginTop: 2 },
});
