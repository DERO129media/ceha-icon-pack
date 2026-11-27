import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createIcon } from '../packages/icons/vorlagen/create-icon.js';
import { komponentenName } from '../scripts/lib/react.ts';

const kontur = { fill: 'none', stroke: 'currentColor', 'stroke-width': '1.35', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
const flaeche = { fill: 'currentColor' };
const Uhr = createIcon('clock', { wurzel: kontur, knoten: [['circle', { cx: '12', cy: '12', r: '10' }]], raster: 24 }, { wurzel: flaeche, knoten: [['circle', { cx: '32', cy: '32', r: '26', 'fill-rule': 'evenodd' }]], raster: 64 });
const NurKontur = createIcon('lock', { wurzel: kontur, knoten: [['path', { d: 'M1 1h2' }]], raster: 24 }, null);
const NurFlaeche = createIcon('doppelspind', null, { wurzel: flaeche, knoten: [['path', { d: 'M8 8H56V56H8Z' }]], raster: 64 });

describe('React-Komponenten', () => {
  it('zeigen ohne variant die Fläche (Hauptstil) im 64er-Raster, ohne Strichangaben', () => {
    const html = renderToStaticMarkup(createElement(Uhr, { size: 32 }));
    expect(html).toContain('width="32"');
    expect(html).toContain('viewBox="0 0 64 64"');
    expect(html).toContain('fill="currentColor"');
    expect(html).not.toContain('stroke');
  });

  it('rendern die Kontur wie lucide-react: Größe, Strich, Enden, currentColor, aria-hidden', () => {
    const html = renderToStaticMarkup(createElement(Uhr, { size: 32, variant: 'outline' }));
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toContain('width="32"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('stroke-width="1.35"');
    expect(html).toContain('stroke-linecap="round"');
    expect(html).toContain('stroke-linejoin="round"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('class="ceha-icon ceha-icon-clock"');
  });

  it('zeigen die Fläche mit variant="solid" und wandeln Attributnamen um', () => {
    const html = renderToStaticMarkup(createElement(Uhr, { variant: 'solid', color: '#0b477e' }));
    expect(html).toContain('fill="currentColor"');
    expect(html).toContain('color="#0b477e"');
    expect(html).toContain('fill-rule="evenodd"');
  });

  it('fallen auf den vorhandenen Stil zurück', () => {
    expect(renderToStaticMarkup(createElement(NurKontur))).toContain('fill="none"');
    expect(renderToStaticMarkup(createElement(NurFlaeche, { variant: 'outline' }))).toContain('viewBox="0 0 64 64"');
  });

  it('heißen wie in lucide-react', () => {
    expect(komponentenName('building-2')).toBe('Building2');
    expect(komponentenName('shield-check')).toBe('ShieldCheck');
  });
});
