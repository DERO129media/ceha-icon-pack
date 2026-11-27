import type { ButtonHTMLAttributes } from 'react';

type Variante = 'primaer' | 'sekundaer' | 'still';

export function Knopf({ variante = 'sekundaer', ...rest }: { variante?: Variante } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'>) {
  return <button type="button" className="knopf" data-variante={variante} {...rest} />;
}
