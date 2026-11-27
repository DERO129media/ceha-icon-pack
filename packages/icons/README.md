# Ceha Icons (`@dero129media/ceha-icons`)

Icon-Pack der Ceha Deutschland GmbH. Jedes Icon gibt es als **Fläche** (64er-Raster, Standard)
und als **Kontur** (24er-Raster, Strich 1,35) für kleine UI-Größen. Farbe über `currentColor`.

## Installieren

Das Paket liegt in GitHub Packages, das auch für öffentliche Pakete einen Token verlangt.
Im Projekt eine `.npmrc` anlegen; der Token (Recht `read:packages`) kommt aus der Umgebung,
nie in die Datei:

```ini
@dero129media:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

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
