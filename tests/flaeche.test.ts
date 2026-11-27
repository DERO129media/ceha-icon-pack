import { describe, expect, it } from 'vitest';
import { nurKubisch, zuFlaeche } from '../scripts/lib/flaeche.ts';
import { wurzelFuer } from '../scripts/lib/svg.ts';

describe('zuFlaeche', () => {
  it('Ceha-Profil: runde Enden ragen um den halben Strich über das Linienende, Strich 1,35 breit', async () => {
    const f = await zuFlaeche([['line', { x1: '4', y1: '12', x2: '20', y2: '12' }]], wurzelFuer('outline', 'ceha'));
    expect(f.rahmen.links).toBeCloseTo(3.325, 2);
    expect(f.rahmen.rechts).toBeCloseTo(20.675, 2);
    expect(f.rahmen.oben).toBeCloseTo(11.325, 2);
    expect(f.rahmen.unten).toBeCloseTo(12.675, 2);
  });

  it('gerade Enden am Element enden genau am Linienende', async () => {
    const f = await zuFlaeche([['line', { x1: '4', y1: '12', x2: '20', y2: '12', 'stroke-linecap': 'butt' }]], wurzelFuer('outline', 'ceha'));
    expect(f.rahmen.links).toBeCloseTo(4, 2);
    expect(f.rahmen.rechts).toBeCloseTo(20, 2);
  });

  it('spitze Ecken (miter) am Element bleiben spitz (Gehrung)', async () => {
    const f = await zuFlaeche([['path', { d: 'M4 20L12 4L20 20', 'stroke-linejoin': 'miter' }]], wurzelFuer('outline', 'ceha'));
    expect(f.rahmen.oben).toBeLessThan(4 - 0.675);
  });

  it('liefert nur Befehle, die PDF und EPS kennen', async () => {
    const f = await zuFlaeche([['circle', { cx: '12', cy: '12', r: '10' }], ['path', { d: 'M12 6v6l4 2' }]], wurzelFuer('outline', 'ceha'));
    expect(f.d).toMatch(/^M/);
    expect(f.d.replace(/[\d.\s-]/g, '')).toMatch(/^[MLCZ]+$/);
  });
});

describe('nurKubisch', () => {
  it('wandelt Bögen, relative und H/V-Befehle um', () => {
    const d = nurKubisch('M2 2h4v4a2 2 0 0 1-2 2z');
    expect(d.replace(/[\d.\s-]/g, '')).toMatch(/^[MLCZ]+$/);
    expect(d.startsWith('M2 2L6 2L6 6C')).toBe(true);
  });
});
