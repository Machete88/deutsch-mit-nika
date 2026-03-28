import { View, Text, ScrollView, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { useExam } from '@/lib/exam-context';
import { CEFRLevel } from '@/lib/types-extended';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const CEFR_LEVELS = [
  { level: 'A1' as CEFRLevel, name: 'A1 — Anfänger', description: 'Grundkenntnisse: Begrüßungen, Zahlen, einfache Sätze', color: '#22C55E', emoji: '🌱', duration: '8 Min.' },
  { level: 'A2' as CEFRLevel, name: 'A2 — Grundstufe', description: 'Alltag: Einkaufen, Familie, Arbeit, einfache Kommunikation', color: '#3B82F6', emoji: '📘', duration: '10 Min.' },
  { level: 'B1' as CEFRLevel, name: 'B1 — Mittelstufe', description: 'Selbstständig: Reisen, Meinungen, komplexere Sätze', color: '#F59E0B', emoji: '🎯', duration: '12 Min.' },
  { level: 'B2' as CEFRLevel, name: 'B2 — Oberstufe', description: 'Fortgeschritten: Abstrakte Themen, Konjunktiv, Nebensätze', color: '#EF4444', emoji: '🏆', duration: '14 Min.' },
];

export default function ExamModeScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const { startExam, getResultsByLevel, certificates } = useExam();

  const handleStartExam = async (level: CEFRLevel) => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startExam(level);
    router.push('/learn/exam-quiz' as never);
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
            Экзамен
          </Text>
          <Text style={{ fontSize: fontSizes.sm, color: colors.muted, marginTop: 4 }}>
            Выбери уровень и проверь свои знания
          </Text>
        </View>

        {/* Certificates */}
        {certificates.length > 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: '#FEF3C7', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#F59E0B' }}>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: '#92400E' }}>
              🏅 Твои сертификаты: {certificates.length}
            </Text>
            <Text style={{ fontSize: fontSizes.xs, color: '#B45309', marginTop: 4 }}>
              {certificates.map(c => c.cefrLevel).join(', ')}
            </Text>
          </View>
        )}

        {/* Level Cards */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {CEFR_LEVELS.map(item => {
            const results = getResultsByLevel(item.level);
            const lastResult = results.length > 0 ? results[results.length - 1] : null;
            const hasCert = certificates.some(c => c.cefrLevel === item.level);
            return (
              <Pressable
                key={item.level}
                onPress={() => handleStartExam(item.level)}
                style={({ pressed }) => ({
                  backgroundColor: colors.surface, borderRadius: 20, padding: 20,
                  borderWidth: 2, borderColor: hasCert ? item.color : colors.border,
                  opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                      <Text style={{ fontSize: fontSizes.xl, fontWeight: '800', color: colors.foreground }}>
                        {item.name}
                      </Text>
                      {hasCert && <Text style={{ fontSize: 16 }}>🏅</Text>}
                    </View>
                    <Text style={{ fontSize: fontSizes.sm, color: colors.muted, lineHeight: fontSizes.sm * 1.5 }}>
                      {item.description}
                    </Text>
                    <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 6 }}>
                      ⏱ {item.duration}
                    </Text>
                  </View>
                </View>

                {lastResult && (
                  <View style={{
                    marginTop: 12, backgroundColor: lastResult.passed ? '#DCFCE7' : '#FEE2E2',
                    borderRadius: 10, padding: 10, flexDirection: 'row', justifyContent: 'space-between',
                  }}>
                    <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: lastResult.passed ? '#16A34A' : '#DC2626' }}>
                      {lastResult.passed ? '✓ Сдан' : '✗ Не сдан'} — {lastResult.score}%
                    </Text>
                    <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>
                      {lastResult.correctAnswers}/{lastResult.totalQuestions} правильных
                    </Text>
                  </View>
                )}

                <View style={{ marginTop: 12, backgroundColor: item.color, borderRadius: 12, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: '#fff' }}>
                    Начать экзамен →
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
