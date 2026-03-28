import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { conversationScenarios } from '@/lib/conversation-coach';
import { useStatistics } from '@/lib/statistics-context';

export default function SpeakScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const { stats } = useStatistics();

  const SPEAK_MODES = [
    { id: 'practice', title: 'Произношение', emoji: '🔊', description: 'Слушай и повторяй слова', route: '/speak/practice' },
    { id: 'conversation', title: 'Разговор', emoji: '💬', description: 'Диалоги на немецком', route: '/speak/conversation' },
  ];

  const levelColors: Record<string, string> = {
    A1: '#22C55E', A2: '#3B82F6', B1: '#F59E0B',
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.foreground }}>
            Говорить
          </Text>
          <Text style={{ fontSize: fontSizes.sm, color: colors.muted, marginTop: 4 }}>
            Практика произношения и разговора
          </Text>
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.primary }}>
                {stats.totalSpeakingSessions}
              </Text>
              <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>Сессий</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.primary }}>
                {conversationScenarios.length}
              </Text>
              <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>Сценариев</Text>
            </View>
          </View>
        </View>

        {/* Modes */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            Режимы
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {SPEAK_MODES.map(mode => (
              <Pressable
                key={mode.id}
                onPress={() => router.push(mode.route as never)}
                style={({ pressed }) => ({
                  flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16,
                  borderWidth: 1, borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Text style={{ fontSize: 32 }}>{mode.emoji}</Text>
                <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginTop: 10 }}>
                  {mode.title}
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 4 }}>
                  {mode.description}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Scenarios */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            Сценарии разговора
          </Text>
          {conversationScenarios.map(scenario => (
            <Pressable
              key={scenario.id}
              onPress={() => router.push({
                pathname: '/speak/conversation' as never,
                params: { scenarioId: scenario.id },
              } as never)}
              style={({ pressed }) => ({
                backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10,
                borderWidth: 1, borderColor: colors.border,
                opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground }}>
                    {scenario.title}
                  </Text>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 4, lineHeight: fontSizes.xs * 1.5 }}>
                    {scenario.setting}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: levelColors[scenario.level] + '20',
                  borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8,
                }}>
                  <Text style={{ fontSize: fontSizes.xs, fontWeight: '700', color: levelColors[scenario.level] }}>
                    {scenario.level}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
