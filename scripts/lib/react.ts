import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FertigesIcon } from './ausgabe.ts';

/** Kebab-case → PascalCase, wie lucide-react: "building-2" → "Building2" */
export function komponentenName(name: string): string {
  return name
    .split('-')
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join('');
}

/**
 * Erzeugt die React-Komponenten. Die Schnittstelle folgt lucide-react
 * (size, color, strokeWidth, absoluteStrokeWidth, className), damit ein Wechsel
 * nur den Import ändert. Zusätzlich: variant="solid" (Standard) | "outline".
 */
export function schreibeReact(paketDir: string, vorlagenDir: string, icons: FertigesIcon[]): void {
  const dir = join(paketDir, 'react');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  copyFileSync(join(vorlagenDir, 'create-icon.js'), join(dir, 'create-icon.js'));
  copyFileSync(join(vorlagenDir, 'create-icon.d.ts'), join(dir, 'create-icon.d.ts'));

  const js = ["import { createIcon } from './create-icon.js';", ''];
  const dts = ["import type { CehaIcon } from './create-icon.js';", "export type { CehaIcon, CehaIconProps } from './create-icon.js';", ''];
  const namen: string[] = [];

  for (const icon of icons) {
    const k = komponentenName(icon.name);
    const teil = (stil: 'outline' | 'solid') => {
      const s = icon.stile[stil];
      return s ? { wurzel: s.wurzel, knoten: s.knoten, raster: s.raster } : null;
    };
    const outline = teil('outline');
    const solid = teil('solid');
    js.push(`export const ${k} = /*#__PURE__*/ createIcon(${JSON.stringify(icon.name)}, ${JSON.stringify(outline)}, ${JSON.stringify(solid)});`);
    dts.push(`/** ${icon.eintrag.titel} – ceha:${icon.name} */`, `export declare const ${k}: CehaIcon;`);
    for (const alias of icon.eintrag.aliases) {
      const ka = komponentenName(alias);
      js.push(`export { ${k} as ${ka} };`);
      dts.push(`/** Alias von ${k} */`, `export declare const ${ka}: CehaIcon;`);
    }
    namen.push(icon.name);
  }
  js.push('', `export const iconNames = ${JSON.stringify(namen)};`);
  dts.push('', `export type CehaIconName = ${namen.map((n) => JSON.stringify(n)).join(' | ')};`, 'export declare const iconNames: CehaIconName[];');

  writeFileSync(join(dir, 'index.js'), js.join('\n') + '\n');
  writeFileSync(join(dir, 'index.d.ts'), dts.join('\n') + '\n');
}
