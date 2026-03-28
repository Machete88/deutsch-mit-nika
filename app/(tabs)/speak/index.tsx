import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatistics } from '@/lib/statistics-context';
import { conversationScenarios } from '@/lib/conversation-coach';
import { DS } from '@/constants/design';

const SPEAK_MODES = [
  {
    id: 'practice', title: 'Aussprache', emoji: '🔊',
    description: 'Wörter hören & nachsprechen', route: '/speak/practice',
    accent: DS.colors.neonCyan, bg: 'rgba(34,211,238,0.10)', border: 'rgba(34,211,238,0.25)',
  },
  {
    id: 'conversation', title: 'Gespräch', emoji: '💬',
    description: 'Dialoge auf Deutsch', route: '/speak/conversation',
    accent: DS.colors.neonPurple, bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.28)',
  },
];

const LEVEL_COLORS: Record<string, string> = {
  A1: DS.colors.neonGreen, A2: DS.colors.neonBlue, B1: DS.colors.gold,
};

export default function SpeakScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stats } = useStatistics();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.orb1} pointerEvents="none" />
      <View style={styles.orb2} pointerEvents="none" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sprechen</Text>
          <Text style={styles.headerSub}>Aussprache & Konversation</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Sitzungen', value: stats.totalSpeakingSessions, icon: '🎙️', color: DS.colors.neonCyan },
            { label: 'Szenarien', value: conversationScenarios.length, icon: '💬', color: DS.colors.neonPurple },
            { label: 'Streak', value: `${stats.currentStreak}🔥`, icon: '🔥', color: '#FB923C' },
          ].map(item => (
            <View key={item.label} style={[styles.statCard, { borderColor: item.color + '33' }]}>
              <Text style={styles.statIcon}>{item.icon}</Text>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Übungsmodi</Text>
        <View style={styles.modesRow}>
          {SPEAK_MODES.map(mode => (
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
              <Text style={styles.modeDesc}>{mode.description}</Text>
              <View style={[styles.modeBar, { backgroundColor: mode.accent }]} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Szenarien</Text>
        <View style={styles.scenariosWrap}>
          {conversationScenarios.map((s: any, i: number) => (
            <Pressable
              key={s.id}
              onPress={() => router.push({ pathname: '/speak/conversation' as never, params: { scenarioId: s.id } } as never)}
              style={({ pressed }) => [
                styles.scenarioRow,
                i < conversationScenarios.length - 1 && styles.scenarioBorder,
                pressed && { backgroundColor: 'rgba(168,85,247,0.06)' },
              ]}
            >
              <View style={styles.scenarioIconWrap}>
                <Text style={styles.scenarioIcon}>{s.emoji ?? '💬'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.scenarioTitle}>{s.title}</Text>
                <Text style={styles.scenarioDesc} numberOfLines={1}>{s.setting}</Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: (LEVEL_COLORS[s.level] ?? DS.colors.neonBlue) + '22', borderColor: (LEVEL_COLORS[s.level] ?? DS.colors.neonBlue) + '55' }]}>
                <Text style={[styles.levelBadgeText, { color: LEVEL_COLORS[s.level] ?? DS.colors.neonBlue }]}>{s.level}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.colors.bg1 },
  orb1: { position: 'absolute', top: -80, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(34,211,238,0.07)' },
  orb2: { position: 'absolute', bottom: 250, left: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(168,85,247,0.07)' },
  scroll: { paddingHorizontal: DS.space[4] },
  header: { paddingTop: DS.space[4], paddingBottom: DS.space[4] },
  headerTitle: { fontSize: DS.font['2xl'], fontWeight: DS.font.extrabold, color: DS.colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: DS.font.sm, color: DS.colors.textMuted, marginTop: 3 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: DS.space[5] },
  statCard: { flex: 1, backgroundColor: DS.colors.glass1, borderRadius: DS.radius.lg, borderWidth: 1, paddingVertical: DS.space[3], alignItems: 'center', gap: 3 },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: DS.font.md, fontWeight: DS.font.extrabold },
  statLabel: { fontSize: DS.font.xs, color: DS.colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: DS.font.xs, fontWeight: DS.font.bold, color: DS.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: DS.space[3] },
  modesRow: { flexDirection: 'row', gap: 12, marginBottom: DS.space[5] },
  modeCard: { flex: 1, borderRadius: DS.radius.xl, borderWidth: 1, padding: DS.space[4], minHeight: 110, position: 'relative', overflow: 'hidden' },
  modeIconWrap: { width: 44, height: 44, borderRadius: DS.radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: DS.space[2] },
  modeIcon: { fontSize: 22 },
  modeTitle: { fontSize: DS.font.sm, fontWeight: DS.font.bold, marginBottom: 3 },
  modeDesc: { fontSize: DS.font.xs, color: DS.colors.textMuted },
  modeBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, opacity: 0.5 },
  scenariosWrap: { backgroundColor: DS.colors.glass1, borderRadius: DS.radius.xl, borderWidth: 1, borderColor: DS.colors.glassBorder, marginBottom: DS.space[5], overflow: 'hidden' },
  scenarioRow: { flexDirection: 'row', alignItems: 'center', padding: DS.space[4], gap: DS.space[3] },
  scenarioBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  scenarioIconWrap: { width: 40, height: 40, borderRadius: DS.radius.md, backgroundColor: 'rgba(168,85,247,0.12)', alignItems: 'center', justifyContent: 'center' },
  scenarioIcon: { fontSize: 20 },
  scenarioTitle: { fontSize: DS.font.sm, color: DS.colors.textPrimary, fontWeight: DS.font.semibold },
  scenarioDesc: { fontSize: DS.font.xs, color: DS.colors.textMuted, marginTop: 2 },
  levelBadge: { borderRadius: DS.radius.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  levelBadgeText: { fontSize: DS.font.xs, fontWeight: DS.font.bold },
});
