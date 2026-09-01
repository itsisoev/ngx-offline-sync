# Priority Queue

**[← Zurück zum Inhaltsverzeichnis](index.md)**

**Dokumentation:** Deutsch ·  [English](../../en/configuration/index.md) · [Русский](../../ru/configuration/index.md)

Wenn die Anwendung offline ist, werden Anfragen in einer lokalen Warteschlange gespeichert und nach der Wiederherstellung der Verbindung synchronisiert.

Allerdings sind nicht alle Anfragen gleich wichtig.

Stellen wir uns eine E-Commerce-Anwendung vor. Während der Benutzer offline ist, können verschiedene Aktionen ausgeführt werden:

* das Benutzerprofil aktualisieren;
* ein Produkt zum Warenkorb hinzufügen;
* eine Bestellung aufgeben;
* Analysedaten senden.

Wenn alle Anfragen die gleiche Priorität haben, werden sie in der Reihenfolge der Warteschlange verarbeitet. Einige Vorgänge sind jedoch wichtiger als andere — beispielsweise sollte eine Bestellung normalerweise vor dem Senden von Analysedaten synchronisiert werden.

**Priority Queue** ermöglicht es, festzulegen, wie wichtig eine bestimmte Anfrage ist.

## Prioritätsstufen

Es stehen drei Prioritätsstufen zur Verfügung:

* `HIGH` — wird zuerst verarbeitet.
* `NORMAL` — Standardpriorität.
* `LOW` — wird nach Anfragen mit der Priorität `HIGH` und `NORMAL` verarbeitet.

## Beispiel

Stellen wir uns eine E-Commerce-Anwendung vor, bei der der Benutzer offline ist.

Der Benutzer führt folgende Aktionen aus:

```text
1. Analyseereignis senden          → LOW
2. Profil aktualisieren            → NORMAL
3. Bestellung aufgeben             → HIGH
4. Weiteres Analyseereignis senden → LOW
5. Warenkorb aktualisieren         → HIGH
```

Die Anfragen werden in dieser Reihenfolge in die Warteschlange aufgenommen:

```text
LOW
NORMAL
HIGH
LOW
HIGH
```

Nach der Wiederherstellung der Verbindung verarbeitet die Warteschlange die Anfragen entsprechend ihrer Priorität:

```text
HIGH
HIGH
NORMAL
LOW
LOW
```

Anfragen mit derselben Priorität behalten ihre ursprüngliche Reihenfolge in der Warteschlange bei.

## Priorität einer Anfrage festlegen

Die Priorität einer HTTP-Anfrage kann mit `HttpContext` von Angular festgelegt werden:

```typescript
const context = new HttpContext().set(
  OFFLINE_SYNC_PRIORITY,
  QueuePriority.HIGH,
);

this.http.post('/api/orders', order, {
  context,
});
```

In diesem Beispiel erhält die Bestellanfrage die Priorität `HIGH` und wird vor Anfragen mit der Priorität `NORMAL` oder `LOW` verarbeitet.

## Standardpriorität

Wenn keine Priorität angegeben wird, erhält die Anfrage automatisch `QueuePriority.NORMAL`:

```typescript
this.http.post('/api/profile', profile);
```

Dies entspricht:

```typescript
const context = new HttpContext().set(
  OFFLINE_SYNC_PRIORITY,
  QueuePriority.NORMAL,
);

this.http.post('/api/profile', profile, {
  context,
});
```

## Verfügbare Prioritäten

| Priorität              | Beschreibung                                                         |
|------------------------|----------------------------------------------------------------------|
| `QueuePriority.HIGH`   | Wird vor Anfragen mit der Priorität `NORMAL` und `LOW` verarbeitet   |
| `QueuePriority.NORMAL` | Standardpriorität                                                    |
| `QueuePriority.LOW`    | Wird nach Anfragen mit der Priorität `HIGH` und `NORMAL` verarbeitet |

Priority Queue ist besonders nützlich, wenn eine Anwendung verschiedene Arten von Offline-Operationen hat und bestimmte Anfragen vor anderen synchronisiert werden müssen.
