import { GrammarRule } from './types';

export const grammarRules: GrammarRule[] = [
  {
    id: 'g001',
    title: 'Артикли: der, die, das',
    explanation: 'В немецком языке есть три рода: мужской (der), женский (die) и средний (das). Артикль нужно запоминать вместе со словом.',
    examples: [
      { de: 'der Mann (мужчина)', ru: 'мужской род' },
      { de: 'die Frau (женщина)', ru: 'женский род' },
      { de: 'das Kind (ребёнок)', ru: 'средний род' },
    ],
    category: 'Артикли',
    cefrLevel: 'A1',
  },
  {
    id: 'g002',
    title: 'Личные местоимения',
    explanation: 'Личные местоимения в немецком: ich (я), du (ты), er/sie/es (он/она/оно), wir (мы), ihr (вы), sie/Sie (они/Вы).',
    examples: [
      { de: 'Ich bin Student.', ru: 'Я студент.' },
      { de: 'Du bist nett.', ru: 'Ты милый.' },
      { de: 'Er arbeitet viel.', ru: 'Он много работает.' },
    ],
    category: 'Местоимения',
    cefrLevel: 'A1',
  },
  {
    id: 'g003',
    title: 'Глагол "sein" (быть)',
    explanation: 'Спряжение глагола sein: ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie/Sie sind.',
    examples: [
      { de: 'Ich bin müde.', ru: 'Я устал.' },
      { de: 'Wir sind Freunde.', ru: 'Мы друзья.' },
      { de: 'Das ist schön.', ru: 'Это красиво.' },
    ],
    category: 'Глаголы',
    cefrLevel: 'A1',
  },
  {
    id: 'g004',
    title: 'Глагол "haben" (иметь)',
    explanation: 'Спряжение глагола haben: ich habe, du hast, er/sie/es hat, wir haben, ihr habt, sie/Sie haben.',
    examples: [
      { de: 'Ich habe ein Auto.', ru: 'У меня есть машина.' },
      { de: 'Er hat keine Zeit.', ru: 'У него нет времени.' },
      { de: 'Wir haben Hunger.', ru: 'Мы голодны.' },
    ],
    category: 'Глаголы',
    cefrLevel: 'A1',
  },
  {
    id: 'g005',
    title: 'Отрицание: nicht и kein',
    explanation: '"nicht" отрицает глаголы и прилагательные, "kein" отрицает существительные.',
    examples: [
      { de: 'Ich bin nicht müde.', ru: 'Я не устал.' },
      { de: 'Ich habe kein Auto.', ru: 'У меня нет машины.' },
      { de: 'Das ist nicht gut.', ru: 'Это нехорошо.' },
    ],
    category: 'Отрицание',
    cefrLevel: 'A1',
  },
  {
    id: 'g006',
    title: 'Порядок слов в предложении',
    explanation: 'В немецком предложении глагол всегда стоит на втором месте. При инверсии подлежащее идёт после глагола.',
    examples: [
      { de: 'Ich gehe heute ins Kino.', ru: 'Я иду сегодня в кино.' },
      { de: 'Heute gehe ich ins Kino.', ru: 'Сегодня я иду в кино.' },
      { de: 'Morgen arbeite ich nicht.', ru: 'Завтра я не работаю.' },
    ],
    category: 'Синтаксис',
    cefrLevel: 'A1',
  },
  {
    id: 'g007',
    title: 'Падежи: Nominativ и Akkusativ',
    explanation: 'Nominativ — подлежащее (кто?). Akkusativ — прямое дополнение (кого? что?). Артикль der → den в Akkusativ.',
    examples: [
      { de: 'Der Mann kauft den Apfel.', ru: 'Мужчина покупает яблоко.' },
      { de: 'Ich sehe den Hund.', ru: 'Я вижу собаку.' },
      { de: 'Sie liebt die Musik.', ru: 'Она любит музыку.' },
    ],
    category: 'Падежи',
    cefrLevel: 'A2',
  },
  {
    id: 'g008',
    title: 'Модальные глаголы',
    explanation: 'Модальные глаголы: können (мочь), müssen (должен), wollen (хотеть), dürfen (разрешено), sollen (следует), mögen (нравиться).',
    examples: [
      { de: 'Ich kann Deutsch sprechen.', ru: 'Я умею говорить по-немецки.' },
      { de: 'Du musst lernen.', ru: 'Ты должен учиться.' },
      { de: 'Er will schlafen.', ru: 'Он хочет спать.' },
    ],
    category: 'Глаголы',
    cefrLevel: 'A2',
  },
  {
    id: 'g009',
    title: 'Перфект (Vergangenheit)',
    explanation: 'Перфект образуется с помощью haben/sein + Partizip II. Большинство глаголов используют haben, глаголы движения — sein.',
    examples: [
      { de: 'Ich habe gegessen.', ru: 'Я поел.' },
      { de: 'Er ist gegangen.', ru: 'Он ушёл.' },
      { de: 'Wir haben gespielt.', ru: 'Мы играли.' },
    ],
    category: 'Времена',
    cefrLevel: 'B1',
  },
  {
    id: 'g010',
    title: 'Придаточные предложения',
    explanation: 'В придаточных предложениях глагол стоит в конце. Союзы: dass (что), weil (потому что), wenn (если/когда), obwohl (хотя).',
    examples: [
      { de: 'Ich denke, dass er kommt.', ru: 'Я думаю, что он придёт.' },
      { de: 'Ich lerne, weil es wichtig ist.', ru: 'Я учусь, потому что это важно.' },
      { de: 'Wenn es regnet, bleibe ich zu Hause.', ru: 'Если идёт дождь, я остаюсь дома.' },
    ],
    category: 'Синтаксис',
    cefrLevel: 'B1',
  },
];

export function getGrammarByLevel(cefrLevel: string): GrammarRule[] {
  return grammarRules.filter(r => r.cefrLevel === cefrLevel);
}

export function getGrammarByCategory(category: string): GrammarRule[] {
  return grammarRules.filter(r => r.category === category);
}
