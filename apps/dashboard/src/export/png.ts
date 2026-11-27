/** Rendert ein SVG im Browser zu PNG mit transparentem Hintergrund. */
export async function pngBlob(svg: string, groesse: number): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const bild = new Image(groesse, groesse);
    bild.src = url;
    await bild.decode();
    const canvas = document.createElement('canvas');
    canvas.width = groesse;
    canvas.height = groesse;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas nicht verfügbar');
    ctx.drawImage(bild, 0, 0, groesse, groesse);
    return await new Promise((ok, fehler) => canvas.toBlob((b) => (b ? ok(b) : fehler(new Error('PNG fehlgeschlagen'))), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}
