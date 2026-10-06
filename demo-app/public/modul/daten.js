'use strict';
// BEISPIELSEITEN (Platzhalter): nur Ampelwerte. Die Zeilen liefert der Leser (leser.js).
const BEISPIEL = {
  seiten: [
    { nr: 1, bild_ref: '(Platzhalter)', qualitaet: 'gruen', erkennung_status: 'offen', zeilen: [] },
    { nr: 2, bild_ref: '(Platzhalter)', qualitaet: 'gelb', erkennung_status: 'offen', zeilen: [] },
    { nr: 3, bild_ref: '(Platzhalter)', qualitaet: 'rot', erkennung_status: 'offen', zeilen: [] },
  ],
};

// Leere Einreichung: Ausgangspunkt für den Upload.
const leereEinreichung = () => ({
  id: 'einreichung-1', eingabe_typ: 'handschrift', status: 'entwurf', text_fuer_korrektur: '',
  offene_unsichere_stellen: 0, aenderungen: [], seiten: [],
});
