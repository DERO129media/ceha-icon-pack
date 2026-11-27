# @ceha/icons

Icons der Ceha Deutschland GmbH. Raster 24 × 24, Strich 1,25, hartkantig. Kontur und – nach und nach – Fläche.

```tsx
import { Wrench } from '@ceha/icons/react';
<Wrench size={24} variant="outline" />
```

Astro: als `"@iconify-json/ceha": "npm:@ceha/icons@^0.1.0"` installieren, dann `<Icon name="ceha:wrench" />`
bzw. `ceha:wrench-solid`.

Weitere Ausgaben: `svg/outline/*.svg`, `svg/solid/*.svg`, `sprite.svg`, `meta.json` (Titel, Aliase, Status).
