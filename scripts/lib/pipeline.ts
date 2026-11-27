import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dateienImStil, ladeManifest, pruefeManifest, STILE } from './manifest.ts';
import { ergaenzeSperrliste, fehlendeNamen, ladeSperrliste, alleNamen } from './namen.ts';
import { pruefeSvg, RANDZONE, RASTER, wurzelFuer } from './svg.ts';
import { zuFlaeche } from './flaeche.ts';
import { schreibeDashboardDaten, schreibePaket, ENDUNGEN, type FertigesIcon } from './ausgabe.ts';
import { schreibeReact } from './react.ts';
import { PFADE } from './pfade.ts';

export interface BuildBericht {
  fehler: string[];
  warnungen: string[];
  icons: FertigesIcon[];
  neueNamen: string[];
}

/**
 * Prüft alle Icons und schreibt, wenn alles stimmt und schreiben=true ist,
 * Paket, React-Komponenten und Dashboard-Daten. Ohne schreiben wird nichts
 * verändert – auch die Namens-Sperrliste nicht.
 */
export async function baue({ schreiben }: { schreiben: boolean }): Promise<BuildBericht> {
  const fehler: string[] = [];
  const warnungen: string[] = [];
  const manifest = ladeManifest(PFADE.icons);
  fehler.push(...pruefeManifest(manifest));
  for (const n of alleNamen(manifest)) {
    for (const endung of Object.values(ENDUNGEN)) {
      if (n.endsWith(endung)) fehler.push(`"${n}": Namen dürfen nicht auf "${endung}" enden, das ist für die Stil-Varianten reserviert.`);
    }
  }

  const dateien = Object.fromEntries(STILE.map((s) => [s, dateienImStil(PFADE.icons, s)]));
  for (const name of Object.keys(manifest)) {
    if (!STILE.some((s) => dateien[s].includes(name))) {
      fehler.push(`${name}: keine Zeichnung. icons/solid/${name}.svg anlegen.`);
    }
  }
  for (const stil of STILE) {
    for (const datei of dateien[stil]) {
      if (!manifest[datei]) fehler.push(`icons/${stil}/${datei}.svg hat keinen Eintrag in icons/manifest.json.`);
    }
  }

  const icons: FertigesIcon[] = [];
  for (const [name, eintrag] of Object.entries(manifest)) {
    const icon: FertigesIcon = { name, eintrag, stile: {} };
    for (const stil of STILE) {
      const pfad = join(PFADE.icons, stil, `${name}.svg`);
      if (!existsSync(pfad)) continue;
      const ort = `icons/${stil}/${name}.svg`;
      const w = wurzelFuer(stil);
      const { fehler: f, knoten } = pruefeSvg(readFileSync(pfad, 'utf8'), stil);
      if (f.length > 0) {
        fehler.push(...f.map((m) => `${ort}: ${m}`));
        continue;
      }
      const flaeche = await zuFlaeche(knoten, w);
      const { links, oben, rechts, unten } = flaeche.rahmen;
      const r = (v: number) => v.toFixed(2);
      const raster = RASTER[stil];
      const rand = RANDZONE[stil];
      if (links < 0 || oben < 0 || rechts > raster || unten > raster) {
        fehler.push(`${ort}: ragt über das ${raster}er-Raster hinaus (Rahmen ${r(links)} ${r(oben)} ${r(rechts)} ${r(unten)}).`);
      } else if (links < rand - 0.01 || oben < rand - 0.01 || rechts > raster - rand + 0.01 || unten > raster - rand + 0.01) {
        warnungen.push(`${ort}: weniger als ${rand} Einheiten Abstand zum Rand.`);
      }
      icon.stile[stil] = { knoten, flaeche, wurzel: w, raster };
    }
    if (eintrag.status === 'fertig' && !icon.stile.solid) warnungen.push(`${name}: als fertig markiert, aber noch nicht als Fläche (Hauptstil) gezeichnet.`);
    icons.push(icon);
  }

  const sperrliste = ladeSperrliste(PFADE.sperrliste);
  for (const n of fehlendeNamen(sperrliste, manifest)) {
    fehler.push(`Name "${n}" wurde schon veröffentlicht und darf nicht verschwinden. Wieder eintragen (als Name oder Alias) – oder bewusst von Hand aus icons/names.lock.json streichen.`);
  }
  let neueNamen = alleNamen(manifest).filter((n) => !sperrliste.includes(n));
  if (!schreiben && neueNamen.length > 0) {
    fehler.push(`Neue Namen noch nicht in icons/names.lock.json: ${neueNamen.join(', ')}. "pnpm build" ausführen und die Datei mit einchecken.`);
  }

  if (schreiben && fehler.length === 0) {
    neueNamen = ergaenzeSperrliste(PFADE.sperrliste, manifest);
    const version = (JSON.parse(readFileSync(join(PFADE.paket, 'package.json'), 'utf8')) as { version: string }).version;
    schreibePaket(PFADE.paket, icons, version);
    schreibeReact(PFADE.paket, PFADE.reactVorlagen, icons);
    schreibeDashboardDaten(PFADE.dashboardDaten, icons, version);
  }
  return { fehler, warnungen, icons, neueNamen };
}
