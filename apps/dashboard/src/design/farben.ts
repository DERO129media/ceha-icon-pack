/**
 * Exportfarben aus dem Ceha-Styleguide (ceha-stahlmoebel.de/styleguide).
 * CMYK-Werte nur, wo sie feststehen. Für die Brand-Töne liefert der Styleguide
 * keine Druckwerte – bis sie hinterlegt sind, enthalten PDF und EPS RGB.
 * Keine Werte erfinden: fehlende Werte bleiben null.
 */
export interface Exportfarbe {
  id: string;
  name: string;
  hex: string;
  cmyk: [c: number, m: number, y: number, k: number] | null;
  /** Vorschau auf dunklem Grund nötig */
  hell: boolean;
}

export const EXPORTFARBEN: Exportfarbe[] = [
  { id: 'brand', name: 'Brand Blue', hex: '#0b477e', cmyk: null, hell: false },
  { id: 'brand-dark', name: 'Brand Dark', hex: '#08365f', cmyk: null, hell: false },
  { id: 'brand-light', name: 'Brand Light', hex: '#12599c', cmyk: null, hell: false },
  { id: 'text', name: 'Text', hex: '#2e2e2e', cmyk: null, hell: false },
  { id: 'schwarz', name: 'Schwarz', hex: '#000000', cmyk: [0, 0, 0, 100], hell: false },
  { id: 'weiss', name: 'Weiß', hex: '#ffffff', cmyk: [0, 0, 0, 0], hell: true },
];

export function farbeNach(id: string): Exportfarbe {
  return EXPORTFARBEN.find((f) => f.id === id) ?? EXPORTFARBEN[0];
}

export function hexZuRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
}
