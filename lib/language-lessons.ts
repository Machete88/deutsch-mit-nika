export type LessonLevel = 'A1' | 'A2' | 'B1';

export interface GrammarLesson {
  id: string;
  title: string;
  level: LessonLevel;
  topic: string;
  explanation: string;
  tips: string[];
  examples: { de: string; hint: string }[];
  quickCheck: { prompt: string; answer: string }[];
}

export interface SentenceChallenge {
  id: string;
  level: LessonLevel;
  topic: string;
  prompt: string;
  fragments: string[];
  solution: string[];
  translation: string;
}

export const grammarLessons: GrammarLesson[] = [
  {
    id: 'articles-a1',
    title: 'Artikel im Alltag',
    level: 'A1',
    topic: 'der, die, das',
    explanation: 'Lerne Nomen immer mit Artikel. Personen und viele maskuline Berufe haben oft der, viele feminine Rollen die und viele neutrale Dinge das.',
    tips: ['Lerne jedes neue Nomen mit Artikel und Plural.', 'Markiere schwierige Wörter in deiner Fehlerliste.', 'Sprich den Artikel immer laut mit.'],
    examples: [
      { de: 'der Lehrer kommt heute.', hint: 'maskuline Person' },
      { de: 'die Lampe ist neu.', hint: 'feminines Nomen' },
      { de: 'das Kind spielt.', hint: 'neutrales Nomen' },
    ],
    quickCheck: [
      { prompt: '___ Tisch steht dort.', answer: 'Der' },
      { prompt: 'Ich sehe ___ Frau.', answer: 'die' },
    ],
  },
  {
    id: 'verbs-a1',
    title: 'Verb an Position 2',
    level: 'A1',
    topic: 'Aussagesätze',
    explanation: 'Im deutschen Hauptsatz steht das konjugierte Verb meistens an zweiter Stelle. Das gilt auch, wenn der Satz mit Zeit oder Ort beginnt.',
    tips: ['Suche zuerst das Verb.', 'Zähle Satzteile, nicht einzelne Wörter.', 'Beginne mit kurzen Beispielsätzen.'],
    examples: [
      { de: 'Ich lerne heute Deutsch.', hint: 'Subjekt zuerst' },
      { de: 'Heute lerne ich Deutsch.', hint: 'Zeit zuerst, Verb bleibt auf Position 2' },
    ],
    quickCheck: [
      { prompt: 'Morgen ___ ich frei.', answer: 'habe' },
      { prompt: 'Im Kurs ___ wir viel.', answer: 'sprechen' },
    ],
  },
  {
    id: 'negation-a1',
    title: 'Verneinung: nicht & kein',
    level: 'A1',
    topic: 'Verneinung',
    explanation: '"nicht" verneint Verben und Adjektive. "kein" verneint Nomen ohne bestimmten Artikel.',
    tips: ['kein = nicht + ein', 'nicht steht meist am Satzende', 'kein wird wie ein dekliniert'],
    examples: [
      { de: 'Ich bin nicht müde.', hint: 'Adjektiv verneinen' },
      { de: 'Ich habe kein Auto.', hint: 'Nomen verneinen' },
      { de: 'Er kommt heute nicht.', hint: 'Verb verneinen' },
    ],
    quickCheck: [
      { prompt: 'Ich habe ___ Zeit.', answer: 'keine' },
      { prompt: 'Das ist ___ gut.', answer: 'nicht' },
    ],
  },
  {
    id: 'cases-a2',
    title: 'Akkusativ im Alltag',
    level: 'A2',
    topic: 'Wen? Was?',
    explanation: 'Den Akkusativ benutzt du häufig bei direkten Objekten. Besonders wichtig: der wird zu den.',
    tips: ['Frage: Wen oder was?', 'Achte besonders auf maskuline Nomen.', 'Baue eigene Sätze mit kaufen, sehen, brauchen.'],
    examples: [
      { de: 'Ich kaufe den Kaffee.', hint: 'direktes Objekt' },
      { de: 'Sie sieht die Tasche.', hint: 'die bleibt die' },
    ],
    quickCheck: [
      { prompt: 'Ich brauche ___ Stuhl.', answer: 'den' },
      { prompt: 'Wir nehmen ___ Brot.', answer: 'das' },
    ],
  },
  {
    id: 'modal-a2',
    title: 'Modalverben',
    level: 'A2',
    topic: 'können, müssen, wollen',
    explanation: 'Modalverben drücken Möglichkeit, Notwendigkeit oder Wunsch aus. Das Vollverb steht am Satzende im Infinitiv.',
    tips: ['Modalverb + Infinitiv am Ende', 'können = Fähigkeit', 'müssen = Notwendigkeit', 'wollen = Wunsch'],
    examples: [
      { de: 'Ich kann Deutsch sprechen.', hint: 'Fähigkeit' },
      { de: 'Du musst lernen.', hint: 'Notwendigkeit' },
      { de: 'Er will schlafen.', hint: 'Wunsch' },
    ],
    quickCheck: [
      { prompt: 'Ich ___ Deutsch lernen. (wollen)', answer: 'will' },
      { prompt: 'Du ___ das machen. (können)', answer: 'kannst' },
    ],
  },
  {
    id: 'perfekt-b1',
    title: 'Perfekt (Vergangenheit)',
    level: 'B1',
    topic: 'haben/sein + Partizip II',
    explanation: 'Das Perfekt wird mit haben oder sein + Partizip II gebildet. Bewegungsverben und Zustandsänderungen nehmen sein.',
    tips: ['haben: essen, kaufen, machen', 'sein: gehen, kommen, fahren, werden', 'Partizip II: ge...t oder ge...en'],
    examples: [
      { de: 'Ich habe gegessen.', hint: 'haben + Partizip II' },
      { de: 'Er ist gegangen.', hint: 'sein + Partizip II' },
      { de: 'Wir haben gespielt.', hint: 'regelmäßiges Verb' },
    ],
    quickCheck: [
      { prompt: 'Ich ___ Kaffee getrunken. (haben)', answer: 'habe' },
      { prompt: 'Sie ___ nach Hause gegangen. (sein)', answer: 'ist' },
    ],
  },
];

export const sentenceChallenges: SentenceChallenge[] = [
  {
    id: 'order-1',
    level: 'A1',
    topic: 'Einfacher Hauptsatz',
    prompt: 'Baue einen korrekten Satz.',
    fragments: ['ich', 'heute', 'Deutsch', 'lerne'],
    solution: ['Ich', 'lerne', 'heute', 'Deutsch'],
    translation: 'Я сегодня учу немецкий.',
  },
  {
    id: 'order-2',
    level: 'A1',
    topic: 'Zeit am Satzanfang',
    prompt: 'Ordne die Wörter richtig.',
    fragments: ['morgen', 'wir', 'haben', 'Prüfung'],
    solution: ['Morgen', 'haben', 'wir', 'Prüfung'],
    translation: 'Завтра у нас экзамен.',
  },
  {
    id: 'order-3',
    level: 'A2',
    topic: 'Ort + Verbposition',
    prompt: 'Ordne die Satzteile.',
    fragments: ['im Kurs', 'sprechen', 'wir', 'viel'],
    solution: ['Im Kurs', 'sprechen', 'wir', 'viel'],
    translation: 'На занятии мы много говорим.',
  },
  {
    id: 'order-4',
    level: 'A2',
    topic: 'Modalverb',
    prompt: 'Bilde einen Satz mit Modalverb.',
    fragments: ['ich', 'kann', 'gut', 'Deutsch', 'sprechen'],
    solution: ['Ich', 'kann', 'gut', 'Deutsch', 'sprechen'],
    translation: 'Я хорошо умею говорить по-немецки.',
  },
  {
    id: 'order-5',
    level: 'B1',
    topic: 'Nebensatz mit weil',
    prompt: 'Ordne den Nebensatz.',
    fragments: ['ich', 'lerne', 'weil', 'Deutsch', 'wichtig', 'ist', 'es'],
    solution: ['Ich', 'lerne', 'Deutsch', 'weil', 'es', 'wichtig', 'ist'],
    translation: 'Я учу немецкий, потому что это важно.',
  },
];
