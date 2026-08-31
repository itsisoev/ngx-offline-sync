# Wiederholungen

**[← Zur Übersicht](../../../README.md)**

**Dokumentation:** [English](../../en/guides/retries.md) · [Русский](../../ru/guides/retries.md) · [日本語]()

Wenn die Synchronisierung fehlschlägt, übergibt die Bibliothek den Fehler an die `RetryPolicy`.

Die Richtlinie bestimmt:

- ob die Anfrage erneut versucht werden soll;
- die Verzögerung bis zum nächsten Versuch;
- wann die Anfrage als `FAILED` markiert werden soll.

## Ablauf bei Fehlern

```
SYNCING → Anfrage fehlgeschlagen → RetryPolicy → PENDING → Wiederholung
```

Nach einer fehlgeschlagenen Ausführung wechselt die Anfrage zurück zu `PENDING` und wartet auf den nächsten Synchronisierungsversuch.

## Nach einem erfolgreichen Versuch

```
PENDING → SYNCING → COMPLETED
```

## Wenn alle Versuche aufgebraucht sind

```
SYNCING → Anfrage fehlgeschlagen → FAILED
```

Sobald die Anzahl der Versuche das zulässige Limit überschreitet, wechselt die Anfrage dauerhaft zu `FAILED` und nimmt nicht mehr an der Synchronisierung teil.

## Weiter

- [Anfragestatus](statuses.md) — das vollständige Diagramm der Statusübergänge
- [Roadmap](roadmap.md) — konfigurierbare Wiederholungsstrategien stehen bereits auf der Roadmap