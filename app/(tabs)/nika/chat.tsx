import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNikaChat } from '@/lib/nika-chat-context';
import { useNika } from '@/lib/nika-context';
import { NikaAvatar } from '@/components/nika/nika-avatar';
import { CorrectionCard } from '@/components/nika/correction-card';
import { DS } from '@/constants/design';

const QUICK_ACTIONS = [
  { label: 'Einfacher', emoji: '🔤' },
  { label: 'Natürlicher', emoji: '✨' },
  { label: 'Erklären', emoji: '💡' },
  { label: 'Beispiel', emoji: '📝' },
];

const MODES = [
  { id: 'coach', label: '🎓 Coach', desc: 'Korrekturen & Tipps' },
  { id: 'live', label: '💬 Live', desc: 'Freies Gespräch' },
] as const;

export default function NikaChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.avatarWrap}>
            <NikaAvatar outfit={currentOutfit} size={34} />
            <View style={styles.onlineDot} />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerName}>Nika</Text>
            <Text style={styles.headerStatus}>● Online & bereit</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)/nika/roleplay' as never)}
          style={({ pressed }) => [styles.roleplayBtn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.roleplayBtnText}>🎭 Rollenspiel</Text>
        </Pressable>
      </View>

      {/* ── Mode Switcher ── */}
      <View style={styles.modeSwitcher}>
        {MODES.map(m => (
          <Pressable
            key={m.id}
            onPress={() => setMode(m.id)}
            style={[styles.modeBtn, mode === m.id && styles.modeBtnActive]}
          >
            <Text style={[styles.modeBtnText, mode === m.id && styles.modeBtnTextActive]}>
              {m.label}
            </Text>
            {mode === m.id && (
              <Text style={styles.modeDesc}>{m.desc}</Text>
            )}
          </Pressable>
        ))}
      </View>

      {/* ── Messages ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyAvatarWrap}>
              <NikaAvatar outfit={currentOutfit} size={80} />
              <View style={styles.emptyGlow} />
            </View>
            <Text style={styles.emptyTitle}>Na los, sag was auf Deutsch!</Text>
            <Text style={styles.emptySubtitle}>
              Ich korrigiere, erkläre und mach dich besser.
            </Text>
            <View style={styles.emptyHints}>
              {['Wie geht es dir?', 'Was machst du heute?', 'Ich lerne Deutsch.'].map(hint => (
                <Pressable
                  key={hint}
                  onPress={() => sendMessage(hint)}
                  style={styles.hintChip}
                >
                  <Text style={styles.hintChipText}>{hint}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {messages.map(msg => (
          <View key={msg.id} style={styles.msgWrap}>
            {msg.role !== 'user' && (
              <View style={styles.nikaMsgRow}>
                <View style={styles.nikaMsgAvatar}>
                  <NikaAvatar outfit={currentOutfit} size={28} />
                </View>
                <View style={styles.nikaBubble}>
                  <Text style={styles.nikaText}>{msg.text}</Text>
                </View>
              </View>
            )}
            {msg.role === 'user' && (
              <View style={styles.userMsgRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{msg.text}</Text>
                </View>
              </View>
            )}
            {msg.correction && <CorrectionCard correction={msg.correction} />}
          </View>
        ))}

        {isLoading && (
          <View style={styles.nikaMsgRow}>
            <View style={styles.nikaMsgAvatar}>
              <NikaAvatar outfit={currentOutfit} size={28} />
            </View>
            <View style={[styles.nikaBubble, styles.typingBubble]}>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Quick Actions ── */}
      <View style={styles.quickWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickScroll}>
          {QUICK_ACTIONS.map(a => (
            <Pressable
              key={a.label}
              onPress={() => sendMessage(a.label + ' bitte')}
              style={({ pressed }) => [styles.quickChip, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.quickChipText}>{a.emoji} {a.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ── Input Row ── */}
      <View style={[styles.inputWrap, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Schreib auf Deutsch..."
          placeholderTextColor={DS.colors.textDisabled}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
          style={({ pressed }) => [
            styles.sendBtn,
            (!input.trim() || isLoading) && styles.sendBtnDisabled,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.sendBtnIcon}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.colors.bg1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DS.space[4],
    paddingVertical: DS.space[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(10,6,24,0.95)',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: DS.radius.md,
    backgroundColor: DS.colors.glass2,
    borderWidth: 1, borderColor: DS.colors.glassBorder,
    alignItems: 'center', justifyContent: 'center',
    marginRight: DS.space[3],
  },
  backText: { color: DS.colors.purple300, fontSize: 18, fontWeight: DS.font.bold },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: DS.colors.neonGreen,
    borderWidth: 2, borderColor: DS.colors.bg1,
  },
  headerName: { color: DS.colors.textPrimary, fontSize: DS.font.base, fontWeight: DS.font.bold },
  headerStatus: { color: DS.colors.neonGreen, fontSize: DS.font.xs, marginTop: 1 },
  roleplayBtn: {
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderRadius: DS.radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)',
  },
  roleplayBtnText: { color: DS.colors.purple300, fontSize: DS.font.xs, fontWeight: DS.font.semibold },

  // Mode Switcher
  modeSwitcher: {
    flexDirection: 'row',
    paddingHorizontal: DS.space[4],
    paddingVertical: DS.space[2],
    gap: 8,
    backgroundColor: 'rgba(10,6,24,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  modeBtn: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: DS.radius.full, borderWidth: 1,
    borderColor: DS.colors.glassBorder,
    backgroundColor: DS.colors.glass1,
  },
  modeBtnActive: {
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderColor: 'rgba(168,85,247,0.5)',
  },
  modeBtnText: { color: DS.colors.textMuted, fontSize: DS.font.sm, fontWeight: DS.font.semibold },
  modeBtnTextActive: { color: DS.colors.purple200 },
  modeDesc: { color: DS.colors.textMuted, fontSize: 10, marginTop: 1 },

  // Messages
  messageList: { flex: 1 },
  messageListContent: { padding: DS.space[4], paddingBottom: DS.space[2], gap: 4 },

  msgWrap: { marginBottom: DS.space[2] },

  nikaMsgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '85%' },
  nikaMsgAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(124,58,237,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)',
  },
  nikaBubble: {
    flex: 1,
    backgroundColor: 'rgba(30,16,64,0.9)',
    borderRadius: DS.radius.lg,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.15)',
    padding: DS.space[3],
  },
  nikaText: { color: DS.colors.textPrimary, fontSize: DS.font.base, lineHeight: 22 },

  userMsgRow: { alignItems: 'flex-end' },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: DS.colors.purple700,
    borderRadius: DS.radius.lg,
    borderBottomRightRadius: 4,
    padding: DS.space[3],
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    ...DS.shadow.sm,
  },
  userText: { color: '#FFFFFF', fontSize: DS.font.base, lineHeight: 22 },

  // Typing indicator
  typingBubble: { paddingVertical: DS.space[3], paddingHorizontal: DS.space[4] },
  typingDots: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: DS.colors.purple400,
  },
  dot1: { opacity: 1 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.3 },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 48, paddingBottom: 24, paddingHorizontal: DS.space[4] },
  emptyAvatarWrap: { position: 'relative', marginBottom: DS.space[4] },
  emptyGlow: {
    position: 'absolute', top: -10, left: -10, right: -10, bottom: -10,
    borderRadius: 60, backgroundColor: 'rgba(124,58,237,0.15)',
  },
  emptyTitle: {
    color: DS.colors.textPrimary, fontSize: DS.font.lg,
    fontWeight: DS.font.bold, textAlign: 'center', marginBottom: 8,
  },
  emptySubtitle: {
    color: DS.colors.textMuted, fontSize: DS.font.sm,
    textAlign: 'center', lineHeight: 20, marginBottom: DS.space[5],
  },
  emptyHints: { gap: 8, width: '100%' },
  hintChip: {
    backgroundColor: DS.colors.glass2,
    borderRadius: DS.radius.full,
    borderWidth: 1, borderColor: DS.colors.glassBorder,
    paddingHorizontal: DS.space[4], paddingVertical: DS.space[2],
    alignSelf: 'center',
  },
  hintChipText: { color: DS.colors.purple300, fontSize: DS.font.sm, fontWeight: DS.font.medium },

  // Quick actions
  quickWrap: {
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(10,6,24,0.9)',
    paddingVertical: 8,
  },
  quickScroll: { paddingHorizontal: DS.space[4], gap: 8 },
  quickChip: {
    backgroundColor: DS.colors.glass2,
    borderRadius: DS.radius.full,
    borderWidth: 1, borderColor: DS.colors.glassBorder,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  quickChipText: { color: DS.colors.purple300, fontSize: DS.font.xs, fontWeight: DS.font.semibold },

  // Input
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: DS.space[4],
    paddingTop: DS.space[3],
    gap: DS.space[2],
    backgroundColor: 'rgba(10,6,24,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  input: {
    flex: 1,
    backgroundColor: DS.colors.glass2,
    borderRadius: DS.radius.xl,
    borderWidth: 1,
    borderColor: DS.colors.glassBorderBright,
    paddingHorizontal: DS.space[4],
    paddingVertical: DS.space[3],
    color: DS.colors.textPrimary,
    fontSize: DS.font.base,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: DS.colors.purple600,
    alignItems: 'center', justifyContent: 'center',
    ...DS.shadow.md,
  },
  sendBtnDisabled: { backgroundColor: DS.colors.glass2, ...DS.shadow.sm },
  sendBtnIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: DS.font.bold },
});
