'use strict';
// Datenmodell und Übergabe laut 04-integration.md. Alles im Speicher.
//   Einreichung { id, eingabe_typ, status, text_fuer_korrektur, eingereicht_am?, offene_unsichere_stellen, seiten[], aenderungen[] }
//   Seite       { nr, bild_ref, qualitaet, erkennung_status, zeilen[] }
//   Zeile       { nr, text_roh, text_bestaetigt, art, unsicher, grund?, mitnehmen?, rahmen?, konfidenz?, quelle }
//   Aenderung   { seite, zeile, vorher, nachher, zeit }
const STATUS = ['entwurf', 'seiten_hochgeladen', 'qualitaet_geprueft', 'erkennung_laeuft', 'pruefung_offen', 'bestaetigt', 'eingereicht'];
const statusNr = e => STATUS.indexOf(e.status);

// Statuswechsel nur in der Reihenfolge oben. "eingereicht" ist damit nur aus "bestaetigt" erreichbar.
function setzeStatus(e, neu) {
  if (STATUS.indexOf(neu) !== statusNr(e) + 1) throw new Error(`Statuswechsel ${e.status} -> ${neu} nicht erlaubt`);
  e.status = neu;
  if (neu === 'eingereicht') e.eingereicht_am = new Date().toISOString();
}

// Einziger Input der Korrektur: reiner Text, ohne Seitenmarken, ohne Bilder.
function baueTextFuerKorrektur(e) {
  const aus = [];
  for (const s of [...e.seiten].sort((a, b) => a.nr - b.nr)) {
    for (const z of [...s.zeilen].sort((a, b) => a.nr - b.nr)) {
      if (z.art === 'einfuegung' && z.grund === 'marke_fehlt') continue;   // noch nicht von der Nutzer:in eingesetzt
      if (z.art === 'text' || z.art === 'einfuegung') aus.push(z.text_bestaetigt);
      else if (z.art === 'randnotiz' && z.mitnehmen) aus.push(z.text_bestaetigt);
      else if (z.art === 'skizze') aus.push('[Skizze]');
      // streichung und nicht mitgenommene randnotiz entfallen
    }
  }
  return aus.join('\n');
}

const zaehleOffene = text => (text.match(/\[\?\]/g) || []).length;
const istOhneMarke = z => z.art === 'einfuegung' && z.grund === 'marke_fehlt';
const ohneMarkeOffen = e => e.seiten.reduce((a, s) => a + s.zeilen.filter(istOhneMarke).length, 0);

// Bestätigung: erst hier entsteht text_fuer_korrektur. Nur aus "pruefung_offen" möglich.
function bestaetige(e) {
  setzeStatus(e, 'bestaetigt');
  e.text_fuer_korrektur = baueTextFuerKorrektur(e);
  e.offene_unsichere_stellen = zaehleOffene(e.text_fuer_korrektur);
}
