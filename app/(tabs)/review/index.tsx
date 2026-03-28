import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useVocabulary } from '@/lib/vocabulary-context';
import { useSpacedRepetition } from '@/lib/spaced-repetition-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function ReviewScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const { words } = useVocabulary();
  const { getDueWords, startReviewSession, reviews } = useSpacedRepetition();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();

  const dueWords = getDueWords(words);
  const dueCount = dueWords.length;
  const reviewedCount = reviews.size;
  const totalCount = words.length;

  const handleStartReview = async () => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startReviewSession(words);
    router.push('/review/quiz' as never);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.foreground }}>
            Повторение
          </Text>
          <Text style={{ fontSize: fontSizes.sm, color: colors.muted, marginTop: 4 }}>
            Интервальное повторение (SM-2)
          </Text>
        </View>

        {/* Due Banner */}
        <View style={{
          marginHorizontal: 20, marginVertical: 12,
          backgroundColor: dueCount > 0 ? '#FEF3C7' : '#DCFCE7',
          borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: dueCount > 0 ? '#F59E0B' : '#16A34A',
        }}>
          <Text style={{ fontSize: fontSizes['4xl'], fontWeight: '800', color: dueCount > 0 ? '#92400E' : '#14532D', textAlign: 'center' }}>
            {dueCount > 0 ? `${dueCount}` : '✓'}
          </Text>
          <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: dueCount > 0 ? '#92400E' : '#14532D', textAlign: 'center', marginTop: 4 }}>
            {dueCount > 0 ? 'слов ждут повторения' : 'Всё повторено на сегодня!'}
          </Text>
          {dueCount > 0 && (
            <Text style={{ fontSize: fontSizes.xs, color: '#B45309', textAlign: 'center', marginTop: 4 }}>
              Рекомендуется повторить сейчас
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { label: 'Всего слов', value: totalCount, emoji: '📚' },
              { label: 'В системе', value: reviewedCount, emoji: '🔄' },
              { label: 'Ожидают', value: dueCount, emoji: '⏰' },
            ].map(item => (
              <View key={item.label} style={{
                flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12,
                alignItems: 'center', borderWidth: 1, borderColor: colors.border,
              }}>
                <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                <Text style={{ fontSize: fontSizes.xl, fontWeight: '700', color: colors.foreground, marginTop: 4 }}>
                  {item.value}
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, textAlign: 'center', marginTop: 2 }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Start Button */}
        <View style={{ paddingHorizontal: 20 }}>
          <Pressable
            onPress={handleStartReview}
            disabled={dueCount === 0}
            style={({ pressed }) => ({
              backgroundColor: dueCount > 0 ? colors.primary : colors.border,
              borderRadius: 20, padding: 20, alignItems: 'center',
              opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Text style={{ fontSize: fontSizes.xl, fontWeight: '800', color: '#fff' }}>
              {dueCount > 0 ? `Начать повторение (${dueCount})` : 'Нет слов для повторения'}
            </Text>
          </Pressable>
        </View>

        {/* How It Works */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            Как работает SM-2?
          </Text>
          {[
            { emoji: '🃏', title: 'Видишь слово', desc: 'Карточка показывает русское слово' },
            { emoji: '🔄', title: 'Оцениваешь', desc: 'Легко, нормально или сложно' },
            { emoji: '📅', title: 'Алгоритм считает', desc: 'Следующее повторение через 1–30 дней' },
            { emoji: '🧠', title: 'Долгосрочная память', desc: 'Слова запоминаются навсегда' },
          ].map(item => (
            <View key={item.title} style={{
              flexDirection: 'row', alignItems: 'flex-start', gap: 12,
              backgroundColor: colors.surface, borderRadius: 14, padding: 14,
              marginBottom: 8, borderWidth: 1, borderColor: colors.border,
            }}>
              <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
