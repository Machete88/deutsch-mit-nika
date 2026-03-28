import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { useTTS } from '@/lib/tts-context';
import { useStatistics } from '@/lib/statistics-context';
import { conversationScenarios, createConversationReply } from '@/lib/conversation-coach';
import { useState, useRef } from 'react';
import * as Haptics from 'expo-haptics';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  correction?: string;
  betterOption?: string;
}

export default function ConversationScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const { speak } = useTTS();
  const { recordSession } = useStatistics();
  const params = useLocalSearchParams<{ scenarioId: string }>();
  const scrollRef = useRef<ScrollView>(null);

  const scenario = conversationScenarios.find(s => s.id === params.scenarioId) ?? conversationScenarios[0];
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'ai', text: scenario.openingLine },
  ]);
  const [input, setInput] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStarted] = useState(Date.now());

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      const reply = createConversationReply(text, scenario.id);
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'ai',
        text: reply.answer,
        correction: reply.correction,
        betterOption: reply.betterOption,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      await speak(reply.answer, 'de-DE');
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 800);

    await recordSession({ type: 'speak', wordsSeen: 1, startedAt: sessionStarted });
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handlePlayAI = async (text: string) => {
    await speak(text, 'de-DE');
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginBottom: 8 })}>
            <Text style={{ fontSize: fontSizes.base, color: colors.muted }}>← Назад</Text>
          </Pressable>
          <Text style={{ fontSize: fontSizes.xl, fontWeight: '800', color: colors.foreground }}>
            {scenario.title}
          </Text>
          <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>
            {scenario.setting}
          </Text>
          <View style={{ backgroundColor: colors.primary + '15', borderRadius: 10, padding: 8, marginTop: 8 }}>
            <Text style={{ fontSize: fontSizes.xs, fontWeight: '600', color: colors.primary }}>
              🎯 Цель: {scenario.goal}
            </Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View key={msg.id} style={{ marginBottom: 12 }}>
              <View style={{
                alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end',
                maxWidth: '82%',
              }}>
                {/* Bubble */}
                <Pressable
                  onPress={() => msg.role === 'ai' && handlePlayAI(msg.text)}
                  style={({ pressed }) => ({
                    backgroundColor: msg.role === 'ai' ? colors.surface : colors.primary,
                    borderRadius: 18,
                    borderBottomLeftRadius: msg.role === 'ai' ? 4 : 18,
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 18,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: msg.role === 'ai' ? colors.border : colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontSize: fontSizes.base, color: msg.role === 'ai' ? colors.foreground : '#fff', lineHeight: fontSizes.base * 1.5 }}>
                    {msg.role === 'ai' ? '🤖 ' : ''}{msg.text}
                  </Text>
                </Pressable>

                {/* Correction */}
                {msg.role === 'ai' && msg.correction && (
                  <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, padding: 10, marginTop: 6, borderWidth: 1, borderColor: '#F59E0B' }}>
                    <Text style={{ fontSize: fontSizes.xs, fontWeight: '700', color: '#92400E', marginBottom: 2 }}>
                      ✏️ Коррекция
                    </Text>
                    <Text style={{ fontSize: fontSizes.xs, color: '#92400E', lineHeight: fontSizes.xs * 1.5 }}>
                      {msg.correction}
                    </Text>
                    {msg.betterOption && (
                      <Text style={{ fontSize: fontSizes.xs, color: '#B45309', marginTop: 4, fontStyle: 'italic' }}>
                        💡 {msg.betterOption}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={{ alignSelf: 'flex-start', backgroundColor: colors.surface, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
              <Text style={{ fontSize: fontSizes.base, color: colors.muted }}>🤖 ...</Text>
            </View>
          )}
        </ScrollView>

        {/* Hints */}
        {showHints && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <View style={{ backgroundColor: '#EFF6FF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#BFDBFE' }}>
              <Text style={{ fontSize: fontSizes.xs, fontWeight: '700', color: '#1D4ED8', marginBottom: 6 }}>
                💡 Подсказки
              </Text>
              {scenario.hints.map((hint, i) => (
                <Text key={i} style={{ fontSize: fontSizes.xs, color: '#1E40AF', marginBottom: 4 }}>
                  • {hint}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Input */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <Pressable
              onPress={() => setShowHints(h => !h)}
              style={({ pressed }) => ({
                backgroundColor: showHints ? colors.primary : colors.surface, borderRadius: 14, padding: 12,
                borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 18 }}>💡</Text>
            </Pressable>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Напиши по-немецки..."
              placeholderTextColor={colors.muted}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
              style={{
                flex: 1, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16,
                paddingVertical: 12, fontSize: fontSizes.base, color: colors.foreground,
                borderWidth: 1, borderColor: colors.border, maxHeight: 100,
              }}
            />
            <Pressable
              onPress={handleSend}
              disabled={!input.trim()}
              style={({ pressed }) => ({
                backgroundColor: input.trim() ? colors.primary : colors.border, borderRadius: 14, padding: 12,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 18 }}>➤</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
