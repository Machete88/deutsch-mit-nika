/**
 * ThemeToggle — floating dark/light mode switch
 * Drop anywhere in a screen header or settings row.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import { useNikaTheme } from '@/lib/nika-theme-context';

interface ThemeToggleProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ThemeToggle({ size = 'md', showLabel = false }: ThemeToggleProps) {
  const { isDark, toggleTheme, colors } = useNikaTheme();
  const isSmall = size === 'sm';

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.10)',
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(124,58,237,0.25)',
          paddingHorizontal: isSmall ? 10 : 14,
          paddingVertical: isSmall ? 5 : 7,
        },
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text style={[styles.icon, isSmall && { fontSize: 14 }]}>
        {isDark ? '☀️' : '🌙'}
      </Text>
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: isSmall ? 11 : 13 }]}>
          {isDark ? 'Hell' : 'Dunkel'}
        </Text>
      )}
    </Pressable>
  );
}

/** Full-width toggle row for the Profile/Settings screen */
export function ThemeToggleRow() {
  const { isDark, toggleTheme, colors, radius } = useNikaTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.05)',
          borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(124,58,237,0.15)',
          borderRadius: radius.lg,
        },
        pressed && { opacity: 0.75 },
      ]}
    >
      <View style={[styles.rowIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.10)' }]}>
        <Text style={styles.rowIcon}>{isDark ? '🌙' : '☀️'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Erscheinungsbild</Text>
        <Text style={[styles.rowValue, { color: colors.textMuted }]}>
          {isDark ? 'Dunkel (Dark Mode)' : 'Hell (Light Mode)'}
        </Text>
      </View>
      {/* Toggle pill */}
      <View style={[
        styles.pill,
        { backgroundColor: isDark ? 'rgba(168,85,247,0.20)' : 'rgba(124,58,237,0.15)', borderColor: isDark ? 'rgba(168,85,247,0.40)' : 'rgba(124,58,237,0.35)' },
      ]}>
        <Text style={[styles.pillText, { color: isDark ? '#A855F7' : '#7C3AED' }]}>
          {isDark ? '🌙 Dunkel' : '☀️ Hell'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 999, borderWidth: 1,
  },
  icon: { fontSize: 16 },
  label: { fontWeight: '600' },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderWidth: 1,
  },
  rowIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  rowIcon: { fontSize: 18 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowValue: { fontSize: 12, marginTop: 2 },
  pill: {
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1,
  },
  pillText: { fontSize: 12, fontWeight: '700' },
});
