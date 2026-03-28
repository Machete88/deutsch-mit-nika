import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/lib/settings-context';
import { useStatistics } from '@/lib/statistics-context';
import { useAchievements } from '@/lib/achievements-context';
import { useNotifications } from '@/lib/notifications-context';
import { useNikaTheme } from '@/lib/nika-theme-context';
import { ThemeToggleRow } from '@/components/ui/theme-toggle';

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Anfänger (A1)',
  intermediate: 'Mittel (A2–B1)',
  advanced: 'Fortgeschritten (B1–B2)',
};
const FONT_SIZE_LABELS: Record<string, string> = { small: 'Klein', normal: 'Normal', large: 'Groß' };

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const { stats } = useStatistics();
  const { achievements } = useAchievements();
  const { notifSettings, permissionStatus, requestPermissions, updateNotifSettings, sendTestNotification } = useNotifications();
  const { colors, font, space, radius, isDark, fontSizeLevel, setFontSizeLevel, fs } = useNikaTheme();

  const unlockedAchievements = achievements.filter((a: any) => a.isUnlocked);

  const handleToggleNotifications = async (val: boolean) => {
    if (val && permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Keine Berechtigung', 'Erlaube Benachrichtigungen in den Geräteeinstellungen.', [{ text: 'OK' }]);
        return;
      }
    }
    await updateNotifSettings({ enabled: val });
  };

  const handleTestNotification = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Nicht verfügbar', 'Push-Benachrichtigungen werden in der Web-Version nicht unterstützt.');
      return;
    }
    await sendTestNotification();
    Alert.alert('Gesendet!', 'Test-Benachrichtigung kommt in 2 Sekunden.');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg1, paddingTop: insets.top }]}>
      <View style={[styles.orb1, { backgroundColor: colors.orb1 }]} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.glass2, borderColor: colors.purple400 + '55' }]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{settings.userName || 'Lernender'}</Text>
            <Text style={[styles.userLevel, { color: colors.purple400 }]}>{LEVEL_LABELS[settings.userLevel] ?? 'Anfänger (A1)'}</Text>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: 'rgba(251,146,60,0.15)', borderColor: 'rgba(251,146,60,0.30)' }]}>
            <Text style={styles.streakBadgeText}>🔥 {stats.currentStreak}</Text>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Streak', value: `${stats.currentStreak}🔥`, color: '#FB923C' },
            { label: 'Gelernt', value: stats.totalWordsLearned, color: colors.neonGreen },
            { label: 'Wiederholt', value: stats.totalWordsReviewed, color: colors.neonBlue },
            { label: 'Gespräche', value: stats.totalSpeakingSessions, color: colors.neonCyan },
          ].map(item => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: colors.glass1, borderColor: item.color + '33' }]}>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Charts Link ── */}
        <Pressable
          onPress={() => router.push('/stats' as never)}
          style={({ pressed }) => [styles.chartsBtn, { backgroundColor: colors.glass1, borderColor: colors.glassBorder }, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.chartsBtnIcon}>📊</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.chartsBtnTitle, { color: colors.textPrimary }]}>Fortschritts-Charts</Text>
            <Text style={[styles.chartsBtnSub, { color: colors.textMuted }]}>Lernkurve & Aktivität</Text>
          </View>
          <Text style={[styles.chartsBtnArrow, { color: colors.textMuted }]}>→</Text>
        </Pressable>

        {/* ── Achievements ── */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Erfolge</Text>
        <View style={[styles.achievementsWrap, { backgroundColor: colors.glass1, borderColor: colors.glassBorder }]}>
          <View style={styles.achieveHeader}>
            <Text style={[styles.achieveCount, { color: colors.textMuted }]}>{unlockedAchievements.length}/{achievements.length} freigeschaltet</Text>
            <View style={[styles.achieveProgressTrack, { backgroundColor: colors.glass2 }]}>
              <View style={[styles.achieveProgressFill, {
                width: `${achievements.length > 0 ? (unlockedAchievements.length / achievements.length) * 100 : 0}%` as any,
                backgroundColor: colors.gold,
              }]} />
            </View>
          </View>
          <View style={styles.achieveGrid}>
            {achievements.slice(0, 6).map((a: any) => (
              <View key={a.id} style={[
                styles.achieveCard,
                { backgroundColor: colors.glass2, borderColor: colors.glassBorder },
                a.isUnlocked && { borderColor: colors.gold + '55', backgroundColor: colors.gold + '0D' },
              ]}>
                <Text style={[styles.achieveIcon, !a.isUnlocked && { opacity: 0.3 }]}>{a.icon}</Text>
                <Text style={[styles.achieveName, { color: a.isUnlocked ? colors.textSecondary : colors.textDisabled }]} numberOfLines={2}>
                  {a.title}
                </Text>
                {!a.isUnlocked && <Text style={styles.achieveLock}>🔒</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* ── Settings ── */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Einstellungen</Text>
        <View style={[styles.settingsWrap, { backgroundColor: colors.glass1, borderColor: colors.glassBorder }]}>

          {/* ── Theme Toggle ── */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.glassBorder }]}>
            <ThemeToggleRow />
          </View>

          {/* Level */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.glassBorder }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: colors.glass2 }]}><Text style={styles.settingIcon}>🎓</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Sprachniveau</Text>
              <View style={styles.levelBtns}>
                {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
                  <Pressable
                    key={lvl}
                    onPress={() => updateSettings({ userLevel: lvl })}
                    style={[
                      styles.levelBtn,
                      { backgroundColor: colors.glass2, borderColor: colors.glassBorder },
                      settings.userLevel === lvl && { backgroundColor: colors.purple600, borderColor: colors.purple500 },
                    ]}
                  >
                    <Text style={[styles.levelBtnText, { color: settings.userLevel === lvl ? '#FFF' : colors.textMuted }]}>
                      {lvl === 'beginner' ? 'A1' : lvl === 'intermediate' ? 'A2–B1' : 'B1–B2'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Font Size */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.glassBorder }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: colors.glass2 }]}><Text style={styles.settingIcon}>🔤</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Schriftgröße</Text>
              <View style={styles.levelBtns}>
                {(['small', 'normal', 'large'] as const).map(size => (
                  <Pressable
                    key={size}
                    onPress={() => {
                      setFontSizeLevel(size);
                      updateSettings({ fontSizeLevel: size });
                    }}
                    style={[
                      styles.levelBtn,
                      { backgroundColor: colors.glass2, borderColor: colors.glassBorder },
                      fontSizeLevel === size && { backgroundColor: colors.purple600, borderColor: colors.purple500 },
                    ]}
                  >
                    <Text style={[styles.levelBtnText, { color: fontSizeLevel === size ? '#FFF' : colors.textMuted, fontSize: size === 'small' ? 11 : size === 'large' ? 15 : 13 }]}>
                      {FONT_SIZE_LABELS[size]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Notifications */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.glassBorder }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: colors.glass2 }]}><Text style={styles.settingIcon}>🔔</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Benachrichtigungen</Text>
              <Text style={[styles.settingValue, { color: colors.textMuted }]}>{notifSettings.enabled ? 'Aktiviert' : 'Deaktiviert'}</Text>
            </View>
            <Switch
              value={notifSettings.enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.glass3, true: colors.purple600 }}
              thumbColor={notifSettings.enabled ? colors.purple300 : colors.textMuted}
              disabled={Platform.OS === 'web'}
            />
          </View>

          {/* Test Notification */}
          <Pressable onPress={handleTestNotification} style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: colors.glass2 }]}><Text style={styles.settingIcon}>🧪</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Test-Benachrichtigung</Text>
              <Text style={[styles.settingValue, { color: colors.textMuted }]}>Jetzt senden</Text>
            </View>
            <Text style={[styles.settingArrow, { color: colors.textMuted }]}>→</Text>
          </Pressable>
        </View>

        {/* ── App Info ── */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoTitle, { color: colors.textMuted }]}>Deutsch mit Nika</Text>
          <Text style={[styles.appInfoSub, { color: colors.textDisabled }]}>Version 2.0 · Powered by Nika AI</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb1: { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110 },
  scroll: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, paddingBottom: 16 },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 28 },
  userName: { fontSize: 20, fontWeight: '800' },
  userLevel: { fontSize: 11, marginTop: 3 },
  streakBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  streakBadgeText: { color: '#FB923C', fontSize: 13, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47.5%', borderRadius: 16, borderWidth: 1, paddingVertical: 12, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11 },
  chartsBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20 },
  chartsBtnIcon: { fontSize: 24 },
  chartsBtnTitle: { fontSize: 13, fontWeight: '700' },
  chartsBtnSub: { fontSize: 11, marginTop: 2 },
  chartsBtnArrow: { fontSize: 15 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 },
  achievementsWrap: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20 },
  achieveHeader: { marginBottom: 12 },
  achieveCount: { fontSize: 11, marginBottom: 6 },
  achieveProgressTrack: { height: 4, borderRadius: 999, overflow: 'hidden' },
  achieveProgressFill: { height: '100%', borderRadius: 999 },
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achieveCard: { width: '30%', borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 4, position: 'relative' },
  achieveIcon: { fontSize: 24 },
  achieveName: { fontSize: 9, textAlign: 'center', fontWeight: '500' },
  achieveLock: { position: 'absolute', top: 4, right: 4, fontSize: 10 },
  settingsWrap: { borderRadius: 20, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  settingIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingIcon: { fontSize: 18 },
  settingLabel: { fontSize: 14, fontWeight: '600' },
  settingValue: { fontSize: 12, marginTop: 2 },
  settingArrow: { fontSize: 15 },
  levelBtns: { flexDirection: 'row', gap: 6, marginTop: 8 },
  levelBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  levelBtnText: { fontSize: 11, fontWeight: '600' },
  appInfo: { alignItems: 'center', paddingVertical: 20 },
  appInfoTitle: { fontSize: 13, fontWeight: '700' },
  appInfoSub: { fontSize: 11, marginTop: 4 },
});
