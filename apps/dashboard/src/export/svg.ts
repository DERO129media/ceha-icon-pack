import type { Icon, Stil } from '../daten';
import { wirksamerStil } from '../daten';

/**
 * SVG in einer festen Farbe.
 * pfade=false: Quellform (Web, Code). pfade=true: alles in eine Fläche vereinigt (Druck, Illustrator).
 */
export function svgText(icon: Icon, stil: Stil, hex: string, { pfade = false, groesse = 24 } = {}): string {
  const s = wirksamerStil(icon, stil);
  const daten = icon.stile[s];
  if (!daten) throw new Error(`${icon.name} hat keine Zeichnung`);
  const kopf = `<svg xmlns="http://www.w3.org/2000/svg" width="${groesse}" height="${groesse}" viewBox="0 0 ${daten.raster} ${daten.raster}"`;
  if (pfade) {
    return `${kopf}><path fill="${hex}" fill-rule="${daten.flaeche.fillRule}" d="${daten.flaeche.d}"/></svg>\n`;
  }
  const wurzel = Object.entries(daten.wurzel).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `${kopf} ${wurzel} color="${hex}">${daten.koerper}</svg>\n`;
}
