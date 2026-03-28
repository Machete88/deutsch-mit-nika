import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import { UserLevel } from '@/lib/types';

const STEPS = [
  {
    id: 'name',
    emoji: '👋',
    title: 'Как тебя зовут?',
    subtitle: 'Введи своё имя',
    description: 'Мы будем обращаться к тебе по имени, чтобы сделать обучение более личным.',
  },
  {
    id: 'welcome',
    emoji: '🇩🇪',
    title: 'Добро пожаловать!',
    subtitle: 'Учи немецкий эффективно',
    description: 'Приложение создано специально для русскоязычных учеников. Используй интервальное повторение, разговорные практики и экзамены A1–B2.',
  },
  {
    id: 'features',
    emoji: '📚',
    title: 'Что тебя ждёт',
    subtitle: 'Всё необходимое для успеха',
    description: '• Карточки с интервальным повторением\n• Грамматика с примерами\n• Разговорные диалоги\n• Экзамены A1, A2, B1, B2\n• Произношение с TTS\n• Аудио-режим и диктант',
  },
  {
    id: 'level',
    emoji: '🎯',
    title: 'Твой уровень',
    subtitle: 'Выбери начальный уровень',
    description: 'Это поможет нам подобрать подходящие слова и упражнения.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const [step, setStep] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>('beginner');
  const [nameInput, setNameInput] = useState('');

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await updateSettings({
        userLevel: selectedLevel,
        hasCompletedOnboarding: true,
        userName: nameInput.trim() || undefined,
      });
      router.replace('/(tabs)/' as never);
    } else {
      setStep(s => s + 1);
    }
  };

  const canProceed = current.id === 'name' ? true : true; // Name ist optional

  const LEVELS: { id: UserLevel; label: string; desc: string; emoji: string }[] = [
    { id: 'beginner', label: 'Начинающий', desc: 'A1 — Первые шаги', emoji: '🌱' },
    { id: 'intermediate', label: 'Средний', desc: 'A2–B1 — Базовые знания', emoji: '📘' },
    { id: 'advanced', label: 'Продвинутый', desc: 'B1–B2 — Уверенный уровень', emoji: '🏆' },
  ];

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}>
            {/* Progress Dots */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 16 }}>
              {STEPS.map((_, i) => (
                <View key={i} style={{
                  width: i === step ? 28 : 8, height: 8, borderRadius: 4,
                  backgroundColor: i === step ? colors.primary : colors.border,
                }} />
              ))}
            </View>

            {/* Content */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: 80 }}>{current.emoji}</Text>
              <Text style={{ fontSize: fontSizes['3xl'], fontWeight: '800', color: colors.foreground, textAlign: 'center', marginTop: 20 }}>
                {current.title}
              </Text>
              <Text style={{ fontSize: fontSizes.base, color: colors.muted, textAlign: 'center', marginTop: 8 }}>
                {current.subtitle}
              </Text>
              <Text style={{ fontSize: fontSizes.base, color: colors.foreground, textAlign: 'center', marginTop: 16, lineHeight: fontSizes.base * 1.6 }}>
                {current.description}
              </Text>

              {/* Name Input */}
              {current.id === 'name' && (
                <View style={{ width: '100%', marginTop: 28 }}>
                  <TextInput
                    value={nameInput}
                    onChangeText={setNameInput}
                    placeholder="Твоё имя (необязательно)"
                    placeholderTextColor={colors.muted}
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 16,
                      padding: 18,
                      fontSize: fontSizes.xl,
                      fontWeight: '600',
                      color: colors.foreground,
                      borderWidth: 2,
                      borderColor: nameInput ? colors.primary : colors.border,
                      textAlign: 'center',
                    }}
                  />
                  {nameInput.trim().length > 0 && (
                    <Text style={{ textAlign: 'center', marginTop: 12, fontSize: fontSizes.base, color: colors.primary, fontWeight: '600' }}>
                      Привет, {nameInput.trim()}! 🎉
                    </Text>
                  )}
                </View>
              )}

              {/* Level Selection */}
              {current.id === 'level' && (
                <View style={{ width: '100%', gap: 12, marginTop: 24 }}>
                  {LEVELS.map(level => (
                    <Pressable
                      key={level.id}
                      onPress={() => setSelectedLevel(level.id)}
                      style={({ pressed }) => ({
                        backgroundColor: selectedLevel === level.id ? colors.primary : colors.surface,
                        borderRadius: 16, padding: 18, borderWidth: 2,
                        borderColor: selectedLevel === level.id ? colors.primary : colors.border,
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
                      })}
                    >
                      <Text style={{ fontSize: 32 }}>{level.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: selectedLevel === level.id ? '#fff' : colors.foreground }}>
                          {level.label}
                        </Text>
                        <Text style={{ fontSize: fontSizes.sm, color: selectedLevel === level.id ? 'rgba(255,255,255,0.8)' : colors.muted, marginTop: 2 }}>
                          {level.desc}
                        </Text>
                      </View>
                      {selectedLevel === level.id && <Text style={{ fontSize: 22 }}>✓</Text>}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Button */}
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => ({
                backgroundColor: colors.primary, borderRadius: 20, padding: 20, alignItems: 'center',
                marginBottom: 16, opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: fontSizes.xl, fontWeight: '800', color: '#fff' }}>
                {isLast ? 'Начать учиться! 🚀' : current.id === 'name' && !nameInput.trim() ? 'Пропустить →' : 'Далее →'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
