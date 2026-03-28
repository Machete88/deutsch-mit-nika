import { View, Text, ScrollView, Pressable, Switch, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useStatistics } from '@/lib/statistics-context';
import { useAchievements } from '@/lib/achievements-context';
import { useNotifications } from '@/lib/notifications-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import { useThemeContext } from '@/lib/theme-provider';

export default function ProfileScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const { stats } = useStatistics();
  const { achievements } = useAchievements();
  const { notifSettings, permissionStatus, requestPermissions, updateNotifSettings, sendTestNotification } = useNotifications();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const { setColorScheme } = useThemeContext();

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);

  const levelLabels: Record<string, string> = {
    beginner: 'Начинающий (A1)',
    intermediate: 'Средний (A2–B1)',
    advanced: 'Продвинутый (B1–B2)',
  };

  const fontSizeLabels: Record<string, string> = {
    small: 'Маленький',
    normal: 'Обычный',
    large: 'Большой',
  };

  const handleToggleNotifications = async (val: boolean) => {
    if (val && permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Нет разрешения',
          'Разреши уведомления в настройках устройства, чтобы получать напоминания.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    await updateNotifSettings({ enabled: val });
  };

  const handleTestNotification = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Недоступно', 'Push-уведомления не поддерживаются в веб-версии.');
      return;
    }
    await sendTestNotification();
    Alert.alert('Отправлено!', 'Тестовое уведомление придёт через 2 секунды.');
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.foreground }}>
            Профиль
          </Text>
        </View>

        {/* Stats Card */}
        <View style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.primary, borderRadius: 20, padding: 20 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: '#fff', marginBottom: 16 }}>
            Моя статистика
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {[
              { label: 'Серия дней', value: `🔥 ${stats.currentStreak}` },
              { label: 'Слов выучено', value: `📚 ${stats.totalWordsLearned}` },
              { label: 'Повторено', value: `🔄 ${stats.totalWordsReviewed}` },
              { label: 'Разговоров', value: `💬 ${stats.totalSpeakingSessions}` },
            ].map(item => (
              <View key={item.label} style={{ width: '47%', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12 }}>
                <Text style={{ fontSize: fontSizes.xl, fontWeight: '800', color: '#fff' }}>{item.value}</Text>
                <Text style={{ fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Charts Button */}
        <Pressable
          onPress={() => router.push('/stats' as never)}
          style={({ pressed }) => ({
            marginHorizontal: 20, marginBottom: 16,
            backgroundColor: colors.surface, borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: colors.border,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 24 }}>📊</Text>
            <View>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground }}>
                Графики прогресса
              </Text>
              <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>
                Кривая обучения и активность
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 18, color: colors.muted }}>›</Text>
        </Pressable>

        {/* Achievements */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            Достижения ({unlockedAchievements.length}/{achievements.length})
          </Text>
          {unlockedAchievements.map(a => (
            <View key={a.id} style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              backgroundColor: '#FEF3C7', borderRadius: 14, padding: 14, marginBottom: 8,
              borderWidth: 1, borderColor: '#F59E0B',
            }}>
              <Text style={{ fontSize: 28 }}>{a.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: '#92400E' }}>{a.title}</Text>
                <Text style={{ fontSize: fontSizes.xs, color: '#B45309', marginTop: 2 }}>{a.description}</Text>
              </View>
              <Text style={{ fontSize: 16 }}>🏅</Text>
            </View>
          ))}
          {lockedAchievements.slice(0, 3).map(a => (
            <View key={a.id} style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8,
              borderWidth: 1, borderColor: colors.border, opacity: 0.6,
            }}>
              <Text style={{ fontSize: 28, opacity: 0.4 }}>{a.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground }}>{a.title}</Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>{a.description}</Text>
              </View>
              <Text style={{ fontSize: 16 }}>🔒</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            Настройки
          </Text>

          {/* Level */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: colors.muted, marginBottom: 8 }}>
              Уровень немецкого
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                <Pressable
                  key={level}
                  onPress={() => updateSettings({ userLevel: level })}
                  style={({ pressed }) => ({
                    flex: 1, backgroundColor: settings.userLevel === level ? colors.primary : colors.background,
                    borderRadius: 10, padding: 8, alignItems: 'center',
                    borderWidth: 1, borderColor: settings.userLevel === level ? colors.primary : colors.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ fontSize: fontSizes.xs, fontWeight: '700', color: settings.userLevel === level ? '#fff' : colors.foreground }}>
                    {level === 'beginner' ? 'A1' : level === 'intermediate' ? 'A2-B1' : 'B1-B2'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Font Size */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: colors.muted, marginBottom: 8 }}>
              Размер шрифта
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['small', 'normal', 'large'] as const).map(size => (
                <Pressable
                  key={size}
                  onPress={() => updateSettings({ fontSizeLevel: size })}
                  style={({ pressed }) => ({
                    flex: 1, backgroundColor: settings.fontSizeLevel === size ? colors.primary : colors.background,
                    borderRadius: 10, padding: 8, alignItems: 'center',
                    borderWidth: 1, borderColor: settings.fontSizeLevel === size ? colors.primary : colors.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ fontSize: fontSizes.xs, fontWeight: '700', color: settings.fontSizeLevel === size ? '#fff' : colors.foreground }}>
                    {fontSizeLabels[size]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Dark Mode */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: colors.foreground }}>
              🌙 Тёмная тема
            </Text>
            <Switch
              value={settings.isDarkMode}
              onValueChange={val => { updateSettings({ isDarkMode: val }); setColorScheme(val ? 'dark' : 'light'); }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {/* Push Notifications Section */}
          <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, marginTop: 8, marginBottom: 12 }}>
            Уведомления
          </Text>

          {/* Enable Notifications Toggle */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: notifSettings.enabled ? 12 : 0 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: colors.foreground }}>
                  🔔 Напоминания
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2 }}>
                  {Platform.OS === 'web' ? 'Недоступно в веб-версии' : 'Ежедневные напоминания учиться'}
                </Text>
              </View>
              <Switch
                value={notifSettings.enabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
                disabled={Platform.OS === 'web'}
              />
            </View>

            {notifSettings.enabled && (
              <>
                {/* Time Picker */}
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: colors.muted, marginBottom: 8 }}>
                    Время напоминания
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {[7, 8, 9, 10, 12, 14, 18, 19, 20, 21].map(h => (
                        <Pressable
                          key={h}
                          onPress={() => updateNotifSettings({ reminderHour: h, reminderMinute: 0 })}
                          style={({ pressed }) => ({
                            backgroundColor: notifSettings.reminderHour === h ? colors.primary : colors.background,
                            borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
                            borderWidth: 1, borderColor: notifSettings.reminderHour === h ? colors.primary : colors.border,
                            opacity: pressed ? 0.7 : 1,
                          })}
                        >
                          <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: notifSettings.reminderHour === h ? '#fff' : colors.foreground }}>
                            {h}:00
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Streak Reminder */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: colors.foreground }}>
                    🔥 Напоминание о серии (20:00)
                  </Text>
                  <Switch
                    value={notifSettings.streakReminder}
                    onValueChange={val => updateNotifSettings({ streakReminder: val })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>

                {/* Test Button */}
                <Pressable
                  onPress={handleTestNotification}
                  style={({ pressed }) => ({
                    marginTop: 12, backgroundColor: colors.primary, borderRadius: 12,
                    padding: 12, alignItems: 'center', opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: '#fff' }}>
                    Тест-уведомление
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
