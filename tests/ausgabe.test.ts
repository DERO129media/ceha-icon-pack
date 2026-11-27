import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { schreibePaket, type FertigesIcon } from '../scripts/lib/ausgabe.ts';
import type { IconEintrag } from '../scripts/lib/manifest.ts';

const eintrag = (aliases: string[] = []): IconEintrag => ({ titel: 'T', kategorien: ['inhalte'], aliases, vorlage: null, status: 'entwurf', verwendungen: 0, tags: [] });
const flaeche = { d: 'M0 0Z', fillRule: 'nonzero' as const, rahmen: { links: 0, oben: 0, rechts: 0, unten: 0 } };
const solid = { knoten: [['path', { d: 'M8 8H56V56H8Z' }]] as [string, Record<string, string>][], flaeche, wurzel: { fill: 'currentColor' }, raster: 64 };
const outline = { knoten: [['path', { d: 'M2 2H22' }]] as [string, Record<string, string>][], flaeche, wurzel: { fill: 'none', stroke: 'currentColor' }, raster: 24 };

describe('Iconify-Set', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ceha-'));
  const icons: FertigesIcon[] = [
    { name: 'archive', eintrag: eintrag(['doppelspind']), stile: { solid, outline }, lucide: null },
    { name: 'map-pin', eintrag: eintrag(), stile: { outline }, lucide: null },
  ];
  schreibePaket(dir, icons, '0.0.0');
  const set = JSON.parse(readFileSync(join(dir, 'icons.json'), 'utf8')) as { icons: Record<string, { body: string; width: number }>; aliases: Record<string, { parent: string }> };

  it('zeigt unter dem Namen ohne Endung die Fläche im 64er-Raster', () => {
    expect(set.icons.archive.width).toBe(64);
    expect(set.icons.archive.body).toContain('fill="currentColor"');
    expect(set.icons['archive-solid'].width).toBe(64);
    expect(set.icons['archive-outline'].width).toBe(24);
  });

  it('nimmt die Kontur, solange die Fläche fehlt', () => {
    expect(set.icons['map-pin'].width).toBe(24);
    expect(set.icons['map-pin-solid']).toBeUndefined();
  });

  it('führt Aliase für alle Varianten', () => {
    expect(set.aliases.doppelspind).toEqual({ parent: 'archive' });
    expect(set.aliases['doppelspind-outline']).toEqual({ parent: 'archive-outline' });
  });
});
