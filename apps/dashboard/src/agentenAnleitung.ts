import { DATEN } from './daten';
import { EXPORTFARBEN } from './design/farben';

export const REPO_URL = 'https://github.com/DERO129media/ceha-icon-pack';
/** Öffentlich lesbares Manifest mit allen Namen, Titeln, Aliasen und Suchbegriffen */
export const MANIFEST_URL = 'https://raw.githubusercontent.com/DERO129media/ceha-icon-pack/main/icons/manifest.json';

/**
 * Kurzer Text zum Einfügen in eine neue KI-Session (Claude Code, Cursor …), damit dort
 * ausschließlich Ceha-Icons verwendet werden. Die Namensliste steht nicht im Text,
 * sondern im Manifest bzw. in meta.json des Pakets.
 */
export function agentenAnleitung(konfigurator: string): string {
  const farben = EXPORTFARBEN.map((f) => `${f.name} ${f.hex}`).join(', ');
  const v = DATEN.version;

  return `Verwende für alle Icons ausschließlich das Ceha-Icon-Pack (${DATEN.icons.length} Icons, Version ${v}) – keine anderen Icon-Sets, keine selbst gezeichneten Icons.
Repo und Regeln: ${REPO_URL} · Konfigurator: ${konfigurator}

INSTALLIEREN (GitHub Packages, braucht Token mit read:packages)
- Projekt-.npmrc: @dero129media:registry=https://npm.pkg.github.com
- ~/.npmrc (nicht ins Projekt): //npm.pkg.github.com/:_authToken=\${NODE_AUTH_TOKEN}
  NODE_AUTH_TOKEN z. B. per \`export NODE_AUTH_TOKEN=$(gh auth token)\`. Fehlt der Zugang: Menschen fragen.
- \`pnpm add @ceha/icons@npm:@dero129media/ceha-icons@^${v}\`
  Astro zusätzlich: \`pnpm add @iconify-json/ceha@npm:@dero129media/ceha-icons@^${v}\`

VERWENDEN
- Astro: <Icon name="ceha:<name>" /> · React: import { Wrench } from '@ceha/icons/react'
- SVG: @ceha/icons/svg/solid/<name>.svg bzw. svg/outline/<name>.svg
- Namen, Titel, Aliase und Suchbegriffe: ${MANIFEST_URL}
  (nach Installation auch @ceha/icons/meta.json). Nur diese Namen verwenden; fehlt ein Motiv, das melden statt improvisieren.

REGELN
- Standard ist die Fläche. Unter 24 px (Buttons, Listen, Formulare) die Kontur: ceha:<name>-outline bzw. variant="outline". Stile in einer Komponente nicht mischen.
- Produkt-Icons (Spinde, Schränke, Möbel) als Fläche erst ab 32 px.
- Farbe nur über CSS color, nur Ceha-Farben: ${farben}.
- Icons nie verändern, umfärben oder nachzeichnen.
`;
}
