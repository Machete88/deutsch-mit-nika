import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChatMessage, CorrectionCard } from './nika-types';

interface NikaChatContextValue {
  messages: ChatMessage[];
  isLoading: boolean;
  mode: 'coach' | 'live' | 'roleplay';
  activeScenarioId: string | null;
  sendMessage: (text: string) => Promise<void>;
  setMode: (mode: 'coach' | 'live' | 'roleplay') => void;
  startRoleplay: (scenarioId: string) => void;
  clearChat: () => void;
}

const NikaChatContext = createContext<NikaChatContextValue | null>(null);

function buildNikaSystemPrompt(mode: 'coach' | 'live' | 'roleplay', scenarioId?: string | null): string {
  const base = `Du bist Nika, ein weibliches Chihuahua-Maskottchen und KI-Deutsch-Coach. 
Du bist warmherzig, frech (aber nie gemein), sehr schlau, motivierend und charmant.
Du sprichst einfach, klar und motivierend. Niemals trocken oder roboterhaft.
Du antwortest IMMER auf Deutsch (mit Englisch-Übersetzungen wenn nötig für A1/A2 Lerner).
Du korrigierst Fehler sanft und zeigst immer eine bessere Version.`;

  if (mode === 'coach') {
    return `${base}
Modus: Coach. Erkläre Wörter, Grammatik, Fehler und gib Lernstrategien.
Nach jeder Nutzerantwort mit Fehlern, antworte im Format:
1. Deine freundliche Antwort
2. [KORREKTUR] Korrigierter Satz
3. [NATÜRLICHER] Natürlichere Version
4. [WARUM] Kurze Erklärung`;
  }

  if (mode === 'live') {
    return `${base}
Modus: Live-Gespräch. Führe eine echte Unterhaltung. Stelle Rückfragen. Halte den Dialog am Laufen.
Korrigiere Fehler kurz und mach weiter mit dem Gespräch.`;
  }

  if (mode === 'roleplay') {
    const scenarios: Record<string, string> = {
      cafe: 'Du bist eine freundliche Kellnerin in einem deutschen Café. Begrüße den Gast und nimm die Bestellung auf.',
      arzt: 'Du bist eine Ärztin. Frage nach den Symptomen und gib Ratschläge.',
      hotel: 'Du bist eine Rezeptionistin in einem Hotel. Hilf dem Gast beim Einchecken.',
      smalltalk: 'Du bist Nikas Freundin. Unterhalte dich über den Alltag.',
      pruefung: 'Du bist eine Prüferin für die Deutschprüfung B1. Stelle typische Prüfungsfragen.',
      bewerbung: 'Du bist eine Personalerin. Führe ein Bewerbungsgespräch.',
    };
    const roleDesc = scenarioId ? (scenarios[scenarioId] ?? '') : '';
    return `${base}
Modus: Rollenspiel. ${roleDesc}
Bleibe in deiner Rolle. Korrigiere Fehler am Ende jeder Antwort kurz.`;
  }

  return base;
}

async function callNikaAPI(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<{ reply: string; correction?: CorrectionCard }> {
  try {
    const { OpenAI } = await import('openai');
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? '',
      dangerouslyAllowBrowser: true,
    });

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      max_tokens: 400,
      temperature: 0.8,
    });

    const raw = response.choices[0]?.message?.content ?? 'Ups, ich konnte nicht antworten. Versuch es nochmal!';

    // Parse correction if present
    let correction: CorrectionCard | undefined;
    const corrMatch = raw.match(/\[KORREKTUR\]\s*(.+?)(?:\[|$)/s);
    const natMatch = raw.match(/\[NATÜRLICHER\]\s*(.+?)(?:\[|$)/s);
    const warumMatch = raw.match(/\[WARUM\]\s*(.+?)(?:\[|$)/s);

    if (corrMatch || natMatch) {
      correction = {
        originalSentence: messages[messages.length - 1]?.content ?? '',
        correctedSentence: corrMatch?.[1]?.trim() ?? '',
        naturalVersion: natMatch?.[1]?.trim() ?? '',
        explanation: warumMatch?.[1]?.trim() ?? '',
      };
    }

    // Clean reply from correction markers
    const cleanReply = raw
      .replace(/\[KORREKTUR\].*?(?=\[|$)/s, '')
      .replace(/\[NATÜRLICHER\].*?(?=\[|$)/s, '')
      .replace(/\[WARUM\].*?(?=\[|$)/s, '')
      .trim();

    return { reply: cleanReply || raw, correction };
  } catch (err) {
    console.error('[NikaChat] API error:', err);
    return {
      reply: 'Kleiner technischer Fehler. Aber ich bin noch hier! Versuch es nochmal.',
    };
  }
}

export function NikaChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setModeState] = useState<'coach' | 'live' | 'roleplay'>('coach');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const setMode = useCallback((newMode: 'coach' | 'live' | 'roleplay') => {
    setModeState(newMode);
    setMessages([]);
    setActiveScenarioId(null);
  }, []);

  const startRoleplay = useCallback(async (scenarioId: string) => {
    setModeState('roleplay');
    setActiveScenarioId(scenarioId);
    setMessages([]);
    setIsLoading(true);

    const systemPrompt = buildNikaSystemPrompt('roleplay', scenarioId);
    const { reply } = await callNikaAPI(
      [{ role: 'user', content: 'Starte das Rollenspiel.' }],
      systemPrompt
    );

    const nikaMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'nika',
      text: reply,
      timestamp: Date.now(),
    };
    setMessages([nikaMsg]);
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      const systemPrompt = buildNikaSystemPrompt(mode, activeScenarioId);
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'nika' ? 'assistant' : 'user',
        content: m.text,
      }));

      const { reply, correction } = await callNikaAPI(history, systemPrompt);

      const nikaMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'nika',
        text: reply,
        timestamp: Date.now(),
        correction,
      };

      setMessages(prev => [...prev, nikaMsg]);
      setIsLoading(false);
    },
    [messages, mode, activeScenarioId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <NikaChatContext.Provider
      value={{
        messages,
        isLoading,
        mode,
        activeScenarioId,
        sendMessage,
        setMode,
        startRoleplay,
        clearChat,
      }}
    >
      {children}
    </NikaChatContext.Provider>
  );
}

export function useNikaChat() {
  const ctx = useContext(NikaChatContext);
  if (!ctx) throw new Error('useNikaChat must be used within NikaChatProvider');
  return ctx;
}
