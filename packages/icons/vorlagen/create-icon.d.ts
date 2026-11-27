import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

export interface CehaIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** Breite und Höhe in px, Standard 24 */
  size?: number | string;
  /** Farbe, Standard currentColor */
  color?: string;
  /** Nur Kontur: Strichstärke im 24er-Raster, Standard 1,35. Die Fläche hat keine Striche. */
  strokeWidth?: number | string;
  /** Nur Kontur: Strichstärke bleibt bei jeder Größe gleich dick */
  absoluteStrokeWidth?: boolean;
  /** Fläche (Standard, Hauptstil) oder Kontur. Fehlt der gewünschte Stil, steht der andere ein. */
  variant?: 'solid' | 'outline';
  /** Zugänglicher Name; ohne title ist das Icon aria-hidden */
  title?: string;
}

export type CehaIcon = ForwardRefExoticComponent<CehaIconProps & RefAttributes<SVGSVGElement>>;

export interface CehaIconTeil {
  wurzel: Record<string, string>;
  knoten: Array<[string, Record<string, string>]>;
  /** Kantenlänge der viewBox: 64 (Fläche) oder 24 (Kontur) */
  raster: number;
}

export declare function createIcon(name: string, outline: CehaIconTeil | null, solid: CehaIconTeil | null): CehaIcon;
