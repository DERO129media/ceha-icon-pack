import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { Manifest } from './manifest.ts';

/**
 * Invariante: Ein einmal veröffentlichter Name (oder Alias) verschwindet nie.
 * Websites und Repos verlassen sich darauf; ein fehlender Name bricht deren Build.
 * Die Sperrdatei wächst nur. Wer einen Namen wirklich streichen will, muss ihn
 * bewusst von Hand aus names.lock.json entfernen.
 */
export function alleNamen(manifest: Manifest): string[] {
  return Object.entries(manifest)
    .flatMap(([name, e]) => [name, ...(e.aliases ?? [])])
    .sort();
}

export function ladeSperrliste(pfad: string): string[] {
  if (!existsSync(pfad)) return [];
  return JSON.parse(readFileSync(pfad, 'utf8')) as string[];
}

export function fehlendeNamen(sperrliste: string[], manifest: Manifest): string[] {
  const vorhanden = new Set(alleNamen(manifest));
  return sperrliste.filter((n) => !vorhanden.has(n));
}

/** Ergänzt neue Namen; entfernt nie etwas. Gibt die neu aufgenommenen Namen zurück. */
export function ergaenzeSperrliste(pfad: string, manifest: Manifest): string[] {
  const alt = ladeSperrliste(pfad);
  const neu = alleNamen(manifest).filter((n) => !alt.includes(n));
  if (neu.length > 0) {
    writeFileSync(pfad, JSON.stringify([...alt, ...neu].sort(), null, 2) + '\n');
  }
  return neu;
}
