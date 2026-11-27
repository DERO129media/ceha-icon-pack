import { EXPORTFARBEN } from '../design/farben';

export function Farbwahl({ wert, aendern }: { wert: string; aendern: (id: string) => void }) {
  return (
    <div className="farbwahl" role="radiogroup" aria-label="Farbe">
      {EXPORTFARBEN.map((f) => (
        <label key={f.id} className="farbwahl-option" data-aktiv={f.id === wert}>
          <input type="radio" name="farbe" value={f.id} checked={f.id === wert} onChange={() => aendern(f.id)} />
          <span className="farbwahl-feld" style={{ background: f.hex }} data-hell={f.hell} />
          <span className="farbwahl-name">{f.name}</span>
          <span className="farbwahl-hex">{f.hex}</span>
        </label>
      ))}
    </div>
  );
}
