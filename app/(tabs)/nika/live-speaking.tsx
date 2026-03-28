/**
 * Live-Gespräch Screen
 * Vollbild-Nika-Avatar mit Lippensync-Animation + Venice TTS
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing, Platform, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NikaAvatar } from '@/components/nika/nika-avatar';
import { useNika } from '@/lib/nika-context';
import { useNikaChat } from '@/lib/nika-chat-context';
import { useNikaTheme } from '@/lib/nika-theme-context';
import { useNikaSpeech } from '@/lib/nika-speech-context';

const QUICK_PROMPTS = [
  { label: 'Erzähl von deinem Tag', emoji: '☀️' },
  { label: 'Bestell im Café', emoji: '☕' },
  { label: 'Übe für die Prüfung', emoji: '📝' },
  { label: 'Freies Gespräch', emoji: '💬' },
];

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
  const { isSpeaking, speak, stop: stopSpeech } = useNikaSpeech();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [statusText, setStatusText] = useState('Tippe auf das Mikrofon um zu sprechen');

  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);
  const prevMsgCountRef = useRef(0);

  const waveAnims = useRef(Array.from({ length: 9 }, () => new Animated.Value(0.2))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { setMode('live'); }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechSupported(!!SR);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  useEffect(() => {
    const nikaMsgs = messages.filter(m => m.role === 'nika');
    if (nikaMsgs.length > prevMsgCountRef.current && nikaMsgs.length > 0 && !isLoading) {
      prevMsgCountRef.current = nikaMsgs.length;
      const last = nikaMsgs[nikaMsgs.length - 1];
      if (last) speak(last.text, 'de');
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isListening) {
      const animations = waveAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 0.2 + Math.random() * 0.8, duration: 200 + i * 70, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.15, duration: 150 + i * 50, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ])
        )
      );
      Animated.parallel(animations).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      waveAnims.forEach(a => { a.stopAnimation(); a.setValue(0.2); });
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (isSpeaking) stopSpeech();
    if (Platform.OS === 'web' && speechSupported) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognition.lang = 'de-DE';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => { setIsListening(true); setStatusText('Ich höre zu... Sprich auf Deutsch!'); setInterimTranscript(''); };
      recognition.onresult = (event: any) => {
        let interim = '', final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) final += r[0].transcript;
          else interim += r[0].transcript;
        }
        if (final) setTranscript(prev => prev + final);
        setInterimTranscript(interim);
      };
      recognition.onerror = (event: any) => {
        setIsListening(false);
        setStatusText(event.error === 'not-allowed' ? 'Mikrofon-Zugriff verweigert.' : 'Fehler bei der Spracherkennung.');
      };
      recognition.onend = () => { setIsListening(false); setInterimTranscript(''); setStatusText('Tippe auf das Mikrofon um zu sprechen'); };
      recognitionRef.current = recognition;
      recognition.start();
    } else {
      setIsListening(true);
      setStatusText('Sprich jetzt... (Tippe nochmal zum Beenden)');
    }
  }, [speechSupported, isSpeaking, stopSpeech]);

  const stopListening = useCallback(async () => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
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

  const handleMicPress = () => { if (isListening) stopListening(); else startListening(); };

  const handleQuickPrompt = async (prompt: string) => {
    if (isSpeaking) stopSpeech();
    setStatusText('Nika antwortet...');
    await sendMessage(prompt);
    recordEvent('speak');
    setStatusText('Tippe auf das Mikrofon um zu sprechen');
  };

  const bg = isDark ? '#0A0618' : '#F7F4FD';
  const cardBg = isDark ? colors.glass2 : 'rgba(124,58,237,0.08)';
  const cardBorder = isDark ? colors.purple500 + '44' : 'rgba(124,58,237,0.20)';
  const textPrimary = isDark ? colors.textPrimary : '#1E1033';
  const textMuted = isDark ? colors.textMuted : '#6B5B8A';
  const textSecondary = isDark ? colors.textSecondary : '#4B3F72';

  return (
    <View style={[styles.root, { backgroundColor: bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.purple500 + '22' }]}>
        <Pressable onPress={() => { stopSpeech(); router.back(); }} style={styles.backBtn}>
          <Text style={[styles.backText, { color: textPrimary }]}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Live-Gespräch</Text>
        <View style={[styles.liveBadge, { backgroundColor: (isListening ? '#EF4444' : isSpeaking ? '#9D5FF3' : '#4ADE80') + '22' }]}>
          <View style={[styles.liveDot, { backgroundColor: isListening ? '#EF4444' : isSpeaking ? '#9D5FF3' : '#4ADE80' }]} />
          <Text style={[styles.liveText, { color: isListening ? '#EF4444' : isSpeaking ? '#9D5FF3' : '#4ADE80' }]}>
            {isListening ? 'HÖRT' : isSpeaking ? 'SPRICHT' : 'LIVE'}
          </Text>
        </View>
      </View>

      {isSpeaking && (
        <View style={[styles.nikaOverlay, { backgroundColor: isDark ? 'rgba(10,6,24,0.90)' : 'rgba(247,244,253,0.92)' }]}>
          <NikaAvatar outfit={currentOutfit} size={200} speaking={true} glowColor={colors.neonPurple} rounded={false} />
          <Text style={[styles.speakingLabel, { color: colors.purple400 }]}>🐾 Nika spricht...</Text>
          <TouchableOpacity onPress={stopSpeech} style={[styles.stopSpeechBtn, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[styles.stopSpeechText, { color: textMuted }]}>⏹ Stoppen</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView ref={scrollRef} style={styles.messagesArea} contentContainerStyle={{ padding: 16, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
        {messages.length === 0 && (
          <View style={[styles.nikaIntro, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <NikaAvatar outfit={currentOutfit} size={80} listening={isListening} />
            <Text style={[styles.introTitle, { color: textPrimary }]}>Hallo! Ich bin Nika 🐾</Text>
            <Text style={[styles.introSub, { color: textMuted }]}>
              Klick auf das Mikrofon und sprich Deutsch mit mir!{'\n'}
              Ich antworte mit meiner Stimme und korrigiere dich sanft.
            </Text>
          </View>
        )}
        {messages.map((msg) => (
          <View key={msg.id} style={[
            styles.bubble,
            msg.role === 'nika'
              ? [styles.nikaBubble, { backgroundColor: cardBg, borderColor: cardBorder }]
              : [styles.userBubble, { backgroundColor: colors.purple600 }],
          ]}>
            {msg.role === 'nika' && (
              <View style={styles.bubbleHeader}>
                <Text style={[styles.bubbleSender, { color: colors.purple400 }]}>🐾 Nika</Text>
                <TouchableOpacity onPress={() => speak(msg.text, 'de')} style={styles.speakBtn}>
                  <Text style={styles.speakBtnIcon}>🔈</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={[styles.bubbleText, { color: msg.role === 'nika' ? textPrimary : '#FFF' }]}>{msg.text}</Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.bubble, styles.nikaBubble, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[styles.bubbleSender, { color: colors.purple400 }]}>🐾 Nika</Text>
            <Text style={[styles.typingDots, { color: textMuted }]}>● ● ●</Text>
          </View>
        )}
      </ScrollView>

      {(transcript || interimTranscript) ? (
        <View style={[styles.transcriptBox, { backgroundColor: cardBg, borderColor: colors.purple500 + '55' }]}>
          <Text style={[styles.transcriptText, { color: textPrimary }]}>
            {transcript}<Text style={{ color: textMuted }}>{interimTranscript}</Text>
          </Text>
        </View>
      ) : null}

      <View style={styles.waveformRow}>
        {waveAnims.map((anim, i) => (
          <Animated.View key={i} style={[styles.waveBar, { backgroundColor: isListening ? colors.neonPurple : colors.purple500 + '55', transform: [{ scaleY: anim }] }]} />
        ))}
      </View>

      <Text style={[styles.statusText, { color: textMuted }]}>{statusText}</Text>

      <View style={styles.micArea}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            onPress={handleMicPress}
            style={({ pressed }) => [styles.micBtn, { backgroundColor: isListening ? '#EF4444' : colors.purple600, shadowColor: isListening ? '#EF4444' : colors.neonPurple, opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={styles.micIcon}>{isListening ? '⏹' : '🎙️'}</Text>
          </Pressable>
        </Animated.View>
        <Text style={[styles.micLabel, { color: textMuted }]}>{isListening ? 'Tippen zum Beenden' : 'Tippen zum Sprechen'}</Text>
      </View>

      {!isListening && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {QUICK_PROMPTS.map((p) => (
            <Pressable key={p.label} onPress={() => handleQuickPrompt(p.label)} style={({ pressed }) => [styles.quickBtn, { backgroundColor: cardBg, borderColor: colors.purple500 + '44', opacity: pressed ? 0.7 : 1 }]}>
              <Text style={styles.quickEmoji}>{p.emoji}</Text>
              <Text style={[styles.quickLabel, { color: textSecondary }]}>{p.label}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  backText: { fontSize: 22, fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  nikaOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, alignItems: 'center', justifyContent: 'center', gap: 16 },
  speakingLabel: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  stopSpeechBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, borderWidth: 1, marginTop: 8 },
  stopSpeechText: { fontSize: 15, fontWeight: '600' },
  messagesArea: { flex: 1 },
  nikaIntro: { alignItems: 'center', padding: 24, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  introTitle: { fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 6 },
  introSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  bubble: { maxWidth: '85%', borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1 },
  nikaBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4, borderColor: 'transparent' },
  bubbleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  bubbleSender: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  speakBtn: { padding: 4 },
  speakBtnIcon: { fontSize: 16 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  typingDots: { fontSize: 18, letterSpacing: 4 },
  transcriptBox: { marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 14, borderWidth: 1 },
  transcriptText: { fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  waveformRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, gap: 4, paddingHorizontal: 24, marginBottom: 4 },
  waveBar: { width: 4, height: 36, borderRadius: 3 },
  statusText: { textAlign: 'center', fontSize: 13, marginBottom: 12, paddingHorizontal: 24 },
  micArea: { alignItems: 'center', marginBottom: 12 },
  micBtn: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 18, elevation: 10 },
  micIcon: { fontSize: 32 },
  micLabel: { fontSize: 12, marginTop: 8 },
  quickRow: { maxHeight: 64, marginBottom: 8 },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  quickEmoji: { fontSize: 16 },
  quickLabel: { fontSize: 13, fontWeight: '600' },
});
