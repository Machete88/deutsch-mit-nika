import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { sentenceChallenges } from '@/lib/language-lessons';
import { useTTS } from '@/lib/tts-context';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function SentenceBuilderScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const { speakSentence } = useTTS();
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);

  const current = sentenceChallenges[challengeIndex];

  const remaining = useMemo(() => {
    const used = [...selected];
    return current.fragments.filter(f => {
      const idx = used.indexOf(f);
      if (idx !== -1) { used.splice(idx, 1); return false; }
      return true;
    });
  }, [current, selected]);

  const solved = selected.join(' ').toLowerCase() === current.solution.join(' ').toLowerCase();
  const isComplete = selected.length === current.solution.length;
  const isWrong = isComplete && !solved;

  const addFragment = (f: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => [...prev, f]);
    setShowResult(null);
  };

  const removeLast = () => {
    setSelected(prev => prev.slice(0, -1));
    setShowResult(null);
  };

  const reset = () => {
    setSelected([]);
    setShowResult(null);
  };

  const handleNext = async () => {
    if (!solved) return;
    const points = 15 + streak * 5;
    setLastPoints(points);
    setScore(s => s + points);
    setStreak(s => s + 1);
    await speakSentence(current.solution.join(' '));
    setShowResult('correct');
    setTimeout(() => {
      setSelected([]);
      setShowResult(null);
      setChallengeIndex(i => (i + 1) % sentenceChallenges.length);
    }, 1500);
  };

  const handleTryAgain = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setStreak(0);
    setSelected([]);
    setShowResult(null);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginBottom: 8 })}>
            <Text style={{ fontSize: fontSizes.base, color: colors.muted }}>← Назад</Text>
          </Pressable>
          <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.foreground }}>
            Составь предложение
          </Text>
          <Text style={{ fontSize: fontSizes.sm, color: colors.muted, marginTop: 4 }}>
            Расставь слова в правильном порядке
          </Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Серия', value: streak, emoji: '🔥' },
            { label: 'Очки', value: score, emoji: '⭐' },
            { label: '+Последние', value: lastPoints, emoji: '🎯' },
          ].map(item => (
            <View key={item.label} style={{
              flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 10,
              alignItems: 'center', borderWidth: 1, borderColor: colors.border,
            }}>
              <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground }}>{item.value}</Text>
              <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Challenge Card */}
        <View style={{ marginHorizontal: 20, backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: fontSizes.xs, color: colors.muted, fontWeight: '600', textTransform: 'uppercase' }}>
              {current.level} · {current.topic}
            </Text>
            <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>
              {challengeIndex + 1}/{sentenceChallenges.length}
            </Text>
          </View>
          <Text style={{ fontSize: fontSizes.base, color: colors.muted, marginBottom: 12 }}>
            {current.prompt}
          </Text>

          {/* Answer Area */}
          <View style={{
            backgroundColor: showResult === 'correct' ? '#DCFCE7' : isWrong ? '#FEE2E2' : colors.background,
            borderRadius: 14, padding: 14, minHeight: 60, justifyContent: 'center',
            borderWidth: 1, borderColor: showResult === 'correct' ? '#16A34A' : isWrong ? '#DC2626' : colors.border,
            marginBottom: 12,
          }}>
            <Text style={{ fontSize: fontSizes.lg, color: colors.foreground, lineHeight: fontSizes.lg * 1.5 }}>
              {selected.length > 0 ? selected.join(' ') : 'Нажимай на слова ниже...'}
            </Text>
          </View>

          {/* Translation */}
          <Text style={{ fontSize: fontSizes.xs, color: colors.muted, fontStyle: 'italic' }}>
            🇷🇺 {current.translation}
          </Text>
        </View>

        {/* Word Fragments */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: colors.muted, marginBottom: 10 }}>
            Доступные слова:
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {remaining.map((fragment, i) => (
              <Pressable
                key={`${fragment}-${i}`}
                onPress={() => addFragment(fragment)}
                style={({ pressed }) => ({
                  backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
                  opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: '#fff' }}>
                  {fragment}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginTop: 20 }}>
          <Pressable
            onPress={removeLast}
            disabled={selected.length === 0}
            style={({ pressed }) => ({
              flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 14,
              alignItems: 'center', borderWidth: 1, borderColor: colors.border,
              opacity: selected.length === 0 ? 0.4 : pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: colors.foreground }}>← Убрать</Text>
          </Pressable>
          <Pressable
            onPress={reset}
            style={({ pressed }) => ({
              flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 14,
              alignItems: 'center', borderWidth: 1, borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: colors.foreground }}>Сброс</Text>
          </Pressable>
        </View>

        {/* Check / Next */}
        {isComplete && (
          <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
            {solved ? (
              <Pressable
                onPress={handleNext}
                style={({ pressed }) => ({
                  backgroundColor: '#16A34A', borderRadius: 16, padding: 16, alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: '#fff' }}>
                  ✓ Правильно! Дальше →
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleTryAgain}
                style={({ pressed }) => ({
                  backgroundColor: '#DC2626', borderRadius: 16, padding: 16, alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: '#fff' }}>
                  ✗ Неверно — попробуй снова
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
