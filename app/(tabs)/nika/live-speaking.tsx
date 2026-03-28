import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { NikaAvatar } from '@/components/nika/nika-avatar';
import { useNika } from '@/lib/nika-context';
import { useNikaChat } from '@/lib/nika-chat-context';

const QUICK_PROMPTS = [
  'Erzähl von deinem Tag',
  'Bestell im Café',
  'Übe für die Prüfung',
];

export default function LiveSpeakingScreen() {
  const router = useRouter();
  const { currentOutfit, recordEvent } = useNika();
  const { sendMessage, messages, isLoading } = useNikaChat();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<{ tempo: number; betonung: number; lautstaerke: number } | null>(null);

  // Waveform animation
  const waveAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (isListening) {
      const animations = waveAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.3 + Math.random() * 0.7,
              duration: 300 + i * 80,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.2,
              duration: 200 + i * 60,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      );
      Animated.parallel(animations).start();
    } else {
      waveAnims.forEach(a => a.setValue(0.3));
    }
    return () => waveAnims.forEach(a => a.stopAnimation());
  }, [isListening]);

  const handleMicPress = async () => {
    if (isListening) {
      // Simulate end of speaking — send a demo message
      setIsListening(false);
      const demoText = transcript || 'Ich möchte ein Kaffee, bitte.';
      setTranscript('');
      await sendMessage(demoText);
      recordEvent('speak');
      // Simulate feedback scores
      setFeedback({
        tempo: Math.round(7 + Math.random() * 2.5),
        betonung: Math.round(7 + Math.random() * 2.5),
        lautstaerke: Math.round(7.5 + Math.random() * 2),
      });
    } else {
      setIsListening(true);
      setFeedback(null);
      // Simulate typing transcript
      const phrases = [
        'Ich möchte ein Kaffee, bitte.',
        'Guten Morgen! Wie geht es Ihnen?',
        'Ich habe gestern im Park spazieren gegangen.',
      ];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      let i = 0;
      const interval = setInterval(() => {
        setTranscript(phrase.slice(0, i + 1));
        i++;
        if (i >= phrase.length) clearInterval(interval);
      }, 60);
    }
  };

  const lastNikaMsg = messages.filter(m => m.role === 'nika').slice(-1)[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: '#A78BFA', fontSize: 16 }}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Live Sprechen</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 32 }}>
        {/* Nika Listening State */}
        <View style={styles.nikaSection}>
          <NikaAvatar outfit={currentOutfit} size={100} listening={isListening} />
          <Text style={styles.listeningLabel}>
            {isListening ? '🎙 Nika hört zu ...' : 'Sprich frei auf Deutsch'}
          </Text>
          <Text style={styles.listeningSubtitle}>
            {isListening ? '' : 'Ich helfe dir in Echtzeit!'}
          </Text>
        </View>

        {/* Waveform */}
        <View style={styles.waveform}>
          {waveAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveBar,
                {
                  transform: [{ scaleY: anim }],
                  backgroundColor: isListening
                    ? i % 2 === 0 ? '#7C3AED' : '#3B82F6'
                    : '#334155',
                },
              ]}
            />
          ))}
        </View>

        {/* Transcript Preview */}
        {transcript ? (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        ) : null}

        {/* Mic Button */}
        <Pressable
          onPress={handleMicPress}
          style={[styles.micOrb, isListening && styles.micOrbActive]}
        >
          <Text style={{ fontSize: 36 }}>{isListening ? '⏹' : '🎤'}</Text>
        </Pressable>

        {/* Quick Prompts */}
        {!isListening && (
          <View style={styles.quickPrompts}>
            {QUICK_PROMPTS.map(p => (
              <Pressable
                key={p}
                onPress={() => sendMessage(p)}
                style={styles.promptBtn}
              >
                <Text style={styles.promptText}>{p}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Nika Feedback */}
        {lastNikaMsg && !isListening && (
          <View style={styles.feedbackCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <NikaAvatar outfit={currentOutfit} size={32} />
              <Text style={styles.feedbackNikaText}>{lastNikaMsg.text}</Text>
            </View>

            {feedback && (
              <View style={styles.scoreGrid}>
                {[
                  { label: 'Lautstärke', value: feedback.lautstaerke, color: '#6EE7B7' },
                  { label: 'Tempo', value: feedback.tempo, color: '#93C5FD' },
                  { label: 'Betonung', value: feedback.betonung, color: '#FCA5A5' },
                ].map(s => (
                  <View key={s.label} style={styles.scoreItem}>
                    <View style={[styles.scoreDot, { backgroundColor: s.color }]} />
                    <Text style={styles.scoreLabel}>{s.label}</Text>
                    <Text style={[styles.scoreValue, { color: s.color }]}>{s.value.toFixed(1)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0618' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  nikaSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  listeningLabel: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginTop: 16 },
  listeningSubtitle: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    gap: 6,
    marginVertical: 16,
  },
  waveBar: {
    width: 6,
    height: 40,
    borderRadius: 3,
  },
  transcriptBox: {
    backgroundColor: '#1E1040',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  transcriptText: { color: '#F8FAFC', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  micOrb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E1040',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#7C3AED',
    marginVertical: 16,
  },
  micOrbActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#A78BFA',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  quickPrompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  promptBtn: {
    backgroundColor: '#1E1040',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  promptText: { color: '#A78BFA', fontSize: 13 },
  feedbackCard: {
    backgroundColor: '#1E1040',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  feedbackNikaText: {
    color: '#F8FAFC',
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
    lineHeight: 20,
  },
  scoreGrid: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  scoreItem: { alignItems: 'center', gap: 4 },
  scoreDot: { width: 8, height: 8, borderRadius: 4 },
  scoreLabel: { color: '#94A3B8', fontSize: 11 },
  scoreValue: { fontSize: 16, fontWeight: '700' },
});
