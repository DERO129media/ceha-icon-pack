# AGENTS.md – Ceha Icons

Hinweise für KI-Agenten und alle, die im Repo arbeiten. Überblick und Befehle: [README.md](README.md). Zeichenregeln: [docs/gestaltung.md](docs/gestaltung.md). Sprache im Repo: Deutsch (Code-Bezeichner, Doku, Commits).

## Worum es geht

Icon-Pack der Ceha Deutschland GmbH in zwei Stilen:

- **Fläche** (`icons/solid/*.svg`, 64er-Raster): Hauptstil, Vorlagen kommen vom Marketing.
- **Kontur** (`icons/outline/*.svg`, 24er-Raster, Strich 1,35): für kleine Größen und UI.

Aus den Quelldateien erzeugt `pnpm build` das npm-Paket `@ceha/icons` (SVG, Iconify-Set, React, Sprite) und die Daten für den Konfigurator (`apps/dashboard`).

## Befehle

| Befehl | Zweck |
|---|---|
| `pnpm install` | Abhängigkeiten (Node ≥ 24, pnpm) |
| `pnpm dev` | Bauen und Konfigurator auf http://localhost:5180 starten |
| `pnpm build` | Prüfen und alle Ausgaben erzeugen; ergänzt `icons/names.lock.json` |
| `pnpm check` | Nur prüfen, nichts schreiben |
| `pnpm pruefen` | Icon-Prüfung, Typen, Tests – **vor jedem Abschluss ausführen** |

## Feste Regeln

- **Namen verschwinden nie.** Kein Name und kein Alias aus `icons/names.lock.json` darf aus dem Manifest fallen. Umbenennen = neuer Name, alter wird Alias. Neue Namen werden mit `pnpm build` dauerhaft gesperrt – vorher prüfen, ob der Name passt.
- **Erzeugte Dateien nie von Hand ändern:** `packages/icons/svg|react|icons.json|meta.json|sprite.svg`, `apps/dashboard/src/generated`. Sie sind nicht eingecheckt.
- **Farben nur aus dem Ceha-Styleguide** (`apps/dashboard/src/design/`). Fehlende Werte (z. B. CMYK) nicht erfinden.
- **Status setzt ein Mensch.** `"status": {"solid": …, "outline": …}` im Manifest gilt je Stil. Agenten legen neue oder geänderte Zeichnungen als `entwurf` an und setzen nie selbst `fertig`.
- **Kein Lucide und keine fremden Icon-Sets** als Quelle. Motive kommen aus den Ceha-Vorlagen oder werden nach `docs/gestaltung.md` neu gezeichnet.
- Kein dero-Standard in diesem Repo.

## Icons übernehmen oder zeichnen

**Fläche aus der Marketing-Ablage** (OneDrive, „Marketing/00 – Standards/03 – Icons/04 – ceha icons“, Dateien `*-CEHA-BLUE.svg`):

1. Nach `icons/solid/<name>.svg` kopieren, `fill="#0b477e"` durch `currentColor` ersetzen, `clip-rule` entfernen.
2. Name in kebab-case aus dem Dateinamen, Umlaute ausgeschrieben (`schliessfachwuerfel`). Ist die Zeichnung inhaltlich gleich einem vorhandenen Icon, wird der Name ein Alias statt eines neuen Icons.
3. Eintrag in `icons/manifest.json` mit deutschem Titel, Kategorie und Status.

**Kontur:** Motiv der Fläche lesen und im 24er-Raster vereinfacht neu zeichnen, nicht abpausen. Vorbilder sind die vorhandenen Konturen (`archive`, `folder`, `truck`, `shield-check` …). Wurzel, Strich und Randzone prüft `pnpm check`.

## Prüfen

- `pnpm pruefen` muss grün sein. Warnungen zur Randzone ernst nehmen.
- Sichtprüfung im Konfigurator: Ansicht „Testblatt“, beide Stile. Neue Icons müssen bei 16–24 px lesbar sein und gleich schwer wirken wie ihre Nachbarn.
- Änderungen am Konfigurator im Browser prüfen (`pnpm dev`), nicht nur Typen.

## Aufbau des Codes

- `scripts/lib/svg.ts` – Raster, Wurzelattribute und Prüfregeln je Stil
- `scripts/lib/manifest.ts` – Manifest-Typen und -Prüfung (Status je Stil)
- `scripts/lib/pipeline.ts` – Ablauf von Prüfung und Build
- `scripts/lib/ausgabe.ts` – Paket, Iconify-Set (Name ohne Endung = Fläche, `-solid`, `-outline`), Dashboard-Daten
- `scripts/lib/flaeche.ts` – Umwandlung in eine Fläche für Druck und Randprüfung
- `packages/icons/vorlagen/` – handgeschriebene React-Vorlage, wird in den Build kopiert
- `apps/dashboard/` – Konfigurator (React, Vite)
- `tests/` – Vitest
