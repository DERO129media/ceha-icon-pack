import { useEffect, useMemo, useState } from 'react';
import { DATEN, statusVon, type Icon } from './daten';
import { farbeNach } from './design/farben';
import { Kopf } from './teile/Kopf';
import { Leiste, type Einstellungen } from './teile/Leiste';
import { Raster } from './teile/Raster';
import { Zeichnungsblatt } from './teile/Zeichnungsblatt';
import { Testblatt } from './teile/Testblatt';

function passt(icon: Icon, suche: string): boolean {
  const q = suche.trim().toLowerCase();
  if (!q) return true;
  return [icon.name, icon.titel, ...icon.aliases, ...icon.tags].some((t) => t.toLowerCase().includes(q));
}

export function App() {
  const [e, setE] = useState<Einstellungen>({ stil: 'solid', farbe: 'brand', filter: 'alle', reihenfolge: 'kategorien', ansicht: 'raster' });
  const [suche, setSuche] = useState('');
  const [offen, setOffen] = useState<string | null>(() => decodeURIComponent(location.hash.slice(1)) || null);
  const farbe = farbeNach(e.farbe);

  // Direktlinks wie /#wrench öffnen das Zeichnungsblatt
  useEffect(() => {
    const folgen = () => setOffen(decodeURIComponent(location.hash.slice(1)) || null);
    addEventListener('hashchange', folgen);
    return () => removeEventListener('hashchange', folgen);
  }, []);

  const sichtbare = useMemo(
    () => DATEN.icons.filter((i) => (e.filter === 'alle' || statusVon(i, e.stil) === e.filter) && passt(i, suche)),
    [e.filter, e.stil, suche],
  );
  const offenesIcon = DATEN.icons.find((i) => i.name === offen);

  function oeffne(name: string | null) {
    setOffen(name);
    history.replaceState(null, '', name ? `#${name}` : location.pathname);
  }

  return (
    <div className="seite">
      <Kopf />
      <Leiste e={e} setze={(t) => setE({ ...e, ...t })} sichtbare={sichtbare} />
      <main className="haupt">
        <label className="suche">
          <span className="nur-vorleser">Icons suchen</span>
          <input type="search" placeholder="Suchen nach Name, Begriff oder Alias, z. B. Spind, rfid, Lieferung" value={suche} onChange={(ev) => setSuche(ev.target.value)} />
        </label>
        {e.ansicht === 'testblatt' ? (
          <Testblatt icons={sichtbare} stil={e.stil} farbe={farbe} oeffnen={oeffne} />
        ) : (
          <Raster icons={sichtbare} stil={e.stil} farbe={farbe} reihenfolge={e.reihenfolge} oeffnen={oeffne} />
        )}
      </main>
      {offenesIcon && (
        <Zeichnungsblatt key={offenesIcon.name} icon={offenesIcon} stil={e.stil} farbe={farbe} setzeStil={(stil) => setE({ ...e, stil })} schliessen={() => oeffne(null)} />
      )}
    </div>
  );
}
