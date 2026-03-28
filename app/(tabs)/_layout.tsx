import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NikaProvider } from '@/lib/nika-context';
import { NikaChatProvider } from '@/lib/nika-chat-context';
import { useNikaTheme } from '@/lib/nika-theme-context';

function NikaTabIcon({ focused }: { focused: boolean }) {
  const { colors } = useNikaTheme();
  return (
    <View style={[
      styles.nikaWrap,
      { backgroundColor: colors.glass2, borderColor: colors.purple400 + '33' },
      focused && {
        backgroundColor: colors.purple700,
        borderColor: colors.purple500,
        shadowColor: colors.neonPurple,
        shadowOpacity: 0.7,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
        elevation: 10,
      },
    ]}>
      {focused && (
        <View style={[styles.nikaGlowRing, { borderColor: colors.purple400 + '55' }]} />
      )}
      <Text style={[styles.nikaEmoji, focused && styles.nikaEmojiActive]}>🐾</Text>
    </View>
  );
}

function TabIcon({ icon, color, focused }: { icon: string; color: string; focused: boolean }) {
  return (
    <View style={[styles.tabIconWrap, focused && { backgroundColor: color + '1A' }]}>
      <IconSymbol size={22} name={icon as any} color={color} />
    </View>
  );
}

function TabsContent() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useNikaTheme();
  const bottomPadding = Platform.OS === 'web' ? 10 : Math.max(insets.bottom, 6);
  const tabBarHeight = 62 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.tabBg,
          borderTopColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(124,58,237,0.12)',
          borderTopWidth: 1,
          ...(Platform.OS === 'web' && {
            boxShadow: isDark
              ? '0 -8px 32px rgba(124,58,237,0.15)'
              : '0 -8px 32px rgba(124,58,237,0.08)',
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 1,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Start',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="house.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Lernen',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="book.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="nika"
        options={{
          title: 'Nika',
          tabBarIcon: ({ focused }) => <NikaTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Wiederholen',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="arrow.clockwise" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="person.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="speak" options={{ href: null }} />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <NikaProvider>
      <NikaChatProvider>
        <TabsContent />
      </NikaChatProvider>
    </NikaProvider>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  nikaWrap: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, position: 'relative',
  },
  nikaGlowRing: {
    position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: 25, borderWidth: 1,
  },
  nikaEmoji: { fontSize: 20 },
  nikaEmojiActive: { fontSize: 22 },
});
