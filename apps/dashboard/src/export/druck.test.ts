import { describe, expect, it } from 'vitest';
import { epsText, pdfText, PT_PRO_MM, zerlege } from './druck';
import { farbeNach } from '../design/farben';

const quadrat = { d: 'M2 2L22 2L22 22L2 22Z', fillRule: 'nonzero' as const, raster: 24 };

describe('PDF', () => {
  it('hat eine gültige Querverweistabelle (Byte-Versätze stimmen)', () => {
    const pdf = pdfText(quadrat, farbeNach('brand'), 'Test (Klammer)');
    const xref = Number(pdf.match(/startxref\n(\d+)/)![1]);
    expect(pdf.slice(xref, xref + 4)).toBe('xref');
    const versaetze = [...pdf.matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
    versaetze.forEach((v, i) => expect(pdf.slice(v).startsWith(`${i + 1} 0 obj`)).toBe(true));
  });

  it('dreht die y-Achse: Rasterpunkt (2|2) liegt oben links', () => {
    const pdf = pdfText(quadrat, farbeNach('brand'), 't');
    const kante = 24 * PT_PRO_MM;
    const [x, y] = pdf.match(/([\d.]+) ([\d.]+) m/)!.slice(1).map(Number);
    expect(x).toBeCloseTo(2 * PT_PRO_MM, 3);
    expect(y).toBeCloseTo(kante - 2 * PT_PRO_MM, 3);
  });

  it('druckt die Fläche aus dem 64er-Raster ebenfalls 24 × 24 mm groß', () => {
    const pdf = pdfText({ d: 'M0 0L64 0L64 64L0 64Z', fillRule: 'nonzero', raster: 64 }, farbeNach('brand'), 't');
    const kante = Math.round(24 * PT_PRO_MM * 10000) / 10000;
    expect(pdf).toContain(`/MediaBox [0 0 ${kante} ${kante}]`);
    const [x] = pdf.match(/([\d.]+) ([\d.]+) l/)!.slice(1).map(Number);
    expect(x).toBeCloseTo(kante, 3);
  });

  it('nutzt CMYK, wenn die Farbe Druckwerte hat, sonst RGB', () => {
    expect(pdfText(quadrat, farbeNach('schwarz'), 't')).toContain('0 0 0 1 k');
    expect(pdfText(quadrat, farbeNach('brand'), 't')).toMatch(/[\d.]+ [\d.]+ [\d.]+ rg/);
  });
});

describe('EPS', () => {
  it('hat Kopf, BoundingBox in Punkt und füllt mit der richtigen Regel', () => {
    const eps = epsText({ ...quadrat, fillRule: 'evenodd' }, farbeNach('schwarz'), 't');
    expect(eps.startsWith('%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 69 69')).toBe(true);
    expect(eps).toContain('setcmykcolor');
    expect(eps).toContain('\neofill\n');
  });
});

describe('zerlege', () => {
  it('liest Zahlen auch ohne Leerzeichen vor Minus', () => {
    expect(zerlege('M1-2L3.5-4Z')).toEqual([['M', [1, -2]], ['L', [3.5, -4]], ['Z', []]]);
  });
});
