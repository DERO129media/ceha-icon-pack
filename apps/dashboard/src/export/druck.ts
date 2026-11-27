import type { Flaeche } from '../daten';
import type { Exportfarbe } from '../design/farben';
import { hexZuRgb } from '../design/farben';

/**
 * Jedes Icon ist im Druck 24 × 24 mm groß und frei skalierbar – gleich, in welchem
 * Raster es gezeichnet ist (Kontur 24: 1 Einheit = 1 mm, Fläche 64: 1 Einheit = 0,375 mm).
 */
export const PT_PRO_MM = 72 / 25.4;
export const KANTE_MM = 24;
const KANTE = KANTE_MM * PT_PRO_MM;

type Segment = [cmd: 'M' | 'L' | 'C' | 'Z', zahlen: number[]];

/** Liest die normalisierten Pfaddaten aus dem Build (nur absolute M, L, C, Z). */
export function zerlege(d: string): Segment[] {
  const segmente: Segment[] = [];
  for (const [, cmd, rest] of d.matchAll(/([MLCZ])([^MLCZ]*)/g)) {
    const zahlen = (rest.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
    segmente.push([cmd as Segment[0], zahlen]);
  }
  return segmente;
}

const z = (v: number) => String(Math.round(v * 10000) / 10000);

/** Pfad in Druckkoordinaten: y nach oben, Ursprung unten links, Einheit pt */
function pfadOperatoren({ d, raster }: Flaeche, ops: { M: string; L: string; C: string; Z: string }): string[] {
  const massstab = KANTE / raster;
  const x = (v: number) => z(v * massstab);
  const y = (v: number) => z(KANTE - v * massstab);
  return zerlege(d).map(([cmd, n]) => {
    if (cmd === 'Z') return ops.Z;
    const paare: string[] = [];
    for (let i = 0; i + 1 < n.length; i += 2) paare.push(`${x(n[i])} ${y(n[i + 1])}`);
    return `${paare.join(' ')} ${ops[cmd]}`;
  });
}

function farbeOperator(farbe: Exportfarbe, art: 'pdf' | 'eps'): string {
  if (farbe.cmyk) {
    const [c, m, gelb, k] = farbe.cmyk.map((v) => z(v / 100));
    return art === 'pdf' ? `${c} ${m} ${gelb} ${k} k` : `${c} ${m} ${gelb} ${k} setcmykcolor`;
  }
  const [r, g, b] = hexZuRgb(farbe.hex).map(z);
  return art === 'pdf' ? `${r} ${g} ${b} rg` : `${r} ${g} ${b} setrgbcolor`;
}

export function epsText(flaeche: Flaeche, farbe: Exportfarbe, titel: string): string {
  const k = z(KANTE);
  const kGanz = Math.ceil(KANTE);
  return [
    '%!PS-Adobe-3.0 EPSF-3.0',
    `%%BoundingBox: 0 0 ${kGanz} ${kGanz}`,
    `%%HiResBoundingBox: 0 0 ${k} ${k}`,
    `%%Title: ${titel}`,
    '%%Creator: Ceha Icon-Pack',
    '%%LanguageLevel: 2',
    '%%EndComments',
    'gsave',
    farbeOperator(farbe, 'eps'),
    'newpath',
    ...pfadOperatoren(flaeche, { M: 'moveto', L: 'lineto', C: 'curveto', Z: 'closepath' }),
    flaeche.fillRule === 'evenodd' ? 'eofill' : 'fill',
    'grestore',
    '%%EOF',
    '',
  ].join('\n');
}

export function pdfText(flaeche: Flaeche, farbe: Exportfarbe, titel: string): string {
  const k = z(KANTE);
  const inhalt = [
    farbeOperator(farbe, 'pdf'),
    ...pfadOperatoren(flaeche, { M: 'm', L: 'l', C: 'c', Z: 'h' }),
    flaeche.fillRule === 'evenodd' ? 'f*' : 'f',
  ].join('\n');
  const titelPdf = titel.replace(/[\\()]/g, (c) => `\\${c}`);
  const objekte = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${k} ${k}] /TrimBox [0 0 ${k} ${k}] /Contents 4 0 R /Resources << >> >>`,
    `<< /Length ${inhalt.length} >>\nstream\n${inhalt}\nendstream`,
    `<< /Title (${titelPdf}) /Producer (Ceha Icon-Pack) >>`,
  ];
  let text = '%PDF-1.4\n';
  const versatz: number[] = [];
  objekte.forEach((o, i) => {
    versatz.push(text.length);
    text += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = text.length;
  text += `xref\n0 ${objekte.length + 1}\n0000000000 65535 f \n`;
  text += versatz.map((v) => `${String(v).padStart(10, '0')} 00000 n \n`).join('');
  text += `trailer\n<< /Size ${objekte.length + 1} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return text;
}
