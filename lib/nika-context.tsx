import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NikaState,
  NikaMood,
  NikaOutfit,
  RewardEvent,
  DailyMission,
  NIKA_OUTFITS,
  DAILY_MISSIONS_TEMPLATE,
  NIKA_GREETINGS,
} from './nika-types';

const STORAGE_KEY = '@nika_state_v1';

const DEFAULT_STATE: NikaState = {
  currentOutfitId: 'headset_coach',
  currentMood: 'happy',
  xp: 0,
  streak: 0,
  level: 1,
  learnedWords: 0,
  conversations: 0,
  speakingSessions: 0,
  examsPassed: 0,
  unlockedOutfits: ['classic', 'headset_coach'],
  dailyMissions: DAILY_MISSIONS_TEMPLATE.map(m => ({ ...m })),
  lastGreeting: '',
};

interface NikaContextValue {
  state: NikaState;
  outfits: NikaOutfit[];
  currentOutfit: NikaOutfit;
  greeting: string;
  pendingRewards: RewardEvent[];
  clearRewards: () => void;
  setOutfit: (outfitId: string) => void;
  setMood: (mood: NikaMood) => void;
  addXP: (amount: number) => void;
  recordEvent: (event: 'chat' | 'speak' | 'exam' | 'word' | 'streak') => RewardEvent[];
  getMissionProgress: () => DailyMission[];
  advanceMission: (missionId: string, amount?: number) => void;
}

const NikaContext = createContext<NikaContextValue | null>(null);

function computeLevel(xp: number): number {
  if (xp >= 5000) return 5;
  if (xp >= 2000) return 4;
  if (xp >= 800) return 3;
  if (xp >= 250) return 2;
  return 1;
}

function getRandomGreeting(mood: NikaMood): string {
  const list = NIKA_GREETINGS[mood];
  return list[Math.floor(Math.random() * list.length)];
}

function checkUnlocks(state: NikaState): { newUnlocks: string[]; events: RewardEvent[] } {
  const newUnlocks: string[] = [];
  const events: RewardEvent[] = [];

  const unlockRules: Array<{ id: string; check: (s: NikaState) => boolean; reaction: string }> = [
    { id: 'study_hoodie', check: s => s.streak >= 3, reaction: 'Study Hoodie freigeschaltet! Du lernst so fleißig!' },
    { id: 'pink_bow', check: s => s.learnedWords >= 10, reaction: 'Pink Bow Nika ist jetzt dein! So süß!' },
    { id: 'exam_queen', check: s => s.examsPassed >= 1, reaction: 'Exam Queen! Du hast deine erste Prüfung bestanden!' },
    { id: 'princess', check: s => s.streak >= 14, reaction: '14 Tage Streak! Princess Nika gehört dir!' },
    { id: 'galaxy', check: s => s.streak >= 30, reaction: 'Galaxy Nika! Du bist eine Legende!' },
  ];

  for (const rule of unlockRules) {
    if (!state.unlockedOutfits.includes(rule.id) && rule.check(state)) {
      newUnlocks.push(rule.id);
      events.push({
        type: 'outfit_unlock',
        outfitId: rule.id,
        message: `Neues Outfit freigeschaltet!`,
        nikaReaction: rule.reaction,
      });
    }
  }

  return { newUnlocks, events };
}

export function NikaProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NikaState>(DEFAULT_STATE);
  const [pendingRewards, setPendingRewards] = useState<RewardEvent[]>([]);

  // Load persisted state
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Partial<NikaState>;
          setState(prev => ({
            ...prev,
            ...saved,
            dailyMissions: saved.dailyMissions ?? DAILY_MISSIONS_TEMPLATE.map(m => ({ ...m })),
          }));
        } catch {
          // ignore parse errors
        }
      }
    });
  }, []);

  // Persist on change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const outfits: NikaOutfit[] = NIKA_OUTFITS.map(o => ({
    ...o,
    unlocked: state.unlockedOutfits.includes(o.id),
  }));

  const currentOutfit = outfits.find(o => o.id === state.currentOutfitId) ?? outfits[0];

  const greeting = getRandomGreeting(state.currentMood);

  const setOutfit = useCallback((outfitId: string) => {
    setState(prev => ({ ...prev, currentOutfitId: outfitId }));
  }, []);

  const setMood = useCallback((mood: NikaMood) => {
    setState(prev => ({ ...prev, currentMood: mood }));
  }, []);

  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const newXP = prev.xp + amount;
      return { ...prev, xp: newXP, level: computeLevel(newXP) };
    });
  }, []);

  const clearRewards = useCallback(() => setPendingRewards([]), []);

  const recordEvent = useCallback(
    (event: 'chat' | 'speak' | 'exam' | 'word' | 'streak'): RewardEvent[] => {
      const rewards: RewardEvent[] = [];

      setState(prev => {
        let next = { ...prev };

        switch (event) {
          case 'chat':
            next.conversations += 1;
            next.xp += 50;
            rewards.push({ type: 'xp', xpDelta: 50, message: '+50 XP', nikaReaction: 'Boom. Genau so.' });
            break;
          case 'speak':
            next.speakingSessions += 1;
            next.xp += 80;
            rewards.push({ type: 'xp', xpDelta: 80, message: '+80 XP', nikaReaction: 'Deine Aussprache wird besser!' });
            break;
          case 'exam':
            next.examsPassed += 1;
            next.xp += 120;
            rewards.push({ type: 'xp', xpDelta: 120, message: '+120 XP', nikaReaction: 'Prüfung bestanden! Ich bin so stolz!' });
            break;
          case 'word':
            next.learnedWords += 1;
            next.xp += 10;
            break;
          case 'streak':
            next.streak += 1;
            next.xp += 30;
            rewards.push({ type: 'streak', message: `${next.streak} Tage Streak!`, nikaReaction: 'Du kommst jeden Tag! Das ist der Schlüssel.' });
            break;
        }

        next.level = computeLevel(next.xp);

        // Check unlocks
        const { newUnlocks, events } = checkUnlocks(next);
        if (newUnlocks.length > 0) {
          next.unlockedOutfits = [...next.unlockedOutfits, ...newUnlocks];
          rewards.push(...events);
        }

        return next;
      });

      setPendingRewards(prev => [...prev, ...rewards]);
      return rewards;
    },
    []
  );

  const getMissionProgress = useCallback(() => state.dailyMissions, [state.dailyMissions]);

  const advanceMission = useCallback((missionId: string, amount = 1) => {
    setState(prev => {
      const missions = prev.dailyMissions.map(m => {
        if (m.id !== missionId || m.completed) return m;
        const newProgress = Math.min(m.progress + amount, m.target);
        const completed = newProgress >= m.target;
        return { ...m, progress: newProgress, completed };
      });

      // XP for completed missions
      const justCompleted = missions.find(
        m => m.id === missionId && m.completed && !prev.dailyMissions.find(pm => pm.id === missionId)?.completed
      );
      const xpBonus = justCompleted ? justCompleted.xpReward : 0;

      return { ...prev, dailyMissions: missions, xp: prev.xp + xpBonus };
    });
  }, []);

  return (
    <NikaContext.Provider
      value={{
        state,
        outfits,
        currentOutfit,
        greeting,
        pendingRewards,
        clearRewards,
        setOutfit,
        setMood,
        addXP,
        recordEvent,
        getMissionProgress,
        advanceMission,
      }}
    >
      {children}
    </NikaContext.Provider>
  );
}

export function useNika() {
  const ctx = useContext(NikaContext);
  if (!ctx) throw new Error('useNika must be used within NikaProvider');
  return ctx;
}
