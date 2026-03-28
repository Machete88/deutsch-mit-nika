import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAchievements } from '@/lib/achievements-context';

export default function ExamResultScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const { checkAchievements } = useAchievements();
  const params = useLocalSearchParams<{
    score: string; passed: string; correct: string;
    total: string; level: string; cert: string; recommendation: string;
  }>();

  const score = parseInt(params.score ?? '0');
  const passed = params.passed === '1';
  const correct = parseInt(params.correct ?? '0');
  const total = parseInt(params.total ?? '0');
  const level = params.level ?? 'A1';
  const cert = params.cert ?? '';
  const recommendation = params.recommendation ?? '';

  useEffect(() => {
    if (Platform.OS !== 'web') {
      if (passed) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    checkAchievements({
      examsDone: 1,
      examPassed: passed,
      examLevel: level,
    });
  }, []);

  const levelColors: Record<string, string> = {
    A1: '#22C55E', A2: '#3B82F6', B1: '#F59E0B', B2: '#EF4444',
  };
  const levelColor = levelColors[level] ?? colors.primary;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, padding: 24, alignItems: 'center' }}>
          {/* Result Badge */}
          <View style={{
            width: 120, height: 120, borderRadius: 60, backgroundColor: passed ? '#DCFCE7' : '#FEE2E2',
            justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 16,
            borderWidth: 4, borderColor: passed ? '#16A34A' : '#DC2626',
          }}>
            <Text style={{ fontSize: 48 }}>{passed ? '🏅' : '📚'}</Text>
          </View>

          {/* Title */}
          <Text style={{ fontSize: fontSizes['3xl'], fontWeight: '800', color: colors.foreground, textAlign: 'center' }}>
            {passed ? 'Поздравляем!' : 'Почти получилось!'}
          </Text>
          <Text style={{ fontSize: fontSizes.base, color: colors.muted, textAlign: 'center', marginTop: 8 }}>
            {passed ? `Ты сдал экзамен ${level}!` : `Продолжай учиться — ты сможешь!`}
          </Text>

          {/* Score Card */}
          <View style={{
            width: '100%', backgroundColor: colors.surface, borderRadius: 20, padding: 24,
            marginTop: 24, borderWidth: 2, borderColor: levelColor, alignItems: 'center',
          }}>
            <Text style={{ fontSize: fontSizes.sm, color: colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
              Уровень {level}
            </Text>
            <Text style={{ fontSize: 64, fontWeight: '800', color: levelColor, marginTop: 8 }}>
              {score}%
            </Text>
            <Text style={{ fontSize: fontSizes.base, color: colors.muted }}>
              {correct} из {total} правильных ответов
            </Text>

            {passed && (
              <View style={{ marginTop: 12, backgroundColor: '#FEF3C7', borderRadius: 12, padding: 10, width: '100%' }}>
                <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: '#92400E', textAlign: 'center' }}>
                  🏅 Сертификат {level} получен!
                </Text>
                {cert ? (
                  <Text style={{ fontSize: fontSizes.xs, color: '#B45309', textAlign: 'center', marginTop: 4 }}>
                    № {cert}
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          {/* Recommendation */}
          {recommendation ? (
            <View style={{
              width: '100%', backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, marginTop: 16,
              borderWidth: 1, borderColor: '#BFDBFE',
            }}>
              <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: '#1D4ED8', marginBottom: 6 }}>
                💡 Рекомендация
              </Text>
              <Text style={{ fontSize: fontSizes.sm, color: '#1E40AF', lineHeight: fontSizes.sm * 1.5 }}>
                {recommendation}
              </Text>
            </View>
          ) : null}

          {/* Actions */}
          <View style={{ width: '100%', gap: 12, marginTop: 24 }}>
            <Pressable
              onPress={() => router.push('/learn/exam-mode' as never)}
              style={({ pressed }) => ({
                backgroundColor: levelColor, borderRadius: 16, padding: 16, alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: '#fff' }}>
                {passed ? 'Попробовать следующий уровень' : 'Попробовать снова'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/' as never)}
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
