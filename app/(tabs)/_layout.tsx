import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NikaProvider } from '@/lib/nika-context';
import { NikaChatProvider } from '@/lib/nika-chat-context';

// Nika Tab Icon — glowing paw
function NikaTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.nikaIconWrap, focused && styles.nikaIconWrapActive]}>
      <Text style={styles.nikaIconText}>🐾</Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'web' ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 64 + bottomPadding;

  return (
    <NikaProvider>
      <NikaChatProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#A78BFA',
            tabBarInactiveTintColor: '#475569',
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarStyle: {
              paddingTop: 6,
              paddingBottom: bottomPadding,
              height: tabBarHeight,
              backgroundColor: '#0D0B1A',
              borderTopColor: '#1E1040',
              borderTopWidth: 1,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              marginTop: 2,
            },
            tabBarIconStyle: {
              marginTop: 2,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Start',
              tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="learn"
            options={{
              title: 'Lernen',
              tabBarIcon: ({ color }) => <IconSymbol size={26} name="book.fill" color={color} />,
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
              tabBarIcon: ({ color }) => <IconSymbol size={26} name="arrow.clockwise" color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profil',
              tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.fill" color={color} />,
            }}
          />
          {/* Hidden tabs */}
          <Tabs.Screen name="speak" options={{ href: null }} />
        </Tabs>
      </NikaChatProvider>
    </NikaProvider>
  );
}

const styles = StyleSheet.create({
  nikaIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  nikaIconWrapActive: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  nikaIconText: { fontSize: 20 },
});
