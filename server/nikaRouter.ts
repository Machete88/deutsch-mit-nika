import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

const NIKA_SYSTEM_BASE = `Du bist Nika, ein weibliches Chihuahua-Maskottchen und KI-Deutsch-Coach.
Du bist warmherzig, frech (aber nie gemein), sehr schlau, motivierend und charmant.
Du sprichst einfach, klar und motivierend. Niemals trocken oder roboterhaft.
Du antwortest IMMER auf Deutsch (mit kurzen Erklärungen auf Englisch für A1/A2 Lerner wenn nötig).
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
Korrigiere Fehler kurz am Ende deiner Antwort und mach weiter mit dem Gespräch.`;
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

export const nikaRouter = router({
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

      const result = await invokeLLM({
        messages: [
          { role: 'system', content: systemPrompt },
          ...input.messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        ],
        maxTokens: 500,
      });

      const raw = (() => {
        const choice = result.choices[0];
        if (!choice) return '';
        const content = choice.message.content;
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
          return content
            .filter(p => p.type === 'text')
            .map(p => (p as { type: 'text'; text: string }).text)
            .join('');
        }
        return '';
      })();

      // Parse structured correction
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

      const result = await invokeLLM({
        messages: [{ role: 'user', content: `Hilf mir mit: ${input.userSentence}` }],
        maxTokens: 300,
      });

      const raw = (() => {
        const choice = result.choices[0];
        if (!choice) return '';
        const content = choice.message.content;
        return typeof content === 'string' ? content : '';
      })();

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

      const result = await invokeLLM({
        messages: [
          {
            role: 'user',
            content: `Begrüße ${name} kurz und motivierend auf Deutsch. Streak: ${input.streak} Tage. XP: ${input.xp}. Tageszeit: ${input.timeOfDay ?? 'tag'}. Maximal 2 Sätze. Sei frech und charmant wie Nika.`,
          },
        ],
        maxTokens: 100,
      });

      const content = result.choices[0]?.message?.content;
      const text = typeof content === 'string' ? content : `${timeGreet}, ${name}! Heute machen wir Deutsch.`;

      return { greeting: text };
    }),
});
