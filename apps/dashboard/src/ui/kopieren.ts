/**
 * Kopiert Text in die Zwischenablage. Verweigert der Browser die Clipboard-API
 * (z. B. in eingebetteten Ansichten oder ohne HTTPS), wird der ältere Weg über
 * ein unsichtbares Textfeld versucht. Gibt zurück, ob das Kopieren geklappt hat.
 */
export async function kopiere(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const feld = document.createElement('textarea');
    feld.value = text;
    feld.setAttribute('readonly', '');
    feld.style.position = 'fixed';
    feld.style.opacity = '0';
    document.body.append(feld);
    feld.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      feld.remove();
    }
  }
}
