# Deutsch mit Nika – Design Plan

## App-Konzept
Mobile Deutsch-Lern-App für russischsprachige Nutzer (A1–B1) mit KI-Tutor "Nika" (Chihuahua-Maskottchen).
Zielgruppe: Russischsprachige Erwachsene, die Deutsch von Grund auf lernen.

## Farbpalette
- **Primär:** Lila/Violett `#7C3AED` (Nika-Markenfarbe)
- **Sekundär:** Pink `#EC4899` (Akzent)
- **Hintergrund (Dark):** `#0F0A1E` (tiefes Dunkelviolett)
- **Surface (Dark):** `#1A1030` (Karten-Hintergrund)
- **Hintergrund (Light):** `#F5F0FF` (helles Lavendel)
- **Surface (Light):** `#FFFFFF`
- **Erfolg:** `#22C55E`
- **Fehler:** `#EF4444`
- **Gold (Achievements):** `#F59E0B`

## Screen-Liste

### Navigation (5 Tabs)
1. **Главная** (Home) – Dashboard
2. **Учиться** (Lernen) – Vokabeln & Lektionen
3. **Повторять** (Wiederholen) – Spaced Repetition Quiz
4. **Говорить** (Sprechen) – Aussprache & KI-Chat
5. **Профиль** (Profil) – Stats & Einstellungen

### Screens im Detail

#### Home (Главная)
- Begrüßung mit Nika-Avatar und Tagesmotto
- Streak-Banner (Серия дней + Слов выучено)
- Schnellzugriff-Karten: Учиться, Повторять, Говорить, Экзамен
- Statistik-Zeile: Wiederholt, Gespräche, Achievements
- Tools-Bereich: Tagesplan, Diktat, Export

#### Lernen (Учиться)
- Kategorien-Grid (Tiere, Farben, Zahlen, Familie, etc.)
- Lernkarten mit Flip-Animation (DE → RU)
- TTS-Button zum Anhören
- Grammatik-Regeln Screen
- Satzbau-Übungen
- Prüfungsmodus (A1–B2)
- Audio-Lernmodus

#### Wiederholen (Повторять)
- Spaced-Repetition Quiz
- Multiple-Choice und Fill-in-the-blank
- Ergebnis-Screen mit Achievements

#### Sprechen (Говорить)
- **Nika Chat** – KI-Konversation mit echtem LLM
  - Modi: Coach, Live-Gespräch, Rollenspiel
  - Szenarien: Café, Arzt, Hotel, Smalltalk, Prüfung, Bewerbung
  - Korrektur-Karten nach Fehlern
- Aussprache-Training (TTS-basiert)

#### Profil (Профиль)
- Statistiken (Streak, Wörter, Genauigkeit)
- Achievements-Galerie
- Einstellungen (Level, Dark Mode, Sprache)
- Nika-Outfit-Auswahl (Wardrobe)

## Key User Flows

### Vokabeln lernen
Home → Tab "Учиться" → Kategorie wählen → Lernkarten (Flip) → Anhören → Легко/Сложно → Ergebnis

### KI-Gespräch mit Nika
Tab "Говорить" → Nika Chat → Modus wählen → Nachricht tippen → Nika antwortet mit Korrektur

### Tägliche Wiederholung
Home → Tab "Повторять" → Quiz starten → Antworten → Ergebnis + Streak-Update

## Designprinzipien
- **Dark Mode als Standard** (dunkles Lila-Theme)
- **Glassmorphism-Karten** mit leichtem Blur-Effekt
- **Nika-Charakter** prominent auf Home und Chat-Screen
- **Russische UI-Sprache** für Hauptnavigation und Aktionen
- **Deutsche Lernelemente** klar hervorgehoben (größere Schrift, Lila-Akzent)
- **Gamification** durch Streaks, Achievements und Punkte
