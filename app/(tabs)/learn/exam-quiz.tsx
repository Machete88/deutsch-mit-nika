import { View, Text, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { useExam } from '@/lib/exam-context';
import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

export default function ExamQuizScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const { currentSession, submitAnswer, completeExam } = useExam();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  // Listening state
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioPlayCount, setAudioPlayCount] = useState(0);
  const speechRef = useRef<any>(null);

  useEffect(() => {
    if (!currentSession) return;
    const remaining = Math.max(0, Math.round((currentSession.expiresAt! - Date.now()) / 1000));
    setTimeLeft(remaining);
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); handleFinish(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentSession?.id]);

  // Reset listening state when question changes
  useEffect(() => {
    setAudioPlayed(false);
    setAudioPlaying(false);
    setAudioPlayCount(0);
    stopSpeech();
  }, [currentIndex]);

  const stopSpeech = () => {
    try {
      if (Platform.OS !== 'web') {
        const Speech = require('expo-speech');
        if (Speech && typeof Speech.stop === 'function') Speech.stop();
      }
    } catch {}
  };

  const playAudio = async (text: string) => {
    if (audioPlaying) { stopSpeech(); setAudioPlaying(false); return; }
    if (audioPlayCount >= 2) return; // max 2 plays like real exam
    try {
      if (Platform.OS !== 'web') {
        const Speech = require('expo-speech');
        if (Speech && typeof Speech.speak === 'function') {
          setAudioPlaying(true);
          Speech.speak(text, {
            language: 'de-DE',
            pitch: 1.0,
            rate: 0.85,
            onDone: () => { setAudioPlaying(false); setAudioPlayed(true); setAudioPlayCount(c => c + 1); },
            onError: () => { setAudioPlaying(false); setAudioPlayed(true); },
          });
        }
      } else {
        // Web: use SpeechSynthesis
        if ('speechSynthesis' in window) {
          const utt = new SpeechSynthesisUtterance(text);
          utt.lang = 'de-DE';
          utt.rate = 0.85;
          utt.onend = () => { setAudioPlaying(false); setAudioPlayed(true); setAudioPlayCount(c => c + 1); };
          utt.onerror = () => { setAudioPlaying(false); setAudioPlayed(true); };
          window.speechSynthesis.speak(utt);
          setAudioPlaying(true);
        } else {
          setAudioPlayed(true);
        }
      }
    } catch {
      setAudioPlayed(true);
    }
  };

  if (!currentSession || currentSession.questions.length === 0) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: fontSizes.xl, fontWeight: '700', color: colors.foreground, textAlign: 'center' }}>
            Нет активного экзамена
          </Text>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({
            marginTop: 20, backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12,
            opacity: pressed ? 0.8 : 1,
          })}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSizes.base }}>Назад</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const question = currentSession.questions[currentIndex];
  const total = currentSession.questions.length;
  const progress = Math.round(((currentIndex + 1) / total) * 100);
  const isLastQuestion = currentIndex === total - 1;
  const isFillBlank = question.type === 'fill-blank';
  const isListening = question.type === 'listening';
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSelectAnswer = async (answer: string) => {
    if (confirmed) return;
    setSelectedAnswer(answer);
    await submitAnswer(question.id, answer);
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleConfirmFill = async () => {
    if (!fillAnswer.trim() || confirmed) return;
    setConfirmed(true);
    await submitAnswer(question.id, fillAnswer.trim());
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNext = async () => {
    stopSpeech();
    if (isLastQuestion) {
      await handleFinish();
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setFillAnswer('');
      setConfirmed(false);
    }
  };

  const handleFinish = async () => {
    stopSpeech();
    const result = await completeExam();
    if (result) {
      router.replace({
        pathname: '/learn/exam-result' as never,
        params: {
          score: result.score.toString(),
          passed: result.passed ? '1' : '0',
          correct: result.correctAnswers.toString(),
          total: result.totalQuestions.toString(),
          level: result.cefrLevel,
          cert: result.certificateNumber ?? '',
          recommendation: result.recommendation ?? '',
        },
      } as never);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: colors.foreground }}>
              Вопрос {currentIndex + 1} / {total}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: timeLeft < 60 ? colors.error : colors.primary }}>
                ⏱ {minutes}:{seconds.toString().padStart(2, '0')}
              </Text>
              <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: colors.primary }}>
                {currentSession.cefrLevel}
              </Text>
            </View>
          </View>
          {/* Progress */}
          <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: colors.primary, width: `${progress}%`, borderRadius: 3 }} />
          </View>
        </View>

        {/* Question Card */}
        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <View style={{
            backgroundColor: isListening ? '#1E3A5F' : colors.primary,
            borderRadius: 20, padding: 20, marginBottom: 20,
          }}>
            <Text style={{ fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' }}>
              {question.category ?? 'Вопрос'}
            </Text>
            {isListening ? (
              <>
                {/* Listening: Audio Player */}
                <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: '#fff', marginBottom: 16, lineHeight: fontSizes.lg * 1.4 }}>
                  🎧 Hörverstehen
                </Text>
                <Text style={{ fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.75)', marginBottom: 16, lineHeight: fontSizes.sm * 1.5 }}>
                  Höre den Text und beantworte die Frage. (Максимум 2 прослушивания)
                </Text>

                {/* Play Button */}
                <Pressable
                  onPress={() => playAudio(question.audioText ?? '')}
                  disabled={audioPlayCount >= 2 && !audioPlaying}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    gap: 10, backgroundColor: audioPlaying ? '#EF4444' : '#22C55E',
                    borderRadius: 14, padding: 14, opacity: (audioPlayCount >= 2 && !audioPlaying) ? 0.4 : (pressed ? 0.85 : 1),
                  })}
                >
                  <Text style={{ fontSize: 22 }}>{audioPlaying ? '⏹' : '▶️'}</Text>
                  <Text style={{ fontSize: fontSizes.base, fontWeight: '800', color: '#fff' }}>
                    {audioPlaying ? 'Stopp' : audioPlayCount === 0 ? 'Audio abspielen' : `Nochmal (${2 - audioPlayCount} übrig)`}
                  </Text>
                </Pressable>

                {audioPlayCount >= 2 && (
                  <Text style={{ fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.6)', marginTop: 8, textAlign: 'center' }}>
                    Maximale Anzahl erreicht
                  </Text>
                )}

                {/* Question after audio */}
                {audioPlayed && (
                  <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' }}>
                    <Text style={{ fontSize: fontSizes.base, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
                      {question.russian}
                    </Text>
                    <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: '#fff', lineHeight: fontSizes.lg * 1.4 }}>
                      {question.german}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={{ fontSize: fontSizes.xl, fontWeight: '700', color: '#fff', lineHeight: fontSizes.xl * 1.4 }}>
                  {question.russian}
                </Text>
              </>
            )}
          </View>

          {/* Answers — only show for listening after audio played */}
          {isListening ? (
            audioPlayed ? (
              <View style={{ gap: 10 }}>
                {(question.options ?? []).map((option, i) => {
                  const isSelected = selectedAnswer === option;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => handleSelectAnswer(option)}
                      style={({ pressed }) => ({
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderRadius: 16, padding: 16, borderWidth: 2,
                        borderColor: isSelected ? colors.primary : colors.border,
                        opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
                      })}
                    >
                      <Text style={{ fontSize: fontSizes.base, fontWeight: isSelected ? '700' : '500', color: isSelected ? '#fff' : colors.foreground }}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={{ padding: 16, backgroundColor: colors.surface, borderRadius: 16, alignItems: 'center' }}>
                <Text style={{ fontSize: fontSizes.base, color: colors.muted, textAlign: 'center' }}>
                  ☝️ Höre zuerst den Audio-Text
                </Text>
                <Text style={{ fontSize: fontSizes.sm, color: colors.muted, textAlign: 'center', marginTop: 4 }}>
                  (Сначала прослушай аудио)
                </Text>
              </View>
            )
          ) : isFillBlank ? (
            <View style={{ gap: 12 }}>
              <TextInput
                value={fillAnswer}
                onChangeText={setFillAnswer}
                placeholder="Введи ответ..."
                placeholderTextColor={colors.muted}
                editable={!confirmed}
                returnKeyType="done"
                onSubmitEditing={handleConfirmFill}
                style={{
                  backgroundColor: colors.surface, borderRadius: 16, padding: 16,
                  fontSize: fontSizes.lg, color: colors.foreground,
                  borderWidth: 1, borderColor: confirmed ? colors.success : colors.border,
                }}
              />
              {!confirmed && (
                <Pressable
                  onPress={handleConfirmFill}
                  disabled={!fillAnswer.trim()}
                  style={({ pressed }) => ({
                    backgroundColor: fillAnswer.trim() ? colors.primary : colors.border,
                    borderRadius: 14, padding: 14, alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: '#fff' }}>
                    Подтвердить
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {(question.options ?? []).map((option, i) => {
                const isSelected = selectedAnswer === option;
                return (
                  <Pressable
                    key={i}
                    onPress={() => handleSelectAnswer(option)}
                    style={({ pressed }) => ({
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderRadius: 16, padding: 16, borderWidth: 2,
                      borderColor: isSelected ? colors.primary : colors.border,
                      opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    <Text style={{ fontSize: fontSizes.base, fontWeight: isSelected ? '700' : '500', color: isSelected ? '#fff' : colors.foreground }}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Next Button */}
        {(selectedAnswer !== null || confirmed) && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => ({
                backgroundColor: colors.success, borderRadius: 16, padding: 16, alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: '#fff' }}>
                {isLastQuestion ? 'Завершить экзамен →' : 'Следующий вопрос →'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Skip */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 10, alignItems: 'center' })}
          >
            <Text style={{ fontSize: fontSizes.sm, color: colors.muted }}>
              Пропустить вопрос
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
