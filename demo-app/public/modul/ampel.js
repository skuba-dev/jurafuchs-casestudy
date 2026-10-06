'use strict';
// Qualitätsampel für hochgeladene Seitenbilder (01-upload-flow.md).
// Gemessen werden nur Auflösung (kurze Kante) und mittlere Helligkeit. Die Ampel sagt nichts über die Lesbarkeit der Schrift.
// Sie warnt nur: Rot blockiert die Bestätigung im Ablauf, Gelb nicht. Das Bild wird nie verändert, nur gemessen.

// PLATZHALTER: ungeprüfte Startwerte. Auf den vier Handschrift-Testseiten ergeben sie Grün, Gelb, Gelb (ANNAHMEN.md, Nr. 50 und 51).
// Zu helle Bilder werden nicht bewertet, weil weißes Papier hell ist.
const SCHWELLEN = { kanteRot: 400, kanteGelb: 800, hellRot: 50, hellGelb: 90 };

// Reine Bewertung aus zwei Messwerten. Getrennt von der Messung, damit sie ohne Bild testbar ist.
function bewerteQualitaet(kante, hell) {
  const hinweise = [];
  let qualitaet = 'gruen';
  if (kante < SCHWELLEN.kanteRot) { qualitaet = 'rot'; hinweise.push(`Auflösung zu niedrig: kurze Kante ${kante} px.`); }
  else if (kante < SCHWELLEN.kanteGelb) { qualitaet = 'gelb'; hinweise.push(`Auflösung knapp: kurze Kante ${kante} px.`); }
  if (hell < SCHWELLEN.hellRot) { qualitaet = 'rot'; hinweise.push(`Zu dunkel: Helligkeit ${hell} von 255.`); }
  else if (hell < SCHWELLEN.hellGelb) { if (qualitaet === 'gruen') qualitaet = 'gelb'; hinweise.push(`Eher dunkel: Helligkeit ${hell} von 255.`); }
  return { qualitaet, hinweise };
}

// Misst ein geladenes Bild (Image-Element) auf einer verkleinerten Kopie.
function messeBild(img) {
  const sk = Math.min(1, 400 / img.naturalWidth), w = Math.max(1, Math.round(img.naturalWidth * sk)), h = Math.max(1, Math.round(img.naturalHeight * sk));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data; let sum = 0;
  for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  const kante = Math.min(img.naturalWidth, img.naturalHeight), hell = Math.round(sum / (w * h));
  return { ...bewerteQualitaet(kante, hell), werte: { kurzeKantePx: kante, helligkeit: hell }, breite: img.naturalWidth, hoehe: img.naturalHeight };
}
