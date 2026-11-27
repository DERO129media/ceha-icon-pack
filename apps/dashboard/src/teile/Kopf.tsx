import { useState } from 'react';
import { DATEN } from '../daten';
import { agentenAnleitung } from '../agentenAnleitung';
import { kopiere } from '../ui/kopieren';
import { Knopf } from '../ui/Knopf';

export function Kopf() {
  const alle = DATEN.icons.length;
  const flaechen = DATEN.icons.filter((i) => i.stile.solid && i.status.solid === 'fertig').length;
  const konturen = DATEN.icons.filter((i) => i.stile.outline && i.status.outline === 'fertig').length;
  const [kopiert, setKopiert] = useState(false);
  /** Text zum Markieren von Hand, wenn der Browser das Kopieren verweigert */
  const [vonHand, setVonHand] = useState<string | null>(null);

  async function anleitungKopieren() {
    const text = agentenAnleitung(location.origin + location.pathname);
    if (await kopiere(text)) {
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2200);
    } else {
      setVonHand(text);
    }
  }
  return (
    <header className="kopf">
      <div className="kopf-marke">
        <h1>Ceha Icons</h1>
        <span className="kopf-version">Version {DATEN.version}</span>
      </div>
      <div className="kopf-fortschritt" aria-label="Fortschritt des Icon-Packs">
        <Balken text="Flächen freigegeben" wert={flaechen} von={alle} />
        <Balken text="Konturen freigegeben" wert={konturen} von={alle} />
      </div>
      <button
        type="button"
        className="kopf-knopf"
        onClick={anleitungKopieren}
        title="Kopiert eine kurze Anleitung für eine neue KI-Session: nur dieses Icon-Pack verwenden, Installation, Stilregeln und wo die Icon-Namen stehen"
      >
        {kopiert ? 'Kopiert ✓' : 'Anleitung für KI-Agent kopieren'}
      </button>
      <span className="nur-vorleser" role="status">
        {kopiert ? 'Anleitung für KI-Agent in die Zwischenablage kopiert' : ''}
      </span>
      {vonHand && (
        <dialog className="vonhand" open aria-labelledby="vonhand-titel">
          <h2 id="vonhand-titel">Anleitung für KI-Agent</h2>
          <p>Der Browser erlaubt hier keinen Zugriff auf die Zwischenablage. Text ist markiert – mit ⌘C bzw. Strg+C kopieren.</p>
          <textarea readOnly value={vonHand} autoFocus onFocus={(e) => e.currentTarget.select()} />
          <Knopf variante="primaer" onClick={() => setVonHand(null)}>
            Fertig
          </Knopf>
        </dialog>
      )}
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
