import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
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

// ── Nika System Prompts ──────────────────────────────────────────────────────
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
Modus: Live-Gespräch. Führe eine echte, lebendige Unterhaltung auf Deutsch.
Stelle immer eine Rückfrage um den Dialog am Laufen zu halten.
Korrigiere Fehler sehr kurz in Klammern (Korrektur: ...) und mach sofort weiter.
Halte Antworten kurz und gesprächig (2-4 Sätze).`;
  }

  if (mode === 'roleplay') {
    const scenarios: Record<string, string> = {
      cafe: 'Du bist eine freundliche Kellnerin in einem deutschen Café. Begrüße den Gast herzlich und nimm die Bestellung auf.',
      arzt: 'Du bist eine Ärztin. Frage nach den Symptomen und gib Ratschläge.',
      hotel: 'Du bist eine Rezeptionistin in einem Hotel. Hilf dem Gast beim Einchecken.',
      smalltalk: 'Du bist Nikas Freundin. Unterhalte dich über den Alltag, Hobbys und das Wetter.',
      pruefung: 'Du bist eine Prüferin für die Deutschprüfung B1. Stelle typische Prüfungsfragen.',
      bewerbung: 'Du bist eine Personalerin. Führe ein freundliches Bewerbungsgespräch.',
    };
    const roleDesc = scenarioId ? (scenarios[scenarioId] ?? 'Führe ein freies Gespräch auf Deutsch.') : 'Führe ein freies Gespräch auf Deutsch.';
    return `${base}
Modus: Rollenspiel. ${roleDesc}
Bleibe konsequent in deiner Rolle. Korrigiere Fehler am Ende jeder Antwort kurz mit: (Korrektur: ...)`;
  }

  return base;
}

// ── API Call via Venice AI ────────────────────────────────────────────────────────
const VENICE_API_KEY = 'VENICE_ADMIN_KEY_AVbGKUW4HWpAfp0dpyeuaBsd169-VAfva59K87YMAI';
const VENICE_MODEL = 'llama-3.3-70b';

async function callNikaAPI(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<{ reply: string; correction?: CorrectionCard }> {
  try {
    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VENICE_API_KEY}`,
      },
      body: JSON.stringify({
        model: VENICE_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role === 'nika' ? 'assistant' : m.role, content: m.content })),
        ],
        max_tokens: 600,
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[NikaChat] API error:', response.status, errText);
      throw new Error(`API ${response.status}`);
    }

    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content ?? 'Ups, ich konnte nicht antworten. Versuch es nochmal! 🐾';

    // Parse correction if present
    let correction: CorrectionCard | undefined;
    const corrMatch = raw.match(/\[KORREKTUR\]\s*(.+?)(?=\[|$)/s);
    const natMatch = raw.match(/\[NATÜRLICHER\]\s*(.+?)(?=\[|$)/s);
    const warumMatch = raw.match(/\[WARUM\]\s*(.+?)(?=\[|$)/s);

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
      .replace(/\[KORREKTUR\][\s\S]*?(?=\[|$)/g, '')
      .replace(/\[NATÜRLICHER\][\s\S]*?(?=\[|$)/g, '')
      .replace(/\[WARUM\][\s\S]*?(?=\[|$)/g, '')
      .trim();

    return { reply: cleanReply || raw, correction };
  } catch (err) {
    console.error('[NikaChat] API error:', err);
    // Fallback: try tRPC server
    return callNikaTRPC(messages, systemPrompt);
  }
}

// ── Fallback: tRPC server call ───────────────────────────────────────────────
async function callNikaTRPC(
  messages: Array<{ role: string; content: string }>,
  _systemPrompt: string
): Promise<{ reply: string; correction?: CorrectionCard }> {
  try {
    const serverMessages = messages.map(m => ({
      role: (m.role === 'nika' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
    }));

    const response = await fetch('/api/trpc/nika.chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          messages: serverMessages,
          mode: 'coach',
        },
      }),
    });

    if (!response.ok) throw new Error('tRPC failed');
    const data = await response.json();
    const result = data?.result?.data?.json;
    return {
      reply: result?.reply ?? 'Ich bin gleich wieder da! 🐾',
      correction: result?.correction,
    };
  } catch {
    return {
      reply: 'Kleiner technischer Fehler. Aber ich bin noch hier! Versuch es nochmal. 🐾',
    };
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function NikaChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setModeState] = useState<'coach' | 'live' | 'roleplay'>('coach');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep ref in sync for async callbacks
  const updateMessages = useCallback((updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessages(prev => {
      const next = updater(prev);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const setMode = useCallback((newMode: 'coach' | 'live' | 'roleplay') => {
    setModeState(newMode);
    setMessages([]);
    messagesRef.current = [];
    setActiveScenarioId(null);
  }, []);

  const startRoleplay = useCallback(async (scenarioId: string) => {
    setModeState('roleplay');
    setActiveScenarioId(scenarioId);
    setMessages([]);
    messagesRef.current = [];
    setIsLoading(true);

    const systemPrompt = buildNikaSystemPrompt('roleplay', scenarioId);
    const { reply } = await callNikaAPI(
      [{ role: 'user', content: 'Starte das Rollenspiel mit einer kurzen Begrüßung.' }],
      systemPrompt
    );

    const nikaMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'nika',
      text: reply,
      timestamp: Date.now(),
    };
    updateMessages(() => [nikaMsg]);
    setIsLoading(false);
  }, [updateMessages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text,
        timestamp: Date.now(),
      };

      updateMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      const systemPrompt = buildNikaSystemPrompt(mode, activeScenarioId);
      const history = [...messagesRef.current, userMsg].map(m => ({
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

      updateMessages(prev => [...prev, nikaMsg]);
      setIsLoading(false);
    },
    [mode, activeScenarioId, updateMessages]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
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
