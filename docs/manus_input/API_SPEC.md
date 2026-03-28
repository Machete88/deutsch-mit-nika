# API-Spezifikation

## Auth
### POST /auth/register
Registriert Nutzer

### POST /auth/login
Login, liefert Session oder Token

### POST /auth/logout
Logout

### GET /auth/me
Aktueller Nutzer

## Learning
### GET /learning/sets
Lernsets und Kategorien

### GET /learning/words?setId=...
Wörter eines Sets

### POST /learning/word-state
Speichert Fortschritt eines Worts

### GET /learning/recommendations
Tagesplan und Empfehlungen

## Grammar
### GET /grammar/lessons
Liefert Lektionen nach Level

### POST /grammar/quiz/submit
Bewertet Quiz und speichert Ergebnis

## Sentence
### GET /sentence/challenges
Liefert Satzbau-Aufgaben

### POST /sentence/submit
Bewertet Reihenfolge, Punkte und Streak

## Speech
### POST /speech/analyze
Input: Audio oder Transkript + Zielwort
Output:
- score
- matchedSounds
- missingSounds
- pacing
- tips[]

## AI Conversation
### POST /ai/conversation/start
Input: scenarioId, level
Output: erste Tutor-Nachricht

### POST /ai/conversation/reply
Input: conversationId, learnerMessage
Output:
- tutorReply
- correction
- improvedReply
- vocabularyHelp[]
- confidenceScore

## Review / Dashboard
### GET /dashboard/summary
Streak, Punkte, gelernte Wörter, Genauigkeit

### GET /dashboard/history
Letzte Sessions und Verläufe

## Sync
### POST /sync/push
Sendet lokalen Snapshot

### GET /sync/pull
Lädt neuere Änderungen
