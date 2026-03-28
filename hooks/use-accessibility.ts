import { FontSizeLevel } from '@/lib/types';

const FONT_SIZES = {
  small: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 36,
  },
  normal: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 42,
  },
  large: {
    xs: 14,
    sm: 16,
    base: 18,
    lg: 22,
    xl: 26,
    '2xl': 30,
    '3xl': 34,
    '4xl': 38,
    '5xl': 44,
    '6xl': 52,
  },
};

export function useFontSizes(level: FontSizeLevel = 'normal') {
  return FONT_SIZES[level] || FONT_SIZES.normal;
}
