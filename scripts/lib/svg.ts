import { parseSync, type INode } from 'svgson';
import type { Stil } from './manifest.ts';

/** Ein Zeichenelement des Icons: [Tag, Attribute]. Gruppen werden aufgelöst. */
export type Knoten = [tag: string, attrs: Record<string, string>];

/**
 * Die Wurzel jedes Icons ist durch seinen Stil festgelegt, damit alle Icons
 * gleich aufgebaut sind und sich gleich einfärben lassen.
 *
 * solid (Hauptstil): reine Fläche im 64er-Raster, Details als Aussparung (evenodd), keine Striche
 * outline (Altbestand): Strich 1,35 im 24er-Raster, runde Enden und Ecken („Präziser Stahl“)
 *
 * Strichstärke und Raster stehen nur hier.
 */
export const STRICH = '1.35';
export const RASTER: Record<Stil, number> = { solid: 64, outline: 24 };
/** Mindestabstand zum Rand je Raster (Warnung), entspricht 1 bzw. 1,5 Einheiten im 24er-Maß */
export const RANDZONE: Record<Stil, number> = { solid: 4, outline: 1 };
export function wurzelFuer(stil: Stil): Record<string, string> {
  if (stil === 'solid') return { fill: 'currentColor' };
  return {
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': STRICH,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  };
}

/** Einzelne Elemente dürfen Enden und Ecken abweichend setzen, z. B. für Punkte. */
const ENDEN_ERLAUBT = { 'stroke-linecap': ['butt', 'round', 'square'], 'stroke-linejoin': ['miter', 'round', 'bevel'] };

const wurzelErlaubt = (stil: Stil) => new Set(['xmlns', 'width', 'height', 'viewBox', ...Object.keys(wurzelFuer(stil))]);
const STRICH_ATTRIBUTE = ['stroke-width', 'stroke-linecap', 'stroke-linejoin'];

const GEOMETRIE: Record<string, string[]> = {
  path: ['d'],
  circle: ['cx', 'cy', 'r'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  line: ['x1', 'y1', 'x2', 'y2'],
  polyline: ['points'],
  polygon: ['points'],
};
const DARSTELLUNG = ['fill', 'stroke', 'fill-rule', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'];

export interface SvgErgebnis {
  fehler: string[];
  knoten: Knoten[];
}

/** Liest eine Icon-Datei und prüft sie gegen die Raster-Regeln. */
export function pruefeSvg(quelltext: string, stil: Stil): SvgErgebnis {
  const fehler: string[] = [];
  let wurzel: INode;
  try {
    wurzel = parseSync(quelltext);
  } catch (e) {
    return { fehler: [`SVG lässt sich nicht lesen: ${(e as Error).message}`], knoten: [] };
  }
  if (wurzel.name !== 'svg') return { fehler: ['Wurzelelement muss <svg> sein.'], knoten: [] };

  const a = wurzel.attributes;
  const box = `0 0 ${RASTER[stil]} ${RASTER[stil]}`;
  if (a.viewBox !== box) fehler.push(`viewBox muss "${box}" sein (ist "${a.viewBox ?? 'fehlt'}").`);
  for (const groesse of ['width', 'height'] as const) {
    if (a[groesse] !== undefined && a[groesse] !== '24') fehler.push(`${groesse} muss 24 sein oder fehlen.`);
  }
  for (const [k, v] of Object.entries(wurzelFuer(stil))) {
    if (a[k] !== v) fehler.push(`<svg> braucht ${k}="${v}" (ist "${a[k] ?? 'fehlt'}").`);
  }
  const erlaubt = wurzelErlaubt(stil);
  for (const k of Object.keys(a)) {
    if (!erlaubt.has(k)) fehler.push(`<svg>: Attribut "${k}" ist nicht erlaubt${stil === 'solid' ? ' (die Fläche hat keine Striche)' : ''}.`);
  }

  const knoten: Knoten[] = [];
  sammle(wurzel.children, {}, knoten, fehler, stil);
  if (knoten.length === 0) fehler.push('Das Icon enthält keine Zeichenelemente.');
  return { fehler, knoten };
}

function sammle(kinder: INode[], geerbt: Record<string, string>, ziel: Knoten[], fehler: string[], stil: Stil): void {
  for (const k of kinder) {
    if (k.type === 'text' && k.value.trim() === '') continue;
    if (k.type !== 'element') {
      if (k.type !== 'comment') fehler.push(`Unerwarteter Inhalt "${k.type}".`);
      continue;
    }
    if (k.name === 'g') {
      for (const attr of Object.keys(k.attributes)) {
        if (!DARSTELLUNG.includes(attr)) fehler.push(`<g>: Attribut "${attr}" ist nicht erlaubt (keine transform, id, class oder style).`);
      }
      pruefeDarstellung('g', k.attributes, fehler, stil);
      sammle(k.children, { ...geerbt, ...k.attributes }, ziel, fehler, stil);
      continue;
    }
    const geometrie = GEOMETRIE[k.name];
    if (!geometrie) {
      fehler.push(`<${k.name}> ist nicht erlaubt. Erlaubt: ${Object.keys(GEOMETRIE).join(', ')}, g.`);
      continue;
    }
    if (k.children.some((c) => c.type === 'element')) fehler.push(`<${k.name}> darf keine Kindelemente haben.`);
    const attrs: Record<string, string> = { ...geerbt };
    for (const [attr, wert] of Object.entries(k.attributes)) {
      if (geometrie.includes(attr) || DARSTELLUNG.includes(attr)) attrs[attr] = wert;
      else fehler.push(`<${k.name}>: Attribut "${attr}" ist nicht erlaubt.`);
    }
    for (const pflicht of geometrie.filter((g) => !['rx', 'ry', 'x', 'y'].includes(g))) {
      if (attrs[pflicht] === undefined) fehler.push(`<${k.name}>: "${pflicht}" fehlt.`);
    }
    pruefeDarstellung(k.name, attrs, fehler, stil);
    ziel.push([k.name, attrs]);
  }
}

function pruefeDarstellung(tag: string, attrs: Record<string, string>, fehler: string[], stil: Stil): void {
  if (stil === 'solid') {
    if (attrs.stroke !== undefined && attrs.stroke !== 'none') fehler.push(`<${tag}>: Die Fläche hat keine Striche. Details als Aussparung zeichnen (fill-rule="evenodd").`);
    for (const art of STRICH_ATTRIBUTE) {
      if (attrs[art] !== undefined) fehler.push(`<${tag}>: ${art} gibt es in der Fläche nicht.`);
    }
  }
  for (const farbe of ['fill', 'stroke'] as const) {
    const w = attrs[farbe];
    if (w !== undefined && w !== 'none' && w !== 'currentColor') {
      fehler.push(`<${tag}>: ${farbe}="${w}" ist eine feste Farbe. Erlaubt sind nur "currentColor" und "none".`);
    }
  }
  if (attrs['stroke-width'] !== undefined && attrs['stroke-width'] !== STRICH) {
    fehler.push(`<${tag}>: stroke-width muss ${STRICH} sein (ist ${attrs['stroke-width']}).`);
  }
  for (const art of ['stroke-linecap', 'stroke-linejoin'] as const) {
    const w = attrs[art];
    if (w !== undefined && !ENDEN_ERLAUBT[art].includes(w)) fehler.push(`<${tag}>: ${art}="${w}" unbekannt, erlaubt: ${ENDEN_ERLAUBT[art].join(', ')}.`);
  }
  const regel = attrs['fill-rule'];
  if (regel !== undefined && regel !== 'evenodd' && regel !== 'nonzero') fehler.push(`<${tag}>: fill-rule "${regel}" unbekannt.`);
}

/** Wandelt ein Grundelement in Pfaddaten um (für die Konturumwandlung). */
export function alsPfad([tag, a]: Knoten): string {
  const n = (k: string, standard = 0) => (a[k] === undefined ? standard : Number(a[k]));
  switch (tag) {
    case 'path':
      return a.d;
    case 'circle':
      return ellipse(n('cx'), n('cy'), n('r'), n('r'));
    case 'ellipse':
      return ellipse(n('cx'), n('cy'), n('rx'), n('ry'));
    case 'line':
      return `M${n('x1')} ${n('y1')}L${n('x2')} ${n('y2')}`;
    case 'polyline':
    case 'polygon': {
      const z = (a.points.trim().match(/-?[\d.]+(?:e-?\d+)?/gi) ?? []).map(Number);
      const paare: string[] = [];
      for (let i = 0; i + 1 < z.length; i += 2) paare.push(`${z[i]} ${z[i + 1]}`);
      return `M${paare.join('L')}${tag === 'polygon' ? 'Z' : ''}`;
    }
    case 'rect': {
      const x = n('x');
      const y = n('y');
      const w = n('width');
      const h = n('height');
      let rx = a.rx === undefined ? n('ry') : n('rx');
      let ry = a.ry === undefined ? rx : n('ry');
      rx = Math.min(rx, w / 2);
      ry = Math.min(ry, h / 2);
      if (rx === 0 || ry === 0) return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
      return (
        `M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}` +
        `V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}` +
        `H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}` +
        `V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`
      );
    }
    default:
      throw new Error(`Unbekanntes Element <${tag}>`);
  }
}

function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  return `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Inhalt des Icons ohne <svg>-Hülle */
export function koerper(knoten: Knoten[]): string {
  return knoten
    .map(([tag, a]) => `<${tag} ${Object.entries(a).map(([k, v]) => `${k}="${escape(v)}"`).join(' ')}/>`)
    .join('');
}

export function wurzelAttribute(w: Record<string, string>): string {
  return Object.entries(w)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
}

/**
 * Vollständige, aufgeräumte SVG-Datei eines Icons. Angezeigt wird sie
 * standardmäßig 24 px groß, gezeichnet ist sie im Raster ihres Stils.
 * lesbar = ein Element pro Zeile (Quelldateien), sonst kompakt (Paket).
 */
export function svgDatei(knoten: Knoten[], w: Record<string, string>, { raster = 24, lesbar = false } = {}): string {
  const kopf = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 ${raster} ${raster}" ${wurzelAttribute(w)}>`;
  if (!lesbar) return `${kopf}${koerper(knoten)}</svg>\n`;
  return `${kopf}\n${knoten.map((k) => `  ${koerper([k])}`).join('\n')}\n</svg>\n`;
}
