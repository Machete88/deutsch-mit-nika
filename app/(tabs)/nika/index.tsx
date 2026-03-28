import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useNika } from '@/lib/nika-context';
import { NikaAvatar } from '@/components/nika/nika-avatar';
import { NIKA_LEVEL_NAMES } from '@/lib/nika-types';

const MENU_ITEMS = [
  { id: 'chat', title: 'Mit Nika chatten', subtitle: 'Frag alles, lerne alles', emoji: '💬', route: '/(tabs)/nika/chat' },
  { id: 'live', title: 'Live Sprechen', subtitle: 'Nika hört dir zu', emoji: '🎤', route: '/(tabs)/nika/live-speaking' },
  { id: 'roleplay', title: 'Rollenspiele', subtitle: 'Café, Arzt, Hotel & mehr', emoji: '🎭', route: '/(tabs)/nika/roleplay' },
  { id: 'wardrobe', title: 'Kleiderschrank', subtitle: 'Outfits freischalten', emoji: '👗', route: '/(tabs)/nika/wardrobe' },
];

export default function NikaScreen() {
  const router = useRouter();
  const { state, currentOutfit, greeting, outfits } = useNika();

  const xpToNextLevel = [250, 800, 2000, 5000, 9999][state.level - 1] ?? 9999;
  const xpProgress = Math.min(state.xp / xpToNextLevel, 1);
  const levelName = NIKA_LEVEL_NAMES[state.level] ?? 'Baby Coach';
  const unlockedCount = outfits.filter(o => o.unlocked).length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Nika Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <NikaAvatar outfit={currentOutfit} size={110} />
          <View style={styles.heroText}>
            <Text style={styles.heroName}>Nika</Text>
            <Text style={styles.heroLevel}>{levelName}</Text>
            <Text style={styles.heroGreeting}>{greeting}</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>⚡ {state.xp} XP</Text>
            <Text style={styles.xpTarget}>Nächstes Level: {xpToNextLevel} XP</Text>
          </View>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
          </View>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          {[
            { label: 'Streak', value: `${state.streak}🔥` },
            { label: 'Wörter', value: state.learnedWords.toString() },
            { label: 'Gespräche', value: state.conversations.toString() },
            { label: 'Outfits', value: `${unlockedCount}/${outfits.length}` },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Daily Missions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tagesmissionen</Text>
          {state.dailyMissions.map(mission => (
            <View key={mission.id} style={[styles.missionItem, mission.completed && styles.missionCompleted]}>
              <Text style={styles.missionEmoji}>{mission.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <View style={styles.missionBar}>
                  <View
                    style={[
                      styles.missionFill,
                      { width: `${Math.min(mission.progress / mission.target, 1) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.missionProgress}>
                  {mission.progress}/{mission.target}
                </Text>
              </View>
              <Text style={styles.missionXP}>+{mission.xpReward} XP</Text>
              {mission.completed && <Text style={{ fontSize: 18, marginLeft: 6 }}>✅</Text>}
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Was möchtest du tun?</Text>
          <View style={styles.menuGrid}>
            {MENU_ITEMS.map(item => (
              <Pressable
                key={item.id}
                onPress={() => router.push(item.route as never)}
                style={({ pressed }) => [
                  styles.menuCard,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                ]}
              >
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0618' },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#7C3AED',
    opacity: 0.06,
  },
  heroText: { flex: 1, marginLeft: 16 },
  heroName: { color: '#A78BFA', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 },
  heroLevel: { color: '#F8FAFC', fontSize: 22, fontWeight: '800', marginTop: 2 },
  heroGreeting: { color: '#CBD5E1', fontSize: 14, marginTop: 8, lineHeight: 20 },
  xpSection: { paddingHorizontal: 20, marginBottom: 16 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel: { color: '#A78BFA', fontSize: 13, fontWeight: '700' },
  xpTarget: { color: '#64748B', fontSize: 12 },
  xpBar: { height: 8, backgroundColor: '#1E1040', borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: '#7C3AED', borderRadius: 4 },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E1040',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  statItem: { alignItems: 'center' },
  statValue: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#64748B', fontSize: 11, marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1040',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  missionCompleted: { borderColor: '#22C55E', opacity: 0.7 },
  missionEmoji: { fontSize: 22 },
  missionTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  missionBar: { height: 4, backgroundColor: '#0A0618', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  missionFill: { height: '100%', backgroundColor: '#7C3AED', borderRadius: 2 },
  missionProgress: { color: '#64748B', fontSize: 11, marginTop: 3 },
  missionXP: { color: '#A78BFA', fontSize: 12, fontWeight: '700' },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  menuCard: {
    width: '47%',
    backgroundColor: '#1E1040',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  menuEmoji: { fontSize: 28 },
  menuTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700', marginTop: 10 },
  menuSubtitle: { color: '#64748B', fontSize: 12, marginTop: 4 },
});
