import roh from './generated/icons.json';

export type Stil = 'outline' | 'solid';
export type Status = 'entwurf' | 'fertig';
export type Kategorie = 'inhalte' | 'produkte' | 'unternehmen';

export interface Flaeche {
  d: string;
  fillRule: 'nonzero' | 'evenodd';
  /** Kantenlänge der viewBox, in der d gezeichnet ist */
  raster: number;
}

export interface StilDaten {
  koerper: string;
  wurzel: Record<string, string>;
  raster: number;
  flaeche: Flaeche;
}

export interface Icon {
  name: string;
  titel: string;
  kategorien: Kategorie[];
  aliases: string[];
  /** Status je Stil; ohne Angabe gilt ein gezeichneter Stil als Entwurf */
  status: Partial<Record<Stil, Status>>;
  verwendungen: number;
  tags: string[];
  stile: Partial<Record<Stil, StilDaten>>;
}

export const DATEN = roh as unknown as { version: string; erzeugt: string; icons: Icon[] };

export const KATEGORIE_NAMEN: Record<Kategorie, string> = {
  inhalte: 'Inhalte',
  produkte: 'Produkte',
  unternehmen: 'Unternehmen',
};

export const STATUS_NAMEN: Record<Status, string> = {
  entwurf: 'Entwurf',
  fertig: 'Freigegeben',
};

export const STIL_NAMEN: Record<Stil, string> = { outline: 'Kontur', solid: 'Fläche' };

/** SVG-Attribute (kebab-case) als React-Props (camelCase) */
export function alsProps(attrs: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v]));
}

/** Fläche ist der Hauptstil; ist sie noch nicht gezeichnet, steht die Kontur ein. */
export function hauptstil(icon: Icon): Stil {
  return icon.stile.solid ? 'solid' : 'outline';
}

/** Status des Stils, der für die Auswahl tatsächlich gezeigt wird */
export function statusVon(icon: Icon, stil: Stil): Status {
  return icon.status[wirksamerStil(icon, stil)] ?? 'entwurf';
}

/** Gewählter Stil, oder der andere, wenn der gewählte noch fehlt */
export function wirksamerStil(icon: Icon, stil: Stil): Stil {
  if (icon.stile[stil]) return stil;
  return stil === 'solid' ? 'outline' : 'solid';
}
