import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useNikaChat } from '@/lib/nika-chat-context';
import { ROLEPLAY_SCENARIOS } from '@/lib/nika-types';

const LEVEL_COLORS: Record<string, string> = {
  A1: '#22C55E',
  A2: '#3B82F6',
  B1: '#F59E0B',
};

export default function RoleplayScreen() {
  const router = useRouter();
  const { startRoleplay } = useNikaChat();

  const handleStart = async (scenarioId: string) => {
    await startRoleplay(scenarioId);
    router.push('/(tabs)/nika/chat' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: '#A78BFA', fontSize: 16 }}>← Zurück</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Rollenspiele</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.subtitle}>
          Nika übernimmt eine Rolle und übt echte Situationen mit dir.
        </Text>

        {ROLEPLAY_SCENARIOS.map(scenario => (
          <Pressable
            key={scenario.id}
            onPress={() => handleStart(scenario.id)}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cardEmoji}>{scenario.emoji}</Text>
            </View>
            <View style={styles.cardCenter}>
              <Text style={styles.cardTitle}>{scenario.title}</Text>
              <Text style={styles.cardDesc}>{scenario.description}</Text>
              <Text style={styles.cardRole}>Nika als: {scenario.nikaRole}</Text>
            </View>
            <View style={styles.cardRight}>
              <View style={[styles.levelBadge, { borderColor: LEVEL_COLORS[scenario.level] }]}>
                <Text style={[styles.levelText, { color: LEVEL_COLORS[scenario.level] }]}>
                  {scenario.level}
                </Text>
              </View>
              <Text style={{ color: '#A78BFA', fontSize: 18, marginTop: 8 }}>→</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0618' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#94A3B8', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1040',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardLeft: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0A0618',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardEmoji: { fontSize: 26 },
  cardCenter: { flex: 1 },
  cardTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  cardDesc: { color: '#94A3B8', fontSize: 13, marginTop: 3 },
  cardRole: { color: '#A78BFA', fontSize: 12, marginTop: 4 },
  cardRight: { alignItems: 'center' },
  levelBadge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelText: { fontSize: 12, fontWeight: '700' },
});
