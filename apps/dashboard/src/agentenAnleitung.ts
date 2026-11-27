import { DATEN, KATEGORIE_NAMEN, type Kategorie } from './daten';
import { EXPORTFARBEN } from './design/farben';

export const REPO_URL = 'https://github.com/DERO129media/ceha-icon-pack';

/**
 * Text zum Einfügen in eine neue KI-Session (Claude Code, Cursor …), damit dort
 * ausschließlich Ceha-Icons verwendet werden – mit Einbindung, Stilregeln und
 * der vollständigen Namensliste aus den aktuellen Build-Daten.
 */
export function agentenAnleitung(konfigurator: string): string {
  const farben = EXPORTFARBEN.map((f) => `${f.name} ${f.hex}`).join(', ');
  const gruppen = (Object.keys(KATEGORIE_NAMEN) as Kategorie[]).map((k) => {
    const zeilen = DATEN.icons
      .filter((i) => i.kategorien[0] === k)
      .map((i) => `- ${i.name} – ${i.titel}${i.aliases.length ? ` (auch: ${i.aliases.join(', ')})` : ''}`);
    return `${KATEGORIE_NAMEN[k]}:\n${zeilen.join('\n')}`;
  });

  return `Verwende in diesem Projekt für alle Icons ausschließlich das Ceha-Icon-Pack (Ceha Deutschland GmbH, Version ${DATEN.version}).
Keine Lucide-, Heroicons-, Font-Awesome- oder anderen Icon-Sets und keine selbst gezeichneten Icons.

Quelle und Regeln: ${REPO_URL} (privat; AGENTS.md, docs/gestaltung.md)
Konfigurator zum Ansehen und Herunterladen: ${konfigurator}

EINBINDEN
Paket @ceha/icons. Es ist noch nicht in einer Registry veröffentlicht. Bis dahin: Repo klonen, dort
\`pnpm install && pnpm build\`, dann in packages/icons \`pnpm pack\` und den Tarball als Abhängigkeit
einbinden (z. B. "file:./vendor/ceha-icons-${DATEN.version}.tgz"). Für einzelne Icons ohne Paket:
SVG im Konfigurator herunterladen.
- Astro (astro-icon): Paket unter dem Namen "@iconify-json/ceha" einbinden, dann <Icon name="ceha:<name>" />
- React: import { Wrench } from '@ceha/icons/react'; <Wrench size={32} />
  Props wie lucide-react (size, color, className, title), zusätzlich variant="solid" | "outline".
- Ohne Framework: @ceha/icons/svg/solid/<name>.svg, @ceha/icons/svg/outline/<name>.svg
  oder Sprite @ceha/icons/sprite.svg mit <use href="sprite.svg#ceha-<name>"/>.

STILREGELN
- Standard ist die Fläche: ceha:<name> bzw. React ohne variant.
- Für kleine UI-Größen (unter 24 px, Buttons, Listen, Formularfelder) die Kontur:
  ceha:<name>-outline bzw. variant="outline". Innerhalb einer Komponente Stile nicht mischen.
- Produkt-Icons (Spinde, Schränke, Möbel) als Fläche erst ab 32 px einsetzen.
- Farbe nur über CSS color (die Icons nutzen currentColor). Nur Ceha-Farben: ${farben}.
- Icons nie verändern, umfärben oder nachzeichnen.
- Nur Namen aus der Liste unten verwenden (Aliase funktionieren ebenfalls). Passt kein Icon,
  nicht improvisieren, sondern im Ergebnis nennen, welches Motiv fehlt.

VERFÜGBARE ICONS (Name – Titel)
${gruppen.join('\n\n')}
`;
}
