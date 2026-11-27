# Ceha Icons (`@dero129media/ceha-icons`)

Icon-Pack der Ceha Deutschland GmbH. Jedes Icon gibt es als **Fläche** (64er-Raster, Standard)
und als **Kontur** (24er-Raster, Strich 1,35) für kleine UI-Größen. Farbe über `currentColor`.

## Installieren

Das Paket liegt in GitHub Packages, das auch für öffentliche Pakete einen Token verlangt.

Im Projekt eine `.npmrc` (ohne Token, wird eingecheckt):

```ini
@dero129media:registry=https://npm.pkg.github.com
```

Einmalig pro Rechner in `~/.npmrc` – pnpm liest Token-Variablen nicht aus der Projekt-`.npmrc`:

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Dazu in der Shell einen Token mit Recht `read:packages` setzen, z. B. nach
`gh auth refresh -s read:packages`: `export NODE_AUTH_TOKEN=$(gh auth token)`.
In GitHub Actions setzt `actions/setup-node` (mit `registry-url: https://npm.pkg.github.com`)
die Zugangsdaten; `NODE_AUTH_TOKEN` kommt dort aus einem Secret.

Unter dem kurzen Namen `@ceha/icons` einbinden (npm-Alias):

```sh
pnpm add @ceha/icons@npm:@dero129media/ceha-icons@^0.1.0
```

## Verwenden

```tsx
import { Wrench, Truck } from '@ceha/icons/react';

<Wrench size={32} />                 // Fläche
<Truck size={20} variant="outline" /> // Kontur
```

Astro (astro-icon): zusätzlich `pnpm add @iconify-json/ceha@npm:@dero129media/ceha-icons@^0.1.0`, dann
`<Icon name="ceha:wrench" />` (Fläche) bzw. `ceha:wrench-outline` (Kontur).

Weitere Ausgaben: `svg/solid/*.svg`, `svg/outline/*.svg`, `sprite.svg`, `meta.json` (Titel, Aliase, Status je Stil).

Quelle, Regeln und Konfigurator: https://github.com/DERO129media/ceha-icon-pack
