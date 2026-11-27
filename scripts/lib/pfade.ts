import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const wurzel = fileURLToPath(new URL('../../', import.meta.url));

export const PFADE = {
  wurzel,
  icons: join(wurzel, 'icons'),
  sperrliste: join(wurzel, 'icons', 'names.lock.json'),
  paket: join(wurzel, 'packages', 'icons'),
  reactVorlagen: join(wurzel, 'packages', 'icons', 'vorlagen'),
  dashboardDaten: join(wurzel, 'apps', 'dashboard', 'src', 'generated', 'icons.json'),
};
