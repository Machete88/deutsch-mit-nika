/**
 * Barrierefreiheits-Kontext für sehbehinderte Nutzer
 * Stellt hohen Kontrast, große Schrift, Auto-TTS und große Touch-Targets bereit.
 */
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useSettings } from './settings-context';

export interface AccessibilityColors {
  background: string;
  foreground: string;
  surface: string;
  border: string;
  primary: string;
  muted: string;
  success: string;
  warning: string;
  error: string;
}

export interface AccessibilityContextType {
  /** Barrierefreiheitsmodus aktiv? */
  isAccessible: boolean;
  /** Hoher Kontrast aktiv? */
  highContrast: boolean;
  /** Auto-TTS aktiv (Wörter automatisch vorlesen)? */
  autoTTS: boolean;
  /** Große Touch-Targets aktiv? */
  largeTargets: boolean;
  /** Mindest-Touch-Target-Größe in px */
  minTouchTarget: number;
  /** Barrierefreiheits-Farbpalette (überschreibt Theme-Farben bei highContrast) */
  a11yColors: AccessibilityColors | null;
  /** Schrift-Skalierungsfaktor */
  fontScale: number;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  isAccessible: false,
  highContrast: false,
  autoTTS: false,
  largeTargets: false,
  minTouchTarget: 44,
  a11yColors: null,
  fontScale: 1,
});

/** Hochkontrast-Farbpalette: Schwarz/Weiß/Gelb für maximale Lesbarkeit */
const HIGH_CONTRAST_LIGHT: AccessibilityColors = {
  background: '#FFFFFF',
  foreground: '#000000',
  surface: '#F0F0F0',
  border: '#000000',
  primary: '#0000CC',
  muted: '#333333',
  success: '#006600',
  warning: '#CC6600',
  error: '#CC0000',
};

const HIGH_CONTRAST_DARK: AccessibilityColors = {
  background: '#000000',
  foreground: '#FFFF00',
  surface: '#1A1A1A',
  border: '#FFFF00',
  primary: '#FFFF00',
  muted: '#CCCCCC',
  success: '#00FF00',
  warning: '#FFAA00',
  error: '#FF4444',
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();

  const value = useMemo<AccessibilityContextType>(() => {
    const isAccessible = settings.accessibilityMode;
    const highContrast = settings.accessibilityHighContrast;
    const autoTTS = settings.accessibilityAutoTTS;
    const largeTargets = settings.accessibilityLargeTargets;

    // Schrift-Skalierung: normal=1.0, large=1.2, accessibilityMode=1.4
    let fontScale = 1.0;
    if (settings.fontSizeLevel === 'large') fontScale = 1.2;
    if (isAccessible) fontScale = Math.max(fontScale, 1.4);

    // Touch-Target-Mindestgröße
    const minTouchTarget = largeTargets ? 64 : 44;

    // Hochkontrast-Farben
    let a11yColors: AccessibilityColors | null = null;
    if (highContrast) {
      a11yColors = settings.isDarkMode ? HIGH_CONTRAST_DARK : HIGH_CONTRAST_LIGHT;
    }

    return { isAccessible, highContrast, autoTTS, largeTargets, minTouchTarget, a11yColors, fontScale };
  }, [
    settings.accessibilityMode,
    settings.accessibilityHighContrast,
    settings.accessibilityAutoTTS,
    settings.accessibilityLargeTargets,
    settings.fontSizeLevel,
    settings.isDarkMode,
  ]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
