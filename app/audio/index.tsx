import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, Switch, Platform, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { vocabularyData, vocabularyDataExtra } from '@/lib/vocabulary-data';
import type { Word } from '@/lib/types';

// ─── Typen ──────────────────────────────────────────────────────────────────

type PlayState = 'idle' | 'playing' | 'paused' | 'finished';
type SpeedOption = 0.5 | 0.75 | 1.0 | 1.25;
type CountOption = 10 | 20 | 30 | 50;
type LevelFilter = 'all' | 'A1' | 'A2' | 'B1' | 'B2';

const ALL_WORDS: Word[] = [...vocabularyData, ...vocabularyDataExtra];

const CATEGORIES = ['Все', 'Еда', 'Дом', 'Транспорт', 'Профессии', 'Природа', 'Тело', 'Цвета', 'Время', 'Технологии', 'Путешествия', 'Здоровье', 'Образование', 'Спорт', 'Хобби', 'Фразы'];

const SPEED_LABELS: Record<SpeedOption, string> = {
  0.5: '0.5×  Очень медленно',
  0.75: '0.75×  Медленно',
  1.0: '1.0×  Нормально',
  1.25: '1.25×  Быстро',
};

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function filterWords(level: LevelFilter, category: string, count: CountOption): Word[] {
  let words = ALL_WORDS;
  if (level !== 'all') words = words.filter(w => w.cefrLevel === level);
  if (category !== 'Все') words = words.filter(w => w.category === category);
  words = shuffle(words);
  return words.slice(0, count);
}

// ─── Hauptkomponente ─────────────────────────────────────────────────────────

export default function AudioLearnScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();

  // Konfiguration
  const [count, setCount] = useState<CountOption>(20);
  const [level, setLevel] = useState<LevelFilter>('all');
  const [category, setCategory] = useState('Все');
  const [speed, setSpeed] = useState<SpeedOption>(0.75);
  const [loopMode, setLoopMode] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [pauseSeconds, setPauseSeconds] = useState(2);

  // Wiedergabe-Zustand
  const [playlist, setPlaylist] = useState<Word[]>([]);
  const [playState, setPlayState] = useState<PlayState>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'de' | 'pause1' | 'ru' | 'pause2'>('de');
  const [isConfiguring, setIsConfiguring] = useState(true);

  // Refs für async-sichere Steuerung
  const cancelledRef = useRef(false);
  const pausedRef = useRef(false);
  const currentIndexRef = useRef(0);

  // Screen bleibt an während Wiedergabe
  useKeepAwake();

  // ── Cleanup beim Verlassen ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      Speech.stop();
    };
  }, []);

  // ── Playlist generieren ────────────────────────────────────────────────────
  const generatePlaylist = useCallback(() => {
    const words = filterWords(level, category, count);
    setPlaylist(words);
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setPlayState('idle');
    setPhase('de');
  }, [level, category, count]);

  useEffect(() => {
    generatePlaylist();
  }, [generatePlaylist]);

  // ── Warte-Hilfsfunktion ────────────────────────────────────────────────────
  const wait = (ms: number): Promise<void> =>
    new Promise(resolve => {
      const timeout = setTimeout(resolve, ms);
      // Wenn pausiert: warte bis fortgesetzt
      const check = setInterval(() => {
        if (cancelledRef.current) { clearTimeout(timeout); clearInterval(check); resolve(); }
      }, 100);
      setTimeout(() => clearInterval(check), ms + 200);
    });

  // ── Einzelnes Wort sprechen ────────────────────────────────────────────────
  const speakWord = (text: string, lang: string, rate: number): Promise<void> =>
    new Promise((resolve) => {
      if (cancelledRef.current) { resolve(); return; }
      Speech.speak(text, {
        language: lang,
        rate,
        onDone: resolve,
        onError: () => resolve(),
        onStopped: resolve,
      });
    });

  // ── Playlist abspielen ─────────────────────────────────────────────────────
  const runPlaylist = useCallback(async (words: Word[], startIndex: number) => {
    cancelledRef.current = false;
    pausedRef.current = false;

    for (let i = startIndex; i < words.length; i++) {
      if (cancelledRef.current) break;

      // Warte wenn pausiert
      while (pausedRef.current && !cancelledRef.current) {
        await wait(200);
      }
      if (cancelledRef.current) break;

      currentIndexRef.current = i;
      setCurrentIndex(i);

      const word = words[i];

      // Phase 1: Deutsches Wort
      setPhase('de');
      if (Platform.OS !== 'web') {
        await speakWord(word.german.replace(/^(der|die|das)\s+/i, ''), 'de-DE', speed);
      }
      if (cancelledRef.current) break;

      // Pause 1
      setPhase('pause1');
      await wait(pauseSeconds * 1000 * 0.6);
      if (cancelledRef.current) break;

      // Phase 2: Russische Übersetzung
      if (showTranslation) {
        setPhase('ru');
        if (Platform.OS !== 'web') {
          await speakWord(word.russian, 'ru-RU', speed);
        }
        if (cancelledRef.current) break;
      }

      // Pause 2 (zwischen Wörtern)
      setPhase('pause2');
      await wait(pauseSeconds * 1000);
      if (cancelledRef.current) break;
    }

    if (!cancelledRef.current) {
      if (loopMode) {
        // Loop: von vorne
        const newWords = filterWords(level, category, count);
        setPlaylist(newWords);
        setCurrentIndex(0);
        currentIndexRef.current = 0;
        setPhase('de');
        await runPlaylist(newWords, 0);
      } else {
        setPlayState('finished');
        setPhase('de');
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }
  }, [speed, pauseSeconds, showTranslation, loopMode, level, category, count]);

  // ── Play starten ───────────────────────────────────────────────────────────
  const handlePlay = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (playState === 'finished' || playlist.length === 0) {
      generatePlaylist();
      await wait(100);
    }
    setIsConfiguring(false);
    setPlayState('playing');
    pausedRef.current = false;
    runPlaylist(playlist, currentIndexRef.current);
  };

  // ── Pause ──────────────────────────────────────────────────────────────────
  const handlePause = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    pausedRef.current = true;
    Speech.stop();
    setPlayState('paused');
  };

  // ── Fortsetzen ─────────────────────────────────────────────────────────────
  const handleResume = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    pausedRef.current = false;
    setPlayState('playing');
    runPlaylist(playlist, currentIndexRef.current);
  };

  // ── Nächstes Wort ──────────────────────────────────────────────────────────
  const handleSkip = () => {
    Speech.stop();
    const next = Math.min(currentIndexRef.current + 1, playlist.length - 1);
    currentIndexRef.current = next;
    setCurrentIndex(next);
    setPhase('de');
    if (playState === 'playing') {
      pausedRef.current = false;
      runPlaylist(playlist, next);
    }
  };

  // ── Vorheriges Wort ────────────────────────────────────────────────────────
  const handlePrev = () => {
    Speech.stop();
    const prev = Math.max(currentIndexRef.current - 1, 0);
    currentIndexRef.current = prev;
    setCurrentIndex(prev);
    setPhase('de');
    if (playState === 'playing') {
      pausedRef.current = false;
      runPlaylist(playlist, prev);
    }
  };

  // ── Stop / Neu konfigurieren ───────────────────────────────────────────────
  const handleStop = () => {
    cancelledRef.current = true;
    Speech.stop();
    setPlayState('idle');
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setPhase('de');
    setIsConfiguring(true);
  };

  const currentWord = playlist[currentIndex];
  const progress = playlist.length > 0 ? (currentIndex + 1) / playlist.length : 0;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 12 }}>
          <Pressable onPress={() => { handleStop(); router.back(); }} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: fontSizes.xl, color: colors.muted }}>‹</Text>
          </Pressable>
          <View>
            <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.foreground }}>
              🎧 Аудио-обучение
            </Text>
            <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>
              Слушай слова на немецком и по-русски
            </Text>
          </View>
        </View>

        {/* Player Card — wird angezeigt wenn Wiedergabe läuft */}
        {!isConfiguring && playlist.length > 0 && (
          <View style={{
            marginHorizontal: 20, marginBottom: 20,
            backgroundColor: colors.primary, borderRadius: 24, padding: 24,
            shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
          }}>
            {/* Fortschrittsbalken */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.8)' }}>
                  Слово {currentIndex + 1} из {playlist.length}
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.8)' }}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3 }}>
                <View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: '#fff', borderRadius: 3 }} />
              </View>
            </View>

            {/* Aktuelles Wort */}
            {currentWord && (
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                {/* Phase-Indikator */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  {[
                    { key: 'de', label: '🇩🇪 DE' },
                    { key: 'pause1', label: '⏸' },
                    { key: 'ru', label: '🇷🇺 RU' },
                    { key: 'pause2', label: '⏸' },
                  ].map(p => (
                    <View key={p.key} style={{
                      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
                      backgroundColor: phase === p.key ? '#fff' : 'rgba(255,255,255,0.2)',
                    }}>
                      <Text style={{
                        fontSize: fontSizes.xs, fontWeight: '700',
                        color: phase === p.key ? colors.primary : 'rgba(255,255,255,0.8)',
                      }}>
                        {p.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Deutsches Wort */}
                <Text style={{ fontSize: fontSizes['3xl'] ?? 32, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 4 }}>
                  {currentWord.german}
                </Text>

                {/* IPA */}
                {currentWord.ipa && (
                  <Text style={{ fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                    {currentWord.ipa}
                  </Text>
                )}

                {/* Russische Übersetzung */}
                {showTranslation && (
                  <Text style={{ fontSize: fontSizes.xl, color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
                    {currentWord.russian}
                  </Text>
                )}

                {/* Beispielsatz */}
                {currentWord.examples?.[0] && (
                  <View style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, width: '100%' }}>
                    <Text style={{ fontSize: fontSizes.xs, color: '#fff', textAlign: 'center', fontStyle: 'italic' }}>
                      {currentWord.examples[0].de}
                    </Text>
                    <Text style={{ fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 2 }}>
                      {currentWord.examples[0].ru}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Steuerungsknöpfe */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              {/* Zurück */}
              <Pressable
                onPress={handlePrev}
                style={({ pressed }) => ({
                  width: 48, height: 48, borderRadius: 24,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center', justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: 22, color: '#fff' }}>⏮</Text>
              </Pressable>

              {/* Play/Pause/Resume */}
              <Pressable
                onPress={playState === 'playing' ? handlePause : (playState === 'paused' ? handleResume : handlePlay)}
                style={({ pressed }) => ({
                  width: 72, height: 72, borderRadius: 36,
                  backgroundColor: '#fff',
                  alignItems: 'center', justifyContent: 'center',
                  opacity: pressed ? 0.85 : 1,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
                })}
              >
                {playState === 'playing' ? (
                  <Text style={{ fontSize: 28 }}>⏸</Text>
                ) : playState === 'paused' ? (
                  <Text style={{ fontSize: 28 }}>▶️</Text>
                ) : playState === 'finished' ? (
                  <Text style={{ fontSize: 28 }}>🔄</Text>
                ) : (
                  <Text style={{ fontSize: 28 }}>▶️</Text>
                )}
              </Pressable>

              {/* Weiter */}
              <Pressable
                onPress={handleSkip}
                style={({ pressed }) => ({
                  width: 48, height: 48, borderRadius: 24,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center', justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: 22, color: '#fff' }}>⏭</Text>
              </Pressable>
            </View>

            {/* Stop-Button */}
            <Pressable
              onPress={handleStop}
              style={({ pressed }) => ({
                marginTop: 16, alignItems: 'center', opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                ⏹ Остановить и настроить
              </Text>
            </Pressable>

            {/* Fertig-Anzeige */}
            {playState === 'finished' && (
              <View style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: fontSizes.lg, fontWeight: '800', color: '#fff' }}>
                  🎉 Готово! {playlist.length} слов прослушано
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Konfiguration */}
        {isConfiguring && (
          <View style={{ paddingHorizontal: 20 }}>

            {/* Wortanzahl */}
            <View style={{ marginBottom: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
                📚 Количество слов
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {([10, 20, 30, 50] as CountOption[]).map(n => (
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
                    <Text style={{ fontSize: fontSizes.base, fontWeight: '800', color: count === n ? '#fff' : colors.foreground }}>
                      {n}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Level-Filter */}
            <View style={{ marginBottom: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
                🎯 Уровень
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['all', 'A1', 'A2', 'B1', 'B2'] as LevelFilter[]).map(l => (
                  <Pressable
                    key={l}
                    onPress={() => setLevel(l)}
                    style={({ pressed }) => ({
                      flex: 1, backgroundColor: level === l ? colors.primary : colors.background,
                      borderRadius: 12, padding: 8, alignItems: 'center',
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

            {/* Kategorie-Filter */}
            <View style={{ marginBottom: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
                🗂 Категория
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={({ pressed }) => ({
                        backgroundColor: category === cat ? colors.primary : colors.background,
                        borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
                        borderWidth: 1.5, borderColor: category === cat ? colors.primary : colors.border,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ fontSize: fontSizes.xs, fontWeight: '700', color: category === cat ? '#fff' : colors.foreground }}>
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Geschwindigkeit */}
            <View style={{ marginBottom: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
                ⚡ Скорость речи
              </Text>
              {([0.5, 0.75, 1.0, 1.25] as SpeedOption[]).map(s => (
                <Pressable
                  key={s}
                  onPress={() => setSpeed(s)}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, marginBottom: 6,
                    backgroundColor: speed === s ? colors.primary + '20' : 'transparent',
                    borderWidth: 1.5, borderColor: speed === s ? colors.primary : 'transparent',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ fontSize: fontSizes.sm, fontWeight: speed === s ? '700' : '500', color: speed === s ? colors.primary : colors.foreground }}>
                    {SPEED_LABELS[s]}
                  </Text>
                  {speed === s && <Text style={{ fontSize: 16 }}>✓</Text>}
                </Pressable>
              ))}
            </View>

            {/* Pause-Dauer */}
            <View style={{ marginBottom: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
                ⏱ Пауза между словами: {pauseSeconds} сек
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[1, 2, 3, 5].map(s => (
                  <Pressable
                    key={s}
                    onPress={() => setPauseSeconds(s)}
                    style={({ pressed }) => ({
                      flex: 1, backgroundColor: pauseSeconds === s ? colors.primary : colors.background,
                      borderRadius: 12, padding: 10, alignItems: 'center',
                      borderWidth: 1.5, borderColor: pauseSeconds === s ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: pauseSeconds === s ? '#fff' : colors.foreground }}>
                      {s}с
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Optionen */}
            <View style={{ marginBottom: 20, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: colors.foreground }}>
                    🇷🇺 Произносить перевод
                  </Text>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>
                    Немецкое слово → пауза → русский перевод
                  </Text>
                </View>
                <Switch
                  value={showTranslation}
                  onValueChange={setShowTranslation}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
              <View style={{ height: 1, backgroundColor: colors.border }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: colors.foreground }}>
                    🔁 Повторять список
                  </Text>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>
                    После конца начинать заново
                  </Text>
                </View>
                <Switch
                  value={loopMode}
                  onValueChange={setLoopMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Vorschau der Wörter */}
            <View style={{ marginBottom: 20, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
                📋 Список слов ({playlist.length} слов)
              </Text>
              {playlist.slice(0, 8).map((word, i) => (
                <View key={word.id} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  paddingVertical: 6, borderBottomWidth: i < 7 ? 0.5 : 0, borderBottomColor: colors.border,
                }}>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.muted, width: 20, textAlign: 'right' }}>
                    {i + 1}.
                  </Text>
                  <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: colors.foreground, flex: 1 }}>
                    {word.german}
                  </Text>
                  <Text style={{ fontSize: fontSizes.sm, color: colors.muted, flex: 1 }}>
                    {word.russian}
                  </Text>
                  <View style={{
                    backgroundColor: word.cefrLevel === 'A1' ? '#10B981' : word.cefrLevel === 'A2' ? '#3B82F6' : word.cefrLevel === 'B1' ? '#F59E0B' : '#EF4444',
                    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
                  }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#fff' }}>{word.cefrLevel}</Text>
                  </View>
                </View>
              ))}
              {playlist.length > 8 && (
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, textAlign: 'center', marginTop: 8 }}>
                  + ещё {playlist.length - 8} слов
                </Text>
              )}
            </View>

            {/* Neue Playlist generieren */}
            <Pressable
              onPress={generatePlaylist}
              style={({ pressed }) => ({
                marginBottom: 12, backgroundColor: colors.surface, borderRadius: 14,
                padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary }}>
                🔀 Перемешать список заново
              </Text>
            </Pressable>

            {/* Start-Button */}
            <Pressable
              onPress={handlePlay}
              style={({ pressed }) => ({
                backgroundColor: colors.primary, borderRadius: 18, padding: 18,
                alignItems: 'center', opacity: pressed ? 0.85 : 1,
                shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
              })}
            >
              <Text style={{ fontSize: fontSizes.xl, fontWeight: '900', color: '#fff' }}>
                ▶  Начать прослушивание
              </Text>
              <Text style={{ fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                {playlist.length} слов · {speed}× скорость · {pauseSeconds}с пауза
              </Text>
            </Pressable>

            {Platform.OS === 'web' && (
              <View style={{ marginTop: 12, backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12 }}>
                <Text style={{ fontSize: fontSizes.xs, color: '#92400E', textAlign: 'center' }}>
                  ⚠️ TTS-Wiedergabe ist nur in der nativen App (iOS/Android) verfügbar
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
