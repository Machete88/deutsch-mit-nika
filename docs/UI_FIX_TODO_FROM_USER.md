# Deutsch Lernen App - TODO

## Grundstruktur
- [x] App-Logo generieren und Branding einrichten
- [x] Theme-Farben anpassen (Blau-Palette)
- [x] Icon-Mapping für alle Tab-Icons
- [x] Tab-Navigation (5 Tabs: Главная, Учиться, Повторять, Говорить, Профиль)
- [x] Root-Layout mit allen Providern
- [x] Onboarding-Guard (Redirect beim ersten Start)

## Daten & Typen
- [x] Typen-Definitionen (Word, LearningSet, UserWordState, etc.)
- [x] Vokabel-Datensatz (~150 Wörter, Deutsch-Russisch, A1–B2)
- [x] Erweiterte Vokabeln (vocabularyDataExtra)
- [x] Grammatik-Daten (grammar-data.ts)
- [x] Exam-Fragen (vocabulary-data-extended.ts, A1–B2)
- [x] Language-Lessons (language-lessons.ts)
- [x] Conversation-Coach (conversation-coach.ts)

## Kontexte
- [x] SettingsContext (Sprache, Schriftgröße, Niveau, Onboarding-Flag)
- [x] VocabularyContext (Wörter, Lernsets, Fortschritt)
- [x] SpacedRepetitionContext (SM-2 Algorithmus)
- [x] ExamContext (Prüfungsmodus)
- [x] StatisticsContext (Streak, Statistiken)
- [x] AchievementsContext (Badges, Gamification, checkAchievements)
- [x] TTSContext (Text-to-Speech mit expo-speech)

## Onboarding
- [x] Onboarding-Screen (3 Schritte: Willkommen, Features, Level-Auswahl)
- [x] Onboarding-Guard in Root-Layout

## Lernen-Tab
- [x] Learn Index Screen (Kategorien, Sets)
- [x] LearnCard Screen (Lernkarten mit Swipe + Buttons)
- [x] LearningCard-Komponente (Flip-Karte)
- [x] Grammar Screen (Grammatik-Regeln)
- [x] SentenceBuilder Screen (Satzbau-Übungen)
- [x] ExamMode Screen (A1–B2 Auswahl)
- [x] ExamQuiz Screen (Multiple-Choice + Fill-Blank)
- [x] ExamResult Screen (Ergebnis + Zertifikat)

## Wiederholen-Tab
- [x] Review Index Screen
- [x] ReviewQuiz Screen (Spaced-Repetition)
- [x] ReviewResult Screen (Ergebnis + Achievements)

## Sprechen-Tab
- [x] Speak Index Screen
- [x] SpeakPractice Screen (TTS-Aussprache)
- [x] AIConversation Screen (Dialog-Szenarien)

## Statistiken & Gamification
- [x] Home-Screen Dashboard (Streak, Wörter, Statistiken)
- [x] Profile-Screen (Stats, Achievements, Dark-Mode-Toggle)
- [x] Achievements-System (in allen relevanten Screens)
- [x] Streak-Tracking (updateStreak nach jeder Lerneinheit)

## Qualität
- [x] Alle Screens vollständig implementiert
- [x] TypeScript: 0 Fehler
- [x] Onboarding-Redirect funktioniert
- [x] TTS integriert (expo-speech)
- [x] Haptic Feedback (expo-haptics)
- [ ] Checkpoint erstellen
- [ ] APK-Build (über Publish-Button)

## Erweiterungen (Runde 2)
- [ ] Push-Benachrichtigungen (tägliche Lern-Erinnerungen)
- [ ] Notification-Context (Einstellungen, Scheduling)
- [ ] Notification-Settings auf Profil-Screen
- [ ] Fortschritts-Charts (Lernkurve, Wörter pro Tag)
- [ ] Chart-Komponente mit react-native-svg
- [ ] Charts-Screen oder erweiterter Profil-Screen
- [ ] Vokabeln auf 500+ erweitern (A1–B2)
- [ ] Grammatik-Kapitel: Konjunktiv, Passiv, Präpositionen
- [ ] Finaler Checkpoint

## Audio-Lernmodus (Runde 3)
- [x] Audio-Playlist-Screen: Vokabeln als TTS-Sequenz (DE → Pause → RU → Pause → nächstes Wort)
- [x] Geschwindigkeitskontrolle (0.5x / 0.75x / 1.0x / 1.25x)
- [x] Pause/Play/Skip-Steuerung während der Wiedergabe
- [x] Wortanzahl wählbar (10 / 20 / 30 / 50 Wörter)
- [x] Level-Filter (A1 / A2 / B1 / B2 / Alle)
- [x] Kategorie-Filter (26 Kategorien)
- [x] Fortschrittsbalken mit aktuellem Wort
- [x] Wiederholungsmodus (Loop)
- [x] Keep-Screen-Awake während Wiedergabe
- [x] Audio-Lernmodus im Learn-Tab verlinken (prominenter Banner)

## Runde 4: Diktat, Export, Tagesplan
- [x] Diktat-Modus Screen: TTS spricht Wort, Nutzer tippt Übersetzung (DE→RU oder RU→DE)
- [x] Diktat: Sofortiges Feedback (richtig/falsch), Streak-Zähler, Fehler-Übersicht
- [x] Diktat: Level-Filter (A1/A2/B1/B2/Alle) und Wortanzahl wählbar (10/15/20/30)
- [x] Diktat: im Home-Dashboard verlinkt
- [x] Wortlisten-Export: CSV, Anki-Format, Text, Markdown
- [x] Wortlisten-Export: als Datei teilen (Share-Sheet) via expo-sharing
- [x] Wortlisten-Export: Filter nach Level/Status (alle/gelernt/neu)
- [x] Wortlisten-Export: im Home-Dashboard verlinkt
- [x] Täglicher Lernplan: personalisierte Tagesliste (Wiederholung, neue Wörter, Audio, Diktat, Prüfung)
- [x] Täglicher Lernplan: Fortschrittsbalken, Motivations-Banner, Aufgaben-Checkboxen
- [x] Täglicher Lernplan: Push-Benachrichtigung mit Uhrzeit-Auswahl (7:00–21:00)
- [x] Täglicher Lernplan: im Home-Dashboard verlinkt
- [x] Alle 3 neuen Screens (Diktat, Export, Tagesplan) im Home-Dashboard als Karten sichtbar

## UI-Fixes (Runde 5)
- [ ] Tab-Icons reparieren: nur 5 Tabs sichtbar, korrekte MaterialIcons-Mappings
- [ ] Quick-Action-Karten größer machen (Emoji + Text größer)
- [ ] Statistik-Karten größer machen (Emoji + Zahl + Label größer)
- [ ] Lernkarten-Buttons (Сложно/Легко) größer und prominenter
- [ ] Namenseingabe im Onboarding (Schritt 1)
- [ ] Personalisierter Gruß auf Dashboard: "Guten Tag, [Name]!"
- [ ] Name in SettingsContext speichern

## Barrierefreiheit (Runde 6)
- [ ] Barrierefreiheitsmodus in SettingsContext (accessibilityMode: boolean)
- [ ] Schriftgröße: Extra-Groß (accessibilityFontScale)
- [ ] Hoher Kontrast: eigene Farbpalette (schwarz/weiß/gelb)
- [ ] TTS Auto-Vorlesen: Wörter werden automatisch vorgelesen
- [ ] Größere Touch-Targets (min. 56px Höhe)
- [ ] Einstellungs-Screen mit Barrierefreiheit-Sektion im Profil
- [ ] AccessibilityInfo-Integration (screenReader-Erkennung)
