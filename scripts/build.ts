/**
 *   pnpm build    prüfen und alles erzeugen (Paket, React, Dashboard-Daten)
 *   pnpm check    nur prüfen, nichts schreiben (für CI und vor dem Commit)
 */
import { baue } from './lib/pipeline.ts';

const nurPruefen = process.argv.includes('--nur-pruefen');
const start = performance.now();
const bericht = await baue({ schreiben: !nurPruefen });

for (const w of bericht.warnungen) console.warn(`⚠ ${w}`);
for (const f of bericht.fehler) console.error(`✗ ${f}`);

const anzahl = bericht.icons.length;
const eigene = bericht.icons.filter((i) => i.eintrag.status !== 'vorlage').length;
const flaechen = bericht.icons.filter((i) => i.stile.solid).length;
const dauer = Math.round(performance.now() - start);

if (bericht.fehler.length > 0) {
  console.error(`\n${bericht.fehler.length} Fehler – ${nurPruefen ? 'Prüfung' : 'Build'} abgebrochen.`);
  process.exit(1);
}
if (bericht.neueNamen.length > 0) console.log(`Neu in names.lock.json: ${bericht.neueNamen.join(', ')}`);
console.log(`✓ ${anzahl} Icons, davon ${eigene} eigene, ${flaechen} als Fläche (Hauptstil) – ${nurPruefen ? 'geprüft' : 'gebaut'} in ${dauer} ms.`);
