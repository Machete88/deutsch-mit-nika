// ─── Nika Domain Types ────────────────────────────────────────────────────────

export type NikaMood = 'happy' | 'frech' | 'stolz' | 'konzentriert' | 'tröstend' | 'celebratory';

export type OutfitRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface NikaOutfit {
  id: string;
  name: string;
  emoji: string;
  rarity: OutfitRarity;
  unlocked: boolean;
  unlockCondition: string;
  unlockDescription: string;
  image: string; // asset key
}

export interface NikaState {
  currentOutfitId: string;
  currentMood: NikaMood;
  xp: number;
  streak: number;
  level: number; // 1=Baby Coach, 2=Smart Coach, 3=Pro Coach, 4=Elite Tutor, 5=Legend
  learnedWords: number;
  conversations: number;
  speakingSessions: number;
  examsPassed: number;
  unlockedOutfits: string[];
  dailyMissions: DailyMission[];
  lastGreeting: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  target: number;
  progress: number;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'nika';
  text: string;
  timestamp: number;
  correction?: CorrectionCard;
}

export interface CorrectionCard {
  originalSentence: string;
  correctedSentence: string;
  naturalVersion: string;
  explanation: string;
  newWord?: string;
}

export interface RewardEvent {
  type: 'xp' | 'outfit_unlock' | 'streak' | 'mission_complete';
  xpDelta?: number;
  outfitId?: string;
  message: string;
  nikaReaction: string;
}

export interface RoleplayScenario {
  id: string;
  title: string;
  emoji: string;
  description: string;
  nikaRole: string;
  level: 'A1' | 'A2' | 'B1';
}

export const NIKA_LEVEL_NAMES: Record<number, string> = {
  1: 'Baby Coach',
  2: 'Smart Coach',
  3: 'Pro Coach',
  4: 'Elite Tutor',
  5: 'Legend',
};

export const NIKA_OUTFITS: NikaOutfit[] = [
  {
    id: 'classic',
    name: 'Classic Nika',
    emoji: '⭐',
    rarity: 'Common',
    unlocked: true,
    unlockCondition: 'Immer verfügbar',
    unlockDescription: 'Nikas natürlicher, charmanter Look',
    image: 'outfit_classic',
  },
  {
    id: 'headset_coach',
    name: 'Headset Coach',
    emoji: '🎧',
    rarity: 'Common',
    unlocked: true,
    unlockCondition: 'Immer verfügbar',
    unlockDescription: 'Bereit zum Sprechen und Coachen',
    image: 'outfit_headset_coach',
  },
  {
    id: 'study_hoodie',
    name: 'Study Hoodie',
    emoji: '📚',
    rarity: 'Common',
    unlocked: false,
    unlockCondition: '3 Tage Streak',
    unlockDescription: 'Lerne 3 Tage hintereinander',
    image: 'outfit_study_hoodie',
  },
  {
    id: 'pink_bow',
    name: 'Pink Bow Nika',
    emoji: '🎀',
    rarity: 'Rare',
    unlocked: false,
    unlockCondition: 'Erstes Lernset abschließen',
    unlockDescription: 'Schließe dein erstes Lernset ab',
    image: 'outfit_pink_bow',
  },
  {
    id: 'cozy_blanket',
    name: 'Cozy Blanket Nika',
    emoji: '🛋️',
    rarity: 'Rare',
    unlocked: false,
    unlockCondition: '5 Tage Streak',
    unlockDescription: 'Lerne 5 Tage hintereinander',
    image: 'outfit_cozy_blanket',
  },
  {
    id: 'exam_queen',
    name: 'Exam Queen',
    emoji: '👑',
    rarity: 'Rare',
    unlocked: false,
    unlockCondition: 'Erste Prüfung bestehen',
    unlockDescription: 'Bestehe deine erste Prüfung',
    image: 'outfit_exam_queen',
  },
  {
    id: 'teacher',
    name: 'Teacher Nika',
    emoji: '🎓',
    rarity: 'Epic',
    unlocked: false,
    unlockCondition: '50 Wörter gelernt',
    unlockDescription: 'Lerne 50 Vokabeln',
    image: 'outfit_teacher',
  },
  {
    id: 'neon',
    name: 'Neon Nika',
    emoji: '⚡',
    rarity: 'Epic',
    unlocked: false,
    unlockCondition: '10 Gespräche mit Nika',
    unlockDescription: 'Führe 10 Gespräche mit Nika',
    image: 'outfit_neon',
  },
  {
    id: 'traveler',
    name: 'Traveler Nika',
    emoji: '✈️',
    rarity: 'Epic',
    unlocked: false,
    unlockCondition: 'B1-Niveau erreichen',
    unlockDescription: 'Erreiche das B1-Sprachniveau',
    image: 'outfit_traveler',
  },
  {
    id: 'princess',
    name: 'Princess Nika',
    emoji: '👸',
    rarity: 'Epic',
    unlocked: false,
    unlockCondition: '14 Tage Streak',
    unlockDescription: 'Lerne 14 Tage hintereinander',
    image: 'outfit_princess',
  },
  {
    id: 'royal',
    name: 'Royal Nika',
    emoji: '🏆',
    rarity: 'Legendary',
    unlocked: false,
    unlockCondition: '21 Tage Streak',
    unlockDescription: 'Lerne 21 Tage hintereinander',
    image: 'outfit_royal',
  },
  {
    id: 'galaxy',
    name: 'Galaxy Nika',
    emoji: '🌌',
    rarity: 'Legendary',
    unlocked: false,
    unlockCondition: '30 Tage Streak oder B1',
    unlockDescription: 'Erreiche B1 oder lerne 30 Tage',
    image: 'outfit_cozy2',
  },
];

export const DAILY_MISSIONS_TEMPLATE: DailyMission[] = [
  {
    id: 'review_words',
    title: '10 Wörter wiederholen',
    description: 'Wiederhole heute 10 Vokabeln',
    emoji: '🔄',
    xpReward: 30,
    target: 10,
    progress: 0,
    completed: false,
  },
  {
    id: 'chat_nika',
    title: 'Mit Nika sprechen',
    description: 'Führe 1 Gespräch mit Nika',
    emoji: '💬',
    xpReward: 50,
    target: 1,
    progress: 0,
    completed: false,
  },
  {
    id: 'grammar_lesson',
    title: '1 Grammatiklektion',
    description: 'Lerne eine Grammatikregel',
    emoji: '📖',
    xpReward: 40,
    target: 1,
    progress: 0,
    completed: false,
  },
  {
    id: 'speak_sentences',
    title: '5 Sätze sprechen',
    description: 'Übe 5 Sätze im Sprechmodus',
    emoji: '🎤',
    xpReward: 60,
    target: 5,
    progress: 0,
    completed: false,
  },
];

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  { id: 'cafe', title: 'Im Café', emoji: '☕', description: 'Bestelle Kaffee und Kuchen', nikaRole: 'Kellnerin', level: 'A1' },
  { id: 'arzt', title: 'Beim Arzt', emoji: '🏥', description: 'Beschreibe deine Symptome', nikaRole: 'Ärztin', level: 'A2' },
  { id: 'hotel', title: 'Im Hotel', emoji: '🏨', description: 'Checke ein und frag nach dem Zimmer', nikaRole: 'Rezeptionistin', level: 'A2' },
  { id: 'smalltalk', title: 'Small Talk', emoji: '💬', description: 'Unterhalte dich über den Alltag', nikaRole: 'Freundin', level: 'A1' },
  { id: 'pruefung', title: 'Prüfungstraining', emoji: '📝', description: 'Übe für die Deutschprüfung', nikaRole: 'Prüferin', level: 'B1' },
  { id: 'bewerbung', title: 'Bewerbungsgespräch', emoji: '💼', description: 'Stell dich vor und überzeuge', nikaRole: 'Interviewerin', level: 'B1' },
];

export const NIKA_GREETINGS: Record<NikaMood, string[]> = {
  happy: [
    'Hey! Heute machen wir 5 Minuten Deutsch und dann bist du gefährlich gut. Was steht an?',
    'Na los, sag was auf Deutsch! Ich höre zu und mach es noch besser.',
    'Boom. Bereit? Ich auch.',
  ],
  frech: [
    'Kleiner Fehler entdeckt. Keine Sorge, ich hab dich.',
    'Fast perfekt — nur ein kleiner Kasusfehler.',
    'Das klang schon ziemlich deutsch.',
  ],
  stolz: [
    'Boom. Genau so. Jetzt sitzt das schon richtig gut.',
    'Du rockst das! Weiter so.',
    'Ich bin stolz auf dich. Wirklich.',
  ],
  konzentriert: [
    'Fokus. Wir schaffen das.',
    'Konzentriert bleiben — du bist so nah dran.',
    'Jetzt wird gelernt. Los geht\'s.',
  ],
  tröstend: [
    'Kein Stress. Fehler sind gut — sie zeigen, was wir üben.',
    'Das war mutig. Weiter versuchen!',
    'Ich bin hier. Wir machen das zusammen.',
  ],
  celebratory: [
    'Ja! Das war perfekt!',
    'Feier das! Du hast es verdient.',
    'Nika ist begeistert! Weiter so!',
  ],
};
