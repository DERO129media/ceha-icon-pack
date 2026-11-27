/**
 * Holt Lucide-Originale als Startpunkt nach icons/outline/.
 *
 *   pnpm vorlage            alle Manifest-Einträge ohne Zeichnung (weder Fläche noch Kontur)
 *   pnpm vorlage wrench     nur dieses Icon (überschreibt nie eine vorhandene Datei)
 *
 * Neue Motive zuerst in icons/manifest.json eintragen (mit "vorlage": "<lucide-name>").
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { ladeManifest } from './lib/manifest.ts';
import { pruefeSvg, STRICH, svgDatei, wurzelFuer } from './lib/svg.ts';
import { PFADE } from './lib/pfade.ts';

const require = createRequire(import.meta.url);
const manifest = ladeManifest(PFADE.icons);
const gewuenscht = process.argv.slice(2);
const namen = gewuenscht.length > 0 ? gewuenscht : Object.keys(manifest);
let fehler = 0;

for (const name of namen) {
  const eintrag = manifest[name];
  if (!eintrag) {
    console.error(`✗ ${name}: steht nicht in icons/manifest.json.`);
    fehler++;
    continue;
  }
  const ziel = join(PFADE.icons, 'outline', `${name}.svg`);
  // Ohne ausdrücklichen Namen nur Lücken füllen: Wer schon eine Fläche hat, braucht keine Lucide-Kontur.
  if (gewuenscht.length === 0 && existsSync(join(PFADE.icons, 'solid', `${name}.svg`))) continue;
  if (existsSync(ziel)) {
    if (gewuenscht.length > 0) console.log(`· ${name}: Datei gibt es schon, bleibt unverändert.`);
    continue;
  }
  if (!eintrag.vorlage) {
    console.error(`✗ ${name}: kein "vorlage"-Feld, nichts zu holen.`);
    fehler++;
    continue;
  }
  const quelle = require.resolve(`lucide-static/icons/${eintrag.vorlage}.svg`);
  // Lucide zeichnet mit Strich 2; im Pack gilt überall dieselbe Stärke.
  const roh = readFileSync(quelle, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\sclass="[^"]*"/, '')
    .replace(/stroke-width="2"/g, `stroke-width="${STRICH}"`);
  const { fehler: f, knoten } = pruefeSvg(roh, 'outline', 'vorlage');
  if (f.length > 0) {
    console.error(`✗ ${name}: Lucide-Vorlage passt nicht zu den Regeln:\n  ${f.join('\n  ')}`);
    fehler++;
    continue;
  }
  writeFileSync(ziel, svgDatei(knoten, wurzelFuer('outline', 'vorlage'), { lesbar: true }));
  console.log(`✓ ${name} ← lucide:${eintrag.vorlage}`);
}
process.exit(fehler > 0 ? 1 : 0);
