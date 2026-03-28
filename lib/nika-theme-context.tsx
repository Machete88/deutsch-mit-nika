/**
 * Nika Theme Context
 * Provides dark/light mode switching + font size scaling with AsyncStorage persistence.
 */
import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_COLORS, ThemeColors, ThemeMode, DS_FONT, DS_SPACE, DS_RADIUS, DS_SHADOW, DS_GRADIENT } from '@/constants/design';

const STORAGE_KEY_THEME = 'nika_theme_mode';
const STORAGE_KEY_FONT = 'nika_font_size';

export type FontSizeLevel = 'small' | 'normal' | 'large';

// Font scale multipliers
const FONT_SCALE: Record<FontSizeLevel, number> = {
  small: 0.88,
  normal: 1.0,
  large: 1.18,
};

interface NikaThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  font: typeof DS_FONT;
  space: typeof DS_SPACE;
  radius: typeof DS_RADIUS;
  shadow: typeof DS_SHADOW;
  gradient: typeof DS_GRADIENT;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  // Font size
  fontSizeLevel: FontSizeLevel;
  setFontSizeLevel: (level: FontSizeLevel) => void;
  fontScale: number;
  /** Scale a fontSize value by the current fontScale */
  fs: (base: number) => number;
}

const NikaThemeContext = createContext<NikaThemeContextType | undefined>(undefined);

export function NikaThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [fontSizeLevel, setFontSizeLevelState] = useState<FontSizeLevel>('normal');

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_THEME),
      AsyncStorage.getItem(STORAGE_KEY_FONT),
    ]).then(([storedTheme, storedFont]) => {
      if (storedTheme === 'light' || storedTheme === 'dark') setMode(storedTheme);
      if (storedFont === 'small' || storedFont === 'normal' || storedFont === 'large') {
        setFontSizeLevelState(storedFont as FontSizeLevel);
      }
    });
  }, []);

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem(STORAGE_KEY_THEME, newMode);
  };

  const toggleTheme = () => setTheme(mode === 'dark' ? 'light' : 'dark');

  const setFontSizeLevel = (level: FontSizeLevel) => {
    setFontSizeLevelState(level);
    AsyncStorage.setItem(STORAGE_KEY_FONT, level);
  };

  const fontScale = FONT_SCALE[fontSizeLevel];
  const fs = useMemo(() => (base: number) => Math.round(base * fontScale), [fontScale]);

  const value: NikaThemeContextType = {
    mode,
    isDark: mode === 'dark',
    colors: THEME_COLORS[mode],
    font: DS_FONT,
    space: DS_SPACE,
    radius: DS_RADIUS,
    shadow: DS_SHADOW,
    gradient: DS_GRADIENT,
    toggleTheme,
    setTheme,
    fontSizeLevel,
    setFontSizeLevel,
    fontScale,
    fs,
  };

  return (
    <NikaThemeContext.Provider value={value}>
      {children}
    </NikaThemeContext.Provider>
  );
}

export function useNikaTheme(): NikaThemeContextType {
  const ctx = useContext(NikaThemeContext);
  if (!ctx) throw new Error('useNikaTheme must be used within NikaThemeProvider');
  return ctx;
}
