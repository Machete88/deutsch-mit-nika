import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useAchievements } from '@/lib/achievements-context';
import { useStatistics } from '@/lib/statistics-context';

export default function ReviewResultScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const { checkAchievements } = useAchievements();
  const { stats } = useStatistics();
  const params = useLocalSearchParams<{ correct: string; total: string }>();
  const correct = parseInt(params.correct ?? '0');
  const total = parseInt(params.total ?? '0');
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      if (accuracy >= 70) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    checkAchievements({
      reviewsDone: 1,
      wordsLearned: stats.totalWordsLearned,
      streak: stats.currentStreak,
    });
  }, []);

  const getEmoji = () => {
    if (accuracy >= 90) return '🌟';
    if (accuracy >= 70) return '👍';
    if (accuracy >= 50) return '💪';
    return '📚';
  };

  const getMessage = () => {
    if (accuracy >= 90) return 'Отлично! Ты хорошо знаешь эти слова!';
    if (accuracy >= 70) return 'Хорошая работа! Продолжай в том же духе!';
    if (accuracy >= 50) return 'Неплохо! Повтори ещё раз сложные слова.';
    return 'Не сдавайся! Повторение — мать учения.';
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' }}>
          {/* Badge */}
          <View style={{
            width: 120, height: 120, borderRadius: 60,
            backgroundColor: accuracy >= 70 ? '#DCFCE7' : '#FEE2E2',
            justifyContent: 'center', alignItems: 'center', marginBottom: 20,
            borderWidth: 4, borderColor: accuracy >= 70 ? '#16A34A' : '#DC2626',
          }}>
            <Text style={{ fontSize: 52 }}>{getEmoji()}</Text>
          </View>

          <Text style={{ fontSize: fontSizes['3xl'], fontWeight: '800', color: colors.foreground, textAlign: 'center' }}>
            Сессия завершена!
          </Text>
          <Text style={{ fontSize: fontSizes.base, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: fontSizes.base * 1.5 }}>
            {getMessage()}
          </Text>

          {/* Score */}
          <View style={{
            width: '100%', backgroundColor: colors.surface, borderRadius: 20, padding: 24,
            marginTop: 24, borderWidth: 1, borderColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: fontSizes['4xl'], fontWeight: '800', color: colors.success }}>
                  {correct}
                </Text>
                <Text style={{ fontSize: fontSizes.sm, color: colors.muted }}>Правильно</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: fontSizes['4xl'], fontWeight: '800', color: colors.error }}>
                  {total - correct}
                </Text>
                <Text style={{ fontSize: fontSizes.sm, color: colors.muted }}>Неверно</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: fontSizes['4xl'], fontWeight: '800', color: colors.primary }}>
                  {accuracy}%
                </Text>
                <Text style={{ fontSize: fontSizes.sm, color: colors.muted }}>Точность</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={{ width: '100%', gap: 12, marginTop: 24 }}>
            <Pressable
              onPress={() => router.replace('/(tabs)/review' as never)}
              style={({ pressed }) => ({
                backgroundColor: colors.primary, borderRadius: 16, padding: 16, alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: '#fff' }}>
                Повторить ещё раз
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace('/(tabs)/' as never)}
              style={({ pressed }) => ({
                backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center',
                borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: colors.foreground }}>
                На главную
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
