import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useNika } from '@/lib/nika-context';
import { NikaAvatar } from '@/components/nika/nika-avatar';
import { NIKA_LEVEL_NAMES } from '@/lib/nika-types';
import { useNikaTheme } from '@/lib/nika-theme-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NIKA_PREMIUM = { uri: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663487380385/BXeVnGCbdDbGSTbQB9nRKD/nika_hero_premium_75f2deda.png' };

export default function NikaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, currentOutfit, greeting, outfits } = useNika();
  const { colors, font, space, radius, isDark } = useNikaTheme();

  const xpToNextLevel = [250, 800, 2000, 5000, 9999][state.level - 1] ?? 9999;
  const xpProgress = Math.min(state.xp / xpToNextLevel, 1);
  const levelName = NIKA_LEVEL_NAMES[state.level] ?? 'Baby Coach';
  const unlockedCount = outfits.filter((o: any) => o.unlocked).length;

  const FEATURE_CARDS = [
    { route: '/(tabs)/nika/chat', icon: '💬', title: 'Mit Nika chatten', sub: 'Frag alles, lerne alles', accent: colors.neonPurple, bg: colors.neonPurple + '1A', border: colors.neonPurple + '44' },
    { route: '/(tabs)/nika/live-speaking', icon: '🎤', title: 'Live Sprechen', sub: 'Nika hört dir zu', accent: colors.neonCyan, bg: colors.neonCyan + '1A', border: colors.neonCyan + '3A' },
    { route: '/(tabs)/nika/roleplay', icon: '🎭', title: 'Rollenspiele', sub: 'Café, Arzt, Hotel & mehr', accent: colors.neonPink, bg: colors.neonPink + '1A', border: colors.neonPink + '3A' },
    { route: '/(tabs)/nika/wardrobe', icon: '👗', title: 'Kleiderschrank', sub: 'Outfits freischalten', accent: colors.gold, bg: colors.gold + '1A', border: colors.gold + '3A' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg1, paddingTop: insets.top }]}>
      <View style={[styles.orb1, { backgroundColor: colors.orb1 }]} pointerEvents="none" />
      <View style={[styles.orb2, { backgroundColor: colors.orb3 }]} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>

        {/* ── Header row ── */}
        <View style={styles.headerRow}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Nika</Text>
          <ThemeToggle size="sm" showLabel />
        </View>

        {/* ── Hero Banner ── */}
        <View style={[styles.heroBanner, { borderColor: colors.purple400 + '44', backgroundColor: isDark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.06)' }]}>
          <View style={styles.heroContent}>
            <View style={{ flex: 1 }}>
              <View style={[styles.nikaBadge, { backgroundColor: colors.purple500 + '33' }]}>
                <Text style={[styles.nikaBadgeText, { color: colors.purple300 }]}>NIKA</Text>
              </View>
              <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{levelName}</Text>
              <Text style={[styles.heroSub, { color: colors.textSecondary }]} numberOfLines={2}>
                {greeting || 'Hey! Heute machen wir 5 Minuten Deutsch und dann bist du gefährlich gut.'}
              </Text>
              <View style={styles.xpRow}>
                <Text style={[styles.xpText, { color: colors.neonPurple }]}>⚡ {state.xp} XP</Text>
                <Text style={[styles.xpNextText, { color: colors.textMuted }]}>Level: {xpToNextLevel} XP</Text>
              </View>
              <View style={[styles.xpTrack, { backgroundColor: colors.glass2 }]}>
                <View style={[styles.xpFill, { width: `${xpProgress * 100}%` as any, backgroundColor: colors.neonPurple }]} />
              </View>
            </View>
            <Image source={NIKA_PREMIUM} style={styles.heroImg} resizeMode="contain" />
          </View>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          {[
            { label: 'Streak', value: `${state.streak}🔥`, color: '#FB923C' },
            { label: 'Wörter', value: String(state.learnedWords), color: colors.neonGreen },
            { label: 'Gespräche', value: String(state.conversations), color: colors.neonCyan },
            { label: 'Outfits', value: `${unlockedCount}/${outfits.length}`, color: colors.gold },
          ].map(item => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: colors.glass2, borderColor: item.color + '33' }]}>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Daily Missions ── */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Tagesmissionen</Text>
        <View style={[styles.missionsWrap, { backgroundColor: colors.missionBg, borderColor: colors.missionBorder }]}>
          {state.dailyMissions.map((mission: any, i: number) => (
            <View key={mission.id} style={[
              styles.missionRow,
              i < state.dailyMissions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
              mission.completed && { opacity: 0.7 },
            ]}>
              <View style={[styles.missionIconWrap, { backgroundColor: mission.completed ? colors.neonGreen + '22' : colors.glass2 }]}>
                <Text style={styles.missionIcon}>{mission.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.missionLabel, { color: mission.completed ? colors.textMuted : colors.textPrimary }]}>
                  {mission.title}
                </Text>
                <View style={[styles.missionTrack, { backgroundColor: colors.glass2 }]}>
                  <View style={[
                    styles.missionFill,
                    { width: `${Math.min(mission.progress / mission.target, 1) * 100}%` as any },
                    { backgroundColor: mission.completed ? colors.neonGreen : colors.neonPurple },
                  ]} />
                </View>
                <Text style={[styles.missionProgress, { color: colors.textMuted }]}>{mission.progress}/{mission.target}</Text>
              </View>
              <View style={[styles.missionXP, {
                backgroundColor: mission.completed ? colors.neonGreen + '22' : colors.glass1,
                borderColor: mission.completed ? colors.neonGreen + '44' : colors.glassBorder,
              }]}>
                <Text style={[styles.missionXPText, { color: mission.completed ? colors.neonGreen : colors.textMuted }]}>
                  {mission.completed ? '✓' : `+${mission.xpReward} XP`}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Feature Cards ── */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Was möchtest du tun?</Text>
        <View style={styles.featureGrid}>
          {FEATURE_CARDS.map(card => (
            <Pressable
              key={card.route}
              onPress={() => router.push(card.route as never)}
              style={({ pressed }) => [
                styles.featureCard,
                { backgroundColor: card.bg, borderColor: card.border },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: card.accent + '22' }]}>
                <Text style={styles.featureIcon}>{card.icon}</Text>
              </View>
              <Text style={[styles.featureTitle, { color: card.accent }]}>{card.title}</Text>
              <Text style={[styles.featureSub, { color: colors.textMuted }]}>{card.sub}</Text>
              <View style={[styles.featureAccentBar, { backgroundColor: card.accent }]} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb1: { position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: 120 },
  orb2: { position: 'absolute', bottom: 200, left: -80, width: 180, height: 180, borderRadius: 90 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  pageTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  heroBanner: { borderRadius: 24, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  heroContent: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  nikaBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  nikaBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle: { fontSize: 22, fontWeight: '800', marginBottom: 6, letterSpacing: -0.3 },
  heroSub: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  xpText: { fontSize: 13, fontWeight: '700' },
  xpNextText: { fontSize: 11 },
  xpTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginRight: 8 },
  xpFill: { height: 6, borderRadius: 3 },
  heroImg: { width: 100, height: 120, marginLeft: 8 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, paddingVertical: 10, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 15, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.4 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  missionsWrap: { borderRadius: 18, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  missionIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  missionIcon: { fontSize: 18 },
  missionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  missionTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  missionFill: { height: 4, borderRadius: 2 },
  missionProgress: { fontSize: 10 },
  missionXP: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  missionXPText: { fontSize: 11, fontWeight: '700' },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  featureCard: { width: '47.5%', borderRadius: 18, borderWidth: 1, padding: 16, minHeight: 110, position: 'relative', overflow: 'hidden' },
  featureIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  featureIcon: { fontSize: 20 },
  featureTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  featureSub: { fontSize: 11 },
  featureAccentBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, opacity: 0.6 },
});
