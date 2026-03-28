import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, Platform, Switch, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { useVocabulary } from '@/lib/vocabulary-context';
import { useSpacedRepetition } from '@/lib/spaced-repetition-context';
import { vocabularyData, vocabularyDataExtra } from '@/lib/vocabulary-data';
import type { Word } from '@/lib/types';

// ─── Typen ──────────────────────────────────────────────────────────────────

interface DailyTask {
  id: string;
  type: 'review' | 'new' | 'exam' | 'audio' | 'dictation';
  title: string;
  description: string;
  emoji: string;
  wordCount?: number;
  route: string;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const STORAGE_KEY = 'daily_plan_state';
const ALL_WORDS: Word[] = [...vocabularyData, ...vocabularyDataExtra];

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getMotivationMessage(completed: number, total: number): { text: string; emoji: string } {
  const pct = total > 0 ? completed / total : 0;
  if (pct === 0) return { text: 'Начни свой день с немецкого!', emoji: '🌅' };
  if (pct < 0.5) return { text: 'Хорошее начало, продолжай!', emoji: '💪' };
  if (pct < 1) return { text: 'Почти готово, ещё немного!', emoji: '🔥' };
  return { text: 'Отличная работа! День выполнен!', emoji: '🏆' };
}

// ─── Hauptkomponente ─────────────────────────────────────────────────────────

export default function DailyPlanScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const { words, userWordStates } = useVocabulary();
  const { getDueWords, reviews } = useSpacedRepetition();

  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifHour, setNotifHour] = useState(9);
  const [isLoadingNotif, setIsLoadingNotif] = useState(false);
  const [todayKey] = useState(getTodayKey());

  // ── Gespeicherten Zustand laden ────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const data = JSON.parse(raw);
        if (data.date === todayKey) {
          setCompletedTasks(new Set(data.completed || []));
        }
        if (data.notifEnabled !== undefined) setNotifEnabled(data.notifEnabled);
        if (data.notifHour !== undefined) setNotifHour(data.notifHour);
      } catch {}
    });
  }, [todayKey]);

  // ── Zustand speichern ──────────────────────────────────────────────────────
  const saveState = useCallback((completed: Set<string>, ne: boolean, nh: number) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: todayKey,
      completed: Array.from(completed),
      notifEnabled: ne,
      notifHour: nh,
    }));
  }, [todayKey]);

  // ── Tagesplan generieren ───────────────────────────────────────────────────
  const dailyTasks = useMemo((): DailyTask[] => {
    const dueWords = getDueWords ? getDueWords(words) : [];
    const newWords = ALL_WORDS.filter(w => !userWordStates.has(w.id));
    const learnedCount = userWordStates.size;
    const tasks: DailyTask[] = [];

    // 1. Wiederholung (höchste Priorität wenn fällig)
    if (dueWords.length > 0) {
      tasks.push({
        id: 'review',
        type: 'review',
        title: 'Повторение',
        description: `${Math.min(dueWords.length, 20)} слов ждут повторения по алгоритму SM-2`,
        emoji: '🔄',
        wordCount: Math.min(dueWords.length, 20),
        route: '/(tabs)/review',
        estimatedMinutes: Math.min(dueWords.length, 20) * 0.5,
        priority: 'high',
        completed: completedTasks.has('review'),
      });
    }

    // 2. Neue Wörter lernen
    if (newWords.length > 0) {
      const targetNew = learnedCount < 50 ? 10 : learnedCount < 100 ? 8 : 5;
      tasks.push({
        id: 'new_words',
        type: 'new',
        title: 'Новые слова',
        description: `Выучи ${targetNew} новых слов с карточками`,
        emoji: '🃏',
        wordCount: targetNew,
        route: '/(tabs)/learn',
        estimatedMinutes: targetNew * 0.7,
        priority: dueWords.length === 0 ? 'high' : 'medium',
        completed: completedTasks.has('new_words'),
      });
    }

    // 3. Audio-Training
    tasks.push({
      id: 'audio',
      type: 'audio',
      title: 'Аудио-обучение',
      description: 'Прослушай 15 слов на немецком и по-русски',
      emoji: '🎧',
      wordCount: 15,
      route: '/audio',
      estimatedMinutes: 5,
      priority: 'medium',
      completed: completedTasks.has('audio'),
    });

    // 4. Diktat
    tasks.push({
      id: 'dictation',
      type: 'dictation',
      title: 'Диктант',
      description: 'Проверь понимание на слух — 10 слов',
      emoji: '✍️',
      wordCount: 10,
      route: '/dictation',
      estimatedMinutes: 7,
      priority: 'medium',
      completed: completedTasks.has('dictation'),
    });

    // 5. Prüfung (nur wenn schon viele Wörter gelernt)
    if (learnedCount >= 20) {
      tasks.push({
        id: 'exam',
        type: 'exam',
        title: 'Мини-экзамен',
        description: `Проверь уровень ${settings.userLevel || 'A1'} — 10 вопросов`,
        emoji: '📝',
        route: '/(tabs)/learn' as never,
        estimatedMinutes: 8,
        priority: 'low',
        completed: completedTasks.has('exam'),
      });
    }

    return tasks;
  }, [getDueWords, words, userWordStates, completedTasks, settings.userLevel]);

  const completedCount = dailyTasks.filter(t => t.completed).length;
  const totalMinutes = dailyTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const doneMinutes = dailyTasks.filter(t => t.completed).reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const motivation = getMotivationMessage(completedCount, dailyTasks.length);

  // ── Aufgabe als erledigt markieren ────────────────────────────────────────
  const handleTaskPress = (task: DailyTask) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Als erledigt markieren und navigieren
    const newCompleted = new Set(completedTasks);
    newCompleted.add(task.id);
    setCompletedTasks(newCompleted);
    saveState(newCompleted, notifEnabled, notifHour);
    router.push(task.route as never);
  };

  const handleToggleComplete = (taskId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
    saveState(newCompleted, notifEnabled, notifHour);
  };

  // ── Push-Benachrichtigung einrichten ───────────────────────────────────────
  const handleToggleNotification = async (enabled: boolean) => {
      if ((Platform.OS as string) === 'web') {
      Alert.alert('Недоступно', 'Push-уведомления доступны только в нативном приложении.');
      return;
    }
    setIsLoadingNotif(true);
    try {
      if (enabled) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Нет разрешения', 'Разреши уведомления в настройках устройства.');
          setIsLoadingNotif(false);
          return;
        }
        await scheduleNotification(notifHour);
        setNotifEnabled(true);
        saveState(completedTasks, true, notifHour);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
        setNotifEnabled(false);
        saveState(completedTasks, false, notifHour);
      }
    } catch (err) {
      console.error('Notification error:', err);
    } finally {
      setIsLoadingNotif(false);
    }
  };

  const handleChangeHour = async (hour: number) => {
    setNotifHour(hour);
    saveState(completedTasks, notifEnabled, hour);
    if (notifEnabled && Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await scheduleNotification(hour);
    }
  };

  const scheduleNotification = async (hour: number) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🇩🇪 Время учить немецкий!',
        body: 'Твой ежедневный план готов. Учи 10 минут в день — и ты заговоришь!',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    });
  };

  const priorityColor = (p: DailyTask['priority']) => {
    if (p === 'high') return colors.error;
    if (p === 'medium') return colors.warning;
    return colors.muted;
  };

  const priorityLabel = (p: DailyTask['priority']) => {
    if (p === 'high') return 'Важно';
    if (p === 'medium') return 'Средне';
    return 'Дополнительно';
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 12 }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: fontSizes.xl, color: colors.muted }}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.foreground }}>
              📅 План на сегодня
            </Text>
            <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>
              {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          {/* Motivations-Banner */}
          <View style={{
            backgroundColor: completedCount === dailyTasks.length && dailyTasks.length > 0
              ? colors.success + '20' : colors.primary + '15',
            borderRadius: 20, padding: 20,
            borderWidth: 1,
            borderColor: completedCount === dailyTasks.length && dailyTasks.length > 0
              ? colors.success + '40' : colors.primary + '30',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 36 }}>{motivation.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.lg, fontWeight: '800', color: colors.foreground }}>
                  {motivation.text}
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>
                  {completedCount} из {dailyTasks.length} задач · ~{Math.round(totalMinutes - doneMinutes)} мин осталось
                </Text>
              </View>
            </View>

            {/* Fortschrittsbalken */}
            <View style={{ height: 10, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 5, overflow: 'hidden' }}>
              <View style={{
                height: '100%',
                width: `${dailyTasks.length > 0 ? (completedCount / dailyTasks.length) * 100 : 0}%`,
                backgroundColor: completedCount === dailyTasks.length ? colors.success : colors.primary,
                borderRadius: 5,
              }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>0%</Text>
              <Text style={{ fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary }}>
                {dailyTasks.length > 0 ? Math.round((completedCount / dailyTasks.length) * 100) : 0}%
              </Text>
              <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>100%</Text>
            </View>
          </View>

          {/* Aufgaben-Liste */}
          <View>
            <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>
              Задачи на сегодня
            </Text>
            {dailyTasks.map((task, i) => (
              <View
                key={task.id}
                style={{
                  backgroundColor: task.completed ? colors.success + '10' : colors.surface,
                  borderRadius: 18, marginBottom: 10,
                  borderWidth: 1.5,
                  borderColor: task.completed ? colors.success + '40' : colors.border,
                  overflow: 'hidden',
                }}
              >
                <Pressable
                  onPress={() => handleTaskPress(task)}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  {/* Emoji */}
                  <View style={{
                    width: 52, height: 52, borderRadius: 16,
                    backgroundColor: task.completed ? colors.success + '20' : colors.primary + '15',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 26 }}>{task.completed ? '✅' : task.emoji}</Text>
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <Text style={{
                        fontSize: fontSizes.base, fontWeight: '700',
                        color: task.completed ? colors.success : colors.foreground,
                        textDecorationLine: task.completed ? 'line-through' : 'none',
                      }}>
                        {task.title}
                      </Text>
                      <View style={{
                        backgroundColor: priorityColor(task.priority) + '20',
                        borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
                      }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: priorityColor(task.priority) }}>
                          {priorityLabel(task.priority)}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: fontSizes.xs, color: colors.muted }}>
                      {task.description}
                    </Text>
                    <Text style={{ fontSize: fontSizes.xs, color: colors.primary, marginTop: 4, fontWeight: '600' }}>
                      ⏱ ~{Math.round(task.estimatedMinutes)} мин
                    </Text>
                  </View>

                  {/* Checkbox */}
                  <Pressable
                    onPress={(e) => { e.stopPropagation?.(); handleToggleComplete(task.id); }}
                    style={({ pressed }) => ({
                      width: 28, height: 28, borderRadius: 14,
                      backgroundColor: task.completed ? colors.success : 'transparent',
                      borderWidth: 2, borderColor: task.completed ? colors.success : colors.border,
                      alignItems: 'center', justifyContent: 'center',
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    {task.completed && <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>✓</Text>}
                  </Pressable>
                </Pressable>
              </View>
            ))}
          </View>

          {/* Push-Benachrichtigungen */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
              🔔 Ежедневное напоминание
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: colors.foreground }}>
                  Напоминать каждый день
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>
                  Получай уведомление в выбранное время
                </Text>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={handleToggleNotification}
                disabled={isLoadingNotif}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            {/* Uhrzeit-Auswahl */}
            <Text style={{ fontSize: fontSizes.xs, fontWeight: '600', color: colors.muted, marginBottom: 8 }}>
              Время напоминания:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[7, 8, 9, 10, 12, 14, 17, 19, 20, 21].map(h => (
                  <Pressable
                    key={h}
                    onPress={() => handleChangeHour(h)}
                    style={({ pressed }) => ({
                      backgroundColor: notifHour === h ? colors.primary : colors.background,
                      borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
                      borderWidth: 1.5, borderColor: notifHour === h ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: notifHour === h ? '#fff' : colors.foreground }}>
                      {h}:00
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {notifEnabled && (
              <View style={{ marginTop: 12, backgroundColor: colors.success + '15', borderRadius: 10, padding: 10 }}>
                <Text style={{ fontSize: fontSizes.xs, color: colors.success, fontWeight: '600', textAlign: 'center' }}>
                  ✅ Напоминание установлено на {notifHour}:00 каждый день
                </Text>
              </View>
            )}
          </View>

          {/* Schnell-Statistik */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
              📊 Твой прогресс
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { label: 'Выучено', value: userWordStates.size, emoji: '✅', color: colors.success },
                { label: 'Осталось', value: ALL_WORDS.length - userWordStates.size, emoji: '📚', color: colors.primary },
                { label: 'Всего', value: ALL_WORDS.length, emoji: '🗂', color: colors.muted },
              ].map(s => (
                <View key={s.label} style={{
                  flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12,
                  alignItems: 'center', borderWidth: 1, borderColor: colors.border,
                }}>
                  <Text style={{ fontSize: 18 }}>{s.emoji}</Text>
                  <Text style={{ fontSize: fontSizes.xl, fontWeight: '900', color: s.color, marginTop: 4 }}>{s.value}</Text>
                  <Text style={{ fontSize: 10, color: colors.muted, textAlign: 'center', marginTop: 2 }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
