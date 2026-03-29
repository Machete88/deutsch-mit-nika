/**
 * Audio-Lernen Screen
 * Wörter hören, Niveau & Tempo wählen, Kategorien
 */
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNikaTheme } from '@/lib/nika-theme-context';
import { useVocabulary } from '@/lib/vocabulary-context';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';

const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;
const SPEEDS = [
  { label: 'Langsam', value: 0.7, emoji: '🐢' },
  { label: 'Normal', value: 1.0, emoji: '🚶' },
  { label: 'Schnell', value: 1.3, emoji: '🏃' },
];

export default function AudioLernenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useNikaTheme();
  const { words } = useVocabulary();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);

  const [selectedLevel, setSelectedLevel] = useState<string>('A1');
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedCount, setPlayedCount] = useState(0);

  const filteredWords = words.filter((w: any) => w.level === selectedLevel);
  const currentWord = filteredWords[currentIndex];

  const bg = isDark ? '#0A0618' : '#F7F4FD';
  const cardBg = isDark ? colors.glass2 : 'rgba(124,58,237,0.06)';
  const cardBorder = isDark ? colors.purple500 + '44' : 'rgba(124,58,237,0.18)';
  const textPrimary = isDark ? colors.textPrimary : '#1E1033';
  const textMuted = isDark ? colors.textMuted : '#6B5B8A';

  const speakWord = useCallback(async (word: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      if (Platform.OS !== 'web') {
        const Speech = require('expo-speech');
        if (Speech && typeof Speech.speak === 'function') {
          Speech.speak(word, {
            language: 'de-DE',
            rate: selectedSpeed,
            pitch: 1.0,
            onDone: () => { setIsPlaying(false); setPlayedCount(c => c + 1); },
            onError: () => setIsPlaying(false),
          });
        } else {
          setIsPlaying(false);
        }
      } else if ('speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(word);
        utt.lang = 'de-DE';
        utt.rate = selectedSpeed;
        utt.onend = () => { setIsPlaying(false); setPlayedCount(c => c + 1); };
        utt.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utt);
      } else {
        setIsPlaying(false);
      }
    } catch {
      setIsPlaying(false);
    }
  }, [isPlaying, selectedSpeed]);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const handleNext = () => {
    if (currentIndex < filteredWords.length - 1) setCurrentIndex(i => i + 1);
  };

  return (
    <View style={[styles.root, { backgroundColor: bg, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.purple500 + '22' }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 8 })}>
          <Text style={{ fontSize: 22, color: textPrimary }}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: textPrimary, fontSize: fontSizes.xl }]}>🎧 Audio-Lernen</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Level-Auswahl */}
        <Text style={[styles.sectionLabel, { color: textMuted, fontSize: fontSizes.xs }]}>NIVEAU</Text>
        <View style={styles.levelRow}>
          {LEVELS.map(level => (
            <Pressable
              key={level}
              onPress={() => { setSelectedLevel(level); setCurrentIndex(0); }}
              style={({ pressed }) => [
                styles.levelBtn,
                { backgroundColor: selectedLevel === level ? colors.purple600 : cardBg, borderColor: selectedLevel === level ? colors.purple400 : cardBorder },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: selectedLevel === level ? '#fff' : textPrimary }}>{level}</Text>
            </Pressable>
          ))}
        </View>

        {/* Tempo-Auswahl */}
        <Text style={[styles.sectionLabel, { color: textMuted, fontSize: fontSizes.xs, marginTop: 20 }]}>SPRECHTEMPO</Text>
        <View style={styles.speedRow}>
          {SPEEDS.map(s => (
            <Pressable
              key={s.value}
              onPress={() => setSelectedSpeed(s.value)}
              style={({ pressed }) => [
                styles.speedBtn,
                { backgroundColor: selectedSpeed === s.value ? colors.neonCyan + '22' : cardBg, borderColor: selectedSpeed === s.value ? colors.neonCyan : cardBorder },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
              <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: selectedSpeed === s.value ? colors.neonCyan : textPrimary, marginTop: 4 }}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Wort-Karte */}
        {currentWord ? (
          <View style={[styles.wordCard, { backgroundColor: cardBg, borderColor: cardBorder, marginTop: 24 }]}>
            <Text style={{ fontSize: fontSizes.xs, color: textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              {currentIndex + 1} / {filteredWords.length} · {currentWord.category ?? ''}
            </Text>
            <Text style={{ fontSize: 40, fontWeight: '900', color: textPrimary, textAlign: 'center', marginBottom: 8 }}>
              {currentWord.german}
            </Text>
            <Text style={{ fontSize: fontSizes.lg, color: textMuted, textAlign: 'center', marginBottom: 20 }}>
              {currentWord.russian}
            </Text>

            {/* Play Button */}
            <Pressable
              onPress={() => speakWord(currentWord.german)}
              disabled={isPlaying}
              style={({ pressed }) => [
                styles.playBtn,
                { backgroundColor: isPlaying ? colors.purple700 : colors.purple600, opacity: (isPlaying || pressed) ? 0.8 : 1 },
              ]}
            >
              <Text style={{ fontSize: 28 }}>{isPlaying ? '🔊' : '▶️'}</Text>
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '800', color: '#fff', marginLeft: 10 }}>
                {isPlaying ? 'Spielt...' : 'Anhören'}
              </Text>
            </Pressable>

            {/* Navigation */}
            <View style={styles.navRow}>
              <Pressable
                onPress={handlePrev}
                disabled={currentIndex === 0}
                style={({ pressed }) => [styles.navBtn, { backgroundColor: cardBg, borderColor: cardBorder, opacity: currentIndex === 0 ? 0.3 : (pressed ? 0.7 : 1) }]}
              >
                <Text style={{ fontSize: fontSizes.lg, color: textPrimary }}>←</Text>
              </Pressable>
              <Text style={{ fontSize: fontSizes.sm, color: textMuted }}>{playedCount} gehört</Text>
              <Pressable
                onPress={handleNext}
                disabled={currentIndex === filteredWords.length - 1}
                style={({ pressed }) => [styles.navBtn, { backgroundColor: colors.purple600, opacity: currentIndex === filteredWords.length - 1 ? 0.3 : (pressed ? 0.7 : 1) }]}
              >
                <Text style={{ fontSize: fontSizes.lg, color: '#fff' }}>→</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={[styles.wordCard, { backgroundColor: cardBg, borderColor: cardBorder, marginTop: 24, alignItems: 'center' }]}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text style={{ fontSize: fontSizes.lg, color: textPrimary, fontWeight: '700', marginTop: 12 }}>Keine Wörter für {selectedLevel}</Text>
            <Text style={{ fontSize: fontSizes.sm, color: textMuted, marginTop: 6, textAlign: 'center' }}>Wähle ein anderes Niveau</Text>
          </View>
        )}

        {/* Tipp */}
        <View style={[styles.tipBox, { backgroundColor: colors.neonPurple + '11', borderColor: colors.neonPurple + '33' }]}>
          <Text style={{ fontSize: fontSizes.sm, color: textMuted, lineHeight: fontSizes.sm * 1.6 }}>
            💡 <Text style={{ fontWeight: '700', color: textPrimary }}>Tipp:</Text> Höre jedes Wort 3× und sprich es laut nach. Beginne langsam, dann erhöhe das Tempo.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontWeight: '800' },
  sectionLabel: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  levelRow: { flexDirection: 'row', gap: 10 },
  levelBtn: { flex: 1, borderRadius: 12, borderWidth: 1.5, paddingVertical: 12, alignItems: 'center' },
  speedRow: { flexDirection: 'row', gap: 10 },
  speedBtn: { flex: 1, borderRadius: 14, borderWidth: 1.5, paddingVertical: 14, alignItems: 'center' },
  wordCard: { borderRadius: 24, borderWidth: 1.5, padding: 24, alignItems: 'center' },
  playBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 32, marginBottom: 20, width: '100%' },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  navBtn: { width: 52, height: 52, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  tipBox: { marginTop: 20, borderRadius: 16, borderWidth: 1, padding: 16 },
});
