import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, Platform,
  KeyboardAvoidingView, Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { vocabularyData, vocabularyDataExtra } from '@/lib/vocabulary-data';
import type { Word } from '@/lib/types';

// ─── Typen ──────────────────────────────────────────────────────────────────

type DictationState = 'setup' | 'listening' | 'answered' | 'finished';
type LevelFilter = 'all' | 'A1' | 'A2' | 'B1' | 'B2';
type CountOption = 10 | 15 | 20 | 30;

const ALL_WORDS: Word[] = [...vocabularyData, ...vocabularyDataExtra];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/^(der|die|das)\s+/i, '')
    .replace(/[.,!?;:]/g, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
}

function checkAnswer(input: string, word: Word): boolean {
  const inp = normalize(input);
  const de = normalize(word.german);
  const ru = word.russian.toLowerCase().trim();
  return inp === de || inp === ru || inp === word.russian.toLowerCase().trim();
}

// ─── Hauptkomponente ─────────────────────────────────────────────────────────

export default function DictationScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();

  // Setup
  const [count, setCount] = useState<CountOption>(15);
  const [level, setLevel] = useState<LevelFilter>('A1');
  const [mode, setMode] = useState<'de_to_ru' | 'ru_to_de'>('de_to_ru');

  // Spielzustand
  const [state, setState] = useState<DictationState>('setup');
  const [playlist, setPlaylist] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasHeard, setHasHeard] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const currentWord = playlist[currentIndex];

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  // ── Playlist generieren ────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    let words = ALL_WORDS;
    if (level !== 'all') words = words.filter(w => w.cefrLevel === level);
    words = shuffle(words).slice(0, count);
    setPlaylist(words);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setWrongWords([]);
    setUserInput('');
    setIsCorrect(null);
    setHasHeard(false);
    setState('listening');
  }, [level, count]);

  // ── Wort sprechen ──────────────────────────────────────────────────────────
  const speakCurrent = useCallback((word: Word) => {
    if (Platform.OS === 'web') return;
    setIsSpeaking(true);
    const text = mode === 'de_to_ru'
      ? word.german.replace(/^(der|die|das)\s+/i, '')
      : word.russian;
    const lang = mode === 'de_to_ru' ? 'de-DE' : 'ru-RU';
    Speech.speak(text, {
      language: lang,
      rate: 0.8,
      onDone: () => { setIsSpeaking(false); setHasHeard(true); },
      onError: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
    setHasHeard(true);
  }, [mode]);

  // Auto-speak beim Laden eines neuen Wortes
  useEffect(() => {
    if (state === 'listening' && currentWord) {
      setHasHeard(false);
      setUserInput('');
      setIsCorrect(null);
      const timer = setTimeout(() => {
        speakCurrent(currentWord);
        setTimeout(() => inputRef.current?.focus(), 400);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, state, currentWord, speakCurrent]);

  // ── Antwort prüfen ─────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!currentWord || !userInput.trim()) return;
    Keyboard.dismiss();

    const correct = checkAnswer(userInput, currentWord);
    setIsCorrect(correct);
    setState('answered');

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setScore(s => s + 1);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setStreak(0);
      setWrongWords(w => [...w, currentWord]);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  // ── Nächstes Wort ──────────────────────────────────────────────────────────
  const handleNext = () => {
    Speech.stop();
    if (currentIndex + 1 >= playlist.length) {
      setState('finished');
    } else {
      setCurrentIndex(i => i + 1);
      setState('listening');
    }
  };

  const progress = playlist.length > 0 ? (currentIndex + 1) / playlist.length : 0;
  const accuracy = currentIndex > 0 ? Math.round((score / (state === 'answered' ? currentIndex + 1 : currentIndex)) * 100) : 0;

  // ─── SETUP-SCREEN ────────────────────────────────────────────────────────────
  if (state === 'setup') {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 12 }}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Text style={{ fontSize: fontSizes.xl, color: colors.muted }}>‹</Text>
            </Pressable>
            <View>
              <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.foreground }}>✍️ Диктант</Text>
              <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>Слушай и пиши перевод</Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, gap: 16 }}>
            {/* Modus */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>🔄 Режим</Text>
              <View style={{ gap: 8 }}>
                {[
                  { key: 'de_to_ru', label: '🇩🇪 → 🇷🇺', desc: 'Слышишь немецкое слово, пишешь по-русски' },
                  { key: 'ru_to_de', label: '🇷🇺 → 🇩🇪', desc: 'Слышишь русское слово, пишешь по-немецки' },
                ].map(m => (
                  <Pressable
                    key={m.key}
                    onPress={() => setMode(m.key as typeof mode)}
                    style={({ pressed }) => ({
                      flexDirection: 'row', alignItems: 'center', gap: 12,
                      padding: 12, borderRadius: 12,
                      backgroundColor: mode === m.key ? colors.primary + '15' : colors.background,
                      borderWidth: 2, borderColor: mode === m.key ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <View style={{
                      width: 22, height: 22, borderRadius: 11,
                      borderWidth: 2, borderColor: mode === m.key ? colors.primary : colors.border,
                      backgroundColor: mode === m.key ? colors.primary : 'transparent',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      {mode === m.key && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' }} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: mode === m.key ? colors.primary : colors.foreground }}>{m.label}</Text>
                      <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>{m.desc}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Level */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>🎯 Уровень</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['all', 'A1', 'A2', 'B1', 'B2'] as LevelFilter[]).map(l => (
                  <Pressable
                    key={l}
                    onPress={() => setLevel(l)}
                    style={({ pressed }) => ({
                      flex: 1, backgroundColor: level === l ? colors.primary : colors.background,
                      borderRadius: 12, padding: 10, alignItems: 'center',
                      borderWidth: 1.5, borderColor: level === l ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ fontSize: fontSizes.xs, fontWeight: '700', color: level === l ? '#fff' : colors.foreground }}>
                      {l === 'all' ? 'Все' : l}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Anzahl */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>📚 Количество слов</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {([10, 15, 20, 30] as CountOption[]).map(n => (
                  <Pressable
                    key={n}
                    onPress={() => setCount(n)}
                    style={({ pressed }) => ({
                      flex: 1, backgroundColor: count === n ? colors.primary : colors.background,
                      borderRadius: 12, padding: 10, alignItems: 'center',
                      borderWidth: 1.5, borderColor: count === n ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ fontSize: fontSizes.base, fontWeight: '800', color: count === n ? '#fff' : colors.foreground }}>{n}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Info-Box */}
            <View style={{ backgroundColor: colors.primary + '12', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.primary + '30' }}>
              <Text style={{ fontSize: fontSizes.sm, color: colors.primary, fontWeight: '600', lineHeight: 20 }}>
                💡 Как это работает:{'\n'}
                Нажми кнопку 🔊 чтобы услышать слово, затем введи перевод и нажми «Проверить». Умляуты можно писать как ae/oe/ue/ss.
              </Text>
            </View>

            {/* Start */}
            <Pressable
              onPress={startGame}
              style={({ pressed }) => ({
                backgroundColor: colors.primary, borderRadius: 18, padding: 18,
                alignItems: 'center', opacity: pressed ? 0.85 : 1,
                shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
              })}
            >
              <Text style={{ fontSize: fontSizes.xl, fontWeight: '900', color: '#fff' }}>✍️ Начать диктант</Text>
              <Text style={{ fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                {count} слов · уровень {level === 'all' ? 'все' : level}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ─── ERGEBNIS-SCREEN ─────────────────────────────────────────────────────────
  if (state === 'finished') {
    const pct = Math.round((score / playlist.length) * 100);
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚';
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 64 }}>{emoji}</Text>
            <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '900', color: colors.foreground, marginTop: 8 }}>
              {pct}% правильно
            </Text>
            <Text style={{ fontSize: fontSizes.base, color: colors.muted, marginTop: 4 }}>
              {score} из {playlist.length} слов
            </Text>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Правильно', value: score, color: colors.success },
              { label: 'Ошибки', value: playlist.length - score, color: colors.error },
              { label: 'Лучшая серия', value: bestStreak, color: colors.primary },
            ].map(s => (
              <View key={s.label} style={{
                flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 14,
                alignItems: 'center', borderWidth: 1, borderColor: colors.border,
              }}>
                <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '900', color: s.color }}>{s.value}</Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, textAlign: 'center', marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Falsche Wörter */}
          {wrongWords.length > 0 && (
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 20 }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
                📝 Слова для повторения ({wrongWords.length})
              </Text>
              {wrongWords.map((w, i) => (
                <View key={w.id} style={{
                  flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
                  borderBottomWidth: i < wrongWords.length - 1 ? 0.5 : 0, borderBottomColor: colors.border,
                }}>
                  <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: colors.error, flex: 1 }}>{w.german}</Text>
                  <Text style={{ fontSize: fontSizes.sm, color: colors.muted, flex: 1, textAlign: 'right' }}>{w.russian}</Text>
                </View>
              ))}
            </View>
          )}

          <Pressable
            onPress={startGame}
            style={({ pressed }) => ({
              backgroundColor: colors.primary, borderRadius: 16, padding: 16,
              alignItems: 'center', marginBottom: 12, opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontSize: fontSizes.lg, fontWeight: '800', color: '#fff' }}>🔄 Ещё раз</Text>
          </Pressable>
          <Pressable
            onPress={() => setState('setup')}
            style={({ pressed }) => ({
              backgroundColor: colors.surface, borderRadius: 16, padding: 16,
              alignItems: 'center', borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground }}>⚙️ Настройки</Text>
          </Pressable>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ─── SPIEL-SCREEN ─────────────────────────────────────────────────────────────
  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 12 }}>
            <Pressable onPress={() => { Speech.stop(); setState('setup'); }} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Text style={{ fontSize: fontSizes.xl, color: colors.muted }}>‹</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>
                  Слово {currentIndex + 1} / {playlist.length}
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>
                  ✅ {score}  🔥 {streak}
                </Text>
              </View>
              <View style={{ height: 5, backgroundColor: colors.border, borderRadius: 3 }}>
                <View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: colors.primary, borderRadius: 3 }} />
              </View>
            </View>
          </View>

          {currentWord && (
            <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
              {/* Wort-Karte */}
              <View style={{
                backgroundColor: colors.surface, borderRadius: 24, padding: 28,
                alignItems: 'center', borderWidth: 1, borderColor: colors.border,
                marginBottom: 20,
                ...(isCorrect === true ? { borderColor: colors.success, borderWidth: 2 } : {}),
                ...(isCorrect === false ? { borderColor: colors.error, borderWidth: 2 } : {}),
              }}>
                {/* Level-Badge */}
                <View style={{
                  backgroundColor: currentWord.cefrLevel === 'A1' ? '#10B981' : currentWord.cefrLevel === 'A2' ? '#3B82F6' : currentWord.cefrLevel === 'B1' ? '#F59E0B' : '#EF4444',
                  borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 16,
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{currentWord.cefrLevel}</Text>
                </View>

                {/* Sprechen-Button */}
                <Pressable
                  onPress={() => speakCurrent(currentWord)}
                  style={({ pressed }) => ({
                    width: 80, height: 80, borderRadius: 40,
                    backgroundColor: isSpeaking ? colors.primary : colors.primary + '20',
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 3, borderColor: colors.primary,
                    opacity: pressed ? 0.7 : 1,
                    marginBottom: 12,
                  })}
                >
                  <Text style={{ fontSize: 36 }}>{isSpeaking ? '🔊' : '🔈'}</Text>
                </Pressable>

                <Text style={{ fontSize: fontSizes.sm, color: colors.muted, textAlign: 'center' }}>
                  {isSpeaking ? 'Слушай...' : hasHeard ? 'Нажми снова чтобы повторить' : 'Нажми чтобы услышать слово'}
                </Text>

                {/* Hinweis: Kategorie */}
                <View style={{ marginTop: 12, backgroundColor: colors.border + '60', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>
                    Категория: {currentWord.category}
                  </Text>
                </View>

                {/* Antwort-Feedback */}
                {state === 'answered' && (
                  <View style={{
                    marginTop: 16, width: '100%',
                    backgroundColor: isCorrect ? colors.success + '15' : colors.error + '15',
                    borderRadius: 14, padding: 14, alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: fontSizes.xl, marginBottom: 4 }}>
                      {isCorrect ? '✅ Правильно!' : '❌ Неправильно'}
                    </Text>
                    {!isCorrect && (
                      <>
                        <Text style={{ fontSize: fontSizes.sm, color: colors.muted }}>Правильный ответ:</Text>
                        <Text style={{ fontSize: fontSizes.lg, fontWeight: '800', color: colors.foreground, marginTop: 4 }}>
                          {mode === 'de_to_ru' ? currentWord.russian : currentWord.german}
                        </Text>
                      </>
                    )}
                    {currentWord.ipa && (
                      <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 4 }}>{currentWord.ipa}</Text>
                    )}
                  </View>
                )}
              </View>

              {/* Eingabefeld */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: colors.muted, marginBottom: 8 }}>
                  {mode === 'de_to_ru' ? '🇷🇺 Напиши по-русски:' : '🇩🇪 Напиши по-немецки:'}
                </Text>
                <TextInput
                  ref={inputRef}
                  value={userInput}
                  onChangeText={setUserInput}
                  placeholder={mode === 'de_to_ru' ? 'Перевод на русский...' : 'Перевод на немецкий...'}
                  placeholderTextColor={colors.muted}
                  editable={state === 'listening'}
                  onSubmitEditing={state === 'listening' ? handleSubmit : undefined}
                  returnKeyType="done"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
                    fontSize: fontSizes.lg, color: colors.foreground,
                    borderWidth: 2,
                    borderColor: state === 'answered'
                      ? (isCorrect ? colors.success : colors.error)
                      : userInput.length > 0 ? colors.primary : colors.border,
                  }}
                />
              </View>

              {/* Aktions-Button */}
              {state === 'listening' ? (
                <Pressable
                  onPress={handleSubmit}
                  disabled={!userInput.trim() || !hasHeard}
                  style={({ pressed }) => ({
                    backgroundColor: (!userInput.trim() || !hasHeard) ? colors.border : colors.primary,
                    borderRadius: 16, padding: 16, alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontSize: fontSizes.lg, fontWeight: '800', color: '#fff' }}>
                    {!hasHeard ? '🔈 Сначала прослушай слово' : '✓ Проверить'}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={handleNext}
                  style={({ pressed }) => ({
                    backgroundColor: colors.primary, borderRadius: 16, padding: 16,
                    alignItems: 'center', opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontSize: fontSizes.lg, fontWeight: '800', color: '#fff' }}>
                    {currentIndex + 1 >= playlist.length ? '🏁 Завершить' : '→ Следующее слово'}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
