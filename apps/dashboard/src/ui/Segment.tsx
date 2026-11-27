interface Props<T extends string> {
  name: string;
  wert: T;
  optionen: { wert: T; text: string }[];
  aendern: (w: T) => void;
}

/** Auswahl aus wenigen Optionen, als Radiogruppe zugänglich */
export function Segment<T extends string>({ name, wert, optionen, aendern }: Props<T>) {
  return (
    <div className="segment" role="radiogroup" aria-label={name}>
      {optionen.map((o) => (
        <label key={o.wert} className="segment-option" data-aktiv={o.wert === wert}>
          <input type="radio" name={name} value={o.wert} checked={o.wert === wert} onChange={() => aendern(o.wert)} />
          {o.text}
        </label>
      ))}
    </div>
  );
}
