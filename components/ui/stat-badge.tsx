import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DS } from '@/constants/design';

interface StatBadgeProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
  glowColor?: string;
}

export function StatBadge({ icon, value, label, color = DS.colors.purple400, glowColor }: StatBadgeProps) {
  return (
    <View style={[styles.container, { borderColor: color + '33' }]}>
      <View style={[styles.iconWrap, { backgroundColor: color + '1A' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

interface XPBarProps {
  current: number;
  max: number;
  label?: string;
}

export function XPBar({ current, max, label }: XPBarProps) {
  const pct = Math.min(1, current / Math.max(1, max));
  return (
    <View style={styles.xpWrap}>
      {label && <Text style={styles.xpLabel}>{label}</Text>}
      <View style={styles.xpTrack}>
        <View style={[styles.xpFill, { width: `${pct * 100}%` as any }]} />
        <View style={[styles.xpGlow, { width: `${pct * 100}%` as any }]} />
      </View>
    </View>
  );
}

interface PillBadgeProps {
  label: string;
  color?: string;
  icon?: string;
}

export function PillBadge({ label, color = DS.colors.purple500, icon }: PillBadgeProps) {
  return (
    <View style={[styles.pill, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      {icon && <Text style={styles.pillIcon}>{icon}</Text>}
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: DS.colors.glass1,
    borderWidth: 1,
    borderRadius: DS.radius.lg,
    padding: DS.space[3],
    minWidth: 72,
    gap: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: DS.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
  value: {
    fontSize: DS.font.lg,
    fontWeight: DS.font.bold,
  },
  label: {
    fontSize: DS.font.xs,
    color: DS.colors.textMuted,
    fontWeight: DS.font.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // XP Bar
  xpWrap: { gap: 6 },
  xpLabel: {
    fontSize: DS.font.xs,
    color: DS.colors.textMuted,
    fontWeight: DS.font.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  xpTrack: {
    height: 6,
    backgroundColor: DS.colors.glass2,
    borderRadius: DS.radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  xpFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: DS.colors.purple500,
    borderRadius: DS.radius.full,
  },
  xpGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: DS.colors.neonPurple,
    borderRadius: DS.radius.full,
    opacity: 0.4,
  },

  // Pill
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: DS.radius.full,
    borderWidth: 1,
  },
  pillIcon: { fontSize: 12 },
  pillText: {
    fontSize: DS.font.xs,
    fontWeight: DS.font.semibold,
    letterSpacing: 0.3,
  },
});
