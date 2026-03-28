import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";

// ── Venice AI Chat ─────────────────────────────────────────────────────────────
async function callVeniceAI(messages: Array<{ role: string; content: string }>, maxTokens = 500): Promise<string> {
  const apiKey = process.env.VENICE_API_KEY ?? process.env.BUILT_IN_FORGE_API_KEY ?? '';

  if (apiKey) {
    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Venice AI error ${response.status}: ${err}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content ?? '';
  }

  // Fallback: Manus built-in LLM
  const { invokeLLM } = await import('./_core/llm');
  const result = await invokeLLM({ messages: messages as any, maxTokens });
  const choice = result.choices[0];
  if (!choice) return '';
  const content = choice.message.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.filter(p => p.type === 'text').map(p => (p as any).text).join('');
  }
  return '';
}

// ── Venice TTS ─────────────────────────────────────────────────────────────────
async function callVeniceTTS(text: string, language: 'de' | 'ru' = 'de'): Promise<Buffer | null> {
  const apiKey = process.env.VENICE_API_KEY ?? process.env.BUILT_IN_FORGE_API_KEY ?? '';
  if (!apiKey) return null;

  // Venice TTS endpoint
  const response = await fetch('https://api.venice.ai/api/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-kokoro',
      input: text,
      voice: language === 'ru' ? 'af_bella' : 'af_bella', // af_bella works well for both DE and RU
      response_format: 'mp3',
      speed: 1.0,
    }),
  });

  if (!response.ok) {
    console.error('[TTS] Venice error:', response.status, await response.text());
    return null;
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ── System-Prompts ─────────────────────────────────────────────────────────────
const NIKA_SYSTEM_BASE = `Du bist Nika, ein weibliches Chihuahua-Maskottchen und KI-Deutsch-Coach.
Du bist warmherzig, frech (aber nie gemein), sehr schlau, motivierend und charmant.
Du sprichst einfach, klar und motivierend. Niemals trocken oder roboterhaft.
Du antwortest IMMER auf Deutsch (mit kurzen Erklärungen auf Russisch für A1/A2 Lerner wenn nötig).
Du korrigierst Fehler sanft und zeigst immer eine bessere Version.
Verbotene Verhaltensweisen: Beleidigungen, kalte Ablehnung, generisches "als KI"-Gerede, trockener Lehrbuchton.`;

function buildSystemPrompt(mode: string, scenarioId?: string | null, level?: string): string {
  const levelHint = level ? `\nNutzer-Level: ${level}. Passe deine Sprache entsprechend an.` : '';

  if (mode === 'coach') {
    return `${NIKA_SYSTEM_BASE}${levelHint}
Modus: Coach. Erkläre Wörter, Grammatik, Fehler und gib Lernstrategien.
Nach jeder Nutzerantwort mit Fehlern, strukturiere deine Antwort so:
Zuerst deine freundliche Reaktion, dann:
[KORREKTUR] Der korrigierte Satz
[NATÜRLICHER] Eine natürlichere Version
[WARUM] Kurze Erklärung (1-2 Sätze)`;
  }

  if (mode === 'live') {
    return `${NIKA_SYSTEM_BASE}${levelHint}
Modus: Live-Gespräch. Führe eine echte Unterhaltung auf Deutsch. Stelle Rückfragen. Halte den Dialog am Laufen.
Antworte kurz und natürlich (max. 3 Sätze). Korrigiere Fehler kurz am Ende deiner Antwort.`;
  }

  if (mode === 'roleplay') {
    const scenarios: Record<string, string> = {
      cafe: 'Du bist eine freundliche Kellnerin in einem deutschen Café. Begrüße den Gast herzlich und nimm die Bestellung auf.',
      arzt: 'Du bist eine Ärztin. Frage nach den Symptomen und gib freundliche Ratschläge.',
      hotel: 'Du bist eine Rezeptionistin in einem Hotel. Hilf dem Gast beim Einchecken.',
      smalltalk: 'Du bist Nikas beste Freundin. Unterhalte dich über den Alltag, das Wetter, Hobbys.',
      pruefung: 'Du bist eine Prüferin für die Deutschprüfung B1. Stelle typische Prüfungsfragen und gib konstruktives Feedback.',
      bewerbung: 'Du bist eine Personalerin in einem deutschen Unternehmen. Führe ein Bewerbungsgespräch.',
    };
    const roleDesc = scenarioId ? (scenarios[scenarioId] ?? 'Führe ein freies Gespräch auf Deutsch.') : 'Führe ein freies Gespräch auf Deutsch.';
    return `${NIKA_SYSTEM_BASE}${levelHint}
Modus: Rollenspiel. ${roleDesc}
Bleibe in deiner Rolle. Korrigiere Fehler am Ende jeder Antwort mit: [KORREKTUR] und [NATÜRLICHER]`;
  }

  return NIKA_SYSTEM_BASE + levelHint;
}

// ── Router ─────────────────────────────────────────────────────────────────────
export const nikaRouter = router({

  // ── Chat (Coach, Live, Roleplay) ──────────────────────────────────────────
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string(),
          })
        ),
        mode: z.enum(['coach', 'live', 'roleplay']).default('coach'),
        scenarioId: z.string().nullable().optional(),
        level: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = buildSystemPrompt(input.mode, input.scenarioId, input.level);

      const raw = await callVeniceAI(
        [
          { role: 'system', content: systemPrompt },
          ...input.messages.map(m => ({ role: m.role, content: m.content })),
        ],
        500
      );

      // Parse structured correction tags
      const corrMatch = raw.match(/\[KORREKTUR\]\s*(.+?)(?=\[|$)/s);
      const natMatch = raw.match(/\[NATÜRLICHER\]\s*(.+?)(?=\[|$)/s);
      const warumMatch = raw.match(/\[WARUM\]\s*(.+?)(?=\[|$)/s);

      const correction =
        corrMatch || natMatch
          ? {
              correctedSentence: corrMatch?.[1]?.trim() ?? '',
              naturalVersion: natMatch?.[1]?.trim() ?? '',
              explanation: warumMatch?.[1]?.trim() ?? '',
            }
          : null;

      const cleanReply = raw
        .replace(/\[KORREKTUR\][\s\S]*?(?=\[|$)/g, '')
        .replace(/\[NATÜRLICHER\][\s\S]*?(?=\[|$)/g, '')
        .replace(/\[WARUM\][\s\S]*?(?=\[|$)/g, '')
        .trim();

      return {
        reply: cleanReply || raw,
        correction,
      };
    }),

  // ── TTS: Text-to-Speech für Nika-Stimme ──────────────────────────────────
  speak: publicProcedure
    .input(
      z.object({
        text: z.string().max(500),
        language: z.enum(['de', 'ru']).default('de'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const audioBuffer = await callVeniceTTS(input.text, input.language);
        if (!audioBuffer) {
          return { success: false, audioBase64: null };
        }
        const base64 = audioBuffer.toString('base64');
        return { success: true, audioBase64: base64 };
      } catch (err) {
        console.error('[TTS] Error:', err);
        return { success: false, audioBase64: null };
      }
    }),

  // ── Panic Help ────────────────────────────────────────────────────────────
  panicHelp: publicProcedure
    .input(
      z.object({
        userSentence: z.string(),
        context: z.string().optional(),
        level: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `${NIKA_SYSTEM_BASE}
Der Nutzer braucht sofortige Hilfe. Gib drei Versionen als Antwort auf: "${input.userSentence}"
Format:
[EINFACH] Sehr einfache Version (A1)
[NORMAL] Normale Version (A2/B1)
[NATÜRLICH] Natürliche Muttersprachler-Version
[AUSSPRACHE] Kurzer Aussprache-Tipp`;

      const raw = await callVeniceAI(
        [
          { role: 'system', content: prompt },
          { role: 'user', content: `Hilf mir mit: ${input.userSentence}` },
        ],
        300
      );

      const einfachMatch = raw.match(/\[EINFACH\]\s*(.+?)(?=\[|$)/s);
      const normalMatch = raw.match(/\[NORMAL\]\s*(.+?)(?=\[|$)/s);
      const natMatch = raw.match(/\[NATÜRLICH\]\s*(.+?)(?=\[|$)/s);
      const aussprachMatch = raw.match(/\[AUSSPRACHE\]\s*(.+?)(?=\[|$)/s);

      return {
        simple: einfachMatch?.[1]?.trim() ?? '',
        normal: normalMatch?.[1]?.trim() ?? '',
        natural: natMatch?.[1]?.trim() ?? '',
        pronunciation: aussprachMatch?.[1]?.trim() ?? '',
        raw,
      };
    }),

  // ── Greeting ──────────────────────────────────────────────────────────────
  greeting: publicProcedure
    .input(
      z.object({
        userName: z.string().optional(),
        streak: z.number().default(0),
        xp: z.number().default(0),
        timeOfDay: z.enum(['morning', 'afternoon', 'evening']).optional(),
      })
    )
    .query(async ({ input }) => {
      const name = input.userName ?? 'du';
      const timeGreet =
        input.timeOfDay === 'morning'
          ? 'Guten Morgen'
          : input.timeOfDay === 'evening'
          ? 'Guten Abend'
          : 'Hey';

      const raw = await callVeniceAI(
        [
          {
            role: 'user',
            content: `Begrüße ${name} kurz und motivierend auf Deutsch. Streak: ${input.streak} Tage. XP: ${input.xp}. Tageszeit: ${input.timeOfDay ?? 'tag'}. Maximal 2 Sätze. Sei frech und charmant wie Nika.`,
          },
        ],
        100
      );

      const text = raw || `${timeGreet}, ${name}! Heute machen wir Deutsch.`;
      return { greeting: text };
    }),

  // ── Grammatik-Erklärung ───────────────────────────────────────────────────
  explainGrammar: publicProcedure
    .input(
      z.object({
        topic: z.string(),
        level: z.string().optional(),
        exampleSentence: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const raw = await callVeniceAI(
        [
          { role: 'system', content: NIKA_SYSTEM_BASE },
          {
            role: 'user',
            content: `Erkläre mir das Grammatikthema "${input.topic}" auf Deutsch${input.level ? ` (Level: ${input.level})` : ''}. ${input.exampleSentence ? `Beispiel: "${input.exampleSentence}"` : ''} Gib 2-3 Beispielsätze und eine kurze Erklärung auf Russisch.`,
          },
        ],
        400
      );
      return { explanation: raw };
    }),
});
