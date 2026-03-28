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

// Light-Mode-sichere Farben
function useContrastColors(isDark: boolean, colors: any) {
  return {
    textPrimary: isDark ? '#F8FAFC' : '#1E1033',
    textSecondary: isDark ? '#C4B5FD' : '#4B3F72',
    textMuted: isDark ? '#9B8AB8' : '#6B5B8A',
    sectionBg: isDark ? colors.glass1 : 'rgba(124,58,237,0.06)',
    sectionBorder: isDark ? colors.glassBorder : 'rgba(124,58,237,0.18)',
    rowBorder: isDark ? colors.glassBorder : 'rgba(124,58,237,0.12)',
    iconBg: isDark ? colors.glass2 : 'rgba(124,58,237,0.10)',
    switchTrackOff: isDark ? colors.glass3 : '#D1D5DB',
    switchThumbOff: '#9CA3AF',
  };
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const { stats } = useStatistics();
  const { achievements } = useAchievements();
  const { notifSettings, permissionStatus, requestPermissions, updateNotifSettings, sendTestNotification } = useNotifications();
  const { colors, isDark, fontSizeLevel, setFontSizeLevel, fs } = useNikaTheme();
  const c = useContrastColors(isDark, colors);

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
    <View style={[styles.root, { backgroundColor: isDark ? colors.bg1 : '#F7F4FD', paddingTop: insets.top }]}>
      <View style={[styles.orb1, { backgroundColor: colors.orb1 }]} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={[styles.avatarCircle, { backgroundColor: c.iconBg, borderColor: colors.purple400 + '55' }]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: c.textPrimary }]}>{settings.userName || 'Lernender'}</Text>
            <Text style={[styles.userLevel, { color: colors.purple500 }]}>{LEVEL_LABELS[settings.userLevel] ?? 'Anfänger (A1)'}</Text>
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
            <View key={item.label} style={[styles.statCard, { backgroundColor: c.sectionBg, borderColor: item.color + '33' }]}>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: c.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Charts Link ── */}
        <Pressable
          onPress={() => router.push('/stats' as never)}
          style={({ pressed }) => [styles.chartsBtn, { backgroundColor: c.sectionBg, borderColor: c.sectionBorder }, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.chartsBtnIcon}>📊</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.chartsBtnTitle, { color: c.textPrimary }]}>Fortschritts-Charts</Text>
            <Text style={[styles.chartsBtnSub, { color: c.textMuted }]}>Lernkurve & Aktivität</Text>
          </View>
          <Text style={[styles.chartsBtnArrow, { color: c.textMuted }]}>→</Text>
        </Pressable>

        {/* ── Achievements ── */}
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Erfolge</Text>
        <View style={[styles.achievementsWrap, { backgroundColor: c.sectionBg, borderColor: c.sectionBorder }]}>
          <View style={styles.achieveHeader}>
            <Text style={[styles.achieveCount, { color: c.textMuted }]}>{unlockedAchievements.length}/{achievements.length} freigeschaltet</Text>
            <View style={[styles.achieveProgressTrack, { backgroundColor: isDark ? colors.glass2 : 'rgba(124,58,237,0.12)' }]}>
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
                { backgroundColor: isDark ? colors.glass2 : 'rgba(124,58,237,0.08)', borderColor: c.sectionBorder },
                a.isUnlocked && { borderColor: colors.gold + '55', backgroundColor: colors.gold + '0D' },
              ]}>
                <Text style={[styles.achieveIcon, !a.isUnlocked && { opacity: 0.3 }]}>{a.icon}</Text>
                <Text style={[styles.achieveName, { color: a.isUnlocked ? c.textSecondary : c.textMuted }]} numberOfLines={2}>
                  {a.title}
                </Text>
                {!a.isUnlocked && <Text style={styles.achieveLock}>🔒</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* ── Settings ── */}
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Einstellungen</Text>
        <View style={[styles.settingsWrap, { backgroundColor: c.sectionBg, borderColor: c.sectionBorder }]}>

          {/* ── Theme Toggle ── */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: c.rowBorder }]}>
            <ThemeToggleRow />
          </View>

          {/* Interface Language */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: c.rowBorder }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: c.iconBg }]}><Text style={styles.settingIcon}>🌐</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Interface-Sprache</Text>
              <Text style={[styles.settingValue, { color: c.textMuted }]}>Erklärungen & Hilfe</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['ru', 'de'] as const).map(lang => (
                <Pressable
                  key={lang}
                  onPress={() => updateSettings({ language: lang })}
                  style={[{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5,
                    backgroundColor: settings.language === lang ? colors.purple600 : (isDark ? colors.glass2 : 'rgba(124,58,237,0.08)'),
                    borderColor: settings.language === lang ? colors.purple500 : c.sectionBorder,
                  }]}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: settings.language === lang ? '#FFF' : c.textSecondary }}>
                    {lang === 'ru' ? '🇷🇺 RU' : '🇩🇪 DE'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Level */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: c.rowBorder }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: c.iconBg }]}><Text style={styles.settingIcon}>🎓</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Sprachniveau</Text>
              <View style={styles.levelBtns}>
                {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
                  <Pressable
                    key={lvl}
                    onPress={() => updateSettings({ userLevel: lvl })}
                    style={[
                      styles.levelBtn,
                      { backgroundColor: isDark ? colors.glass2 : 'rgba(124,58,237,0.08)', borderColor: c.sectionBorder },
                      settings.userLevel === lvl && { backgroundColor: colors.purple600, borderColor: colors.purple500 },
                    ]}
                  >
                    <Text style={[styles.levelBtnText, { color: settings.userLevel === lvl ? '#FFF' : c.textSecondary }]}>
                      {lvl === 'beginner' ? 'A1' : lvl === 'intermediate' ? 'A2–B1' : 'B1–B2'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Font Size */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: c.rowBorder }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: c.iconBg }]}><Text style={styles.settingIcon}>🔤</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Schriftgröße</Text>
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
                      { backgroundColor: isDark ? colors.glass2 : 'rgba(124,58,237,0.08)', borderColor: c.sectionBorder },
                      fontSizeLevel === size && { backgroundColor: colors.purple600, borderColor: colors.purple500 },
                    ]}
                  >
                    <Text style={[styles.levelBtnText, { color: fontSizeLevel === size ? '#FFF' : c.textSecondary, fontSize: size === 'small' ? 11 : size === 'large' ? 15 : 13 }]}>
                      {FONT_SIZE_LABELS[size]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Notifications */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: c.rowBorder }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: c.iconBg }]}><Text style={styles.settingIcon}>🔔</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Benachrichtigungen</Text>
              <Text style={[styles.settingValue, { color: c.textMuted }]}>{notifSettings.enabled ? 'Aktiviert' : 'Deaktiviert'}</Text>
            </View>
            <Switch
              value={notifSettings.enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: c.switchTrackOff, true: colors.purple600 }}
              thumbColor={notifSettings.enabled ? colors.purple300 : c.switchThumbOff}
              disabled={Platform.OS === 'web'}
            />
          </View>

          {/* Test Notification */}
          <Pressable onPress={handleTestNotification} style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: c.iconBg }]}><Text style={styles.settingIcon}>🧪</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Test-Benachrichtigung</Text>
              <Text style={[styles.settingValue, { color: c.textMuted }]}>Jetzt senden</Text>
            </View>
            <Text style={[styles.settingArrow, { color: c.textMuted }]}>→</Text>
          </Pressable>
        </View>

        {/* ── Barrierefreiheit ── */}
        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Barrierefreiheit</Text>
        <View style={[styles.settingsWrap, { backgroundColor: c.sectionBg, borderColor: c.sectionBorder }]}>

          {/* Auto-Vorlesen */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: c.rowBorder }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: c.iconBg }]}><Text style={styles.settingIcon}>🔊</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Auto-Vorlesen</Text>
              <Text style={[styles.settingValue, { color: c.textMuted }]}>Nika liest Nachrichten automatisch vor</Text>
            </View>
            <Switch
              value={settings.accessibilityAutoTTS ?? false}
              onValueChange={val => updateSettings({ accessibilityAutoTTS: val })}
              trackColor={{ false: c.switchTrackOff, true: colors.purple600 }}
              thumbColor={(settings.accessibilityAutoTTS ?? false) ? colors.purple300 : c.switchThumbOff}
            />
          </View>

          {/* Hoher Kontrast */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: c.rowBorder }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: c.iconBg }]}><Text style={styles.settingIcon}>🎨</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Hoher Kontrast</Text>
              <Text style={[styles.settingValue, { color: c.textMuted }]}>Verstärkte Farben für bessere Lesbarkeit</Text>
            </View>
            <Switch
              value={settings.accessibilityHighContrast ?? false}
              onValueChange={val => updateSettings({ accessibilityHighContrast: val })}
              trackColor={{ false: c.switchTrackOff, true: colors.purple600 }}
              thumbColor={(settings.accessibilityHighContrast ?? false) ? colors.purple300 : c.switchThumbOff}
            />
          </View>

          {/* Große Touch-Ziele */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: c.rowBorder }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: c.iconBg }]}><Text style={styles.settingIcon}>👆</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Große Schaltflächen</Text>
              <Text style={[styles.settingValue, { color: c.textMuted }]}>Größere Tipp-Ziele für einfachere Bedienung</Text>
            </View>
            <Switch
              value={settings.accessibilityLargeTargets ?? false}
              onValueChange={val => updateSettings({ accessibilityLargeTargets: val })}
              trackColor={{ false: c.switchTrackOff, true: colors.purple600 }}
              thumbColor={(settings.accessibilityLargeTargets ?? false) ? colors.purple300 : c.switchThumbOff}
            />
          </View>

          {/* Barrierefreiheit-Modus (alle aktivieren) */}
          <View style={[styles.settingRow]}>
            <View style={[styles.settingIconWrap, { backgroundColor: c.iconBg }]}><Text style={styles.settingIcon}>♿</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: c.textPrimary }]}>Barrierefreiheit-Modus</Text>
              <Text style={[styles.settingValue, { color: c.textMuted }]}>Alle Hilfsfunktionen auf einmal aktivieren</Text>
            </View>
            <Switch
              value={settings.accessibilityMode ?? false}
              onValueChange={val => updateSettings({
                accessibilityMode: val,
                accessibilityAutoTTS: val,
                accessibilityHighContrast: val,
                accessibilityLargeTargets: val,
              })}
              trackColor={{ false: c.switchTrackOff, true: colors.neonGreen }}
              thumbColor={(settings.accessibilityMode ?? false) ? '#FFFFFF' : c.switchThumbOff}
            />
          </View>
        </View>

        {/* ── App Info ── */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoTitle, { color: c.textMuted }]}>Deutsch mit Nika</Text>
          <Text style={[styles.appInfoSub, { color: isDark ? colors.textDisabled : '#9CA3AF' }]}>Version 2.0 · Powered by Nika AI</Text>
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
