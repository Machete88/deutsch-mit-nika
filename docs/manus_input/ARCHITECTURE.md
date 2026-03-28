# Zielarchitektur

## Frontend
- Expo + React Native + Expo Router
- TypeScript
- Context oder Zustand als Übergangslösung; langfristig Zustand vereinheitlichen
- Reusable UI-Komponenten für Karten, Buttons, Status, Quiz, Dialoge

## Persistenz lokal
- AsyncStorage für unkritische Zustände
- SecureStore für sensible Daten
- klar definierte Storage Keys

## Backend
Empfehlung:
- kleines Node/Express oder tRPC Backend beibehalten
- Auth-Router
- Learning-Router
- Sync-Router
- AI-Router
- Speech-Router

## Externe Integrationen
- TTS: Expo Speech oder kompatible TTS-Lösung
- STT: Device-native oder externer Speech-Service
- LLM: OpenAI oder kompatibles Modell über Backend
- optionale Datenbank: SQLite lokal, später Postgres/MySQL serverseitig

## Qualitätsregeln
- keine Klartext-Passwörter
- alle Netzwerkzugriffe über Service-Layer
- Fehler- und Offline-Handling zentralisieren
- keine Businesslogik in UI-Komponenten duplizieren
