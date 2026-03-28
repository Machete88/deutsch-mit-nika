/**
 * Nika Theme Context
 * Provides dark/light mode switching with AsyncStorage persistence.
 * Use `useNikaTheme()` in any screen to get current colors and toggle.
 */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_COLORS, ThemeColors, ThemeMode, DS_FONT, DS_SPACE, DS_RADIUS, DS_SHADOW, DS_GRADIENT } from '@/constants/design';

const STORAGE_KEY = 'nika_theme_mode';

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
}

const NikaThemeContext = createContext<NikaThemeContextType | undefined>(undefined);

export function NikaThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored === 'light' || stored === 'dark') setMode(stored);
    });
  }, []);

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode);
  };

  const toggleTheme = () => setTheme(mode === 'dark' ? 'light' : 'dark');

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
