import { useState } from 'react';
import { DATEN } from '../daten';
import { agentenAnleitung, REPO_URL } from '../agentenAnleitung';
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
      <div className="kopf-aktionen">
        <button
          type="button"
          className="kopf-knopf"
          onClick={anleitungKopieren}
          title="Kopiert eine kurze Anleitung für eine neue KI-Session: nur dieses Icon-Pack verwenden, Installation, Stilregeln und wo die Icon-Namen stehen"
        >
          {kopiert ? 'Kopiert ✓' : 'Anleitung für KI-Agent kopieren'}
        </button>
        <a className="kopf-knopf" href={REPO_URL} target="_blank" rel="noreferrer" title="Quellcode, Regeln und Paket auf GitHub">
          <GithubLogo />
          GitHub
        </a>
      </div>
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

/** GitHub-Marke (Octicon „mark-github“), als Link-Kennzeichnung zum eigenen Repo */
function GithubLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
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
