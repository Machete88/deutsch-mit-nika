import React from 'react';
import {
  View, ScrollView, ViewStyle, StyleSheet, StatusBar, Platform,
} from 'react-native';
import { DS } from '@/constants/design';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PremiumScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  noTopPad?: boolean;
}

export function PremiumScreen({
  children,
  scrollable = true,
  style,
  contentStyle,
  noTopPad = false,
}: PremiumScreenProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <View
      style={[
        styles.content,
        { paddingBottom: insets.bottom + DS.space[6] },
        !noTopPad && { paddingTop: DS.space[4] },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.root, style]}>
      <StatusBar barStyle="light-content" backgroundColor={DS.colors.bg0} />
      {/* Ambient glow orbs */}
      <View style={styles.orb1} pointerEvents="none" />
      <View style={styles.orb2} pointerEvents="none" />

      {scrollable ? (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.colors.bg1,
  },
  orb1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(124,58,237,0.12)',
    // blur simulated via large radius
  },
  orb2: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  content: {
    flex: 1,
    paddingHorizontal: DS.space[4],
  },
});
