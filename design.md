# Design: Deutsch Lernen App

## Zielgruppe
Russischsprachige Nutzer, die Deutsch lernen (A1–B2 CEFR-Niveau).

## Farbschema
- **Primary**: #2563EB (Blau – Vertrauen, Lernen)
- **Background**: #FFFFFF / #0F172A (Dark)
- **Surface**: #F1F5F9 / #1E293B
- **Success**: #16A34A / #4ADE80
- **Warning**: #D97706 / #FBBF24
- **Error**: #DC2626 / #F87171
- **Foreground**: #0F172A / #F8FAFC
- **Muted**: #64748B / #94A3B8

## Screen-Liste

### Onboarding
1. **Welcome** – App-Logo, Titel, Beschreibung, Start-Button
2. **UserLevel** – Sprachniveau wählen (Anfänger, Mittelstufe, Fortgeschritten)
3. **FontSize** – Schriftgröße anpassen (Klein, Normal, Groß)

### Haupt-Tabs
4. **Lernen (Learn)** – Kategorien-Übersicht, Lernsets, Prüfungsmodus-Button
5. **Wiederholen (Review)** – Spaced-Repetition-Übersicht, fällige Karten
6. **Sprechen (Speak)** – Aussprache-Übungen, KI-Gespräch

### Lernen-Sub-Screens
7. **LearnCard** – Lernkarten mit Wisch-Gesten (Swipe)
8. **Grammar** – Grammatik-Regeln mit Beispielen
9. **SentenceBuilder** – Satzbau-Übungen
10. **StudyPlan** – Tagesplan mit personalisierten Empfehlungen
11. **ExamMode** – Prüfungsniveau wählen (A1, A2, B1, B2)
12. **ExamQuiz** – Prüfungsfragen (Multiple Choice, Matching)
13. **ExamResult** – Ergebnis mit Zertifikat

### Wiederholen-Sub-Screens
14. **ReviewQuiz** – Karteikarten-Quiz (Multiple Choice)
15. **ReviewResult** – Ergebnis-Feedback

### Sprechen-Sub-Screens
16. **SpeakPractice** – Aussprache-Übung mit Aufnahme
17. **AIConversation** – KI-Chat für Deutsch-Gespräche

### Statistiken (im Learn-Tab)
18. **Dashboard** – Streak, gelernte Wörter, Fortschritts-Charts

## Key User Flows

### Vokabeln lernen
Home → Lernen → Set auswählen → LearnCard (Swipe) → Ergebnis

### Wiederholen
Home → Wiederholen → Set auswählen → ReviewQuiz → Ergebnis

### Prüfung
Home → Lernen → Prüfungsmodus → Niveau wählen → Quiz → Zertifikat

### Sprechen
Home → Sprechen → Wortgruppe wählen → SpeakPractice

## Layout-Prinzipien
- **Tab-Navigation**: 3 Tabs (Lernen, Wiederholen, Sprechen)
- **Karten-Design**: Abgerundete Ecken (rounded-2xl), Schatten
- **Typografie**: Große, lesbare Schriften (min. 16px)
- **Barrierefreiheit**: Hoher Kontrast, große Touch-Ziele (min. 48dp)
