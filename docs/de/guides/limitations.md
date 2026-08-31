# Einschränkungen

**[← Zur Übersicht](../../../README.md)**

**Dokumentation:** Deutsch · [English](../../en/guides/limitations.md) · [Русский](../../ru/guides/limitations.md)

- Die Bibliothek ist für die Synchronisierung der folgenden HTTP-Methoden ausgelegt: `POST`, `PUT`, `PATCH`, `DELETE`.
- `GET`-Anfragen werden nicht in die Offline-Warteschlange aufgenommen.
- Die Warteschlange wird lokal in der IndexedDB des Browsers gespeichert.

## Weiter

- [Roadmap](roadmap.md) — welche Einschränkungen künftig aufgehoben werden sollen
- [Verwendung](usage.md) — welche Methoden unterstützt werden und wie sie aufgerufen werden
