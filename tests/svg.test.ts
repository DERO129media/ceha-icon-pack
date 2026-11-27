import { describe, expect, it } from 'vitest';
import { alsPfad, pruefeSvg, svgDatei, wurzelFuer } from '../scripts/lib/svg.ts';

const kontur = (inhalt: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${inhalt}</svg>`;

const flaeche = (inhalt: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor">${inhalt}</svg>`;

describe('pruefeSvg', () => {
  it('akzeptiert ein regelkonformes Kontur-Icon', () => {
    const { fehler, knoten } = pruefeSvg(kontur('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'), 'outline', 'ceha');
    expect(fehler).toEqual([]);
    expect(knoten).toHaveLength(2);
  });

  it('lehnt feste Farben, andere Strichstärken und unbekannte Enden ab', () => {
    const { fehler } = pruefeSvg(kontur('<path d="M2 2h20" stroke="#0b477e" stroke-width="2" stroke-linecap="kantig"/>'), 'outline', 'ceha');
    expect(fehler.join('\n')).toMatch(/feste Farbe/);
    expect(fehler.join('\n')).toMatch(/stroke-width muss 1.35/);
    expect(fehler.join('\n')).toMatch(/stroke-linecap="kantig" unbekannt/);
  });

  it('verlangt die passende Wurzel für Ceha und Vorlage (Strich 1,35, rund)', () => {
    const falsch = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="butt" stroke-linejoin="miter"><path d="M2 2h20"/></svg>';
    expect(pruefeSvg(falsch, 'outline', 'ceha').fehler.join()).toMatch(/stroke-linecap="round"/);
    expect(wurzelFuer('outline', 'ceha')).toMatchObject({ 'stroke-width': '1.35', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    expect(wurzelFuer('outline', 'vorlage')).toMatchObject({ 'stroke-width': '1.35', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  });

  it('lehnt typischen Illustrator-Export ab: falsches Raster, style, transform, text', () => {
    const svg = '<svg viewBox="0 0 48 48" style="x" id="Ebene_1"><g transform="translate(1)"><text>A</text></g></svg>';
    const { fehler } = pruefeSvg(svg, 'outline', 'ceha');
    const text = fehler.join('\n');
    expect(text).toMatch(/viewBox muss "0 0 24 24"/);
    expect(text).toMatch(/"style" ist nicht erlaubt/);
    expect(text).toMatch(/"transform" ist nicht erlaubt/);
    expect(text).toMatch(/<text> ist nicht erlaubt/);
  });

  it('akzeptiert eine regelkonforme Fläche im 64er-Raster mit Aussparung', () => {
    const { fehler, knoten } = pruefeSvg(flaeche('<path fill-rule="evenodd" d="M8 8H56V56H8Z M20 20H44V44H20Z"/><rect x="4" y="58" width="56" height="2" rx="1"/>'), 'solid', 'ceha');
    expect(fehler).toEqual([]);
    expect(knoten).toHaveLength(2);
  });

  it('lehnt in der Fläche Striche, feste Farben und das 24er-Raster ab', () => {
    const fehler = pruefeSvg(flaeche('<path d="M8 8H56" stroke="currentColor" stroke-width="2"/><path d="M1 1H2" fill="#0b477e" clip-rule="evenodd"/>'), 'solid', 'ceha').fehler.join('\n');
    expect(fehler).toMatch(/keine Striche/);
    expect(fehler).toMatch(/stroke-width gibt es in der Fläche nicht/);
    expect(fehler).toMatch(/feste Farbe/);
    expect(fehler).toMatch(/"clip-rule" ist nicht erlaubt/);
    expect(pruefeSvg(kontur('<path d="M2 2h20"/>').replace('fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"', 'fill="currentColor"'), 'solid', 'ceha').fehler.join()).toMatch(/viewBox muss "0 0 64 64"/);
  });

  it('schreibt eine Fläche, die die eigene Prüfung wieder besteht', () => {
    const { knoten } = pruefeSvg(flaeche('<rect x="8" y="8" width="48" height="48" rx="2"/>'), 'solid', 'ceha');
    expect(pruefeSvg(svgDatei(knoten, wurzelFuer('solid', 'ceha'), { raster: 64 }), 'solid', 'ceha').fehler).toEqual([]);
  });

  it('verlangt bei der Fläche fill="currentColor" an der Wurzel', () => {
    const { fehler } = pruefeSvg(kontur('<path d="M2 2h20"/>'), 'solid', 'ceha');
    expect(fehler.join('\n')).toMatch(/fill="currentColor"/);
  });

  it('löst Gruppen auf und vererbt deren Darstellung', () => {
    const { fehler, knoten } = pruefeSvg(kontur('<g fill="currentColor"><circle cx="12" cy="12" r="1"/></g>'), 'outline', 'ceha');
    expect(fehler).toEqual([]);
    expect(knoten[0]).toEqual(['circle', { fill: 'currentColor', cx: '12', cy: '12', r: '1' }]);
  });

  it('schreibt eine Datei, die die eigene Prüfung wieder besteht', () => {
    const { knoten } = pruefeSvg(kontur('<rect x="3" y="3" width="18" height="18" rx="2"/>'), 'outline', 'ceha');
    expect(pruefeSvg(svgDatei(knoten, wurzelFuer('outline', 'ceha'), { lesbar: true }), 'outline', 'ceha').fehler).toEqual([]);
  });
});

describe('alsPfad', () => {
  it('wandelt Grundformen in Pfade um', () => {
    expect(alsPfad(['line', { x1: '2', y1: '3', x2: '4', y2: '5' }])).toBe('M2 3L4 5');
    expect(alsPfad(['polygon', { points: '1,2 3,4 5,6' }])).toBe('M1 2L3 4L5 6Z');
    expect(alsPfad(['rect', { x: '1', y: '1', width: '4', height: '4' }])).toBe('M1 1H5V5H1Z');
  });
});
