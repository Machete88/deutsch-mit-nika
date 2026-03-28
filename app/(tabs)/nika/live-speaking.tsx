import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NikaAvatar } from '@/components/nika/nika-avatar';
import { useNika } from '@/lib/nika-context';
import { useNikaChat } from '@/lib/nika-chat-context';
import { useNikaTheme } from '@/lib/nika-theme-context';

const QUICK_PROMPTS = [
  { label: 'Erzähl von deinem Tag', emoji: '☀️' },
  { label: 'Bestell im Café', emoji: '☕' },
  { label: 'Übe für die Prüfung', emoji: '📝' },
  { label: 'Freies Gespräch', emoji: '💬' },
];

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function LiveSpeakingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentOutfit, recordEvent } = useNika();
  const { sendMessage, messages, isLoading, setMode } = useNikaChat();
  const { colors, isDark } = useNikaTheme();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [statusText, setStatusText] = useState('Tippe auf das Mikrofon um zu sprechen');
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Waveform animation
  const waveAnims = useRef(Array.from({ length: 9 }, () => new Animated.Value(0.2))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Set live mode on mount
  useEffect(() => {
    setMode('live');
    return () => {};
  }, []);

  // Check speech support
  useEffect(() => {
    if (Platform.OS === 'web') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  // Waveform animation
  useEffect(() => {
    if (isListening) {
      const animations = waveAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.2 + Math.random() * 0.8,
              duration: 200 + i * 70,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.15,
              duration: 150 + i * 50,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      );
      Animated.parallel(animations).start();

      // Pulse animation for mic button
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      waveAnims.forEach(a => a.setValue(0.2));
      pulseAnim.setValue(1);
      waveAnims.forEach(a => a.stopAnimation());
      pulseAnim.stopAnimation();
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (Platform.OS === 'web' && speechSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'de-DE';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusText('Ich höre zu... Sprich auf Deutsch!');
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        if (final) setTranscript(prev => prev + final);
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
        setStatusText(event.error === 'not-allowed'
          ? 'Mikrofon-Zugriff verweigert. Bitte erlauben.'
          : 'Fehler bei der Spracherkennung. Nochmal versuchen.');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        setStatusText('Tippe auf das Mikrofon um zu sprechen');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      // Native fallback: just show listening state
      setIsListening(true);
      setStatusText('Sprich jetzt... (Tippe nochmal zum Beenden)');
    }
  }, [speechSupported]);

  const stopListening = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');

    const finalText = transcript.trim();
    if (finalText) {
      setTranscript('');
      setStatusText('Nika antwortet...');
      await sendMessage(finalText);
      recordEvent('speak');
      setStatusText('Tippe auf das Mikrofon um zu sprechen');
    }
  }, [transcript, sendMessage, recordEvent]);

  const handleMicPress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    setStatusText('Nika antwortet...');
    await sendMessage(prompt);
    recordEvent('speak');
    setStatusText('Tippe auf das Mikrofon um zu sprechen');
  };

  const lastNikaMsg = [...messages].reverse().find(m => m.role === 'nika');
  const bg = isDark ? '#0A0A1A' : '#F0EEFF';

  return (
    <View style={[styles.root, { backgroundColor: bg, paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: colors.purple500 + '22' }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Live-Gespräch</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* ── Nika Response Area ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesArea}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={[styles.nikaIntro, { backgroundColor: colors.glass2, borderColor: colors.purple500 + '33' }]}>
            <NikaAvatar outfit={currentOutfit} size={72} />
            <Text style={[styles.introTitle, { color: colors.textPrimary }]}>Hallo! Ich bin Nika 🐾</Text>
            <Text style={[styles.introSub, { color: colors.textMuted }]}>
              Klick auf das Mikrofon und sprich Deutsch mit mir!{'\n'}
              Ich korrigiere dich sanft und helfe dir besser zu werden.
            </Text>
          </View>
        )}

        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.bubble,
              msg.role === 'nika'
                ? [styles.nikaBubble, { backgroundColor: colors.glass2, borderColor: colors.purple500 + '44' }]
                : [styles.userBubble, { backgroundColor: colors.purple600 }],
            ]}
          >
            {msg.role === 'nika' && (
              <Text style={[styles.bubbleSender, { color: colors.purple400 }]}>🐾 Nika</Text>
            )}
            <Text style={[
              styles.bubbleText,
              { color: msg.role === 'nika' ? colors.textPrimary : '#FFF' },
            ]}>
              {msg.text}
            </Text>
          </View>
        ))}

        {isLoading && (
          <View style={[styles.bubble, styles.nikaBubble, { backgroundColor: colors.glass2, borderColor: colors.purple500 + '44' }]}>
            <Text style={[styles.bubbleSender, { color: colors.purple400 }]}>🐾 Nika</Text>
            <Text style={[styles.typingDots, { color: colors.textMuted }]}>● ● ●</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Transcript Preview ── */}
      {(transcript || interimTranscript) ? (
        <View style={[styles.transcriptBox, { backgroundColor: colors.glass2, borderColor: colors.purple500 + '55' }]}>
          <Text style={[styles.transcriptText, { color: colors.textPrimary }]}>
            {transcript}
            <Text style={{ color: colors.textMuted }}>{interimTranscript}</Text>
          </Text>
        </View>
      ) : null}

      {/* ── Waveform ── */}
      <View style={styles.waveformRow}>
        {waveAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.waveBar,
              {
                backgroundColor: isListening ? colors.neonPurple : colors.purple500 + '55',
                transform: [{ scaleY: anim }],
              },
            ]}
          />
        ))}
      </View>

      {/* ── Status ── */}
      <Text style={[styles.statusText, { color: colors.textMuted }]}>{statusText}</Text>

      {/* ── Mic Button ── */}
      <View style={styles.micArea}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            onPress={handleMicPress}
            style={({ pressed }) => [
              styles.micBtn,
              {
                backgroundColor: isListening ? '#EF4444' : colors.purple600,
                shadowColor: isListening ? '#EF4444' : colors.neonPurple,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={styles.micIcon}>{isListening ? '⏹' : '🎙️'}</Text>
          </Pressable>
        </Animated.View>
        <Text style={[styles.micLabel, { color: colors.textMuted }]}>
          {isListening ? 'Tippen zum Beenden' : 'Tippen zum Sprechen'}
        </Text>
      </View>

      {/* ── Quick Prompts ── */}
      {!isListening && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {QUICK_PROMPTS.map((p) => (
            <Pressable
              key={p.label}
              onPress={() => handleQuickPrompt(p.label)}
              style={({ pressed }) => [
                styles.quickBtn,
                { backgroundColor: colors.glass2, borderColor: colors.purple500 + '44', opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.quickEmoji}>{p.emoji}</Text>
              <Text style={[styles.quickLabel, { color: colors.textSecondary }]}>{p.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={{ height: insets.bottom + 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 22, fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EF444422', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText: { fontSize: 11, fontWeight: '800', color: '#EF4444', letterSpacing: 1 },
  messagesArea: { flex: 1 },
  nikaIntro: {
    alignItems: 'center', padding: 24, borderRadius: 20, borderWidth: 1, marginBottom: 12,
  },
  introTitle: { fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 6 },
  introSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  bubble: {
    maxWidth: '85%', borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1,
  },
  nikaBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4, borderColor: 'transparent' },
  bubbleSender: { fontSize: 11, fontWeight: '700', marginBottom: 4, letterSpacing: 0.3 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  typingDots: { fontSize: 18, letterSpacing: 4 },
  transcriptBox: {
    marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 14, borderWidth: 1,
  },
  transcriptText: { fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  waveformRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 48, gap: 4, paddingHorizontal: 24, marginBottom: 4,
  },
  waveBar: { width: 4, height: 36, borderRadius: 3 },
  statusText: { textAlign: 'center', fontSize: 13, marginBottom: 12, paddingHorizontal: 24 },
  micArea: { alignItems: 'center', marginBottom: 12 },
  micBtn: {
    width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 18, elevation: 10,
  },
  micIcon: { fontSize: 32 },
  micLabel: { fontSize: 12, marginTop: 8 },
  quickRow: { maxHeight: 64, marginBottom: 8 },
  quickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1,
  },
  quickEmoji: { fontSize: 16 },
  quickLabel: { fontSize: 13, fontWeight: '600' },
});
