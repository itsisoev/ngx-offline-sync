# Anfragestatus

**[← Zur Übersicht](../README.md)**

**Dokumentation:** [English](../../en/guides/statuses.md) · Deutsch · [Русский](../../ru/guides/statuses.md)

Jede Anfrage in der Warteschlange hat einen der folgenden Status:

| Status | Beschreibung |
|---|---|
| `PENDING` | Die Anfrage wartet auf ihre Ausführung |
| `SYNCING` | Die Anfrage wird ausgeführt |
| `COMPLETED` | Die Anfrage wurde erfolgreich ausgeführt |
| `FAILED` | Die Anfrage konnte nicht ausgeführt werden |

## Grundlegender Ablauf

```
PENDING → SYNCING → COMPLETED
```

Eine Anfrage wird in die Warteschlange aufgenommen (`PENDING`), dann ausgeführt (`SYNCING`) und erhält bei Erfolg den endgültigen Status `COMPLETED`.

## Bei Fehlern

```
SYNCING → RetryPolicy → PENDING → Wiederholung
```

Wenn eine Anfrage fehlschlägt, entscheidet die `RetryPolicy`, ob sie erneut versucht werden soll. Siehe [Wiederholungen](retries.md).

## Wenn die Anfrage nicht mehr wiederholt werden soll

```
SYNCING → FAILED
```

Wenn die `RetryPolicy` entscheidet, dass weitere Versuche aussichtslos sind, beispielsweise weil das Wiederholungslimit überschritten wurde, wechselt die Anfrage zu `FAILED` und bleibt dort.

## Weiter

- [Wiederholungen](retries.md) — ein genauerer Blick auf die Wiederholungsentscheidung
