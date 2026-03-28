import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { DS } from '@/constants/design';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'bright' | 'dark' | 'purple' | 'gold';
  glow?: boolean;
  padding?: number;
}

export function GlassCard({
  children,
  style,
  variant = 'default',
  glow = false,
  padding,
}: GlassCardProps) {
  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: DS.colors.glass2,
      borderColor: DS.colors.glassBorder,
    },
    bright: {
      backgroundColor: DS.colors.glass3,
      borderColor: DS.colors.glassBorderBright,
    },
    dark: {
      backgroundColor: 'rgba(5,3,15,0.7)',
      borderColor: DS.colors.glassBorder,
    },
    purple: {
      backgroundColor: 'rgba(124,58,237,0.15)',
      borderColor: 'rgba(168,85,247,0.3)',
    },
    gold: {
      backgroundColor: 'rgba(245,158,11,0.10)',
      borderColor: 'rgba(245,158,11,0.3)',
    },
  };

  return (
    <View
      style={[
        styles.base,
        variantStyles[variant],
        glow && DS.shadow.glow,
        padding !== undefined && { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: DS.radius.xl,
    borderWidth: 1,
    padding: DS.space[4],
    overflow: 'hidden',
  },
});
