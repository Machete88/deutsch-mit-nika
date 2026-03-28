# Deutsch mit Nika – TODO

## Setup & Branding
- [x] App-Logo generieren (Nika Chihuahua mit Kopfhörern)
- [x] Theme-Farben konfigurieren (Dark Premium Lila-Palette)
- [x] app.config.ts aktualisieren
- [x] Icon-Mappings in icon-symbol.tsx

## Daten & Typen
- [x] Typen-Definitionen (Word, LearningSet, UserWordState, AppSettings, UserStats)
- [x] Vokabel-Datensatz (200+ Wörter DE-RU, A1-B2)
- [x] Vokabel-Datensatz Extended (weitere Wörter)
- [x] Grammatik-Daten (grammar-data.ts)
- [x] Achievements-Definitionen
- [x] Nika-Typen (NikaOutfit, NikaState)

## Kontexte & State
- [x] SettingsContext (Level, Dark Mode, Onboarding)
- [x] VocabularyContext (Wörter, Fortschritt)
- [x] SpacedRepetitionContext (SM-2 Algorithmus)
- [x] StatisticsContext (Streak, Statistiken)
- [x] AchievementsContext (Badges, Gamification)
- [x] NikaChatContext (KI-Gespräche)
- [x] NikaContext (Nika-State, Outfits, XP)
- [x] NikaThemeContext (Dark/Light Mode, Font-Skalierung)
- [x] ExamContext (Prüfungen)
- [x] TTSContext (Text-to-Speech)
- [x] NotificationsContext
- [x] AccessibilityContext

## Navigation & Layout
- [x] Root-Layout mit allen Providern
- [x] Tab-Navigation (5 Tabs: Start, Lernen, Nika, Wiederholen, Profil)
- [x] Onboarding-Screen (Level-Auswahl)
- [x] Onboarding-Guard

## Home-Screen
- [x] Begrüßung mit Nika-Avatar
- [x] Streak & XP Pills
- [x] Nika Hero Card
- [x] Action Cards (Lernen, Wiederholen, Nika Chat, Prüfung)
- [x] Stats Row (Streak, Wörter, XP)
- [x] Tool Cards (Tagesplan, Diktat, Export)

## Lernen-Tab
- [x] Learn Index (Kategorien-Grid)
- [x] Lernkarten-Screen (Flip-Animation, TTS)
- [x] Grammatik-Screen
- [x] Satzbau-Screen
- [x] Prüfungsmodus (A1-B2)
- [x] Exam Quiz (Multiple Choice)
- [x] Exam Result

## Wiederholen-Tab
- [x] Review Index
- [x] Quiz-Screen (SM-2 Karteikarten)
- [x] Ergebnis-Screen

## Nika-Tab (KI)
- [x] Nika Index (Übersicht, Outfits)
- [x] Nika Chat (KI-Gespräch, Coach-Modus)
- [x] Nika Live Speaking (Live-Gespräch)
- [x] Nika Roleplay (Szenarien: Café, Arzt, Hotel, Bewerbung)
- [x] Nika Wardrobe (Outfit-Auswahl)

## Profil-Tab
- [x] Profil-Screen (Stats, Achievements, Einstellungen)

## KI-Integration (Server)
- [x] Server nikaRouter mit invokeLLM
- [x] tRPC-Endpunkt für Nika Chat
- [x] MANUS_API_KEY konfiguriert
- [x] ENV-Fallback für API-Key

## Assets
- [x] Nika-Bilder (30 Outfit-Bilder)
- [x] App-Icon (Nika Chihuahua)

## Qualität
- [x] TypeScript: 0 Fehler
- [x] Alle Screens vollständig implementiert
- [x] TTS integriert (expo-speech)
- [x] API-Key-Test bestanden
- [x] Checkpoint erstellen
- [ ] Restliche Bilder auf S3 hochladen und lokale Dateien verschieben
- [ ] Checkpoint erstellen
- [ ] Auf GitHub pushen (https://github.com/Machete88/deutsch-mit-nika)

## Bug-Fixes (28.03.2026)
- [x] KI-Integration reparieren (Venice AI API-Fehler im Server)
- [x] Live-Gespräch fixieren (Mikrofon + KI-Antwort)
- [x] speak/index Tab-Name in Tab-Bar bereinigen
- [x] Unmatched Route Fehler beheben
- [x] Design: Neon-Glow-Effekte, Tab-Bar-Icons verbessern
- [x] Home-Screen Design dem Screenshot-Design angleichen

## Kritische Bug-Fixes Runde 2 (28.03.2026 Abend)
- [ ] Live-Gespräch: KI antwortet nicht - komplett neu implementieren
- [ ] speak/index Tab immer noch sichtbar - endgültig entfernen
- [ ] Unmatched Route beim App-Start fixen
- [ ] Alle Screens vollständig auf Funktion prüfen (keine Platzhalter)
- [ ] Venice AI direkt im Live-Gespräch Screen einbinden

## Runde 3 Bug-Fixes + Stimme (28.03.2026)
- [ ] callNikaAPI Venice AI korrekt reparieren (Chat funktioniert nicht)
- [ ] speak/index Tab endgültig entfernen
- [ ] Unmatched Route beim App-Start fixen
- [ ] Nika-Stimme: Venice AI TTS oder expo-speech (Deutsch + Russisch, Chihuahua-Charakter)
- [ ] Live-Gespräch: Stimme nach jeder Nika-Antwort abspielen
- [ ] Alle Screens end-to-end prüfen
- [ ] Barrierefreiheit in Einstellungen reparieren (Schriftgröße, Kontrast, TTS-Vorlesefunktion)
- [ ] Light-Mode Kontrast reparieren (Text unsichtbar auf hellem Hintergrund)
- [ ] Barrierefreiheit-Sektion im Profil-Screen vollständig implementieren
- [ ] Venice AI Chat auf Native reparieren (kein CORS-Problem über Server-Route)
- [ ] Venice TTS Stimme: Server-Route + Audio-Playback (Chihuahua DE+RU)
- [ ] Lade-Animationen (Skeleton/Pulse) hinzufügen
- [ ] Venice TTS Server-Route: /api/trpc/nika.speak (Chihuahua-Stimme DE+RU)
- [ ] Lautsprecher-Button bei jeder Nika-Nachricht im Chat
- [ ] Auto-Vorlesen-Toggle in Profil/Einstellungen (Nika liest automatisch vor)
- [ ] TTS-Kontext: useNikaTTS Hook für gesamte App
- [ ] Live-Gespräch: Nika-Avatar erscheint beim Drücken des Mikrofon-Buttons
- [ ] Live-Gespräch: Lippensynchrone Animation während Nika spricht (Mund öffnet/schließt sich)
- [ ] Venice AI Chat auf Native reparieren (über Server-Route statt direktem Fetch)

## Runde 4 Fertigstellungen (28.03.2026 Nacht)
- [x] NikaSpeechProvider implementiert (Venice TTS + expo-speech Fallback)
- [x] NikaSpeechProvider in Tab-Layout eingebunden
- [x] NikaAvatar: speaking-Prop + Lippensync-Animation (Bounce + Glow-Ring)
- [x] Live-Gespräch: Vollbild-Overlay wenn Nika spricht + Stoppen-Button
- [x] Live-Gespräch: Auto-TTS nach jeder Nika-Antwort
- [x] Live-Gespräch: Vorlesen-Button bei jeder Nika-Nachricht
- [x] Live-Gespräch: Light-Mode-Farben repariert
- [x] Chat-Screen: Vorlesen-Button (🔈) bei jeder Nika-Nachricht
- [x] Chat-Screen: Auto-Vorlesen wenn accessibilityAutoTTS aktiviert
- [x] Profil-Screen: Barrierefreiheit-Sektion mit Auto-Vorlesen-Toggle
- [x] Light-Mode-Kontrast verbessert (textPrimary, textMuted, cardBg)

## Runde 5 Bug-Fixes (29.03.2026)
- [x] Icons in Action-Cards vergrößern (Home-Screen + Nika-Tab)
- [x] KI System-Prompt: Erklärungen auf Russisch statt Englisch
- [x] expo-speech Crash auf Android fixen (SpeechSynthesisUtterance + cancel)
- [x] Onboarding Light-Mode Kontrast reparieren
