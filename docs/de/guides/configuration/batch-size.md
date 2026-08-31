# batchSize

**[← Zur Konfiguration](index.md)**

**Dokumentation:** [English](../../../en/guides/configuration/batch-size.md) · [Русский](../../../ru/guides/configuration/batch-size.md) · [日本語]()

| Typ      | Standardwert |
|----------|--------------|
| `number` | `1`          |

```typescript
provideOfflineSync({
  batchSize: 10,
})
```

## Warum diese Option existiert

Standardmäßig verarbeitet die Bibliothek die Warteschlange **sequenziell** — eine Anfrage nach der anderen: Die nächste Anfrage wird erst gesendet, wenn die vorherige abgeschlossen ist, entweder erfolgreich oder mit einem Fehler.

Das ist zuverlässig, kann aber langsam sein, wenn der Benutzer längere Zeit offline war und sich viele Anfragen in der Warteschlange angesammelt haben.

`batchSize` legt die maximale Anzahl von Anfragen fest, die die Bibliothek innerhalb eines einzelnen Batches parallel verarbeitet.

## Funktionsweise

**`batchSize: 1` (Standard)** — Anfragen werden strikt nacheinander ausgeführt:

```
PENDING [1] [2] [3] [4] [5]
             ↓
          SYNCING [1] → COMPLETED [1]
             ↓
          SYNCING [2] → COMPLETED [2]
             ↓
             ...
```

**`batchSize: 3`** — die Warteschlange wird in Batches zu je 3 Elementen aufgeteilt; Anfragen innerhalb eines Batches laufen parallel:

```
PENDING [1] [2] [3] [4] [5]
             ↓
     SYNCING [1] [2] [3]   (parallel)
             ↓
   COMPLETED [1] [2] [3]
             ↓
     SYNCING [4] [5]
             ↓
   COMPLETED [4] [5]
```

Der nächste Batch startet erst, wenn der aktuelle abgeschlossen ist.

## Wann der Wert erhöht werden sollte

- Die Warteschlange sammelt regelmäßig viele Anfragen an, etwa weil die App intensiv offline genutzt wird, beispielsweise im Lager, Außendienst oder Nahverkehr.
- Das Backend kann parallele Anfragen eines einzelnen Clients ohne Rate Limits verarbeiten.
- Die Anfragen sind voneinander unabhängig und ihre Ausführungsreihenfolge ist nicht wichtig.

## Wann der Standardwert (`1`) beibehalten werden sollte

- Anfragen hängen von ihrer Reihenfolge ab, beispielsweise wenn zuerst eine Entität erstellt und anschließend aktualisiert wird.
- Die API hat strikte Limits für die Anzahl gleichzeitiger Anfragen.
- Garantierte sequenzielle Ausführung ist wichtig, beispielsweise bei Finanztransaktionen.

## Beispiel

```typescript
provideOfflineSync({
  batchSize: 5
});
```

Wenn die Verbindung wiederhergestellt wird, bilden 20 Anfragen in der Warteschlange 4 Batches mit je 5 Anfragen. Die Batches werden sequenziell verarbeitet — einer nach dem anderen — während die Anfragen innerhalb jedes Batches parallel laufen.

> ⚠️ Das Erhöhen von `batchSize` beschleunigt die Synchronisierung, erhöht aber auch die Serverlast, sobald die Verbindung wiederhergestellt ist. Wählen Sie einen Wert, den Ihr Backend bewältigen kann.

## Siehe auch

- [Architektur](../architecture.md) — `SyncService` und der Einsatzort von `batchSize`
- [Anfragestatus](../statuses.md) — wie der Fortschritt eines Batches verfolgt wird