import { useEffect, useRef, useState } from 'react';
import type { Icon, Stil } from '../daten';
import { alsProps, DATEN, hauptstil, KATEGORIE_NAMEN, STATUS_NAMEN, STIL_NAMEN, statusVon, wirksamerStil } from '../daten';
import type { Exportfarbe } from '../design/farben';
import { Segment } from '../ui/Segment';
import { Knopf } from '../ui/Knopf';
import { FORMATE, dateiInhalt, dateiname, speichere, type Format } from '../export/dateien';
import { svgText } from '../export/svg';
import { kopiere } from '../ui/kopieren';

interface Props {
  icon: Icon;
  stil: Stil;
  farbe: Exportfarbe;
  setzeStil: (s: Stil) => void;
  schliessen: () => void;
}

const komponente = (n: string) => n.split('-').map((t) => t[0].toUpperCase() + t.slice(1)).join('');

/** Detailansicht eines Icons, aufgebaut wie ein technisches Zeichnungsblatt */
export function Zeichnungsblatt({ icon, stil, farbe, setzeStil, schliessen }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [raster, setRaster] = useState(true);
  const [pngGroesse, setPngGroesse] = useState(512);
  const [format, setFormat] = useState<Format>('svg');
  const [meldung, setMeldung] = useState('');
  const s = wirksamerStil(icon, stil);
  const daten = icon.stile[s];
  const r = daten?.raster ?? 24;
  const rand = r / 24;

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);

  async function laden(format: Format) {
    speichere(await dateiInhalt(icon, stil, farbe, format, pngGroesse), dateiname(icon, stil, farbe, format, pngGroesse));
  }

  async function kopieren(text: string, was: string) {
    setMeldung((await kopiere(text)) ? `${was} kopiert` : `${was} ließ sich nicht kopieren – der Browser erlaubt keinen Zugriff auf die Zwischenablage.`);
    setTimeout(() => setMeldung(''), 1800);
  }

  const k = komponente(icon.name);
  // Ohne Endung bzw. variant kommt der Hauptstil; nur der andere Stil muss genannt werden.
  const reactCode = `import { ${k} } from '@ceha/icons/react';\n\n<${k} size={32}${s === hauptstil(icon) ? '' : ` variant="${s}"`} />`;
  const astroCode = `<Icon name="ceha:${icon.name}${s === hauptstil(icon) ? '' : `-${s}`}" />`;

  return (
    <dialog ref={dialog} className="blatt" onClose={schliessen} onClick={(ev) => ev.target === dialog.current && dialog.current?.close()} aria-labelledby="blatt-titel">
      <div className="blatt-inhalt">
        <div className="blatt-werkzeuge">
          <Segment name="Stil im Blatt" wert={stil} aendern={setzeStil} optionen={[{ wert: 'solid', text: 'Fläche' }, { wert: 'outline', text: 'Kontur' }]} />
          <label className="schalter">
            <input type="checkbox" checked={raster} onChange={(e) => setRaster(e.target.checked)} /> Raster und Hilfslinien
          </label>
          <Knopf variante="still" groesse="klein" onClick={() => dialog.current?.close()} aria-label="Schließen" title="Schließen (Esc)">
            <span aria-hidden="true" className="knopf-kreuz">×</span> Schließen
          </Knopf>
        </div>

        <div className="blatt-zeichnung" data-dunkel={farbe.hell}>
          <svg viewBox={`${-rand} ${-rand} ${r + 2 * rand} ${r + 2 * rand}`} className="zeichnung" role="img" aria-label={`${icon.titel} im ${r}er-Raster`}>
            {raster && (r === 24 ? <Hilfslinien /> : <HilfslinienFlaeche raster={r} />)}
            {daten && (
              <g
                {...alsProps(daten.wurzel)}
                style={{ color: farbe.hex }}
                dangerouslySetInnerHTML={{ __html: daten.koerper }}
              />
            )}
          </svg>
          {s !== stil && (
            <p className="blatt-ersatz">
              Die {STIL_NAMEN[stil]} ist noch nicht gezeichnet. Angezeigt wird die {STIL_NAMEN[s]}.
            </p>
          )}
        </div>

        <table className="schriftfeld">
          <caption className="nur-vorleser">Angaben zum Icon</caption>
          <tbody>
            <tr>
              <th>Benennung</th>
              <td colSpan={3}>
                <h2 id="blatt-titel">{icon.titel}</h2>
              </td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{icon.name}</td>
              <th>Status</th>
              <td>
                <span className="status-punkt" data-status={statusVon(icon, stil)} /> {STATUS_NAMEN[statusVon(icon, stil)]} ({STIL_NAMEN[s]})
              </td>
            </tr>
            <tr>
              <th>Aliase</th>
              <td>{icon.aliases.length ? icon.aliases.join(', ') : 'keine'}</td>
              <th>Kategorien</th>
              <td>{icon.kategorien.map((k) => KATEGORIE_NAMEN[k]).join(', ')}</td>
            </tr>
            <tr>
              <th>Stile</th>
              <td>{(Object.keys(icon.stile) as Stil[]).map((x) => STIL_NAMEN[x]).join(', ')}</td>
              <th>Website</th>
              <td>{icon.verwendungen > 0 ? `${icon.verwendungen}× im Content` : 'Menü oder nicht verwendet'}</td>
            </tr>
            <tr>
              <th>Profil</th>
              <td colSpan={3}>
                {s === 'solid' ? 'Ceha Fläche: Details als Aussparung, gemeinsame Standlinie, Blech-Radien' : 'Ceha Kontur: 24er-Raster, Strich 1,35, rund, Blech-Radien'}
              </td>
            </tr>
            <tr>
              <th>Raster</th>
              <td>
                {r} × {r}, {s === 'solid' ? 'Fläche ohne Striche' : `Strich ${daten?.wurzel['stroke-width']}`}
              </td>
              <th>Version</th>
              <td>{DATEN.version}</td>
            </tr>
          </tbody>
        </table>

        <section className="blatt-teil">
          <h3>
            Herunterladen <span className="blatt-teil-zusatz">{STIL_NAMEN[s]} · {farbe.name}</span>
          </h3>
          <div className="formatwahl" role="radiogroup" aria-label="Format">
            {FORMATE.map((f) => (
              <label key={f.id} className="formatwahl-option" data-aktiv={f.id === format}>
                <input type="radio" name="format" value={f.id} checked={f.id === format} onChange={() => setFormat(f.id)} />
                <span className="formatwahl-name">{f.name}</span>
                <span className="formatwahl-hinweis">{f.hinweis}</span>
              </label>
            ))}
          </div>
          {format === 'png' && (
            <label className="feld">
              Größe
              <select className="auswahl" value={pngGroesse} onChange={(e) => setPngGroesse(Number(e.target.value))}>
                {[64, 128, 256, 512, 1024].map((g) => (
                  <option key={g} value={g}>
                    {g} × {g} px
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="knopfreihe">
            <Knopf variante="primaer" onClick={() => laden(format)}>
              Herunterladen
            </Knopf>
            <Knopf onClick={() => kopieren(svgText(icon, stil, farbe.hex), 'SVG-Code')}>SVG-Code kopieren</Knopf>
          </div>
          <p className="dateiname">{dateiname(icon, stil, farbe, format, pngGroesse)}</p>
        </section>

        <section className="blatt-teil">
          <h3>Einbinden</h3>
          <Code titel="Astro (astro-icon)" code={astroCode} kopieren={kopieren} />
          <Code titel="React" code={reactCode} kopieren={kopieren} />
        </section>
        <p className="meldung" role="status">
          {meldung}
        </p>
      </div>
    </dialog>
  );
}

function Code({ titel, code, kopieren }: { titel: string; code: string; kopieren: (t: string, w: string) => void }) {
  return (
    <div className="code">
      <div className="code-kopf">
        <span>{titel}</span>
        <Knopf variante="still" groesse="klein" onClick={() => kopieren(code, titel)}>
          Kopieren
        </Knopf>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** 24er-Raster der Kontur mit 1 px Randzone und Hilfsformen (Kreis, Quadrat, Hoch- und Querformat) */
function Hilfslinien() {
  const linien = Array.from({ length: 25 }, (_, i) => i);
  return (
    <g className="hilfslinien" aria-hidden="true">
      <path className="randzone" fillRule="evenodd" d="M0 0H24V24H0Z M1 1V23H23V1Z" />
      {linien.map((i) => (
        <g key={i} className={i % 4 === 0 ? 'linie-stark' : 'linie'}>
          <line x1={i} y1={0} x2={i} y2={24} />
          <line x1={0} y1={i} x2={24} y2={i} />
        </g>
      ))}
      <g className="hilfsform">
        <circle cx={12} cy={12} r={10} />
        <rect x={3} y={3} width={18} height={18} rx={2} />
        <rect x={4} y={2} width={16} height={20} rx={2} />
        <rect x={2} y={4} width={20} height={16} rx={2} />
      </g>
    </g>
  );
}

/** 64er-Raster der Fläche: Linien alle 2 Einheiten, kräftig alle 8, Randzone 4, Standlinie 59,5 */
function HilfslinienFlaeche({ raster }: { raster: number }) {
  const linien = Array.from({ length: raster / 2 + 1 }, (_, i) => i * 2);
  const rand = 4;
  return (
    <g className="hilfslinien" aria-hidden="true">
      <path className="randzone" fillRule="evenodd" d={`M0 0H${raster}V${raster}H0Z M${rand} ${rand}V${raster - rand}H${raster - rand}V${rand}Z`} />
      {linien.map((i) => (
        <g key={i} className={i % 8 === 0 ? 'linie-stark' : 'linie'}>
          <line x1={i} y1={0} x2={i} y2={raster} />
          <line x1={0} y1={i} x2={raster} y2={i} />
        </g>
      ))}
      <g className="hilfsform">
        <line x1={0} y1={59.5} x2={raster} y2={59.5} />
        <line x1={raster / 2} y1={0} x2={raster / 2} y2={raster} />
      </g>
    </g>
  );
}
