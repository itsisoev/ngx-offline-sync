# Verwendung

**[← Zur Übersicht](../README.md)**

**Dokumentation:** [English](../../en/guides/usage.md) · Deutsch · [Русский](../../ru/guides/usage.md)

Nach der Einrichtung benötigt die Bibliothek keine spezielle API zum Senden von Anfragen. Verwenden Sie einfach den regulären `HttpClient`:

```typescript
this.http.post('/api/products', product).subscribe();
```

- Bei verfügbarer Internetverbindung wird die Anfrage wie gewohnt gesendet.
- Ist die Verbindung nicht verfügbar, wird die Anfrage automatisch zur Warteschlange hinzugefügt.

Kein zusätzlicher Wrapper, kein spezieller Dienst und keine manuelle Verwaltung der Warteschlange sind erforderlich — `offlineSyncInterceptor` fängt die Anfrage ab, bevor sie das Netzwerk erreicht, und entscheidet, was mit ihr geschieht.

## Unterstützte Methoden

Die Bibliothek stellt nur Methoden in die Warteschlange, die Daten auf dem Server verändern:

- `POST`
- `PUT`
- `PATCH`
- `DELETE`

`GET`-Anfragen werden niemals in der Warteschlange gespeichert. Details finden Sie unter [Einschränkungen](limitations.md).

## Weiter

- [So funktioniert es](how-it-works.md) — was innerhalb der Bibliothek mit einer Anfrage passiert
- [Anfragestatus](statuses.md) — wie der Status einer Anfrage verfolgt wird
