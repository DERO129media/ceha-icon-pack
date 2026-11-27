import type { Icon, Stil } from '../daten';
import { STATUS_NAMEN, statusVon } from '../daten';
import { IconBild } from '../ui/IconBild';

const GROESSEN = [16, 20, 24, 32, 48];

/**
 * Prüfansicht: Icons nebeneinander in echten Größen. Hier fällt auf, ob alle
 * gleich schwer wirken und ob Details in kleinen Größen zulaufen.
 */
export function Testblatt({ icons, stil, farbe, oeffnen }: { icons: Icon[]; stil: Stil; farbe: { hex: string; hell: boolean }; oeffnen: (n: string) => void }) {
  return (
    <div className="testblatt" data-dunkel={farbe.hell}>
      <section>
        <h2>Nebeneinander</h2>
        {[24, 16].map((g) => (
          <div key={g} className="testblatt-reihe" aria-label={`Alle Icons in ${g} px`}>
            {icons.map((i) => (
              <IconBild key={i.name} icon={i} stil={stil} groesse={g} farbe={farbe.hex} />
            ))}
          </div>
        ))}
      </section>
      <section>
        <h2>Größen</h2>
        <table className="testblatt-tabelle">
          <thead>
            <tr>
              <th>Icon</th>
              {GROESSEN.map((g) => (
                <th key={g}>{g} px</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {icons.map((i) => (
              <tr key={i.name}>
                <th>
                  <button type="button" className="testblatt-name" onClick={() => oeffnen(i.name)}>
                    {i.name}
                  </button>
                  <span className="testblatt-status">
                    <span className="status-punkt" data-status={statusVon(i, stil)} /> {STATUS_NAMEN[statusVon(i, stil)]}
                  </span>
                </th>
                {GROESSEN.map((g) => (
                  <td key={g}>
                    <IconBild icon={i} stil={stil} groesse={g} farbe={farbe.hex} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
