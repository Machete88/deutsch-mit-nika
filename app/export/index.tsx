import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { useVocabulary } from '@/lib/vocabulary-context';
import { vocabularyData, vocabularyDataExtra } from '@/lib/vocabulary-data';
import type { Word } from '@/lib/types';

// ─── Typen ──────────────────────────────────────────────────────────────────

type ExportFormat = 'csv' | 'anki' | 'text' | 'markdown';
type StatusFilter = 'all' | 'learned' | 'new';
type LevelFilter = 'all' | 'A1' | 'A2' | 'B1' | 'B2';

const ALL_WORDS: Word[] = [...vocabularyData, ...vocabularyDataExtra];

const FORMAT_INFO: Record<ExportFormat, { label: string; emoji: string; desc: string; ext: string }> = {
  csv: {
    label: 'CSV (Excel/Sheets)',
    emoji: '📊',
    desc: 'Таблица: Немецкий, Русский, IPA, Уровень, Категория',
    ext: 'csv',
  },
  anki: {
    label: 'Anki Flashcards',
    emoji: '🃏',
    desc: 'Формат для импорта в Anki (Tab-separated)',
    ext: 'txt',
  },
  text: {
    label: 'Простой текст',
    emoji: '📝',
    desc: 'Список: Немецкий — Русский (по одному на строку)',
    ext: 'txt',
  },
  markdown: {
    label: 'Markdown таблица',
    emoji: '📋',
    desc: 'Таблица в формате Markdown для заметок',
    ext: 'md',
  },
};

// ─── Export-Generatoren ───────────────────────────────────────────────────────

function generateCSV(words: Word[]): string {
  const header = 'Deutsch,Russisch,IPA,Wortart,Genus,Level,Kategorie,Beispiel DE,Beispiel RU\n';
  const rows = words.map(w => {
    const ex = w.examples?.[0];
    const escape = (s: string) => `"${(s || '').replace(/"/g, '""')}"`;
    return [
      escape(w.german),
      escape(w.russian),
      escape(w.ipa || ''),
      escape(w.partOfSpeech || ''),
      escape(w.gender || ''),
      escape(w.cefrLevel || ''),
      escape(w.category || ''),
      escape(ex?.de || ''),
      escape(ex?.ru || ''),
    ].join(',');
  });
  return header + rows.join('\n');
}

function generateAnki(words: Word[]): string {
  // Anki: Vorderseite\tRückseite\tTags
  return words.map(w => {
    const front = `${w.german}${w.ipa ? ` [${w.ipa}]` : ''}`;
    const back = `${w.russian}${w.examples?.[0] ? `\n\n${w.examples[0].de}\n${w.examples[0].ru}` : ''}`;
    const tags = [w.cefrLevel, w.category?.replace(/\s+/g, '_')].filter(Boolean).join(' ');
    return `${front}\t${back}\t${tags}`;
  }).join('\n');
}

function generateText(words: Word[]): string {
  return words.map(w => `${w.german} — ${w.russian}`).join('\n');
}

function generateMarkdown(words: Word[]): string {
  const header = '| Deutsch | Russisch | IPA | Level | Kategorie |\n|---------|----------|-----|-------|-----------|\n';
  const rows = words.map(w =>
    `| **${w.german}** | ${w.russian} | ${w.ipa || ''} | ${w.cefrLevel || ''} | ${w.category || ''} |`
  ).join('\n');
  return `# Vokabelliste Deutsch-Russisch\n\n${header}${rows}\n`;
}

// ─── Hauptkomponente ─────────────────────────────────────────────────────────

export default function ExportScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const { userWordStates } = useVocabulary();

  const [format, setFormat] = useState<ExportFormat>('csv');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  // Gefilterte Wörter
  const filteredWords = useMemo(() => {
    let words = ALL_WORDS;
    if (statusFilter === 'learned') words = words.filter(w => userWordStates.has(w.id));
    if (statusFilter === 'new') words = words.filter(w => !userWordStates.has(w.id));
    if (levelFilter !== 'all') words = words.filter(w => w.cefrLevel === levelFilter);
    return words;
  }, [statusFilter, levelFilter, userWordStates]);

  // Statistiken
  const learnedCount = ALL_WORDS.filter(w => userWordStates.has(w.id)).length;

  const handleExport = async () => {
    if (filteredWords.length === 0) {
      Alert.alert('Нет слов', 'Нет слов для экспорта с выбранными фильтрами.');
      return;
    }

          if ((Platform.OS as string) !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

    setIsExporting(true);
    setExported(false);

    try {
      let content = '';
      const info = FORMAT_INFO[format];

      switch (format) {
        case 'csv': content = generateCSV(filteredWords); break;
        case 'anki': content = generateAnki(filteredWords); break;
        case 'text': content = generateText(filteredWords); break;
        case 'markdown': content = generateMarkdown(filteredWords); break;
      }

      const fileName = `deutsch_lernen_${statusFilter}_${levelFilter}_${Date.now()}.${info.ext}`;

      if ((Platform.OS as string) === 'web') {
        // Web: Download via Blob
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        setExported(true);
      } else {
        // Native: Datei schreiben und teilen
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: format === 'csv' ? 'text/csv' : 'text/plain',
            dialogTitle: `Экспорт ${filteredWords.length} слов`,
            UTI: format === 'csv' ? 'public.comma-separated-values-text' : 'public.plain-text',
          });
          setExported(true);
          if ((Platform.OS as string) !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } else {
          Alert.alert('Ошибка', 'Функция "Поделиться" недоступна на этом устройстве.');
        }
      }
    } catch (err) {
      console.error('Export error:', err);
      Alert.alert('Ошибка экспорта', 'Не удалось создать файл. Попробуй ещё раз.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 12 }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: fontSizes.xl, color: colors.muted }}>‹</Text>
          </Pressable>
          <View>
            <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.foreground }}>📤 Экспорт слов</Text>
            <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>Сохрани словарь для Anki, Excel или заметок</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          {/* Statistik-Banner */}
          <View style={{
            backgroundColor: colors.primary + '15', borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: colors.primary + '30',
            flexDirection: 'row', gap: 16,
          }}>
            {[
              { label: 'Всего слов', value: ALL_WORDS.length, emoji: '📚' },
              { label: 'Выучено', value: learnedCount, emoji: '✅' },
              { label: 'Новые', value: ALL_WORDS.length - learnedCount, emoji: '🆕' },
            ].map(s => (
              <View key={s.label} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
                <Text style={{ fontSize: fontSizes.xl, fontWeight: '900', color: colors.primary }}>{s.value}</Text>
                <Text style={{ fontSize: 10, color: colors.muted, textAlign: 'center' }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Status-Filter */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
              📂 Какие слова экспортировать?
            </Text>
            <View style={{ gap: 8 }}>
              {[
                { key: 'all', label: '📚 Все слова', count: ALL_WORDS.length },
                { key: 'learned', label: '✅ Только выученные', count: learnedCount },
                { key: 'new', label: '🆕 Только новые', count: ALL_WORDS.length - learnedCount },
              ].map(opt => (
                <Pressable
                  key={opt.key}
                  onPress={() => setStatusFilter(opt.key as StatusFilter)}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    padding: 12, borderRadius: 12,
                    backgroundColor: statusFilter === opt.key ? colors.primary + '15' : colors.background,
                    borderWidth: 2, borderColor: statusFilter === opt.key ? colors.primary : colors.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: statusFilter === opt.key ? colors.primary : colors.foreground }}>
                    {opt.label}
                  </Text>
                  <View style={{
                    backgroundColor: statusFilter === opt.key ? colors.primary : colors.border,
                    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
                  }}>
                    <Text style={{ fontSize: fontSizes.xs, fontWeight: '700', color: statusFilter === opt.key ? '#fff' : colors.muted }}>
                      {opt.count}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Level-Filter */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>🎯 Уровень</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['all', 'A1', 'A2', 'B1', 'B2'] as LevelFilter[]).map(l => (
                <Pressable
                  key={l}
                  onPress={() => setLevelFilter(l)}
                  style={({ pressed }) => ({
                    flex: 1, backgroundColor: levelFilter === l ? colors.primary : colors.background,
                    borderRadius: 12, padding: 10, alignItems: 'center',
                    borderWidth: 1.5, borderColor: levelFilter === l ? colors.primary : colors.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ fontSize: fontSizes.xs, fontWeight: '700', color: levelFilter === l ? '#fff' : colors.foreground }}>
                    {l === 'all' ? 'Все' : l}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Format-Auswahl */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>📄 Формат файла</Text>
            <View style={{ gap: 8 }}>
              {(Object.entries(FORMAT_INFO) as [ExportFormat, typeof FORMAT_INFO[ExportFormat]][]).map(([key, info]) => (
                <Pressable
                  key={key}
                  onPress={() => setFormat(key)}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    padding: 12, borderRadius: 12,
                    backgroundColor: format === key ? colors.primary + '15' : colors.background,
                    borderWidth: 2, borderColor: format === key ? colors.primary : colors.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ fontSize: 24 }}>{info.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: format === key ? colors.primary : colors.foreground }}>
                      {info.label}
                    </Text>
                    <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>{info.desc}</Text>
                  </View>
                  {format === key && (
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Vorschau */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
              👁 Предпросмотр ({filteredWords.length} слов)
            </Text>
            {filteredWords.length === 0 ? (
              <Text style={{ fontSize: fontSizes.sm, color: colors.muted, textAlign: 'center', paddingVertical: 12 }}>
                Нет слов с выбранными фильтрами
              </Text>
            ) : (
              <>
                {filteredWords.slice(0, 5).map((word, i) => (
                  <View key={word.id} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    paddingVertical: 6, borderBottomWidth: i < 4 ? 0.5 : 0, borderBottomColor: colors.border,
                  }}>
                    <Text style={{ fontSize: fontSizes.xs, color: colors.muted, width: 18, textAlign: 'right' }}>{i + 1}.</Text>
                    <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: colors.foreground, flex: 1 }}>{word.german}</Text>
                    <Text style={{ fontSize: fontSizes.sm, color: colors.muted, flex: 1 }}>{word.russian}</Text>
                    <View style={{
                      backgroundColor: word.cefrLevel === 'A1' ? '#10B981' : word.cefrLevel === 'A2' ? '#3B82F6' : word.cefrLevel === 'B1' ? '#F59E0B' : '#EF4444',
                      borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1,
                    }}>
                      <Text style={{ fontSize: 9, fontWeight: '800', color: '#fff' }}>{word.cefrLevel}</Text>
                    </View>
                  </View>
                ))}
                {filteredWords.length > 5 && (
                  <Text style={{ fontSize: fontSizes.xs, color: colors.muted, textAlign: 'center', marginTop: 8 }}>
                    + ещё {filteredWords.length - 5} слов
                  </Text>
                )}
              </>
            )}
          </View>

          {/* Export-Button */}
          {exported && (
            <View style={{ backgroundColor: colors.success + '15', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.success + '40' }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.success }}>
                ✅ Файл успешно создан!
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleExport}
            disabled={isExporting || filteredWords.length === 0}
            style={({ pressed }) => ({
              backgroundColor: filteredWords.length === 0 ? colors.border : colors.primary,
              borderRadius: 18, padding: 18, alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
              shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
              shadowOpacity: filteredWords.length > 0 ? 0.4 : 0, shadowRadius: 12, elevation: 6,
            })}
          >
            {isExporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ fontSize: fontSizes.xl, fontWeight: '900', color: '#fff' }}>
                  📤 Экспортировать {filteredWords.length} слов
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                  Формат: {FORMAT_INFO[format].label} · .{FORMAT_INFO[format].ext}
                </Text>
              </>
            )}
          </Pressable>

          {(Platform.OS as string) === 'web' && (
            <View style={{ backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12 }}>
              <Text style={{ fontSize: fontSizes.xs, color: '#1D4ED8', textAlign: 'center' }}>
                💻 На веб-версии файл будет скачан автоматически
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
