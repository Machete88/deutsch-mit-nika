# Prompt für Manus.ai

Baue diese App auf Basis des beigefügten Quellstands und der Spezifikationen produktionsnah fertig.

## Kontext
Die App heißt "DEUTSCH LERNEN". Sie ist eine mobile Lernapp für russischsprachige Nutzer, die Deutsch von A1 bis B1 lernen. Der vorhandene Code ist ein guter Ausgangspunkt, aber mehrere Features sind nur teilweise implementiert oder lokal simuliert.

## Deine Aufgabe
1. Analysiere den vorhandenen Code im Ordner `source_snapshot/deutsch_lernen/`.
2. Nutze ihn weiter, wo sinnvoll, statt alles neu zu schreiben.
3. Mache die App Android-first lauffähig.
4. Behebe Inkonsistenzen in Navigation, UI-Sprache und Datenfluss.
5. Implementiere die fehlenden produktionsrelevanten Teile, insbesondere:
   - stabile Authentifizierung
   - konsistente Persistenz
   - Grammatik-Quiz
   - Satzbau mit Punkten und Streaks
   - Aussprachetraining mit echtem Aufnahmeflow
   - KI-Unterhaltung mit Szenarien, Korrektur und Tutor-Antworten
   - Prüfungsmodus und Dashboard
6. Wenn echte Integrationen nicht sofort möglich sind, kapsle sie sauber hinter Interfaces oder Service-Layern und liefere eine robuste Mock-fähige Struktur.

## Prioritäten
1. Build-Stabilität
2. Kern-Lernflows
3. Sprechen und KI
4. Sync und Backend
5. Polish

## Nicht tun
- keine Klartext-Passwörter
- keine verstreute Businesslogik ohne Service-Layer
- keine unklare Mischsprache in zentralen Nutzerflows

## Ergebnis
Liefere einen konsistenten, kompilierbaren App-Stand mit sauberer Projektstruktur und dokumentiere alle Annahmen.
