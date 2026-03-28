import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useNikaTheme } from '@/lib/nika-theme-context';
import { useVocabulary } from '@/lib/vocabulary-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExportScreen() {
  const router = useRouter();
  const { colors } = useNikaTheme();
  const { words } = useVocabulary();
  const insets = useSafeAreaInsets();
  const [exported, setExported] = useState(false);

  const learnedWords = words.filter((w: any) => w.status === 'learned' || w.reviewCount > 0);

  const handleExportCSV = async () => {
    const header = 'Deutsch,Russisch,Level,Status\n';
    const rows = learnedWords
      .map((w: any) => `"${w.german}","${w.russian}","${w.level}","${w.status ?? 'gelernt'}"`)
      .join('\n');
    const csv = header + rows;
    try {
      await Share.share({
        message: csv,
        title: 'Deutsch mit Nika – Vokabeln',
      });
      setExported(true);
    } catch {
      Alert.alert('Fehler', 'Export fehlgeschlagen.');
    }
  };

  const handleExportText = async () => {
    const lines = learnedWords
      .map((w: any) => `${w.german} = ${w.russian} (${w.level})`)
      .join('\n');
    const text = `Deutsch mit Nika – Meine Vokabeln\n${'─'.repeat(30)}\n${lines}`;
    try {
      await Share.share({ message: text, title: 'Vokabeln' });
      setExported(true);
    } catch {
      Alert.alert('Fehler', 'Export fehlgeschlagen.');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg1, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.glassBorder }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.neonPurple }]}>← Zurück</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Export</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.glass1, borderColor: colors.neonPurple + '33' }]}>
          <Text style={[styles.statsNum, { color: colors.neonPurple }]}>{learnedWords.length}</Text>
          <Text style={[styles.statsSub, { color: colors.textMuted }]}>Wörter gelernt</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>FORMAT WÄHLEN</Text>

        {/* CSV Export */}
        <Pressable
          onPress={handleExportCSV}
          style={({ pressed }) => [
            styles.exportBtn,
            { backgroundColor: colors.glass2, borderColor: colors.neonGreen + '44' },
            pressed && { opacity: 0.8 },
          ]}
        >
          <View style={[styles.exportIcon, { backgroundColor: colors.neonGreen + '22' }]}>
            <Text style={styles.exportEmoji}>📊</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.exportTitle, { color: colors.textPrimary }]}>CSV-Tabelle</Text>
            <Text style={[styles.exportDesc, { color: colors.textMuted }]}>Für Excel, Google Sheets, Anki</Text>
          </View>
          <View style={[styles.exportBadge, { backgroundColor: colors.neonGreen + '22', borderColor: colors.neonGreen + '44' }]}>
            <Text style={[styles.exportBadgeText, { color: colors.neonGreen }]}>CSV</Text>
          </View>
        </Pressable>

        {/* Text Export */}
        <Pressable
          onPress={handleExportText}
          style={({ pressed }) => [
            styles.exportBtn,
            { backgroundColor: colors.glass2, borderColor: colors.neonBlue + '44' },
            pressed && { opacity: 0.8 },
          ]}
        >
          <View style={[styles.exportIcon, { backgroundColor: colors.neonBlue + '22' }]}>
            <Text style={styles.exportEmoji}>📝</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.exportTitle, { color: colors.textPrimary }]}>Textliste</Text>
            <Text style={[styles.exportDesc, { color: colors.textMuted }]}>Einfache Wortliste zum Teilen</Text>
          </View>
          <View style={[styles.exportBadge, { backgroundColor: colors.neonBlue + '22', borderColor: colors.neonBlue + '44' }]}>
            <Text style={[styles.exportBadgeText, { color: colors.neonBlue }]}>TXT</Text>
          </View>
        </Pressable>

        {exported && (
          <View style={[styles.successBanner, { backgroundColor: colors.success + '22', borderColor: colors.success + '44' }]}>
            <Text style={[styles.successText, { color: colors.success }]}>✓ Export erfolgreich!</Text>
          </View>
        )}

        {learnedWords.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: colors.glass1, borderColor: colors.glassBorder }]}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Noch keine Wörter gelernt</Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>Lerne zuerst ein paar Wörter, dann kannst du sie exportieren.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '800' },
  content: { padding: 20, gap: 16 },
  statsCard: {
    borderRadius: 20, borderWidth: 1, padding: 24,
    alignItems: 'center', marginBottom: 8,
  },
  statsNum: { fontSize: 48, fontWeight: '900' },
  statsSub: { fontSize: 14, marginTop: 4 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: -4,
  },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 18, borderWidth: 1, padding: 18,
  },
  exportIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  exportEmoji: { fontSize: 24 },
  exportTitle: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  exportDesc: { fontSize: 13 },
  exportBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  exportBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  successBanner: { borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center' },
  successText: { fontSize: 15, fontWeight: '700' },
  emptyCard: { borderRadius: 20, borderWidth: 1, padding: 32, alignItems: 'center', gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
