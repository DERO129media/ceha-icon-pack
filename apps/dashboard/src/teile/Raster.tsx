import type { Icon, Kategorie, Stil } from '../daten';
import { KATEGORIE_NAMEN, STATUS_NAMEN, STIL_NAMEN, statusVon, wirksamerStil } from '../daten';
import { IconBild } from '../ui/IconBild';
import type { Reihenfolge } from './Leiste';

interface Props {
  icons: Icon[];
  stil: Stil;
  farbe: { hex: string; hell: boolean };
  reihenfolge: Reihenfolge;
  oeffnen: (name: string) => void;
}

export function Raster({ icons, stil, farbe, reihenfolge, oeffnen }: Props) {
  if (icons.length === 0) {
    return <p className="leer">Kein Icon passt zur Suche. Versuchen Sie einen anderen Begriff, etwa „Schloss“ oder „Lieferung“.</p>;
  }
  const gruppen: [string, Icon[]][] =
    reihenfolge === 'verwendung'
      ? [['Nach Häufigkeit auf ceha-stahlmoebel.de', [...icons].sort((a, b) => b.verwendungen - a.verwendungen)]]
      : (Object.keys(KATEGORIE_NAMEN) as Kategorie[])
          .map((k) => [KATEGORIE_NAMEN[k], icons.filter((i) => i.kategorien.includes(k))] as [string, Icon[]])
          .filter(([, liste]) => liste.length > 0);

  return (
    <div className="raster">
      {gruppen.map(([titel, liste]) => (
        <section key={titel} className="raster-gruppe">
          <h2>
            {titel} <span className="raster-anzahl">{liste.length}</span>
          </h2>
          <ul className="raster-liste">
            {liste.map((icon) => (
              <li key={icon.name}>
                <button type="button" className="kachel" data-dunkel={farbe.hell} onClick={() => oeffnen(icon.name)}>
                  <IconBild icon={icon} stil={stil} groesse={32} farbe={farbe.hex} />
                  <span className="kachel-name">{icon.name}</span>
                  <span className="kachel-titel">{icon.titel}</span>
                  <span className="status-punkt" data-status={statusVon(icon, stil)} title={STATUS_NAMEN[statusVon(icon, stil)]} />
                  {wirksamerStil(icon, stil) !== stil && <span className="kachel-ersatz">{STIL_NAMEN[wirksamerStil(icon, stil)]}</span>}
                  {reihenfolge === 'verwendung' && icon.verwendungen > 0 && <span className="kachel-zahl">{icon.verwendungen}×</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
