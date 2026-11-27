import { zipSync, strToU8 } from 'fflate';
import type { Icon, Stil } from '../daten';
import { STIL_NAMEN, wirksamerStil } from '../daten';
import type { Exportfarbe } from '../design/farben';
import { svgText } from './svg';
import { epsText, pdfText } from './druck';
import { pngBlob } from './png';

export type Format = 'svg' | 'svg-pfade' | 'png' | 'pdf' | 'eps';

export const FORMATE: { id: Format; name: string; hinweis: string }[] = [
  { id: 'svg', name: 'SVG', hinweis: 'Web und Code, Aufbau bleibt bearbeitbar' },
  { id: 'svg-pfade', name: 'SVG für Druck', hinweis: 'Alles in eine Fläche vereinigt' },
  { id: 'png', name: 'PNG', hinweis: 'Transparenter Hintergrund' },
  { id: 'pdf', name: 'PDF', hinweis: '24 × 24 mm, Vektor' },
  { id: 'eps', name: 'EPS', hinweis: '24 × 24 mm, Vektor' },
];

const ENDUNG: Record<Format, string> = { svg: 'svg', 'svg-pfade': 'svg', png: 'png', pdf: 'pdf', eps: 'eps' };

export function dateiname(icon: Icon, stil: Stil, farbe: Exportfarbe, format: Format, pngGroesse?: number): string {
  const s = STIL_NAMEN[wirksamerStil(icon, stil)].toLowerCase().replace('ä', 'ae');
  const zusatz = format === 'svg-pfade' ? '-druck' : format === 'png' ? `-${pngGroesse}px` : '';
  return `ceha-${icon.name}-${s}-${farbe.id}${zusatz}.${ENDUNG[format]}`;
}

export async function dateiInhalt(icon: Icon, stil: Stil, farbe: Exportfarbe, format: Format, pngGroesse = 512): Promise<Blob> {
  const s = wirksamerStil(icon, stil);
  const flaeche = icon.stile[s]!.flaeche;
  const titel = `Ceha ${icon.titel} (${icon.name})`;
  switch (format) {
    case 'svg':
      return new Blob([svgText(icon, stil, farbe.hex)], { type: 'image/svg+xml' });
    case 'svg-pfade':
      return new Blob([svgText(icon, stil, farbe.hex, { pfade: true })], { type: 'image/svg+xml' });
    case 'png':
      return pngBlob(svgText(icon, stil, farbe.hex, { groesse: pngGroesse }), pngGroesse);
    case 'pdf':
      return new Blob([pdfText(flaeche, farbe, titel)], { type: 'application/pdf' });
    case 'eps':
      return new Blob([epsText(flaeche, farbe, titel)], { type: 'application/postscript' });
  }
}

export function speichere(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Alle gewählten Icons in allen gewählten Formaten als ZIP, ein Ordner pro Format */
export async function zipBlob(icons: Icon[], stil: Stil, farbe: Exportfarbe, formate: Format[], pngGroesse: number): Promise<Blob> {
  const eintraege: Record<string, Uint8Array> = {};
  for (const icon of icons) {
    for (const format of formate) {
      const blob = await dateiInhalt(icon, stil, farbe, format, pngGroesse);
      eintraege[`${format}/${dateiname(icon, stil, farbe, format, pngGroesse)}`] = new Uint8Array(await blob.arrayBuffer());
    }
  }
  eintraege['LIESMICH.txt'] = strToU8(
    `Ceha Icons – ${icons.length} Icons, ${STIL_NAMEN[stil]}, ${farbe.name} (${farbe.hex})\n` +
      `PDF und EPS: 24 × 24 mm, als eine Fläche, ${farbe.cmyk ? 'CMYK' : 'RGB (Druckwerte für diese Farbe noch nicht hinterlegt)'}.\n` +
      `Fehlt einem Icon der gewählte Stil, ist der andere enthalten (Dateiname nennt den Stil).\n`,
  );
  return new Blob([zipSync(eintraege, { level: 6 }) as BlobPart], { type: 'application/zip' });
}
