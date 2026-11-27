import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const wurzel = fileURLToPath(new URL('../../', import.meta.url));

/**
 * Baut das Pack neu, sobald sich in icons/ etwas ändert, und lädt das Dashboard neu.
 * Schlägt die Prüfung fehl, zeigt das Dashboard die Meldungen als Overlay.
 */
function iconsBeobachten(): Plugin {
  let laeuft = false;
  let nochmal = false;
  return {
    name: 'ceha-icons-beobachten',
    configureServer(server) {
      const bauen = () => {
        laeuft = true;
        nochmal = false;
        let ausgabe = '';
        const build = spawn(process.execPath, ['scripts/build.ts'], { cwd: wurzel });
        build.stdout.on('data', (d) => (ausgabe += d));
        build.stderr.on('data', (d) => (ausgabe += d));
        build.on('exit', (code) => {
          laeuft = false;
          server.config.logger.info(ausgabe.trim());
          if (nochmal) return bauen();
          if (code === 0) server.ws.send({ type: 'full-reload' });
          else server.ws.send({ type: 'error', err: { message: `Icon-Prüfung fehlgeschlagen\n\n${ausgabe.trim()}`, stack: '' } });
        });
      };
      server.watcher.add(`${wurzel}icons`);
      server.watcher.on('all', (_art, pfad) => {
        if (!pfad.startsWith(`${wurzel}icons`)) return;
        if (laeuft) nochmal = true;
        else bauen();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), iconsBeobachten()],
  server: { port: 5180 },
});
