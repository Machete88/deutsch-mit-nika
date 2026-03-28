import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useVocabulary } from '@/lib/vocabulary-context';
import { useStatistics } from '@/lib/statistics-context';
import { useAchievements } from '@/lib/achievements-context';
import { useSpacedRepetition } from '@/lib/spaced-repetition-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useNika } from '@/lib/nika-context';
import { NikaAvatar } from '@/components/nika/nika-avatar';

const NIKA_HOME_IMG = require('@/assets/nika/nika_home_greeting.png');

export default function HomeScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const { words } = useVocabulary();
  const { stats } = useStatistics();
  const { achievements } = useAchievements();
  const { getDueWords } = useSpacedRepetition();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const { state: nikaState, currentOutfit, greeting: nikaGreeting } = useNika();

  const dueCount = getDueWords(words).length;
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  const userName = settings.userName ?? '';
  const timeHour = new Date().getHours();
  const timeGreet = timeHour < 12 ? 'Guten Morgen' : timeHour < 18 ? 'Guten Tag' : 'Guten Abend';
  const greeting = userName ? `${timeGreet}, ${userName}!` : `${timeGreet}!`;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerGreeting, { fontSize: fontSizes['2xl'] }]}>{greeting}</Text>
            <Text style={styles.headerSub}>
              {nikaState.streak > 0 ? `🔥 ${nikaState.streak} Tage Streak · ` : ''}
              {nikaState.xp} XP
            </Text>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/nika' as never)}>
            <NikaAvatar outfit={currentOutfit} size={48} />
          </Pressable>
        </View>

        {/* Nika Greeting Card */}
        <Pressable
          onPress={() => router.push('/(tabs)/nika' as never)}
          style={({ pressed }) => [styles.nikaCard, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.nikaCardGlow} />
          <Image source={NIKA_HOME_IMG} style={styles.nikaCardImage} resizeMode="contain" />
          <View style={styles.nikaCardText}>
            <Text style={styles.nikaCardName}>Nika sagt:</Text>
            <Text style={styles.nikaCardGreeting} numberOfLines={3}>{nikaGreeting}</Text>
            <View style={styles.nikaCardCTA}>
              <Text style={styles.nikaCardCTAText}>Mit Nika lernen →</Text>
            </View>
          </View>
        </Pressable>

        {/* Streak Banner */}
        <View style={styles.streakBanner}>
          <View>
            <Text style={styles.streakLabel}>Streak</Text>
            <Text style={styles.streakValue}>🔥 {stats.currentStreak}</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.streakLabel}>Wörter gelernt</Text>
            <Text style={styles.streakValue}>{stats.totalWordsLearned}</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.streakLabel}>Nika XP</Text>
            <Text style={styles.streakValue}>⚡ {nikaState.xp}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.lg }]}>Schnellstart</Text>
          <View style={styles.actionGrid}>
            <Pressable
              onPress={() => router.push('/learn' as never)}
              style={({ pressed }) => [styles.actionCard, styles.actionCardBlue, pressed && styles.pressed]}
            >
              <Text style={styles.actionEmoji}>📚</Text>
              <Text style={styles.actionTitle}>Lernen</Text>
              <Text style={styles.actionSub}>Neue Wörter</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/review' as never)}
              style={({ pressed }) => [styles.actionCard, styles.actionCardPurple, pressed && styles.pressed]}
            >
              <Text style={styles.actionEmoji}>🔄</Text>
              <Text style={styles.actionTitle}>Wiederholen</Text>
              <Text style={styles.actionSub}>{dueCount > 0 ? `${dueCount} warten` : 'Alles fertig!'}</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/nika/chat' as never)}
              style={({ pressed }) => [styles.actionCard, styles.actionCardNika, pressed && styles.pressed]}
            >
              <Text style={styles.actionEmoji}>💬</Text>
              <Text style={styles.actionTitle}>Nika Chat</Text>
              <Text style={styles.actionSub}>KI-Coach</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/learn/exam-mode')}
              style={({ pressed }) => [styles.actionCard, styles.actionCardGold, pressed && styles.pressed]}
            >
              <Text style={styles.actionEmoji}>📝</Text>
              <Text style={styles.actionTitle}>Prüfung</Text>
              <Text style={styles.actionSub}>A1 – B2</Text>
            </Pressable>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.lg }]}>Statistik</Text>
          <View style={styles.statsRow}>
            {[
              { label: 'Wiederholt', value: stats.totalWordsReviewed, emoji: '🔄' },
              { label: 'Gespräche', value: stats.totalSpeakingSessions, emoji: '💬' },
              { label: 'Erfolge', value: `${unlockedCount}/${achievements.length}`, emoji: '🏆' },
            ].map(item => (
              <View key={item.label} style={styles.statCard}>
                <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tools */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.lg }]}>Werkzeuge</Text>
          <View style={styles.toolsRow}>
            <Pressable
              onPress={() => router.push('/dailyplan' as never)}
              style={({ pressed }) => [styles.toolCard, { backgroundColor: '#0F172A', borderColor: '#1E3A5F' }, pressed && styles.pressed]}
            >
              <Text style={{ fontSize: 28 }}>📅</Text>
              <Text style={styles.toolTitle}>Tagesplan</Text>
              <Text style={styles.toolSub}>Aufgaben</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/dictation' as never)}
              style={({ pressed }) => [styles.toolCard, { backgroundColor: '#0F172A', borderColor: '#3B1F0A' }, pressed && styles.pressed]}
            >
              <Text style={{ fontSize: 28 }}>✍️</Text>
              <Text style={styles.toolTitle}>Diktat</Text>
              <Text style={styles.toolSub}>Hören</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/export' as never)}
              style={({ pressed }) => [styles.toolCard, { backgroundColor: '#0F172A', borderColor: '#0F3A1F' }, pressed && styles.pressed]}
            >
              <Text style={{ fontSize: 28 }}>📤</Text>
              <Text style={styles.toolTitle}>Export</Text>
              <Text style={styles.toolSub}>CSV/Anki</Text>
            </Pressable>
          </View>
        </View>

        {/* Due Words Alert */}
        {dueCount > 0 && (
          <Pressable
            onPress={() => router.push('/review' as never)}
            style={({ pressed }) => [styles.dueAlert, pressed && { opacity: 0.8 }]}
          >
            <Text style={{ fontSize: 24, marginRight: 12 }}>⏰</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dueAlertTitle}>{dueCount} Wörter warten auf Wiederholung</Text>
              <Text style={styles.dueAlertSub}>Tippe, um die Sitzung zu starten</Text>
            </View>
            <Text style={{ fontSize: 20, color: '#FCD34D' }}>→</Text>
          </Pressable>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerGreeting: { fontWeight: '800', color: '#F8FAFC' },
  headerSub: { color: '#A78BFA', fontSize: 13, marginTop: 3 },
  nikaCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#1a1040',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 120,
    position: 'relative',
  },
  nikaCardGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#7C3AED',
    opacity: 0.07,
  },
  nikaCardImage: {
    width: 100,
    height: 120,
    marginLeft: 8,
  },
  nikaCardText: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  nikaCardName: { color: '#A78BFA', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  nikaCardGreeting: { color: '#F8FAFC', fontSize: 14, lineHeight: 20, marginTop: 6 },
  nikaCardCTA: {
    marginTop: 10,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  nikaCardCTAText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  streakBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#1E1040',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#334155',
  },
  streakLabel: { color: '#94A3B8', fontSize: 11, textAlign: 'center' },
  streakValue: { color: '#F8FAFC', fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  streakDivider: { width: 1, height: 36, backgroundColor: '#334155' },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontWeight: '700', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '47%',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    minHeight: 110,
  },
  actionCardBlue: { backgroundColor: '#0F1E3A', borderColor: '#1E3A5F' },
  actionCardPurple: { backgroundColor: '#1a1040', borderColor: '#4C1D95' },
  actionCardNika: { backgroundColor: '#1a1040', borderColor: '#7C3AED' },
  actionCardGold: { backgroundColor: '#1A1200', borderColor: '#78350F' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  actionEmoji: { fontSize: 32 },
  actionTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700', marginTop: 10 },
  actionSub: { color: '#64748B', fontSize: 12, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#1E1040',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: { color: '#F8FAFC', fontSize: 20, fontWeight: '800', marginTop: 6 },
  statLabel: { color: '#64748B', fontSize: 11, textAlign: 'center', marginTop: 4 },
  toolsRow: { flexDirection: 'row', gap: 10 },
  toolCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    minHeight: 100,
    alignItems: 'center',
  },
  toolTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  toolSub: { color: '#475569', fontSize: 11, marginTop: 3, textAlign: 'center' },
  dueAlert: {
    marginHorizontal: 20,
    marginTop: 4,
    backgroundColor: '#1A1200',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#78350F',
  },
  dueAlertTitle: { fontSize: 14, fontWeight: '700', color: '#FCD34D' },
  dueAlertSub: { fontSize: 12, color: '#92400E', marginTop: 3 },
});
