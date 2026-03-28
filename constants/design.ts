/**
 * NIKA PREMIUM DESIGN SYSTEM
 * Dark Luxury · Light Premium · Glassmorphism · Neon Accents
 */

// ─── Shared non-color tokens ──────────────────────────────────────────────────
export const DS_FONT = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 42,
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
  black:     '900' as const,
  tight:  1.2,
  normal: 1.5,
  loose:  1.8,
};

export const DS_SPACE = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20,
  6: 24, 7: 28, 8: 32, 10: 40, 12: 48, 16: 64,
};

export const DS_RADIUS = {
  sm: 8, md: 12, lg: 16, xl: 20,
  '2xl': 24, '3xl': 32, full: 9999,
};

export const DS_SHADOW = {
  sm: { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  md: { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
  lg: { shadowColor: '#A855F7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 24, elevation: 16 },
  glow: { shadowColor: '#A855F7', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 20 },
  goldGlow: { shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 },
};

export const DS_GRADIENT = {
  purple:     ['#7C3AED', '#A855F7'],
  purpleDeep: ['#4C1D95', '#7C3AED'],
  blue:       ['#4338CA', '#6366F1'],
  cyan:       ['#0E7490', '#22D3EE'],
  gold:       ['#D97706', '#F59E0B', '#FCD34D'],
  success:    ['#065F46', '#10B981'],
  dark:       ['#0A0618', '#160D2E'],
  card:       ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'],
  nikaHero:   ['#1A0A3A', '#0A0618'],
};

// ─── Dark Mode Colors ─────────────────────────────────────────────────────────
const DARK_COLORS = {
  bg0: '#05030F',
  bg1: '#0A0618',
  bg2: '#0F0A22',
  bg3: '#160D2E',
  glass1: 'rgba(255,255,255,0.04)',
  glass2: 'rgba(255,255,255,0.07)',
  glass3: 'rgba(255,255,255,0.10)',
  glassBorder: 'rgba(255,255,255,0.10)',
  glassBorderBright: 'rgba(255,255,255,0.18)',
  purple50:  '#F5F3FF',
  purple100: '#EDE9FE',
  purple200: '#DDD6FE',
  purple300: '#C4B5FD',
  purple400: '#A78BFA',
  purple500: '#8B5CF6',
  purple600: '#7C3AED',
  purple700: '#6D28D9',
  purple800: '#5B21B6',
  purple900: '#4C1D95',
  neonPurple: '#A855F7',
  neonBlue:   '#6366F1',
  neonCyan:   '#22D3EE',
  neonGreen:  '#10B981',
  neonPink:   '#EC4899',
  gold:       '#F59E0B',
  goldLight:  '#FCD34D',
  textPrimary:   '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted:     '#64748B',
  textDisabled:  '#334155',
  success: '#10B981',
  warning: '#F59E0B',
  error:   '#EF4444',
  info:    '#6366F1',
  tabActive:   '#A855F7',
  tabInactive: '#475569',
  tabBg:       'rgba(10,6,24,0.92)',
  orb1: 'rgba(124,58,237,0.10)',
  orb2: 'rgba(168,85,247,0.07)',
  orb3: 'rgba(34,211,238,0.07)',
  inputBg: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(255,255,255,0.12)',
  inputText: '#F8FAFC',
  inputPlaceholder: '#475569',
  missionBg: 'rgba(255,255,255,0.04)',
  missionBorder: 'rgba(255,255,255,0.08)',
  cardShadow: 'rgba(124,58,237,0.25)',
  statusBarStyle: 'light' as 'light' | 'dark',
} as const;

// ─── Light Mode Colors ────────────────────────────────────────────────────────
const LIGHT_COLORS = {
  bg0: '#EDE9F9',
  bg1: '#F7F4FD',
  bg2: '#FFFFFF',
  bg3: '#F0EBF8',
  glass1: 'rgba(124,58,237,0.05)',
  glass2: 'rgba(124,58,237,0.08)',
  glass3: 'rgba(124,58,237,0.12)',
  glassBorder: 'rgba(124,58,237,0.15)',
  glassBorderBright: 'rgba(124,58,237,0.28)',
  purple50:  '#F5F3FF',
  purple100: '#EDE9FE',
  purple200: '#DDD6FE',
  purple300: '#C4B5FD',
  purple400: '#A78BFA',
  purple500: '#8B5CF6',
  purple600: '#7C3AED',
  purple700: '#6D28D9',
  purple800: '#5B21B6',
  purple900: '#4C1D95',
  neonPurple: '#7C3AED',
  neonBlue:   '#4F46E5',
  neonCyan:   '#0891B2',
  neonGreen:  '#059669',
  neonPink:   '#DB2777',
  gold:       '#D97706',
  goldLight:  '#F59E0B',
  textPrimary:   '#1E1033',
  textSecondary: '#4B3F72',
  textMuted:     '#7C6FA0',
  textDisabled:  '#C4B5FD',
  success: '#059669',
  warning: '#D97706',
  error:   '#DC2626',
  info:    '#4F46E5',
  tabActive:   '#7C3AED',
  tabInactive: '#9CA3AF',
  tabBg:       'rgba(247,244,253,0.96)',
  orb1: 'rgba(124,58,237,0.08)',
  orb2: 'rgba(168,85,247,0.06)',
  orb3: 'rgba(8,145,178,0.06)',
  inputBg: 'rgba(124,58,237,0.06)',
  inputBorder: 'rgba(124,58,237,0.20)',
  inputText: '#1E1033',
  inputPlaceholder: '#9CA3AF',
  missionBg: 'rgba(124,58,237,0.05)',
  missionBorder: 'rgba(124,58,237,0.12)',
  cardShadow: 'rgba(124,58,237,0.12)',
  statusBarStyle: 'dark' as 'light' | 'dark',
} as const;

export type ThemeColors = typeof DARK_COLORS;

export const THEME_COLORS = {
  dark: DARK_COLORS,
  light: LIGHT_COLORS,
} as const;

export type ThemeMode = 'dark' | 'light';

// ─── Legacy DS export (dark, for backward compat) ─────────────────────────────
export const DS = {
  colors: DARK_COLORS,
  font: DS_FONT,
  space: DS_SPACE,
  radius: DS_RADIUS,
  shadow: DS_SHADOW,
  gradient: DS_GRADIENT,
} as const;

export type DesignSystem = typeof DS;
