import React from 'react';
import {
  Pressable, Text, View, ViewStyle, TextStyle, StyleSheet, ActivityIndicator,
} from 'react-native';
import { DS } from '@/constants/design';

interface PremiumButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function PremiumButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}: PremiumButtonProps) {
  const sizeMap = {
    sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: DS.font.sm, radius: DS.radius.md },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: DS.font.base, radius: DS.radius.lg },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: DS.font.md, radius: DS.radius.xl },
  };

  const variantMap: Record<string, { bg: string; border: string; text: string; shadow: object }> = {
    primary: {
      bg: DS.colors.purple600,
      border: DS.colors.purple500,
      text: DS.colors.textPrimary,
      shadow: DS.shadow.md,
    },
    secondary: {
      bg: DS.colors.glass2,
      border: DS.colors.glassBorderBright,
      text: DS.colors.purple300,
      shadow: DS.shadow.sm,
    },
    ghost: {
      bg: 'transparent',
      border: 'rgba(168,85,247,0.3)',
      text: DS.colors.purple400,
      shadow: {},
    },
    gold: {
      bg: 'rgba(245,158,11,0.15)',
      border: 'rgba(245,158,11,0.5)',
      text: DS.colors.goldLight,
      shadow: DS.shadow.goldGlow,
    },
    danger: {
      bg: 'rgba(239,68,68,0.15)',
      border: 'rgba(239,68,68,0.4)',
      text: '#FCA5A5',
      shadow: {},
    },
  };

  const s = sizeMap[size];
  const v = variantMap[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderRadius: s.radius,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          opacity: pressed ? 0.8 : disabled ? 0.4 : 1,
          ...(fullWidth && { width: '100%' }),
        },
        v.shadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && <Text style={[styles.icon, { fontSize: s.fontSize + 2 }]}>{icon}</Text>}
          <Text
            style={[
              styles.label,
              { color: v.text, fontSize: s.fontSize, fontWeight: DS.font.semibold },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    lineHeight: 22,
  },
  label: {
    letterSpacing: 0.3,
  },
});
