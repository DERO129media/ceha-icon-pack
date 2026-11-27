# Ceha Icons

Überblick, Befehle und Aufbau: README.md. Regeln für das Zeichnen von Icons: docs/gestaltung.md.

- Vor dem Abschluss `pnpm pruefen` laufen lassen (Icon-Prüfung, Typen, Tests).
- Erzeugte Dateien (`packages/icons/svg|react|icons.json|meta.json|sprite.svg`, `apps/dashboard/src/generated`) nie von Hand ändern.
- Namen und Aliase aus `icons/names.lock.json` nie entfernen. Umbenennen = neuer Name, alter wird Alias.
- Farben nur aus dem Ceha-Styleguide (`apps/dashboard/src/design/`). Fehlende Werte (z. B. CMYK) nicht erfinden.
- Kein dero-Standard in diesem Repo.
