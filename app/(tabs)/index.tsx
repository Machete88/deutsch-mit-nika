import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useVocabulary } from '@/lib/vocabulary-context';
import { useStatistics } from '@/lib/statistics-context';
import { useAchievements } from '@/lib/achievements-context';
import { useSpacedRepetition } from '@/lib/spaced-repetition-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';

export default function HomeScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const { words } = useVocabulary();
  const { stats } = useStatistics();
  const { achievements } = useAchievements();
  const { getDueWords } = useSpacedRepetition();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();

  const dueCount = getDueWords(words).length;
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  const levelLabel: Record<string, string> = {
    beginner: 'Начинающий (A1)',
    intermediate: 'Средний (A2–B1)',
    advanced: 'Продвинутый (B1–B2)',
  };

  const userName = settings.userName ?? '';
  const greeting = userName ? `Guten Tag, ${userName}! 👋` : 'Guten Tag! 👋';

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.foreground }}>
            {greeting}
          </Text>
          <Text style={{ fontSize: fontSizes.base, color: colors.muted, marginTop: 4 }}>
            {levelLabel[settings.userLevel] ?? 'Начинающий'}
          </Text>
        </View>

        {/* Streak Banner */}
        <View style={{
          marginHorizontal: 20, marginVertical: 12,
          backgroundColor: colors.primary, borderRadius: 20, padding: 20,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <View>
            <Text style={{ fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
              Серия дней
            </Text>
            <Text style={{ fontSize: fontSizes['3xl'] + 4, fontWeight: '800', color: '#fff', marginTop: 2 }}>
              🔥 {stats.currentStreak}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>Слов выучено</Text>
            <Text style={{ fontSize: fontSizes['3xl'] + 4, fontWeight: '800', color: '#fff', marginTop: 2 }}>
              {stats.totalWordsLearned}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 14 }}>
            Быстрые действия
          </Text>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <Pressable
              onPress={() => router.push('/learn' as never)}
              style={({ pressed }) => ({
                flex: 1, backgroundColor: colors.surface, borderRadius: 18,
                padding: 20, borderWidth: 1, borderColor: colors.border,
                minHeight: 110,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: 36 }}>📚</Text>
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginTop: 10 }}>
                Учиться
              </Text>
              <Text style={{ fontSize: fontSizes.sm, color: colors.muted, marginTop: 3 }}>
                Новые слова
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/review' as never)}
              style={({ pressed }) => ({
                flex: 1, backgroundColor: colors.surface, borderRadius: 18,
                padding: 20, borderWidth: 1, borderColor: colors.border,
                minHeight: 110,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: 36 }}>🔄</Text>
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginTop: 10 }}>
                Повторять
              </Text>
              <Text style={{ fontSize: fontSizes.sm, color: colors.muted, marginTop: 3 }}>
                {dueCount > 0 ? `${dueCount} слов ждут` : 'Всё повторено!'}
              </Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', gap: 14, marginTop: 14 }}>
            <Pressable
              onPress={() => router.push('/speak' as never)}
              style={({ pressed }) => ({
                flex: 1, backgroundColor: colors.surface, borderRadius: 18,
                padding: 20, borderWidth: 1, borderColor: colors.border,
                minHeight: 110,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: 36 }}>🗣️</Text>
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginTop: 10 }}>
                Говорить
              </Text>
              <Text style={{ fontSize: fontSizes.sm, color: colors.muted, marginTop: 3 }}>
                Произношение
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/learn/exam-mode')}
              style={({ pressed }) => ({
                flex: 1, backgroundColor: colors.surface, borderRadius: 18,
                padding: 20, borderWidth: 1, borderColor: colors.border,
                minHeight: 110,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: 36 }}>📝</Text>
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginTop: 10 }}>
                Экзамен
              </Text>
              <Text style={{ fontSize: fontSizes.sm, color: colors.muted, marginTop: 3 }}>
                A1 – B2
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Stats Row */}
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 14 }}>
            Статистика
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { label: 'Повторено', value: stats.totalWordsReviewed, emoji: '🔄' },
              { label: 'Разговоров', value: stats.totalSpeakingSessions, emoji: '💬' },
              { label: 'Достижений', value: `${unlockedCount}/${achievements.length}`, emoji: '🏆' },
            ].map(item => (
              <View key={item.label} style={{
                flex: 1, backgroundColor: colors.surface, borderRadius: 16,
                paddingVertical: 18, paddingHorizontal: 8,
                alignItems: 'center', borderWidth: 1, borderColor: colors.border,
              }}>
                <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                <Text style={{ fontSize: fontSizes.xl, fontWeight: '800', color: colors.foreground, marginTop: 6 }}>
                  {item.value}
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, textAlign: 'center', marginTop: 4 }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Инструменты */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 14 }}>
            Инструменты
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={() => router.push('/dailyplan' as never)}
              style={({ pressed }) => ({
                flex: 1, backgroundColor: '#EFF6FF', borderRadius: 18,
                padding: 16, borderWidth: 1.5, borderColor: '#BFDBFE',
                minHeight: 100,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: 30 }}>📅</Text>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: '#1D4ED8', marginTop: 8 }}>План дня</Text>
              <Text style={{ fontSize: fontSizes.xs, color: '#3B82F6', marginTop: 3 }}>Задачи</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/dictation' as never)}
              style={({ pressed }) => ({
                flex: 1, backgroundColor: '#FFF7ED', borderRadius: 18,
                padding: 16, borderWidth: 1.5, borderColor: '#FED7AA',
                minHeight: 100,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: 30 }}>✍️</Text>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: '#C2410C', marginTop: 8 }}>Диктант</Text>
              <Text style={{ fontSize: fontSizes.xs, color: '#EA580C', marginTop: 3 }}>Слушай</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/export' as never)}
              style={({ pressed }) => ({
                flex: 1, backgroundColor: '#F0FDF4', borderRadius: 18,
                padding: 16, borderWidth: 1.5, borderColor: '#BBF7D0',
                minHeight: 100,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: 30 }}>📤</Text>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: '#15803D', marginTop: 8 }}>Экспорт</Text>
              <Text style={{ fontSize: fontSizes.xs, color: '#16A34A', marginTop: 3 }}>CSV/Anki</Text>
            </Pressable>
          </View>
        </View>

        {/* Due Words Alert */}
        {dueCount > 0 && (
          <Pressable
            onPress={() => router.push('/review' as never)}
            style={({ pressed }) => ({
              marginHorizontal: 20, marginTop: 16,
              backgroundColor: '#FEF3C7', borderRadius: 16,
              padding: 18, flexDirection: 'row', alignItems: 'center',
              borderWidth: 1, borderColor: '#F59E0B',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ fontSize: 26, marginRight: 12 }}>⏰</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: '#92400E' }}>
                {dueCount} слов ждут повторения
              </Text>
              <Text style={{ fontSize: fontSizes.sm, color: '#B45309', marginTop: 3 }}>
                Нажми, чтобы начать сессию
              </Text>
            </View>
            <Text style={{ fontSize: 22, color: '#92400E' }}>→</Text>
          </Pressable>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
