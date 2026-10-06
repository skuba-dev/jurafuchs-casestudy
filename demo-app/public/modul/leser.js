'use strict';
// Leser-Schnittstelle (02-texterkennung.md). Jede Seite wird einzeln gelesen, der Leser ist austauschbar.
//
//   erkenne(seitenbild) -> Promise<Zeile[]>        seitenbild = { nr, typ, bild_ref }
//
// Ein Leser ist ein Objekt { name, platzhalter, lese(seitenbild) -> Promise<Rohzeile[]> } mit
//   Rohzeile = { text, art, unsicher, grund?, rahmen?, mitnehmen? }
// Das ist das Format, das ein Vision-Leser laut Prompt in 02 liefern würde (text, art, unsicher, grund).
// Den Rest einer Zeile (nr, text_roh, text_bestaetigt, quelle) füllt erkenne() einheitlich.
// Es gibt keine Nachbearbeitung durch ein Sprachmodell.

// ---------- Platzhalter-Leser ----------
// Liefert für jede Seite dieselben festen Beispielzeilen, frei erfunden, nichts davon ist aus einem Bild gelesen.
// Enthält je eine Zeile der Arten text, streichung, einfuegung, randnotiz, skizze, drei Stellen mit [?]
// und eine Einfügung ohne Marke. Die Fehler ("adequat", § 832 im Ergebnis) sind Absicht: Sie müssen wörtlich stehen bleiben.
const BEISPIELZEILEN = [
  ['text', 'A. Anspruch des A gegen B aus § 823 Abs. 1 BGB'],
  ['text', 'A könnte gegen B einen Anspruch auf Schadensersatz haben.'],
  ['text', 'I. Rechtsgutsverletzung'],
  ['text', 'Das Eigentum des A am Fahrrad wurde durch die Beschädigung verletzt.'],
  ['streichung', 'Das Fahrrad gehörte dem B.'],
  ['text', 'II. Verletzungshandlung'],
  ['text', 'Das Umwerfen des Fahrrads ist eine Handlung. Sie war kausal und auch adequat.'],
  ['einfuegung', 'Nach der conditio sine qua non Formel hätte der Schaden sonst nicht auftreten dürfen.'],
  ['text', 'III. Rechtswidrigkeit'],
  ['text', 'Rechtfertigungsgründe sind nicht [?].', { unsicher: true, grund: 'unleserlich' }],
  ['text', 'B handelte fahrlässig, § [?] Abs. 2 BGB.', { unsicher: true, grund: 'unleserlich' }],
  ['skizze', '[Skizze]'],
  ['text', 'Ein Mitverschulden des A liegt nicht vor [?]', { unsicher: true, grund: 'unklar_gestrichen' }],
  ['text', 'B. Ergebnis'],
  ['text', 'A kann von B Schadensersatz aus § 832 Abs. 1 BGB verlangen.'],
  ['einfuegung', 'Ein Schuldausschließungsgrund liegt nicht vor.', { unsicher: true, grund: 'marke_fehlt' }],
  ['randnotiz', 'Mitverschulden prüfen?'],
];

const platzhalterLeser = {
  name: 'Platzhalter-Leser',
  platzhalter: true,
  async lese() {
    await new Promise(ok => setTimeout(ok, 700));   // sichtbare Arbeitszeit, damit der Fortschritt zu sehen ist
    return BEISPIELZEILEN.map(([art, text, extra = {}], k) => {
      const rand = art === 'randnotiz' || extra.grund === 'marke_fehlt';
      return {
        text, art, ...extra,
        rahmen: rand ? { x: 0.64, y: 0.04 + k * 0.052, b: 0.3, h: 0.03 }
                     : { x: 0.08, y: 0.04 + k * 0.052, b: Math.min(0.84, 0.15 + text.length * 0.009), h: 0.03 },
      };
    });
  },
};

// ---------- Die eine Stelle, an der der Leser gewählt wird ----------
let LESER = platzhalterLeser;

// ---------- Schnittstelle nach außen ----------
async function erkenne(seitenbild) {
  const roh = await LESER.lese(seitenbild);
  return roh.map((z, k) => ({
    nr: k + 1,
    text_roh: z.text,                       // Ausgabe des Lesers, wird nie überschrieben
    text_bestaetigt: z.text,
    art: z.art,
    unsicher: !!z.unsicher || /\[\?\]/.test(z.text),
    ...(z.grund ? { grund: z.grund } : {}),
    ...(z.art === 'randnotiz' ? { mitnehmen: false } : {}),
    ...(z.rahmen ? { rahmen: z.rahmen } : {}),
    quelle: LESER.name,
  }));
}
