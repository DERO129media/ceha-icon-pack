import type { Icon, Stil } from '../daten';
import { alsProps, wirksamerStil } from '../daten';

/** Zeigt ein Icon aus den Build-Daten. Fehlt der gewählte Stil, steht der andere ein. */
export function IconBild({ icon, stil, groesse, farbe }: { icon: Icon; stil: Stil; groesse: number; farbe: string }) {
  const daten = icon.stile[wirksamerStil(icon, stil)];
  if (!daten) return null;
  return (
    <svg
      width={groesse}
      height={groesse}
      viewBox={`0 0 ${daten.raster} ${daten.raster}`}
      {...alsProps(daten.wurzel)}
      style={{ color: farbe }}
      aria-hidden="true"
      // Inhalt stammt aus dem eigenen, geprüften Build (icons/*.svg).
      dangerouslySetInnerHTML={{ __html: daten.koerper }}
    />
  );
}
