// Handgeschriebene Vorlage. Der Build kopiert sie nach react/create-icon.js.
import { createElement, forwardRef } from 'react';

const camel = (k) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function reactAttrs(attrs) {
  const aus = {};
  for (const [k, v] of Object.entries(attrs)) aus[camel(k)] = v;
  return aus;
}

/**
 * @typedef {{ wurzel: Record<string, string>, knoten: Array<[string, Record<string, string>]>, raster: number }} Teil
 * @param {string} name
 * @param {Teil | null} outline
 * @param {Teil | null} solid
 */
export function createIcon(name, outline, solid) {
  const Icon = forwardRef(function CehaIcon(
    { size = 24, color = 'currentColor', strokeWidth, absoluteStrokeWidth = false, variant = 'solid', className, title, children, ...rest },
    ref,
  ) {
    // Fläche ist der Hauptstil. Fehlt der gewünschte Stil, steht der andere ein.
    const teil = (variant === 'outline' ? outline ?? solid : solid ?? outline);
    const wurzel = reactAttrs(teil.wurzel);
    // Strichstärke gibt es nur bei der Kontur; die Fläche hat keine Striche.
    const breite = wurzel.strokeWidth === undefined ? undefined : strokeWidth ?? wurzel.strokeWidth;
    return createElement(
      'svg',
      {
        ref,
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox: `0 0 ${teil.raster} ${teil.raster}`,
        ...wurzel,
        strokeWidth: breite === undefined ? undefined : absoluteStrokeWidth ? (Number(breite) * teil.raster) / Number(size) : breite,
        color: color === 'currentColor' ? undefined : color,
        className: ['ceha-icon', `ceha-icon-${name}`, className].filter(Boolean).join(' '),
        'aria-hidden': title ? undefined : true,
        role: title ? 'img' : undefined,
        ...rest,
      },
      title ? createElement('title', null, title) : null,
      ...teil.knoten.map(([tag, attrs], i) => createElement(tag, { key: i, ...reactAttrs(attrs) })),
      children,
    );
  });
  Icon.displayName = name;
  return Icon;
}
