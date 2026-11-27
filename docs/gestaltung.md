# Gestaltung der Ceha-Icons

Stil „Präziser Stahl“: technisch, klar, schlicht – wie sauber gekantetes Blech. Keine harten 0-mm-CAD-Ecken und nicht verspielt-rundgelutscht.

**Hauptstil ist die Fläche** (seit 27.11.2026): durchgefärbte Formen im 64er-Raster, Details als Aussparung. Die Kontur im 24er-Raster ist Altbestand. Sie steht nur noch dort ein, wo die Fläche noch nicht gezeichnet ist, und wird nicht weiter ausgebaut.

## Prinzipien

1. **Klar vor eigen.** Bekannte Bilder bleiben wie Verkehrszeichen sofort lesbar (Uhr, Schild, Personen, Lkw, Kalender). Eigen sind Proportion, Konstruktion und die Blech-Details, nicht die Metapher.
2. **Ceha-Welt vor Allerwelt.** Produktmotive zeigen das echte Produkt in Frontansicht: Doppelspind mit Lüftungsschlitzen, Flügeltürschrank, Schließfachanlage, Wertfachschrank mit vielen Fächern, Etagenbett mit Leiter. Alle Ceha-Schränke stehen auf geschlossenem Sockel (keine Füße).
3. **Konstante Grundform + feste Modifier.** Varianten behalten ihre Grundform und wechseln nur ein klares Merkmal (z. B. Fahrtlinien links für Express). Lieferzustände wie *montiert* / *zerlegt* bleiben produktneutral.
4. **Knapp & gleich schwer.** Nur die Details, an denen man das Motiv erkennt. Alle Icons wirken im Testblatt (Konfigurator → Ansicht → Testblatt) gleich dunkel. Schmale Hochformate (Spinde, Regale) brauchen dafür eher etwas mehr Breite als mehr Details.
5. **Optisch ausrichten.** Nicht nur rechnerisch zentrieren. Was optisch tief hängt, nach oben setzen, und umgekehrt.

## Fläche (Hauptstil)

Die Werte sind aus den freigegebenen Beispielen abgeleitet (Ordner „04 – ceha icons“ im Marketing-Standard).

| Regel | Wert |
|---|---|
| Raster | 64 × 64, `viewBox="0 0 64 64"` |
| Aufbau | Nur Fläche, keine Striche. Innere Details sind Aussparungen (`fill-rule="evenodd"` im selben Pfad). |
| Farbe | `fill="currentColor"` an der Wurzel, sonst keine Farbangaben |
| Randzone | 4 Einheiten frei nach außen, Inhalt zwischen 4 und 60 |
| Standlinie | Möbel stehen unten auf **y = 59,5**. Kleine Möbel sind niedriger, nicht höher gesetzt. |
| Schrank-Aufbau | Abdeckplatte oben (rund 2,2 hoch), Fuge, Türblätter, Fuge, geschlossener Sockel bis 59,5 |
| Fugen zwischen Bauteilen | 1,3–1,5 (Abdeckung, Türen, Sockel, Fächer) |
| Radien („Blech-Biegung“) | 1,0–1,4 an Möbeln und Schränken; 2,0–3,6 an Piktogrammen (USPs: Schild, Kalender, Stecker) |
| Kleine Details | Schlitze ≥ 1,0 hoch, Schlösser als Punkt r ≈ 1,0 |
| Koordinaten | 0,05er-Schritte, bevorzugt ganze und Zehntel-Werte |

### Größen

1 Einheit sind bei 24 px nur 0,375 px. Fugen, Lüftungsschlitze und Lochbleche lösen sich deshalb unter 32 px auf. Die Produkt-Icons sind für **32 px und größer** gedacht (Kacheln, Kategorien, Datenblätter, Druck). In kleinen UI-Größen (Buttons, Listen) wirken die USP-Piktogramme besser, weil sie gröber gebaut sind.

### Bekannte Abweichungen in den übernommenen Zeichnungen

- `archive` (Doppelspind): steht auf Füßen statt auf geschlossenem Sockel.
- `feuerwehrspind`: als Rahmen mit ausgesparten Türen gebaut, ohne Abdeckplatte und Sockel; der Helm ragt 0,4 in die Randzone (Build-Warnung).
- `aktenregal`, `kleiderschrank-wohnheim`: ebenfalls als Rahmen gebaut statt aus Türblättern.
- Schmale Spinde (Doppel-, Feuerwehrspind, `lagerregal`) wirken neben den USP-Piktogrammen deutlich heller.

## Kontur (Altbestand)

Gilt nur noch für Icons ohne Fläche. Neue Motive werden nicht mehr als Kontur gezeichnet.

| Regel | Wert |
|---|---|
| Raster | 24 × 24, `viewBox="0 0 24 24"` |
| Strich | 1,35, mittig, runde Enden und Ecken |
| Radien | 1,0–1,25 an Außenkanten technischer Objekte; 0,75–1,0 an kleinen Details; 1,5–3,5 an weichen Formen |
| Sockel | Schränke stehen auf geschlossenem Sockel (`y = 19,25` bis `21,5`) |
| Maße | Koordinaten auf 0,25er-Schritten |
| Abstand | Zwischen zwei Strichen mindestens 1,25 frei |
| Randzone | 1 Einheit frei nach außen |
| Punkte / Schlösser | gefüllter `<circle r="0.65" fill="currentColor" stroke="none"/>` |

## Text, Zahlen und Prüfzeichen

- **Kein `<text>`** im SVG (wird technisch abgelehnt).
- **Ziffern:** Höchstens 1–2 Ziffern, als konstruierte Form (z. B. `step-1` bis `step-8`: Ziffer als Aussparung im Kreis).
- **Marken & Prüfzeichen (TÜV, GS):** Gehören nicht ins Icon-Raster (rechtlich geschützt und klein nicht lesbar). Im UI steht das neutrale `shield-check` neben dem Text; offizielle Siegel werden als zugelassene Original-SVGs separat eingebunden.

## Technisch geprüft (`pnpm check`)

- Fläche: Wurzel `viewBox="0 0 64 64" fill="currentColor"`, keine `stroke`-, `stroke-width`-, `stroke-linecap`- oder `stroke-linejoin`-Angaben.
- Kontur: Wurzel `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"`.
- Erlaubte Elemente: `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, `polygon`, `g`.
- Nicht erlaubt: feste Farben, `clip-rule`, `transform`, `style`, `class`, `id`, Text, Bilder, Masken, Verläufe.
- Nichts ragt über das Raster. Eigene Icons halten die Randzone ein (Warnung).
- Jedes Icon hat mindestens eine Zeichnung; fehlt die Fläche, steht die Kontur ein.

Quellen der Prinzipien: Streamline, „The five rules of good icon design“; Helena Zhang, „7 Principles of Icon Design“ (UX Collective).
