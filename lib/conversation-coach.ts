export interface ConversationScenario {
  id: string;
  title: string;
  level: 'A1' | 'A2' | 'B1';
  setting: string;
  openingLine: string;
  goal: string;
  hints: string[];
}

export interface ConversationReply {
  answer: string;
  correction: string;
  betterOption: string;
  encouragement: string;
}

export const conversationScenarios: ConversationScenario[] = [
  {
    id: 'cafe',
    title: 'Im Café bestellen',
    level: 'A1',
    setting: 'Du bestellst ein Getränk und etwas zu essen.',
    openingLine: 'Guten Tag. Was möchten Sie bestellen?',
    goal: 'Bestelle höflich ein Getränk und einen Snack.',
    hints: ['Nutze: Ich möchte ...', 'Sei höflich mit bitte.', 'Halte die Antwort kurz und klar.'],
  },
  {
    id: 'arzt',
    title: 'Beim Arzt',
    level: 'A2',
    setting: 'Du beschreibst ein einfaches Problem beim Arzt.',
    openingLine: 'Guten Morgen. Was fehlt Ihnen?',
    goal: 'Beschreibe dein Problem in 1 bis 2 Sätzen.',
    hints: ['Nutze: Ich habe ...', 'Beschreibe seit wann.', 'Nenne ein Symptom.'],
  },
  {
    id: 'vorstellung',
    title: 'Sich vorstellen',
    level: 'A1',
    setting: 'Du lernst neue Leute im Kurs kennen.',
    openingLine: 'Hallo. Erzähl bitte kurz etwas über dich.',
    goal: 'Nenne Name, Herkunft und warum du Deutsch lernst.',
    hints: ['Nutze: Ich heiße ...', 'Ich komme aus ...', 'Ich lerne Deutsch, weil ...'],
  },
  {
    id: 'einkaufen',
    title: 'Im Supermarkt',
    level: 'A1',
    setting: 'Du fragst nach einem Produkt im Supermarkt.',
    openingLine: 'Guten Tag. Kann ich Ihnen helfen?',
    goal: 'Frage nach einem Produkt und bedanke dich.',
    hints: ['Nutze: Wo finde ich ...?', 'Nutze: Ich suche ...', 'Sag Danke am Ende.'],
  },
  {
    id: 'weg-fragen',
    title: 'Nach dem Weg fragen',
    level: 'A2',
    setting: 'Du bist in der Stadt und suchst den Bahnhof.',
    openingLine: 'Entschuldigung, können Sie mir helfen?',
    goal: 'Frage nach dem Weg zum Bahnhof.',
    hints: ['Nutze: Wie komme ich zu ...?', 'Nutze: Wo ist ...?', 'Bedanke dich am Ende.'],
  },
  {
    id: 'job-interview',
    title: 'Vorstellungsgespräch',
    level: 'B1',
    setting: 'Du bewirbst dich um eine Stelle.',
    openingLine: 'Guten Tag. Erzählen Sie bitte etwas über sich.',
    goal: 'Stelle dich professionell vor und nenne deine Stärken.',
    hints: ['Nutze: Ich habe Erfahrung in ...', 'Nutze: Meine Stärken sind ...', 'Sei höflich und klar.'],
  },
];

function buildCorrection(userMessage: string): string {
  const trimmed = userMessage.trim();
  if (!trimmed) return 'Schreibe eine kurze Antwort, damit ich sie korrigieren kann.';
  if (!/[.!?]$/.test(trimmed)) return 'Gut verständlich. Ergänze am Ende noch einen Punkt für einen vollständigen Satz.';
  if (/ich bin kommen/i.test(trimmed)) return 'Achte auf die Verbform: "ich komme", nicht "ich bin kommen".';
  if (/möchte ein kaffe/i.test(trimmed)) return 'Im Deutschen heißt es: "einen Kaffee". Achte auf Artikel und Endung.';
  if (/\bich\b.*\bbin\b.*\bstudent\b/i.test(trimmed)) return 'Gut! Beachte: "Ich bin Student" (ohne Artikel bei Berufen).';
  return 'Dein Satz ist gut verständlich. Achte weiter auf Artikel, Verbposition und höfliche Formulierungen.';
}

function buildBetterOption(userMessage: string, scenarioId?: string): string {
  if (scenarioId === 'cafe') return 'Besser: "Ich möchte bitte einen Kaffee und ein Käsebrötchen."';
  if (scenarioId === 'arzt') return 'Besser: "Ich habe seit zwei Tagen starke Kopfschmerzen und fühle mich müde."';
  if (scenarioId === 'vorstellung') return 'Besser: "Ich heiße Alex, komme aus Russland und lerne Deutsch für meine Arbeit."';
  if (scenarioId === 'einkaufen') return 'Besser: "Entschuldigung, wo finde ich die Milch, bitte?"';
  if (scenarioId === 'weg-fragen') return 'Besser: "Entschuldigung, wie komme ich zum Bahnhof?"';
  if (scenarioId === 'job-interview') return 'Besser: "Ich heiße Anna, habe 3 Jahre Erfahrung im Marketing und bin sehr teamfähig."';
  return `Verbesserte Version: "${userMessage.trim() || 'Ich brauche noch einen Beispielsatz.'}"`;
}

export function createConversationReply(userMessage: string, scenarioId?: string): ConversationReply {
  const lower = userMessage.toLowerCase();
  let answer = 'Danke. Antworte noch einmal mit einem ganzen Satz.';

  if (scenarioId === 'cafe') {
    answer = /kaffee|tee|wasser|saft|bier|wein/.test(lower)
      ? 'Sehr gut! Möchten Sie noch etwas dazu essen?'
      : 'Gut. Nenne bitte noch ein Getränk oder einen Snack.';
  } else if (scenarioId === 'arzt') {
    answer = /schmerz|fieber|husten|müde|krank|kopf/.test(lower)
      ? 'Verstanden. Seit wann haben Sie diese Beschwerden?'
      : 'Beschreibe bitte dein Symptom etwas genauer.';
  } else if (scenarioId === 'vorstellung') {
    answer = /heiße|komme|lerne|bin|arbeite/.test(lower)
      ? 'Schön dich kennenzulernen! Warum lernst du Deutsch?'
      : 'Stell dich bitte in einem ganzen Satz vor.';
  } else if (scenarioId === 'einkaufen') {
    answer = /milch|brot|käse|fleisch|obst|gemüse|suche|finde/.test(lower)
      ? 'Das finden Sie in Gang 3, links neben den Getränken.'
      : 'Was suchen Sie genau? Ich helfe Ihnen gerne.';
  } else if (scenarioId === 'weg-fragen') {
    answer = /bahnhof|links|rechts|gerade|straße|wie|wo/.test(lower)
      ? 'Gehen Sie geradeaus und dann links. Der Bahnhof ist 5 Minuten entfernt.'
      : 'Wohin möchten Sie? Ich zeige Ihnen den Weg.';
  } else if (scenarioId === 'job-interview') {
    answer = /erfahrung|arbeit|stärke|team|jahre|studium/.test(lower)
      ? 'Sehr interessant. Was sind Ihre größten Stärken?'
      : 'Erzählen Sie bitte mehr über Ihre Berufserfahrung.';
  }

  return {
    answer,
    correction: buildCorrection(userMessage),
    betterOption: buildBetterOption(userMessage, scenarioId),
    encouragement: 'Gut gemacht! Kurze, klare Sätze sind perfekt zum Üben.',
  };
}
