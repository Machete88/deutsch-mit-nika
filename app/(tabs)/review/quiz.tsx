import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useSpacedRepetition } from '@/lib/spaced-repetition-context';
import { useStatistics } from '@/lib/statistics-context';
import { useTTS } from '@/lib/tts-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type AnswerResult = 'correct' | 'wrong' | null;

export default function ReviewQuizScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const { currentSession, recordReview, advanceSession, completeSession } = useSpacedRepetition();
  const { recordSession } = useStatistics();
  const { speakWord } = useTTS();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<AnswerResult>(null);

  if (!currentSession || currentSession.words.length === 0) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: fontSizes.xl, fontWeight: '700', color: colors.foreground, textAlign: 'center' }}>
            Нет слов для повторения
          </Text>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({
            marginTop: 20, backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12,
            opacity: pressed ? 0.8 : 1,
          })}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSizes.base }}>Назад</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const word = currentSession.words[currentSession.currentIndex];
  const total = currentSession.words.length;
  const current = currentSession.currentIndex;
  const progress = Math.round(((current + 1) / total) * 100);
  const isLast = current === total - 1;

  const handleShowAnswer = async () => {
    setShowAnswer(true);
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await speakWord(word.russian, word.german);
  };

  const handleAnswer = async (correct: boolean) => {
    if (Platform.OS !== 'web') {
      if (correct) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setResult(correct ? 'correct' : 'wrong');
    await recordReview(word.id, correct);
    setTimeout(async () => {
      setShowAnswer(false);
      setResult(null);
      if (isLast) {
        const { correct: correctCount, total: totalCount } = await completeSession();
        await recordSession({
          type: 'review',
          wordsSeen: totalCount,
          successRate: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
          startedAt: currentSession.startedAt,
        });
        router.replace({
          pathname: '/review/result' as never,
          params: {
            correct: correctCount.toString(),
            total: totalCount.toString(),
          },
        } as never);
      } else {
        advanceSession();
      }
    }, 800);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Text style={{ fontSize: fontSizes.lg, color: colors.muted }}>✕</Text>
            </Pressable>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: colors.foreground }}>
              {current + 1} / {total}
            </Text>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.primary }}>
              {progress}%
            </Text>
          </View>

          {/* Progress */}
          <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: colors.primary, width: `${progress}%`, borderRadius: 3 }} />
          </View>

          {/* Card */}
          <View style={{
            backgroundColor: result === 'correct' ? '#DCFCE7' : result === 'wrong' ? '#FEE2E2' : colors.surface,
            borderRadius: 24, padding: 32, minHeight: 280, justifyContent: 'center', alignItems: 'center',
            borderWidth: 2, borderColor: result === 'correct' ? '#16A34A' : result === 'wrong' ? '#DC2626' : colors.border,
          }}>
            {/* Russian word */}
            <Text style={{ fontSize: fontSizes.xs, color: colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
              Русский
            </Text>
            <Text style={{ fontSize: fontSizes['4xl'], fontWeight: '800', color: colors.foreground, textAlign: 'center', lineHeight: fontSizes['4xl'] * 1.2 }}>
              {word.russian}
            </Text>

            {showAnswer && (
              <View style={{ alignItems: 'center', marginTop: 20, gap: 8 }}>
                <View style={{ height: 1, backgroundColor: colors.border, width: '100%' }} />
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 2, marginTop: 8 }}>
                  Deutsch
                </Text>
                <Text style={{ fontSize: fontSizes['3xl'], fontWeight: '800', color: colors.primary, textAlign: 'center' }}>
                  {word.german}
                </Text>
                {word.ipa && (
                  <Text style={{ fontSize: fontSizes.base, color: colors.muted }}>
                    {word.ipa}
                  </Text>
                )}
                {word.examples && word.examples.length > 0 && (
                  <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 10, width: '100%' }}>
                    <Text style={{ fontSize: fontSizes.sm, color: colors.foreground, fontStyle: 'italic', textAlign: 'center' }}>
                      {word.examples[0].de}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Actions */}
          {!showAnswer ? (
            <Pressable
              onPress={handleShowAnswer}
              style={({ pressed }) => ({
                marginTop: 24, backgroundColor: colors.primary, borderRadius: 18, padding: 18,
                alignItems: 'center', opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: fontSizes.xl, fontWeight: '700', color: '#fff' }}>
                Показать ответ
              </Text>
            </Pressable>
          ) : (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <Pressable
                onPress={() => handleAnswer(false)}
                style={({ pressed }) => ({
                  flex: 1, backgroundColor: '#FEE2E2', borderRadius: 18, padding: 18,
                  alignItems: 'center', opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: '#DC2626' }}>✗ Не знал</Text>
              </Pressable>
              <Pressable
                onPress={() => handleAnswer(true)}
                style={({ pressed }) => ({
                  flex: 1, backgroundColor: '#DCFCE7', borderRadius: 18, padding: 18,
                  alignItems: 'center', opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: '#16A34A' }}>✓ Знал</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
