import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const STATUS = ['entwurf', 'fertig'] as const;
export type Status = (typeof STATUS)[number];

export const KATEGORIEN = ['inhalte', 'produkte', 'unternehmen'] as const;
export type Kategorie = (typeof KATEGORIEN)[number];

export const STILE = ['outline', 'solid'] as const;
export type Stil = (typeof STILE)[number];

export interface IconEintrag {
  /** Deutscher Anzeigename im Dashboard */
  titel: string;
  kategorien: Kategorie[];
  /** Weitere Namen, unter denen das Icon erreichbar ist (z. B. frühere Namen) */
  aliases: string[];
  /**
   * Status je Stil: entwurf = Zeichnung in Arbeit, fertig = freigegeben.
   * Fehlt die Angabe für einen gezeichneten Stil, gilt er als Entwurf.
   */
  status: Partial<Record<Stil, Status>>;
  /** Verwendungen auf ceha-stahlmoebel.de, dient als Priorität */
  verwendungen: number;
  tags: string[];
}

export type Manifest = Record<string, IconEintrag>;

export const NAME_MUSTER = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function ladeManifest(iconsDir: string): Manifest {
  return JSON.parse(readFileSync(join(iconsDir, 'manifest.json'), 'utf8')) as Manifest;
}

/** Namen der SVG-Dateien eines Stils, ohne Endung */
/** Status eines Stils; ohne Angabe gilt ein Stil als Entwurf */
export function statusVon(e: Pick<IconEintrag, 'status'>, stil: Stil): Status {
  return e.status[stil] ?? 'entwurf';
}

export function dateienImStil(iconsDir: string, stil: Stil): string[] {
  const dir = join(iconsDir, stil);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.slice(0, -4))
    .sort();
}

/** Prüft das Manifest in sich: Felder, Werte, Kollisionen zwischen Namen und Aliasen */
export function pruefeManifest(manifest: Manifest): string[] {
  const fehler: string[] = [];
  const vergeben = new Map<string, string>();
  for (const [name, e] of Object.entries(manifest)) {
    if (!NAME_MUSTER.test(name)) fehler.push(`${name}: Name muss kebab-case sein (a-z, 0-9, Bindestrich).`);
    if (!e.titel) fehler.push(`${name}: Feld "titel" fehlt.`);
    if (typeof e.status !== 'object' || e.status === null || Array.isArray(e.status)) {
      fehler.push(`${name}: "status" muss je Stil angegeben werden, z. B. {"solid": "fertig", "outline": "entwurf"}.`);
    } else {
      for (const [stil, s] of Object.entries(e.status)) {
        if (!STILE.includes(stil as Stil)) fehler.push(`${name}: status für unbekannten Stil "${stil}", erlaubt: ${STILE.join(', ')}.`);
        if (!STATUS.includes(s as Status)) fehler.push(`${name}: status "${s}" unbekannt, erlaubt: ${STATUS.join(', ')}.`);
      }
    }
    if (!Array.isArray(e.kategorien) || e.kategorien.length === 0) fehler.push(`${name}: mindestens eine Kategorie angeben.`);
    for (const k of e.kategorien ?? []) {
      if (!KATEGORIEN.includes(k)) fehler.push(`${name}: Kategorie "${k}" unbekannt, erlaubt: ${KATEGORIEN.join(', ')}.`);
    }
    for (const n of [name, ...(e.aliases ?? [])]) {
      if (!NAME_MUSTER.test(n)) fehler.push(`${name}: Alias "${n}" muss kebab-case sein.`);
      const schon = vergeben.get(n);
      if (schon) fehler.push(`"${n}" ist doppelt vergeben (${schon} und ${name}).`);
      vergeben.set(n, name);
    }
  }
  return fehler;
}
