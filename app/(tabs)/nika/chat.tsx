import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNikaChat } from '@/lib/nika-chat-context';
import { useNika } from '@/lib/nika-context';
import { NikaAvatar } from '@/components/nika/nika-avatar';
import { CorrectionCard } from '@/components/nika/correction-card';
import { useColors } from '@/hooks/use-colors';

const QUICK_ACTIONS = [
  { label: 'Einfacher', emoji: '🔤' },
  { label: 'Natürlicher', emoji: '✨' },
  { label: 'Erklären', emoji: '💡' },
  { label: 'Beispiel', emoji: '📝' },
];

export default function NikaChatScreen() {
  const router = useRouter();
  const colors = useColors();
  const { messages, isLoading, sendMessage, mode, setMode } = useNikaChat();
  const { currentOutfit, recordEvent } = useNika();
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    await sendMessage(text);
    recordEvent('chat');
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action + ' bitte');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0A0618' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: '#A78BFA', fontSize: 16 }}>← Zurück</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <NikaAvatar outfit={currentOutfit} size={36} />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ color: '#F8FAFC', fontWeight: '700', fontSize: 16 }}>Nika</Text>
            <Text style={{ color: '#6EE7B7', fontSize: 11 }}>Online & bereit zu helfen</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/nika/roleplay' as never)}
          style={styles.roleplayBtn}
        >
          <Text style={{ color: '#A78BFA', fontSize: 12, fontWeight: '600' }}>🎭 Rollenspiel</Text>
        </Pressable>
      </View>

      {/* Mode Switcher */}
      <View style={styles.modeSwitcher}>
        {(['coach', 'live'] as const).map(m => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
          >
            <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
              {m === 'coach' ? '🎓 Coach' : '💬 Live'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <NikaAvatar outfit={currentOutfit} size={80} />
            <Text style={styles.emptyTitle}>Na los, sag was auf Deutsch!</Text>
            <Text style={styles.emptySubtitle}>Ich höre zu und mach es noch besser.</Text>
          </View>
        )}

        {messages.map(msg => (
          <View key={msg.id}>
            <View
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.userBubble : styles.nikaBubble,
              ]}
            >
              {msg.role === 'nika' && (
                <NikaAvatar outfit={currentOutfit} size={28} style={{ marginRight: 8 }} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={msg.role === 'user' ? styles.userText : styles.nikaText}>
                  {msg.text}
                </Text>
              </View>
            </View>
            {msg.correction && <CorrectionCard correction={msg.correction} />}
          </View>
        ))}

        {isLoading && (
          <View style={[styles.bubble, styles.nikaBubble]}>
            <NikaAvatar outfit={currentOutfit} size={28} style={{ marginRight: 8 }} />
            <ActivityIndicator color="#A78BFA" />
          </View>
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {QUICK_ACTIONS.map(a => (
          <Pressable
            key={a.label}
            onPress={() => handleQuickAction(a.label)}
            style={styles.quickBtn}
          >
            <Text style={styles.quickBtnText}>{a.emoji} {a.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Schreib etwas oder frag Nika..."
          placeholderTextColor="#475569"
          multiline
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
          style={[styles.sendBtn, (!input.trim() || isLoading) && { opacity: 0.4 }]}
        >
          <Text style={{ fontSize: 20 }}>🎤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#0A0618',
    borderBottomWidth: 1,
    borderBottomColor: '#1E1040',
  },
  backBtn: { paddingRight: 12 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  roleplayBtn: {
    backgroundColor: '#1a1040',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  modeSwitcher: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#0A0618',
  },
  modeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modeBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  modeBtnText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  modeBtnTextActive: { color: '#FFFFFF' },
  emptyState: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  emptyTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  emptySubtitle: { color: '#94A3B8', fontSize: 14, marginTop: 8, textAlign: 'center' },
  bubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    maxWidth: '85%',
  },
  nikaBubble: { alignSelf: 'flex-start' },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#7C3AED',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  nikaText: {
    color: '#F8FAFC',
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: '#1E1040',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  userText: { color: '#FFFFFF', fontSize: 15, lineHeight: 22 },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    flexWrap: 'wrap',
    backgroundColor: '#0A0618',
  },
  quickBtn: {
    backgroundColor: '#1E1040',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickBtnText: { color: '#A78BFA', fontSize: 12, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 8,
    backgroundColor: '#0A0618',
    borderTopWidth: 1,
    borderTopColor: '#1E1040',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1E1040',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
