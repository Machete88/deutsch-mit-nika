import { View, Text, ScrollView, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useVocabulary } from '@/lib/vocabulary-context';
import { useTTS } from '@/lib/tts-context';
import { useStatistics } from '@/lib/statistics-context';
import { useAchievements } from '@/lib/achievements-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import { Word } from '@/lib/types';

export default function SpeakPracticeScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const { words } = useVocabulary();
  const { speak, isSpeaking, speakWord } = useTTS();
  const { recordSession } = useStatistics();
  const { checkAchievements } = useAchievements();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playedCount, setPlayedCount] = useState(0);

  const practiceWords = words.slice(0, 30);

  const handlePlay = async (word: Word) => {
    setPlayingId(word.id);
    setPlayedCount(c => c + 1);
    await speakWord(word.russian, word.german);
    setPlayingId(null);
    if (playedCount + 1 >= 1) {
      await recordSession({ type: 'speak', wordsSeen: playedCount + 1, startedAt: Date.now() });
      await checkAchievements({ speakingSessions: playedCount + 1 });
    }
  };

  const handlePlaySentence = async (sentence: string) => {
    await speak(sentence, 'de-DE');
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
            Произношение
          </Text>
          <Text style={{ fontSize: fontSizes.sm, color: colors.muted, marginTop: 4 }}>
            Нажми на слово, чтобы услышать произношение
          </Text>
        </View>

        {/* TTS Info */}
        <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#BFDBFE' }}>
          <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: '#1D4ED8', marginBottom: 4 }}>
            💡 Как использовать
          </Text>
          <Text style={{ fontSize: fontSizes.xs, color: '#1E40AF', lineHeight: fontSizes.xs * 1.5 }}>
            Нажми на карточку, чтобы услышать немецкое произношение. Повторяй вслух после каждого слова.
          </Text>
        </View>

        {/* Word List */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            Слова для практики
          </Text>
          {practiceWords.map(word => (
            <Pressable
              key={word.id}
              onPress={() => handlePlay(word)}
              style={({ pressed }) => ({
                backgroundColor: playingId === word.id ? colors.primary : colors.surface,
                borderRadius: 16, padding: 16, marginBottom: 8,
                borderWidth: 1, borderColor: playingId === word.id ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              })}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: playingId === word.id ? '#fff' : colors.foreground }}>
                  {word.german}
                </Text>
                <Text style={{ fontSize: fontSizes.sm, color: playingId === word.id ? 'rgba(255,255,255,0.8)' : colors.muted, marginTop: 2 }}>
                  {word.russian}
                </Text>
                {word.ipa && (
                  <Text style={{ fontSize: fontSizes.xs, color: playingId === word.id ? 'rgba(255,255,255,0.7)' : colors.muted, marginTop: 2 }}>
                    {word.ipa}
                  </Text>
                )}
              </View>
              <Text style={{ fontSize: 24, marginLeft: 12 }}>
                {playingId === word.id ? '🔊' : '▶️'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Phrases */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            Полезные фразы
          </Text>
          {[
            { de: 'Guten Morgen!', ru: 'Доброе утро!' },
            { de: 'Wie geht es Ihnen?', ru: 'Как вы поживаете?' },
            { de: 'Ich lerne Deutsch.', ru: 'Я учу немецкий.' },
            { de: 'Entschuldigung, ich verstehe nicht.', ru: 'Извините, я не понимаю.' },
            { de: 'Können Sie das wiederholen?', ru: 'Можете повторить?' },
            { de: 'Vielen Dank!', ru: 'Большое спасибо!' },
          ].map((phrase, i) => (
            <Pressable
              key={i}
              onPress={() => handlePlaySentence(phrase.de)}
              style={({ pressed }) => ({
                backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8,
                borderWidth: 1, borderColor: colors.border,
                opacity: pressed ? 0.7 : 1, flexDirection: 'row', alignItems: 'center',
              })}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: colors.foreground }}>
                  {phrase.de}
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>
                  {phrase.ru}
                </Text>
              </View>
              <Text style={{ fontSize: 20 }}>🔊</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
