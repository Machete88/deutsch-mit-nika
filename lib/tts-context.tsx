import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

interface TTSContextType {
  isSpeaking: boolean;
  isAvailable: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => Promise<void>;
  speakWord: (russian: string, german: string) => Promise<void>;
  speakSentence: (sentence: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const TTSContext = createContext<TTSContextType | undefined>(undefined);

export function TTSProvider({ children }: { children: ReactNode }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAvailable = Platform.OS !== 'web';

  const speak = async (text: string, language = 'de-DE') => {
    if (!text.trim()) return;
    try {
      setError(null);
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language;
          utterance.rate = 0.9;
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
        }
        return;
      }
      await Speech.stop();
      setIsSpeaking(true);
      await new Promise<void>((resolve, reject) => {
        Speech.speak(text, {
          language,
          rate: 0.85,
          pitch: 1.0,
          onDone: () => { setIsSpeaking(false); resolve(); },
          onError: (e: { message: string }) => { setIsSpeaking(false); setError(e.message); reject(e); },
          onStopped: () => { setIsSpeaking(false); resolve(); },
        });
      });
    } catch (e) {
      setIsSpeaking(false);
      const msg = e instanceof Error ? e.message : 'Fehler bei der Sprachausgabe';
      setError(msg);
    }
  };

  const stop = async () => {
    try {
      if (Platform.OS === 'web') {
        window.speechSynthesis?.cancel();
      } else {
        await Speech.stop();
      }
      setIsSpeaking(false);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const speakWord = async (_russian: string, german: string) => speak(german, 'de-DE');
  const speakSentence = async (sentence: string) => speak(sentence, 'de-DE');
  const clearError = () => setError(null);

  return (
    <TTSContext.Provider value={{ isSpeaking, isAvailable, speak, stop, speakWord, speakSentence, error, clearError }}>
      {children}
    </TTSContext.Provider>
  );
}

export function useTTS() {
  const context = useContext(TTSContext);
  if (!context) throw new Error('useTTS must be used within TTSProvider');
  return context;
}
