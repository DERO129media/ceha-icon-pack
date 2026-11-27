# Ceha Icons

Eigenes Icon-Pack der Ceha Deutschland GmbH für Website, Drucksachen und Software.
Hauptstil ist die **Fläche im 64er-Raster** (Produkte, Eigenschaften, Website-Icons).
Jedes Icon gibt es zusätzlich als **Kontur im 24er-Raster** für kleine Größen und UI.
Hinweise für KI-Agenten und Regeln für Beiträge: [AGENTS.md](AGENTS.md).

- **Konfigurator** (`apps/dashboard`): alle Icons ansehen, Fläche oder Kontur wählen,
  in Brand-Farben, Schwarz oder Weiß als SVG, PNG, PDF, EPS oder ZIP herunterladen.
  Oben rechts kopiert „Anleitung für KI-Agent kopieren“ einen Text für eine neue KI-Session
  in einem anderen Projekt: nur dieses Pack verwenden, Einbindung, Stilregeln, alle Icon-Namen.
- **npm-Paket** `@ceha/icons` (`packages/icons`): SVGs, Iconify-Set für astro-icon,
  React-Komponenten mit der Schnittstelle von lucide-react, SVG-Sprite.

## Befehle

| Befehl | Was passiert |
|---|---|
| `pnpm install` | Abhängigkeiten installieren (Node 24, pnpm) |
| `pnpm dev` | Bauen und Konfigurator starten: http://localhost:5180 – baut bei jeder Änderung in `icons/` neu |
| `pnpm build` | Icons prüfen und Paket, React-Komponenten und Dashboard-Daten erzeugen |
| `pnpm check` | Nur prüfen, nichts schreiben |
| `pnpm pruefen` | Alles prüfen: Icons, Typen, Tests |
| `pnpm dashboard:build` | Konfigurator als statische Seite nach `apps/dashboard/dist` bauen |

## Aufbau

```
icons/
  manifest.json      Name, Titel, Kategorien, Aliase, Status, Verwendungen
  names.lock.json    jeder je veröffentlichte Name – wächst nur
  solid/*.svg        Fläche, 64er-Raster (Hauptstil)
  outline/*.svg      Kontur, 24er-Raster
scripts/             Prüfung und Build
packages/icons/      das npm-Paket (Ausgaben werden erzeugt, nicht einchecken)
apps/dashboard/      der Konfigurator
docs/gestaltung.md   Regeln für eigene Icons
```

## Status

Fläche und Kontur werden getrennt freigegeben (`entwurf` → `fertig`). Die Flächen aus dem
Marketing-Standard sind freigegeben; alle Konturen und nachgezeichnete Flächen stehen auf
Entwurf, bis sie im Konfigurator (Ansicht „Testblatt“) durchgesehen sind. Den Status setzt
immer ein Mensch.

## Ein Icon neu zeichnen

1. Datei `icons/solid/<name>.svg` anlegen oder überschreiben. Regeln: [docs/gestaltung.md](docs/gestaltung.md).
   Aus Illustrator oder der Vorlagen-Ablage: feste Farbe durch `currentColor` ersetzen, `clip-rule` entfernen.
2. Neues Motiv: zuerst in `icons/manifest.json` eintragen.
3. Status im Manifest je Stil setzen, neue Zeichnungen als Entwurf: `"status": {"solid": "entwurf", "outline": "entwurf"}`.
   Kontur in `icons/outline/<name>.svg` nach den Kontur-Regeln zeichnen.
4. Bei laufendem `pnpm dev` zeigt der Konfigurator die Änderung sofort. Verstößt die Datei
   gegen eine Regel, erscheint die Meldung als Overlay im Browser.

## Was nie passieren darf

- **Ein veröffentlichter Name verschwindet.** Websites rufen Icons über den Namen auf
  (`wrench`, `keypad` …). Der Build bricht ab, wenn ein Name aus `icons/names.lock.json`
  im Manifest fehlt. Umbenennen geht nur so: neuer Name, alter Name wird Alias.
- **Ein Icon bricht die Raster-Regeln.** Der Build prüft jede Datei: Fläche im 64er-Raster
  ohne Striche, Kontur im 24er-Raster mit Strich 1,35, nur `currentColor`, keine
  Transformationen, kein Text.

## Einbinden

Das Paket liegt in **GitHub Packages** als `@dero129media/ceha-icons` (der Scope muss
dort dem GitHub-Konto entsprechen; installieren geht dort auch bei öffentlichen Paketen nur mit Token). In Projekten wird es unter dem kurzen Namen `@ceha/icons`
eingebunden.

Im Projekt eine `.npmrc` (ohne Token, wird eingecheckt):

```ini
@dero129media:registry=https://npm.pkg.github.com
```

Einmalig pro Rechner in `~/.npmrc` – pnpm liest Token-Variablen nicht aus der Projekt-`.npmrc`:

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Dazu einen Token mit Recht `read:packages` setzen, z. B. nach `gh auth refresh -s read:packages`:
`export NODE_AUTH_TOKEN=$(gh auth token)`. Nicht `GITHUB_TOKEN` verwenden – solange diese
Variable gesetzt ist, lässt sich gh nicht neu anmelden.

```sh
pnpm add @ceha/icons@npm:@dero129media/ceha-icons@^0.1.0
```

**Astro (astro-icon)** – zusätzlich unter dem Alias `@iconify-json/ceha` installieren,
dann findet astro-icon das Set als `ceha:`:

```sh
pnpm add @iconify-json/ceha@npm:@dero129media/ceha-icons@^0.1.0
```

Der Name ohne Endung zeigt immer die Fläche. Mit Endung gibt es einen bestimmten Stil:

```astro
<Icon name="ceha:wrench" />          <!-- Fläche -->
<Icon name="ceha:wrench-outline" />  <!-- Kontur -->
<Icon name="ceha:wrench-solid" />    <!-- Fläche, ausdrücklich -->
```

**React** – gleiche Props wie lucide-react, zusätzlich `variant` (Standard `solid`):

```tsx
import { Wrench, Truck } from '@ceha/icons/react';

<Wrench size={32} />
<Truck variant="outline" color="#0b477e" />
```

**Ohne Framework** – `@ceha/icons/svg/solid/wrench.svg` oder das Sprite
`@ceha/icons/sprite.svg` (`<use href="sprite.svg#ceha-wrench"/>`).

## Neue Version veröffentlichen

1. Version in `packages/icons/package.json` erhöhen (neue Icons: Minor, Korrekturen: Patch).
2. Committen, dann Tag setzen und pushen: `git tag v0.2.0 && git push origin v0.2.0`.
3. Der Workflow `.github/workflows/paket.yml` baut, prüft und veröffentlicht. Passt der Tag
   nicht zur Version im Paket, bricht er ab.

## Offen

- **Hosting des Konfigurators:** z. B. Cloudflare Pages hinter Cloudflare Access.
- **Druckfarben:** CMYK- oder Pantone-Werte für Brand Blue, Brand Dark und Brand Light fehlen.
  Bis dahin enthalten PDF und EPS dieser Farben RGB. Eintragen in `apps/dashboard/src/design/farben.ts`.
