import type { ButtonHTMLAttributes } from 'react';

/**
 * primaer: die eine Hauptaktion eines Bereichs (gefüllt, Brand Blue)
 * sekundaer: weitere Aktionen (Rahmen)
 * still: Nebenaktionen wie Kopieren oder Schließen (nur Text)
 */
type Variante = 'primaer' | 'sekundaer' | 'still';
type Groesse = 'normal' | 'klein';

export function Knopf({ variante = 'sekundaer', groesse = 'normal', ...rest }: { variante?: Variante; groesse?: Groesse } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'>) {
  return <button type="button" className="knopf" data-variante={variante} data-groesse={groesse} {...rest} />;
}
