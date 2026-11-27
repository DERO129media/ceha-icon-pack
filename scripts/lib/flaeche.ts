import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import svgpath from 'svgpath';
import { alsPfad, type Knoten } from './svg.ts';

/**
 * Wandelt ein Icon in eine einzige gefüllte Fläche um: Striche werden mit ihrer
 * Stärke, ihren Enden und Ecken zu Umrissen, alles wird vereinigt.
 * Das Ergebnis brauchen Druckdateien (EPS, PDF), Illustrator und die Randprüfung.
 */

// pathkit-wasm hat keine Typen; wir brauchen nur diesen kleinen Teil der API.
interface PkPfad {
  setFillType(t: unknown): PkPfad;
  stroke(o: { width: number; join: unknown; cap: unknown; miter_limit?: number }): PkPfad | null;
  op(anderer: PkPfad, op: unknown): PkPfad | null;
  simplify(): PkPfad | null;
  toSVGString(): string;
  getFillTypeString(): string;
  computeTightBounds(): { fLeft: number; fTop: number; fRight: number; fBottom: number };
  delete(): void;
}
interface PathKit {
  NewPath(): PkPfad;
  FromSVGString(d: string): PkPfad | null;
  FillType: { WINDING: unknown; EVENODD: unknown };
  StrokeJoin: { ROUND: unknown; MITER: unknown; BEVEL: unknown };
  StrokeCap: { ROUND: unknown; BUTT: unknown; SQUARE: unknown };
  PathOp: { UNION: unknown };
}

let pathKit: Promise<PathKit> | undefined;

export function ladePathKit(): Promise<PathKit> {
  if (!pathKit) {
    const require = createRequire(import.meta.url);
    const init = require('pathkit-wasm/bin/pathkit.js') as (o: object) => Promise<PathKit>;
    pathKit = init({ wasmBinary: readFileSync(require.resolve('pathkit-wasm/bin/pathkit.wasm')) });
  }
  return pathKit;
}

export interface Flaeche {
  /** Absolute Pfaddaten, nur M, L, C, Z */
  d: string;
  fillRule: 'nonzero' | 'evenodd';
  rahmen: { links: number; oben: number; rechts: number; unten: number };
}

/** w = Wurzelattribute des Icons (Stil und Profil), Elemente erben davon */
export async function zuFlaeche(knoten: Knoten[], w: Record<string, string>): Promise<Flaeche> {
  const pk = await ladePathKit();
  const gesamt = pk.NewPath();
  const kappen: Record<string, unknown> = { butt: pk.StrokeCap.BUTT, round: pk.StrokeCap.ROUND, square: pk.StrokeCap.SQUARE };
  const ecken: Record<string, unknown> = { miter: pk.StrokeJoin.MITER, round: pk.StrokeJoin.ROUND, bevel: pk.StrokeJoin.BEVEL };
  try {
    for (const k of knoten) {
      const a = k[1];
      const d = nurKubisch(alsPfad(k));
      const e = { ...w, ...a };
      // Ohne Angabe füllt SVG, zeichnet aber keinen Strich.
      const fill = e.fill ?? 'currentColor';
      const stroke = e.stroke ?? 'none';
      if (fill !== 'none') {
        const p = neu(pk, d);
        if (a['fill-rule'] === 'evenodd') p.setFillType(pk.FillType.EVENODD);
        vereinige(pk, gesamt, p);
      }
      if (stroke !== 'none') {
        const p = neu(pk, d);
        // Gehrungsgrenze 4 wie in SVG, damit Druck und Bildschirm gleich aussehen
        p.stroke({ width: Number(e['stroke-width']), join: ecken[e['stroke-linejoin']], cap: kappen[e['stroke-linecap']], miter_limit: 4 });
        vereinige(pk, gesamt, p);
      }
    }
    gesamt.simplify();
    const b = gesamt.computeTightBounds();
    return {
      d: nurKubisch(gesamt.toSVGString()),
      fillRule: gesamt.getFillTypeString() === 'evenodd' ? 'evenodd' : 'nonzero',
      rahmen: { links: b.fLeft, oben: b.fTop, rechts: b.fRight, unten: b.fBottom },
    };
  } finally {
    gesamt.delete();
  }
}

function neu(pk: PathKit, d: string): PkPfad {
  const p = pk.FromSVGString(d);
  if (!p) throw new Error(`Pfad lässt sich nicht lesen: ${d.slice(0, 60)}`);
  return p;
}

function vereinige(pk: PathKit, gesamt: PkPfad, p: PkPfad): void {
  // Erst einzeln vereinfachen, damit sich überlappende Teile eines Pfads nicht aufheben.
  p.simplify();
  gesamt.op(p, pk.PathOp.UNION);
  p.delete();
}

/** Normalisiert auf absolute M/L/C/Z: Druckformate kennen keine Q- oder A-Befehle. */
export function nurKubisch(d: string): string {
  let x = 0;
  let y = 0;
  const teile: string[] = [];
  const r = (v: number) => String(Math.round(v * 1000) / 1000);
  svgpath(d)
    .abs()
    .unarc()
    .unshort()
    .iterate((seg, _i, sx, sy) => {
      x = sx;
      y = sy;
      const [cmd, ...z] = seg as [string, ...number[]];
      if (cmd === 'Q') {
        const [qx, qy, ex, ey] = z;
        const c = [x + (2 / 3) * (qx - x), y + (2 / 3) * (qy - y), ex + (2 / 3) * (qx - ex), ey + (2 / 3) * (qy - ey), ex, ey];
        teile.push('C' + c.map(r).join(' '));
      } else if (cmd === 'H') teile.push(`L${r(z[0])} ${r(y)}`);
      else if (cmd === 'V') teile.push(`L${r(x)} ${r(z[0])}`);
      else teile.push(cmd + z.map(r).join(' '));
    });
  return teile.join('');
}
