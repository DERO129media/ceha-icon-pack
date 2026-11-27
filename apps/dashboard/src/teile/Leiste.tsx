import { useState } from 'react';
import type { Icon, Stil, Status } from '../daten';
import { STATUS_NAMEN } from '../daten';
import { Segment } from '../ui/Segment';
import { Farbwahl } from '../ui/Farbwahl';
import { Knopf } from '../ui/Knopf';
import { farbeNach } from '../design/farben';
import { FORMATE, speichere, zipBlob, type Format } from '../export/dateien';

export type Reihenfolge = 'kategorien' | 'verwendung';
export type Ansicht = 'raster' | 'testblatt';
export type Filter = 'alle' | Status;

export interface Einstellungen {
  stil: Stil;
  farbe: string;
  filter: Filter;
  reihenfolge: Reihenfolge;
  ansicht: Ansicht;
}

interface Props {
  e: Einstellungen;
  setze: (teil: Partial<Einstellungen>) => void;
  sichtbare: Icon[];
}

export function Leiste({ e, setze, sichtbare }: Props) {
  const [formate, setFormate] = useState<Format[]>(['svg', 'png', 'pdf', 'eps']);
  const [pngGroesse, setPngGroesse] = useState(512);
  const [laeuft, setLaeuft] = useState(false);
  const farbe = farbeNach(e.farbe);

  async function zipLaden() {
    setLaeuft(true);
    try {
      const blob = await zipBlob(sichtbare, e.stil, farbe, formate, pngGroesse);
      speichere(blob, `ceha-icons-${e.stil === 'solid' ? 'flaeche' : 'kontur'}-${farbe.id}.zip`);
    } finally {
      setLaeuft(false);
    }
  }

  return (
    <aside className="leiste">
      <section className="leiste-gruppe">
        <h2>Ansicht</h2>
        <Segment name="Ansicht" wert={e.ansicht} aendern={(ansicht) => setze({ ansicht })} optionen={[{ wert: 'raster', text: 'Übersicht' }, { wert: 'testblatt', text: 'Testblatt' }]} />
      </section>
      <section className="leiste-gruppe">
        <h2>Stil</h2>
        <Segment name="Stil" wert={e.stil} aendern={(stil) => setze({ stil })} optionen={[{ wert: 'solid', text: 'Fläche' }, { wert: 'outline', text: 'Kontur' }]} />
      </section>
      <section className="leiste-gruppe">
        <h2>Farbe</h2>
        <Farbwahl wert={e.farbe} aendern={(f) => setze({ farbe: f })} />
        {!farbe.cmyk && <p className="leiste-hinweis">Für {farbe.name} sind noch keine CMYK-Werte hinterlegt. PDF und EPS enthalten RGB.</p>}
      </section>
      <section className="leiste-gruppe">
        <h2>Zeigen</h2>
        <select className="auswahl" value={e.filter} onChange={(ev) => setze({ filter: ev.target.value as Filter })} aria-label="Status">
          <option value="alle">Alle Icons</option>
          {(Object.keys(STATUS_NAMEN) as Status[]).map((s) => (
            <option key={s} value={s}>
              Nur {STATUS_NAMEN[s]}
            </option>
          ))}
        </select>
        <Segment name="Reihenfolge" wert={e.reihenfolge} aendern={(reihenfolge) => setze({ reihenfolge })} optionen={[{ wert: 'kategorien', text: 'Kategorien' }, { wert: 'verwendung', text: 'Häufigkeit' }]} />
      </section>
      <section className="leiste-gruppe">
        <h2>Herunterladen</h2>
        <p className="leiste-hinweis">Alle {sichtbare.length} sichtbaren Icons in {e.stil === 'solid' ? 'Fläche' : 'Kontur'}, {farbe.name}.</p>
        <div className="formate">
          {FORMATE.map((f) => (
            <label key={f.id} className="format" title={f.hinweis} data-aktiv={formate.includes(f.id)}>
              <input type="checkbox" checked={formate.includes(f.id)} onChange={(ev) => setFormate(ev.target.checked ? [...formate, f.id] : formate.filter((x) => x !== f.id))} />
              {f.name}
            </label>
          ))}
        </div>
        {formate.includes('png') && (
          <label className="feld">
            PNG-Größe
            <select className="auswahl" value={pngGroesse} onChange={(ev) => setPngGroesse(Number(ev.target.value))}>
              {[64, 128, 256, 512, 1024].map((g) => (
                <option key={g} value={g}>
                  {g} × {g} px
                </option>
              ))}
            </select>
          </label>
        )}
        <Knopf variante="primaer" onClick={zipLaden} disabled={laeuft || formate.length === 0 || sichtbare.length === 0}>
          {laeuft ? 'ZIP wird erstellt …' : 'Als ZIP herunterladen'}
        </Knopf>
      </section>
    </aside>
  );
}
