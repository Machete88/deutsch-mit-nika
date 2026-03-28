import { View, Text, ScrollView, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useVocabulary } from '@/lib/vocabulary-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { learningSets } from '@/lib/vocabulary-data';

const LEARN_MODES = [
  { id: 'cards', title: 'Карточки', emoji: '🃏', description: 'Учи слова с карточками', route: '/learn/learn-card' },
  { id: 'grammar', title: 'Грамматика', emoji: '📖', description: 'Правила и объяснения', route: '/learn/grammar' },
  { id: 'sentence', title: 'Составь предложение', emoji: '🧩', description: 'Собери правильный порядок', route: '/learn/sentence-builder' },
  { id: 'exam', title: 'Экзамен A1–B2', emoji: '📝', description: 'Проверь свой уровень', route: '/learn/exam-mode' },
];

export default function LearnScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const { words, userWordStates, setCurrentSet } = useVocabulary();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();

  const learnedCount = userWordStates.size;
  const totalCount = words.length;
  const progress = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  const handleStartSet = async (setId: string) => {
    const set = learningSets.find(s => s.id === setId);
    if (set) {
      await setCurrentSet(set);
      router.push('/learn/learn-card' as never);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.foreground }}>
            Учиться
          </Text>
          <Text style={{ fontSize: fontSizes.sm, color: colors.muted, marginTop: 4 }}>
            {learnedCount} из {totalCount} слов выучено
          </Text>
          {/* Progress bar */}
          <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: colors.primary, width: `${progress}%`, borderRadius: 3 }} />
          </View>
        </View>

        {/* Audio-Lernmodus Banner */}
        <Pressable
          onPress={() => router.push('/audio' as never)}
          style={({ pressed }) => ({
            marginHorizontal: 20, marginTop: 16, marginBottom: 4,
            borderRadius: 20, overflow: 'hidden',
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View style={{
            backgroundColor: colors.primary, borderRadius: 20, padding: 20,
            flexDirection: 'row', alignItems: 'center', gap: 16,
          }}>
            <View style={{
              width: 60, height: 60, borderRadius: 30,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 30 }}>🎧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '900', color: '#fff' }}>
                Аудио-обучение
              </Text>
              <Text style={{ fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.85)', marginTop: 3 }}>
                Слушай слова на немецком и по-русски · выбери уровень, темп и категорию
              </Text>
              <View style={{
                marginTop: 8, backgroundColor: 'rgba(255,255,255,0.25)',
                borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
                alignSelf: 'flex-start',
              }}>
                <Text style={{ fontSize: fontSizes.xs, fontWeight: '700', color: '#fff' }}>
                  ▶  Начать прослушивание
                </Text>
              </View>
            </View>
          </View>
        </Pressable>

        {/* Modes */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            Режимы обучения
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {LEARN_MODES.map(mode => (
              <Pressable
                key={mode.id}
                onPress={() => router.push(mode.route as never)}
                style={({ pressed }) => ({
                  width: '47%', backgroundColor: colors.surface,
                  borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Text style={{ fontSize: 28 }}>{mode.emoji}</Text>
                <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginTop: 8 }}>
                  {mode.title}
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 4 }}>
                  {mode.description}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Learning Sets */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            Темы
          </Text>
          {learningSets.map(set => {
            const setWords = words.filter(w => w.category === set.category);
            const learnedInSet = setWords.filter(w => userWordStates.has(w.id)).length;
            const setProgress = setWords.length > 0 ? Math.round((learnedInSet / setWords.length) * 100) : 0;
            return (
              <Pressable
                key={set.id}
                onPress={() => handleStartSet(set.id)}
                style={({ pressed }) => ({
                  backgroundColor: colors.surface, borderRadius: 16, padding: 16,
                  marginBottom: 10, borderWidth: 1, borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground }}>
                      {set.name}
                    </Text>
                    <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>
                      {set.wordCount} слов · {set.category}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary }}>
                      {setProgress}%
                    </Text>
                    <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>
                      {learnedInSet}/{setWords.length}
                    </Text>
                  </View>
                </View>
                <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
                  <View style={{ height: '100%', backgroundColor: colors.primary, width: `${setProgress}%`, borderRadius: 2 }} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
