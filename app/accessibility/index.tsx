import { View, Text, ScrollView, Pressable, Switch, AccessibilityInfo } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSettings } from '@/lib/settings-context';
import { useAccessibility } from '@/lib/accessibility-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function AccessibilityScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const a11y = useAccessibility();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();

  // Hochkontrast-Farben überschreiben Theme-Farben
  const bg = a11y.a11yColors?.background ?? colors.background;
  const fg = a11y.a11yColors?.foreground ?? colors.foreground;
  const surface = a11y.a11yColors?.surface ?? colors.surface;
  const border = a11y.a11yColors?.border ?? colors.border;
  const primary = a11y.a11yColors?.primary ?? colors.primary;
  const muted = a11y.a11yColors?.muted ?? colors.muted;

  const fs = {
    xs: fontSizes.xs * a11y.fontScale,
    sm: fontSizes.sm * a11y.fontScale,
    base: fontSizes.base * a11y.fontScale,
    lg: fontSizes.lg * a11y.fontScale,
    xl: fontSizes.xl * a11y.fontScale,
  };

  const toggle = async (key: keyof typeof settings, value: boolean) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateSettings({ [key]: value } as any);
  };

  const SettingRow = ({
    emoji,
    title,
    description,
    value,
    onToggle,
    recommended,
  }: {
    emoji: string;
    title: string;
    description: string;
    value: boolean;
    onToggle: (v: boolean) => void;
    recommended?: boolean;
  }) => (
    <View style={{
      backgroundColor: surface, borderRadius: 16, padding: 18,
      borderWidth: value ? 2 : 1,
      borderColor: value ? primary : border,
      marginBottom: 12,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 28 }}>{emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: fs.base, fontWeight: '700', color: fg }}>{title}</Text>
              {recommended && (
                <View style={{ backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: fs.xs, color: '#92400E', fontWeight: '600' }}>Рекомендуется</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: fs.sm, color: muted, marginTop: 4, lineHeight: fs.sm * 1.5 }}>{description}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: border, true: primary }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
          ios_backgroundColor={border}
          style={{ marginLeft: 12 }}
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer style={{ backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: a11y.minTouchTarget, height: a11y.minTouchTarget,
              borderRadius: a11y.minTouchTarget / 2,
              backgroundColor: surface, alignItems: 'center', justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 22, color: fg }}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fs.xl, fontWeight: '800', color: fg }}>
              ♿ Barrierefreiheit
            </Text>
            <Text style={{ fontSize: fs.sm, color: muted, marginTop: 2 }}>
              Für sehbehinderte Nutzer
            </Text>
          </View>
        </View>

        {/* Info-Banner */}
        <View style={{
          marginHorizontal: 20, marginBottom: 20,
          backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16,
          borderWidth: 1.5, borderColor: '#BFDBFE',
        }}>
          <Text style={{ fontSize: fs.base, fontWeight: '700', color: '#1D4ED8', marginBottom: 4 }}>
            👁️ Modus für Sehbehinderte
          </Text>
          <Text style={{ fontSize: fs.sm, color: '#3B82F6', lineHeight: fs.sm * 1.6 }}>
            Diese Einstellungen verbessern die Lesbarkeit und Bedienbarkeit der App für Menschen mit eingeschränktem Sehvermögen. Alle Optionen können einzeln aktiviert werden.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Haupt-Schalter */}
          <Text style={{ fontSize: fs.lg, fontWeight: '700', color: fg, marginBottom: 12 }}>
            Allgemein
          </Text>

          <SettingRow
            emoji="♿"
            title="Barrierefreiheitsmodus"
            description="Aktiviert alle Barrierefreiheits-Verbesserungen auf einmal: größere Schrift (1.4×), größere Touch-Targets und optimierte Layouts."
            value={settings.accessibilityMode}
            onToggle={async (v) => {
              await updateSettings({
                accessibilityMode: v,
                accessibilityLargeTargets: v,
                fontSizeLevel: v ? 'large' : settings.fontSizeLevel,
              });
            }}
            recommended
          />

          <Text style={{ fontSize: fs.lg, fontWeight: '700', color: fg, marginBottom: 12, marginTop: 8 }}>
            Visuelle Anpassungen
          </Text>

          <SettingRow
            emoji="🔆"
            title="Hoher Kontrast"
            description="Maximiert den Farbkontrast zwischen Text und Hintergrund. Im Hellmodus: Schwarz auf Weiß. Im Dunkelmodus: Gelb auf Schwarz. Ideal bei Grauem Star oder schwacher Sehkraft."
            value={settings.accessibilityHighContrast}
            onToggle={(v) => toggle('accessibilityHighContrast', v)}
          />

          <SettingRow
            emoji="🔠"
            title="Große Schrift"
            description="Erhöht die Schriftgröße auf 'Groß' (1.2× Skalierung). In Kombination mit dem Barrierefreiheitsmodus wird die Schrift auf 1.4× skaliert."
            value={settings.fontSizeLevel === 'large'}
            onToggle={(v) => updateSettings({ fontSizeLevel: v ? 'large' : 'normal' })}
          />

          <SettingRow
            emoji="👆"
            title="Große Touch-Targets"
            description="Vergrößert alle Schaltflächen und Tipp-Bereiche auf mindestens 64×64 Pixel. Erleichtert das Antippen für Nutzer mit motorischen Einschränkungen oder zitternden Händen."
            value={settings.accessibilityLargeTargets}
            onToggle={(v) => toggle('accessibilityLargeTargets', v)}
          />

          <Text style={{ fontSize: fs.lg, fontWeight: '700', color: fg, marginBottom: 12, marginTop: 8 }}>
            Audio-Unterstützung
          </Text>

          <SettingRow
            emoji="🔊"
            title="Auto-Vorlesen (TTS)"
            description="Liest Vokabeln automatisch vor, sobald eine neue Lernkarte angezeigt wird. Ideal für Nutzer, die sich auf das Hören statt auf das Lesen verlassen möchten."
            value={settings.accessibilityAutoTTS}
            onToggle={(v) => toggle('accessibilityAutoTTS', v)}
          />

          {/* Vorschau */}
          {(settings.accessibilityHighContrast || settings.accessibilityMode) && (
            <View style={{
              backgroundColor: bg, borderRadius: 16, padding: 20,
              borderWidth: 2, borderColor: primary, marginTop: 8,
            }}>
              <Text style={{ fontSize: fs.base, fontWeight: '700', color: fg, marginBottom: 8 }}>
                👁️ Vorschau
              </Text>
              <Text style={{ fontSize: fs.xl, fontWeight: '800', color: fg }}>
                sein
              </Text>
              <Text style={{ fontSize: fs.base, color: muted, marginTop: 4 }}>
                быть (to be)
              </Text>
              <Text style={{ fontSize: fs.sm, color: muted, marginTop: 4, fontStyle: 'italic' }}>
                [zaɪn] • Verb
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <View style={{
                  flex: 1, backgroundColor: '#FFE4E4', borderRadius: 12,
                  padding: 14, alignItems: 'center',
                  borderWidth: settings.accessibilityHighContrast ? 2 : 0,
                  borderColor: a11y.a11yColors?.error ?? '#CC0000',
                  minHeight: a11y.minTouchTarget,
                  justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: fs.base, fontWeight: '700', color: '#CC0000' }}>← Сложно</Text>
                </View>
                <View style={{
                  flex: 1, backgroundColor: '#E4FFE4', borderRadius: 12,
                  padding: 14, alignItems: 'center',
                  borderWidth: settings.accessibilityHighContrast ? 2 : 0,
                  borderColor: a11y.a11yColors?.success ?? '#006600',
                  minHeight: a11y.minTouchTarget,
                  justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: fs.base, fontWeight: '700', color: '#006600' }}>Легко →</Text>
                </View>
              </View>
            </View>
          )}

          {/* Zurück-Button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              backgroundColor: primary, borderRadius: 16, padding: 18,
              alignItems: 'center', marginTop: 24,
              minHeight: a11y.minTouchTarget,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Text style={{ fontSize: fs.lg, fontWeight: '800', color: settings.accessibilityHighContrast && settings.isDarkMode ? '#000' : '#fff' }}>
              Сохранить и вернуться
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
