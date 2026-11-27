import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { STILE, type IconEintrag, type Stil } from './manifest.ts';
import { koerper, svgDatei, wurzelAttribute, type Knoten } from './svg.ts';
import type { Flaeche } from './flaeche.ts';

export interface StilDaten {
  knoten: Knoten[];
  flaeche: Flaeche;
  wurzel: Record<string, string>;
  /** Kantenlänge der viewBox: 64 für die Fläche, 24 für die Kontur */
  raster: number;
}

export interface FertigesIcon {
  name: string;
  eintrag: IconEintrag;
  stile: Partial<Record<Stil, StilDaten>>;
  /** Inhalt des Lucide-Originals zum Vergleich im Dashboard */
  lucide: string | null;
}

/** Endungen für einen bestimmten Stil. Der Name ohne Endung zeigt immer den Hauptstil. */
export const ENDUNGEN: Record<Stil, string> = { solid: '-solid', outline: '-outline' };

/** Fläche ist der Hauptstil. Ist sie noch nicht gezeichnet, steht die Kontur ein. */
export function hauptstil(icon: Pick<FertigesIcon, 'stile'>): Stil {
  return icon.stile.solid ? 'solid' : 'outline';
}

/** Alle Namen, unter denen ein Stil erreichbar ist: [Endung, Stil] – "" für den Hauptstil */
function varianten(icon: FertigesIcon): [string, Stil][] {
  const aus: [string, Stil][] = [['', hauptstil(icon)]];
  for (const stil of STILE) if (icon.stile[stil]) aus.push([ENDUNGEN[stil], stil]);
  return aus;
}

const gruppe = (w: Record<string, string>, inhalt: string) => `<g ${wurzelAttribute(w)}>${inhalt}</g>`;

/** Schreibt die Dateien des npm-Pakets (außer React, siehe react.ts). */
export function schreibePaket(paketDir: string, icons: FertigesIcon[], version: string): void {
  for (const stil of STILE) {
    const dir = join(paketDir, 'svg', stil);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    for (const icon of icons) {
      const s = icon.stile[stil];
      if (s) writeFileSync(join(dir, `${icon.name}.svg`), svgDatei(s.knoten, s.wurzel, { raster: s.raster }));
    }
  }

  // Iconify-Set: astro-icon findet es als "ceha:<name>", wenn das Paket
  // unter dem Alias @iconify-json/ceha installiert ist. Jedes Icon trägt
  // sein eigenes Raster (width/height), angezeigt wird es quadratisch.
  const iconify: {
    prefix: string;
    info: object;
    width: number;
    height: number;
    icons: Record<string, { body: string; width: number; height: number }>;
    aliases: Record<string, { parent: string }>;
  } = {
    prefix: 'ceha',
    info: { name: 'Ceha Icons', total: icons.length, version, author: { name: 'Ceha Deutschland GmbH' }, license: { title: 'Intern, enthält Lucide (ISC)' }, height: 24 },
    width: 24,
    height: 24,
    icons: {},
    aliases: {},
  };
  const sprite: string[] = [];
  for (const icon of icons) {
    for (const [endung, stil] of varianten(icon)) {
      const s = icon.stile[stil]!;
      const body = gruppe(s.wurzel, koerper(s.knoten));
      iconify.icons[icon.name + endung] = { body, width: s.raster, height: s.raster };
      for (const alias of icon.eintrag.aliases) iconify.aliases[alias + endung] = { parent: icon.name + endung };
      sprite.push(`<symbol id="ceha-${icon.name}${endung}" viewBox="0 0 ${s.raster} ${s.raster}">${body}</symbol>`);
    }
  }
  writeFileSync(join(paketDir, 'icons.json'), JSON.stringify(iconify) + '\n');
  writeFileSync(join(paketDir, 'sprite.svg'), `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${sprite.join('')}</svg>\n`);

  const meta = Object.fromEntries(
    icons.map((i) => [i.name, { ...i.eintrag, hauptstil: hauptstil(i), stile: Object.keys(i.stile) }]),
  );
  writeFileSync(join(paketDir, 'meta.json'), JSON.stringify({ version, icons: meta }, null, 2) + '\n');
}

/** Daten für den Konfigurator: alles, was er zum Anzeigen und Exportieren braucht. */
export function schreibeDashboardDaten(datei: string, icons: FertigesIcon[], version: string): void {
  const daten = {
    version,
    erzeugt: new Date().toISOString(),
    icons: icons.map((i) => ({
      name: i.name,
      ...i.eintrag,
      lucide: i.lucide,
      stile: Object.fromEntries(
        Object.entries(i.stile).map(([stil, s]) => [
          stil,
          { koerper: koerper(s.knoten), wurzel: s.wurzel, raster: s.raster, flaeche: { d: s.flaeche.d, fillRule: s.flaeche.fillRule, raster: s.raster } },
        ]),
      ),
    })),
  };
  mkdirSync(join(datei, '..'), { recursive: true });
  writeFileSync(datei, JSON.stringify(daten) + '\n');
}
