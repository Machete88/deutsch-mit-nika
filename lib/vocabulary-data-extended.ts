import { CEFRLevel, ExamQuestion } from './types-extended';

export const examQuestions: ExamQuestion[] = [
  // A1 Questions
  { id: 'exam-a1-001', type: 'multiple-choice', cefrLevel: 'A1', russian: 'Как сказать "я"?', german: 'Wie sagt man "я"?', options: ['ich', 'du', 'er', 'sie'], correctAnswer: 'ich', category: 'Местоимения' },
  { id: 'exam-a1-002', type: 'multiple-choice', cefrLevel: 'A1', russian: 'Что означает "Haus"?', german: 'Was bedeutet "Haus"?', options: ['дом', 'школа', 'книга', 'стол'], correctAnswer: 'дом', category: 'Существительные' },
  { id: 'exam-a1-003', type: 'fill-blank', cefrLevel: 'A1', russian: 'Заполни пропуск: Ich ___ Anna.', german: 'Füll die Lücke aus: Ich ___ Anna.', options: ['bin', 'bist', 'ist', 'sind'], correctAnswer: 'bin', category: 'Глаголы' },
  { id: 'exam-a1-004', type: 'multiple-choice', cefrLevel: 'A1', russian: 'Как сказать "привет"?', german: 'Wie sagt man "привет"?', options: ['Hallo', 'Tschüss', 'Danke', 'Bitte'], correctAnswer: 'Hallo', category: 'Приветствия' },
  { id: 'exam-a1-005', type: 'multiple-choice', cefrLevel: 'A1', russian: 'Что означает "Mutter"?', german: 'Was bedeutet "Mutter"?', options: ['мать', 'отец', 'сестра', 'брат'], correctAnswer: 'мать', category: 'Семья' },
  { id: 'exam-a1-006', type: 'multiple-choice', cefrLevel: 'A1', russian: 'Какой артикль у слова "Tisch"?', german: 'Welcher Artikel hat "Tisch"?', options: ['der', 'die', 'das', 'den'], correctAnswer: 'der', category: 'Артикли' },
  { id: 'exam-a1-007', type: 'fill-blank', cefrLevel: 'A1', russian: 'Заполни: Ich ___ Deutsch.', german: 'Ergänze: Ich ___ Deutsch.', options: ['lerne', 'lernt', 'lernen', 'lernst'], correctAnswer: 'lerne', category: 'Глаголы' },
  { id: 'exam-a1-008', type: 'multiple-choice', cefrLevel: 'A1', russian: 'Как сказать "спасибо"?', german: 'Wie sagt man "спасибо"?', options: ['Danke', 'Bitte', 'Hallo', 'Ja'], correctAnswer: 'Danke', category: 'Фразы' },

  // A2 Questions
  { id: 'exam-a2-001', type: 'multiple-choice', cefrLevel: 'A2', russian: 'Как спросить "Как дела?"', german: 'Wie fragt man "Как дела?"', options: ['Wie geht es dir?', 'Wer bist du?', 'Was machst du?', 'Wo wohnst du?'], correctAnswer: 'Wie geht es dir?', category: 'Фразы' },
  { id: 'exam-a2-002', type: 'multiple-choice', cefrLevel: 'A2', russian: 'Выбери правильный артикль: ___ Buch', german: 'Wähle den richtigen Artikel: ___ Buch', options: ['der', 'die', 'das', 'den'], correctAnswer: 'das', category: 'Артикли' },
  { id: 'exam-a2-003', type: 'fill-blank', cefrLevel: 'A2', russian: 'Заполни: Ich ___ ein Buch.', german: 'Ergänze: Ich ___ ein Buch.', options: ['habe', 'hat', 'haben', 'habt'], correctAnswer: 'habe', category: 'Глаголы' },
  { id: 'exam-a2-004', type: 'multiple-choice', cefrLevel: 'A2', russian: 'Что означает "Arbeit"?', german: 'Was bedeutet "Arbeit"?', options: ['работа', 'дом', 'машина', 'еда'], correctAnswer: 'работа', category: 'Существительные' },
  { id: 'exam-a2-005', type: 'multiple-choice', cefrLevel: 'A2', russian: 'Как сказать "я понимаю"?', german: 'Wie sagt man "я понимаю"?', options: ['Ich verstehe', 'Ich spreche', 'Ich lerne', 'Ich weiß'], correctAnswer: 'Ich verstehe', category: 'Глаголы' },
  { id: 'exam-a2-006', type: 'fill-blank', cefrLevel: 'A2', russian: 'Заполни: ___ Tisch ist groß.', german: 'Ergänze: ___ Tisch ist groß.', options: ['Der', 'Die', 'Das', 'Den'], correctAnswer: 'Der', category: 'Артикли' },
  { id: 'exam-a2-007', type: 'multiple-choice', cefrLevel: 'A2', russian: 'Что означает "heute"?', german: 'Was bedeutet "heute"?', options: ['сегодня', 'завтра', 'вчера', 'сейчас'], correctAnswer: 'сегодня', category: 'Время' },
  { id: 'exam-a2-008', type: 'multiple-choice', cefrLevel: 'A2', russian: 'Как сказать "я хочу"?', german: 'Wie sagt man "я хочу"?', options: ['Ich möchte', 'Ich muss', 'Ich kann', 'Ich darf'], correctAnswer: 'Ich möchte', category: 'Модальные глаголы' },

  // B1 Questions
  { id: 'exam-b1-001', type: 'multiple-choice', cefrLevel: 'B1', russian: 'Выбери синоним: "verstehen"', german: 'Wähle das Synonym: "verstehen"', options: ['begreifen', 'sehen', 'hören', 'sprechen'], correctAnswer: 'begreifen', category: 'Синонимы' },
  { id: 'exam-b1-002', type: 'fill-blank', cefrLevel: 'B1', russian: 'Заполни: Ich ___ nicht, was du meinst.', german: 'Ergänze: Ich ___ nicht, was du meinst.', options: ['verstehe', 'verstehst', 'versteht', 'verstehen'], correctAnswer: 'verstehe', category: 'Глаголы' },
  { id: 'exam-b1-003', type: 'multiple-choice', cefrLevel: 'B1', russian: 'Как образовать Perfekt от "gehen"?', german: 'Wie bildet man das Perfekt von "gehen"?', options: ['bin gegangen', 'habe gegangen', 'bin geht', 'habe geht'], correctAnswer: 'bin gegangen', category: 'Времена' },
  { id: 'exam-b1-004', type: 'multiple-choice', cefrLevel: 'B1', russian: 'Что означает "obwohl"?', german: 'Was bedeutet "obwohl"?', options: ['хотя', 'потому что', 'если', 'когда'], correctAnswer: 'хотя', category: 'Союзы' },
  { id: 'exam-b1-005', type: 'fill-blank', cefrLevel: 'B1', russian: 'Заполни: Er kommt, ___ er müde ist.', german: 'Ergänze: Er kommt, ___ er müde ist.', options: ['obwohl', 'weil', 'wenn', 'dass'], correctAnswer: 'obwohl', category: 'Союзы' },
  { id: 'exam-b1-006', type: 'multiple-choice', cefrLevel: 'B1', russian: 'Как сказать "я должен"?', german: 'Wie sagt man "я должен"?', options: ['Ich muss', 'Ich kann', 'Ich will', 'Ich darf'], correctAnswer: 'Ich muss', category: 'Модальные глаголы' },

  // B2 Questions
  { id: 'exam-b2-001', type: 'multiple-choice', cefrLevel: 'B2', russian: 'Выбери правильное слово: "Obwohl er müde war, ___"', german: 'Wähle das richtige Wort: "Obwohl er müde war, ___"', options: ['ging er zur Arbeit', 'er ging zur Arbeit', 'zur Arbeit ging er', 'ging zur Arbeit er'], correctAnswer: 'ging er zur Arbeit', category: 'Сложные предложения' },
  { id: 'exam-b2-002', type: 'fill-blank', cefrLevel: 'B2', russian: 'Заполни: Das ___ ich schon lange nicht mehr.', german: 'Ergänze: Das ___ ich schon lange nicht mehr.', options: ['habe', 'hat', 'haben', 'hatte'], correctAnswer: 'habe', category: 'Перфект' },
  { id: 'exam-b2-003', type: 'multiple-choice', cefrLevel: 'B2', russian: 'Что означает "voraussetzen"?', german: 'Was bedeutet "voraussetzen"?', options: ['предполагать', 'понимать', 'объяснять', 'решать'], correctAnswer: 'предполагать', category: 'Глаголы' },
  { id: 'exam-b2-004', type: 'multiple-choice', cefrLevel: 'B2', russian: 'Как образовать Konjunktiv II от "haben"?', german: 'Wie bildet man den Konjunktiv II von "haben"?', options: ['hätte', 'hatte', 'habe', 'hat'], correctAnswer: 'hätte', category: 'Конъюнктив' },
  { id: 'exam-b2-005', type: 'fill-blank', cefrLevel: 'B2', russian: 'Заполни: Wenn ich Zeit ___, würde ich reisen.', german: 'Ergänze: Wenn ich Zeit ___, würde ich reisen.', options: ['hätte', 'habe', 'hatte', 'hat'], correctAnswer: 'hätte', category: 'Конъюнктив' },
];

export function getExamQuestionsByLevel(level: CEFRLevel): ExamQuestion[] {
  return examQuestions.filter(q => q.cefrLevel === level);
}
