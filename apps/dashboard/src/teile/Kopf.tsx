import { DATEN } from '../daten';

export function Kopf() {
  const alle = DATEN.icons.length;
  const fertig = DATEN.icons.filter((i) => i.status === 'fertig').length;
  const flaechen = DATEN.icons.filter((i) => i.stile.solid).length;
  return (
    <header className="kopf">
      <div className="kopf-marke">
        <h1>Ceha Icons</h1>
        <span className="kopf-version">Version {DATEN.version}</span>
      </div>
      <div className="kopf-fortschritt" aria-label="Fortschritt des Icon-Packs">
        <Balken text="Freigegeben" wert={fertig} von={alle} />
        <Balken text="Als Fläche gezeichnet" wert={flaechen} von={alle} />
      </div>
    </header>
  );
}

function Balken({ text, wert, von }: { text: string; wert: number; von: number }) {
  return (
    <div className="balken">
      <div className="balken-text">
        <span>{text}</span>
        <strong>
          {wert} von {von}
        </strong>
      </div>
      <div className="balken-spur" role="progressbar" aria-label={text} aria-valuenow={wert} aria-valuemin={0} aria-valuemax={von}>
        <div className="balken-wert" style={{ width: `${(wert / von) * 100}%` }} />
      </div>
    </div>
  );
}
