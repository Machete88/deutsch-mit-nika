import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { LearningCard } from '@/components/learning-card';
import { useSettings } from '@/lib/settings-context';
import { useVocabulary } from '@/lib/vocabulary-context';
import { useTTS } from '@/lib/tts-context';
import { useStatistics } from '@/lib/statistics-context';
import { useAchievements } from '@/lib/achievements-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { Word } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function LearnCardScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const { currentSet, words, getNewWords, recordWordResult } = useVocabulary();
  const { speakWord } = useTTS();
  const { recordSession, updateStreak } = useStatistics();
  const { checkAchievements } = useAchievements();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const [cardsToLearn, setCardsToLearn] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    if (currentSet) {
      const setWords = words.filter(w => w.category === currentSet.category);
      const newWords = getNewWords(20);
      const toLearn = newWords.length > 0 ? newWords.slice(0, 10) : setWords.slice(0, 10);
      setCardsToLearn(toLearn);
    } else {
      const newWords = getNewWords(10);
      setCardsToLearn(newWords.length > 0 ? newWords : words.slice(0, 10));
    }
    setSessionStarted(true);
  }, [currentSet]);

  const handleFinish = async () => {
    await recordSession({ type: 'learn', wordsSeen: cardsToLearn.length, startedAt: Date.now() });
    await updateStreak();
    router.back();
  };

  const handleSwipeRight = async () => {
    if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await recordWordResult(cardsToLearn[currentIndex].id, 'easy');
    if (currentIndex >= cardsToLearn.length - 1) {
      handleFinish();
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleSwipeLeft = async () => {
    if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await recordWordResult(cardsToLearn[currentIndex].id, 'hard');
    if (currentIndex >= cardsToLearn.length - 1) {
      handleFinish();
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleAudio = async () => {
    const word = cardsToLearn[currentIndex];
    if (word) await speakWord(word.russian, word.german);
  };

  if (!sessionStarted || cardsToLearn.length === 0) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: fontSizes.xl, fontWeight: '700', color: colors.foreground, textAlign: 'center' }}>
            Нет слов для изучения
          </Text>
          <Text style={{ fontSize: fontSizes.base, color: colors.muted, textAlign: 'center', marginTop: 8 }}>
            Выбери тему в разделе "Учиться"
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              marginTop: 24, backgroundColor: colors.primary, borderRadius: 16,
              paddingHorizontal: 24, paddingVertical: 12,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSizes.base }}>Назад</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const currentWord = cardsToLearn[currentIndex];
  const progress = Math.round(((currentIndex + 1) / cardsToLearn.length) * 100);

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
              {currentIndex + 1} / {cardsToLearn.length}
            </Text>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.primary }}>
              {progress}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: colors.primary, width: `${progress}%`, borderRadius: 3 }} />
          </View>

          {/* Card */}
          <LearningCard
            word={currentWord}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onAudioPlay={handleAudio}
          />

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <Pressable
              onPress={handleSwipeLeft}
              style={({ pressed }) => ({
                flex: 1, backgroundColor: '#FEE2E2', borderRadius: 16, padding: 16,
                alignItems: 'center', opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: '#DC2626' }}>← Сложно</Text>
            </Pressable>
            <Pressable
              onPress={handleSwipeRight}
              style={({ pressed }) => ({
                flex: 1, backgroundColor: '#DCFCE7', borderRadius: 16, padding: 16,
                alignItems: 'center', opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: '#16A34A' }}>Легко →</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
