import { View, Text, ScrollView, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { grammarLessons, GrammarLesson } from '@/lib/language-lessons';
import { useState } from 'react';
import { useTTS } from '@/lib/tts-context';

const LEVELS = ['A1', 'A2', 'B1'] as const;

export default function GrammarScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const { speakSentence } = useTTS();
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [checkAnswers, setCheckAnswers] = useState<Record<string, string>>({});
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  const filtered = grammarLessons.filter(l => l.level === selectedLevel);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
            Грамматика
          </Text>
          <Text style={{ fontSize: fontSizes.sm, color: colors.muted, marginTop: 4 }}>
            Правила немецкого языка
          </Text>
        </View>

        {/* Level Filter */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 }}>
          {LEVELS.map(level => (
            <Pressable
              key={level}
              onPress={() => setSelectedLevel(level)}
              style={({ pressed }) => ({
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: selectedLevel === level ? colors.primary : colors.surface,
                borderWidth: 1, borderColor: selectedLevel === level ? colors.primary : colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: selectedLevel === level ? '#fff' : colors.foreground }}>
                {level}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Lessons */}
        {filtered.map(lesson => (
          <View key={lesson.id} style={{ marginHorizontal: 20, marginBottom: 12 }}>
            <Pressable
              onPress={() => toggleExpand(lesson.id)}
              style={({ pressed }) => ({
                backgroundColor: colors.surface, borderRadius: 16, padding: 16,
                borderWidth: 1, borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground }}>
                    {lesson.title}
                  </Text>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>
                    {lesson.topic}
                  </Text>
                </View>
                <Text style={{ fontSize: fontSizes.lg, color: colors.muted }}>
                  {expandedId === lesson.id ? '▲' : '▼'}
                </Text>
              </View>
            </Pressable>

            {expandedId === lesson.id && (
              <View style={{ backgroundColor: colors.background, borderRadius: 16, padding: 16, marginTop: 4, borderWidth: 1, borderColor: colors.border }}>
                {/* Explanation */}
                <Text style={{ fontSize: fontSizes.base, color: colors.foreground, lineHeight: fontSizes.base * 1.6, marginBottom: 12 }}>
                  {lesson.explanation}
                </Text>

                {/* Tips */}
                <View style={{ backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                  <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: '#1D4ED8', marginBottom: 6 }}>
                    💡 Советы
                  </Text>
                  {lesson.tips.map((tip, i) => (
                    <Text key={i} style={{ fontSize: fontSizes.sm, color: '#1E40AF', marginBottom: 4 }}>
                      • {tip}
                    </Text>
                  ))}
                </View>

                {/* Examples */}
                <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
                  Примеры:
                </Text>
                {lesson.examples.map((ex, i) => (
                  <Pressable
                    key={i}
                    onPress={() => speakSentence(ex.de)}
                    style={({ pressed }) => ({
                      backgroundColor: colors.surface, borderRadius: 10, padding: 10, marginBottom: 8,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: colors.foreground }}>
                      🔊 {ex.de}
                    </Text>
                    <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>
                      {ex.hint}
                    </Text>
                  </Pressable>
                ))}

                {/* Quick Check */}
                <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: colors.foreground, marginTop: 8, marginBottom: 8 }}>
                  Быстрая проверка:
                </Text>
                {lesson.quickCheck.map((qc, i) => {
                  const key = `${lesson.id}-${i}`;
                  const answered = showAnswers[key];
                  return (
                    <View key={i} style={{ marginBottom: 8 }}>
                      <Text style={{ fontSize: fontSizes.base, color: colors.foreground, marginBottom: 6 }}>
                        {qc.prompt}
                      </Text>
                      <Pressable
                        onPress={() => setShowAnswers(prev => ({ ...prev, [key]: true }))}
                        style={({ pressed }) => ({
                          backgroundColor: answered ? '#DCFCE7' : colors.primary,
                          borderRadius: 10, padding: 10, alignItems: 'center',
                          opacity: pressed ? 0.8 : 1,
                        })}
                      >
                        <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: answered ? '#16A34A' : '#fff' }}>
                          {answered ? `✓ ${qc.answer}` : 'Показать ответ'}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
