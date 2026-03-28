/**
 * NikaSpeech Context
 * Verwaltet Text-to-Speech für Nika: Venice TTS über Server-Route
 * Fallback: expo-speech für einfache Ausgabe
 */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { useSettings } from './settings-context';

// ── Typen ─────────────────────────────────────────────────────────────────────
interface NikaSpeechContextValue {
  isSpeaking: boolean;
  isMouthOpen: boolean; // Lippensync-State für Avatar-Animation
  speak: (text: string, language?: 'de' | 'ru') => Promise<void>;
  stop: () => void;
  speakIfAutoEnabled: (text: string, language?: 'de' | 'ru') => Promise<void>;
}

const NikaSpeechContext = createContext<NikaSpeechContextValue | null>(null);

// ── API Base URL ──────────────────────────────────────────────────────────────
function getApiBaseUrl(): string {
  if (Platform.OS === 'web') return '';
  // Auf Native: Server-URL aus Umgebungsvariable oder Standard
  const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL ?? 'http://127.0.0.1:3000';
  return serverUrl;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function NikaSpeechProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mouthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<any>(null);

  // Mund-Animation starten/stoppen
  const startMouthAnim = useCallback(() => {
    if (mouthIntervalRef.current) clearInterval(mouthIntervalRef.current);
    mouthIntervalRef.current = setInterval(() => {
      setIsMouthOpen(prev => !prev);
    }, 180); // ~5.5x pro Sekunde öffnen/schließen
  }, []);

  const stopMouthAnim = useCallback(() => {
    if (mouthIntervalRef.current) {
      clearInterval(mouthIntervalRef.current);
      mouthIntervalRef.current = null;
    }
    setIsMouthOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (mouthIntervalRef.current) clearInterval(mouthIntervalRef.current);
    };
  }, []);

  const stop = useCallback(() => {
    setIsSpeaking(false);
    stopMouthAnim();

    // Web: HTML Audio stoppen
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Native: expo-av stoppen
    if (soundRef.current) {
      try { soundRef.current.stopAsync?.(); } catch {}
      soundRef.current = null;
    }

    // expo-speech stoppen (nur iOS/Android, nicht Web)
    if (Platform.OS !== 'web') {
      try {
        const Speech = require('expo-speech');
        if (Speech && typeof Speech.stop === 'function') {
          Speech.stop();
        }
      } catch {}
    }
  }, [stopMouthAnim]);

  const speak = useCallback(async (text: string, language: 'de' | 'ru' = 'de') => {
    if (!text.trim()) return;
    stop();

    setIsSpeaking(true);
    startMouthAnim();

    try {
      // Versuche Venice TTS über Server-Route
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/trpc/nika.speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: { text: text.slice(0, 400), language },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const audioBase64: string | null = data?.result?.data?.json?.audioBase64;

        if (audioBase64) {
          if (Platform.OS === 'web') {
            // Web: Base64 → Audio-Element
            const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
            audioRef.current = audio;
            audio.onended = () => {
              setIsSpeaking(false);
              stopMouthAnim();
            };
            audio.onerror = () => {
              setIsSpeaking(false);
              stopMouthAnim();
            };
            await audio.play();
            return;
          } else {
            // Native: Base64 → expo-av
            try {
              const { Audio } = require('expo-av');
              const { FileSystem } = require('expo-file-system/legacy');
              const uri = FileSystem.cacheDirectory + 'nika_tts.mp3';
              await FileSystem.writeAsStringAsync(uri, audioBase64, {
                encoding: FileSystem.EncodingType.Base64,
              });
              await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
              const { sound } = await Audio.Sound.createAsync({ uri });
              soundRef.current = sound;
              sound.setOnPlaybackStatusUpdate((status: any) => {
                if (status.didJustFinish) {
                  setIsSpeaking(false);
                  stopMouthAnim();
                  sound.unloadAsync();
                  soundRef.current = null;
                }
              });
              await sound.playAsync();
              return;
            } catch (nativeErr) {
              console.warn('[TTS] Native audio error, falling back to expo-speech:', nativeErr);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[TTS] Server TTS failed, using expo-speech fallback:', err);
    }

    // Fallback: expo-speech (nur iOS/Android)
    if (Platform.OS !== 'web') {
      try {
        const Speech = require('expo-speech');
        if (Speech && typeof Speech.speak === 'function') {
          const langCode = language === 'ru' ? 'ru-RU' : 'de-DE';
          Speech.speak(text, {
            language: langCode,
            pitch: 1.1,
            rate: 0.9,
            onDone: () => {
              setIsSpeaking(false);
              stopMouthAnim();
            },
            onError: () => {
              setIsSpeaking(false);
              stopMouthAnim();
            },
          });
          return;
        }
      } catch (speechErr) {
        console.warn('[TTS] expo-speech failed:', speechErr);
      }
    }
    // Wenn alles fehlschlägt: State zurücksetzen
    setIsSpeaking(false);
    stopMouthAnim();
  }, [stop, startMouthAnim, stopMouthAnim]);

  // Nur sprechen wenn Auto-TTS aktiviert
  const speakIfAutoEnabled = useCallback(async (text: string, language: 'de' | 'ru' = 'de') => {
    if (settings.accessibilityAutoTTS) {
      await speak(text, language);
    }
  }, [settings.accessibilityAutoTTS, speak]);

  return (
    <NikaSpeechContext.Provider value={{ isSpeaking, isMouthOpen, speak, stop, speakIfAutoEnabled }}>
      {children}
    </NikaSpeechContext.Provider>
  );
}

export function useNikaSpeech() {
  const ctx = useContext(NikaSpeechContext);
  if (!ctx) throw new Error('useNikaSpeech must be used within NikaSpeechProvider');
  return ctx;
}
