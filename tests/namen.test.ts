import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ergaenzeSperrliste, fehlendeNamen } from '../scripts/lib/namen.ts';
import { pruefeManifest, type IconEintrag, type Manifest } from '../scripts/lib/manifest.ts';

const eintrag = (aliases: string[] = []): IconEintrag => ({ titel: 'T', kategorien: ['inhalte'], aliases, status: {}, verwendungen: 0, tags: [] });

describe('Namen verschwinden nie', () => {
  it('meldet veröffentlichte Namen, die im Manifest fehlen', () => {
    const manifest: Manifest = { wrench: eintrag() };
    expect(fehlendeNamen(['wrench', 'tool'], manifest)).toEqual(['tool']);
  });

  it('akzeptiert einen Namen, der als Alias weiterlebt', () => {
    const manifest: Manifest = { 'square-check-big': eintrag(['check-square']) };
    expect(fehlendeNamen(['check-square'], manifest)).toEqual([]);
  });

  it('ergänzt die Sperrliste nur, entfernt nie', () => {
    const datei = join(mkdtempSync(join(tmpdir(), 'ceha-')), 'names.lock.json');
    ergaenzeSperrliste(datei, { a: eintrag(), b: eintrag() });
    ergaenzeSperrliste(datei, { a: eintrag(), c: eintrag() });
    expect(JSON.parse(readFileSync(datei, 'utf8'))).toEqual(['a', 'b', 'c']);
  });
});

describe('pruefeManifest', () => {
  it('meldet doppelt vergebene Namen und Aliase', () => {
    expect(pruefeManifest({ key: eintrag(['schluessel']), lock: eintrag(['schluessel']) }).join()).toMatch(/doppelt/);
  });

  it('verlangt den Status je Stil und nur bekannte Werte', () => {
    expect(pruefeManifest({ a: { ...eintrag(), status: 'fertig' as never } }).join()).toMatch(/je Stil/);
    expect(pruefeManifest({ a: { ...eintrag(), status: { solid: 'fertig', outline: 'vorlage' as never } } }).join()).toMatch(/"vorlage" unbekannt/);
    expect(pruefeManifest({ a: { ...eintrag(), status: { solid: 'fertig', outline: 'entwurf' } } })).toEqual([]);
  });
});
