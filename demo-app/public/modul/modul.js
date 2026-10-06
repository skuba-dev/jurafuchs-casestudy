'use strict';
// Oberfläche des Handschrift-Moduls. Modell, Statusfolge und Übergabetext: modell.js. Leser: leser.js (derzeit nur der Platzhalter-Leser).
// Design: Jurafuchs Design System (tokens.css, base.css, components.css). Genau ein Primary-Button pro Ansicht.
const SCHRITTE = ['1 · Seiten', '2 · Erkennung', '3 · Prüfen', '4 · Übergabe'];
const AMPEL = { gruen: 'Grün · in Ordnung', gelb: 'Gelb · Warnung', rot: 'Rot · Neuaufnahme nötig' };
const GLIEDERUNG = /^([A-Z]\.|[IVX]+\.|\d+\.|[a-z]\))\s/;
const $ = (s, r = document) => r.querySelector(s);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ansicht = $('#ansicht');
let st;

// Bausteine nach Design System
const knopf = (text, { id = '', primary = false, disabled = false, extra = '' } = {}) =>
  `<button class="jf-btn jf-btn--${primary ? 'primary' : 'secondary'}" ${id ? `id="${id}"` : ''} ${disabled ? 'disabled' : ''} ${extra}>${text}</button>`;
const link = (text, attr, disabled = false) => `<button class="linkknopf" ${attr} ${disabled ? 'disabled' : ''}>${text}</button>`;
const note = (label, body, ton = 'info') => `<div class="jf-note jf-note--${ton}" role="note"><div class="jf-note__label">${label}</div><div class="jf-note__body">${body}</div></div>`;
// Überschriften ohne Punkt. Ein Folgetext steht in einer eigenen Zeile darunter.
const kopf = (titel, folge = '') => `<h2>${titel}</h2>${folge ? `<p class="folge">${folge}</p>` : ''}`;
const platzhalter = text => `<div class="platzhalterbox" role="note"><strong>Platzhalter</strong><div>${text}</div></div>`;
// Der Sachverhalt liegt in dieser Demo nicht vor. Nichts erfinden: nur ein sichtbarer Platzhalter.
const SACHVERHALT = 'Hier stünde der Sachverhalt der Klausur. Er liegt in dieser Demo nicht vor.';
// Ansage für Screenreader. Die Ansicht wird bei jeder Aktion neu aufgebaut, deshalb liegt die Live-Region außerhalb (index.html).
const ansage = t => { const a = $('#ansage'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 60); };

function neu() {
  st = { schritt: 1, e: leereEinreichung(), meldungen: [], drag: null, ersetzeIdx: null, vollstaendig: false, seite: 0, zeile: null, edit: null, frage: false, aendOffen: false, erkennungLaeuft: false };
}

function blatt(s, aktiv, klein) {
  return `<div class="blatt ${klein ? 'klein' : ''}">${s.zeilen.map(z => {
    const r = z.rahmen;
    return `<i class="strich ${z.art} ${z.unsicher ? 'unsicher' : ''} ${aktiv === z.nr ? 'aktiv' : ''}" style="left:${r.x * 100}%;top:${r.y * 100}%;width:${r.b * 100}%;height:${r.h * 100}%"></i>`;
  }).join('')}<span class="blattlabel">Beispiel-Seitenbild · Platzhalter</span></div>`;
}

const zurueck = n => knopf('Zurück', { extra: `data-zu="${n}"` });
const bindeZurueck = () => ansicht.querySelectorAll('[data-zu]').forEach(b => b.onclick = () => { st.schritt = +b.dataset.zu; render(); });

// ---------- 1 Seiten (01-upload-flow.md) ----------
const MAX_BYTES = 10 * 1024 * 1024;   // Annahme aus 01: 10 MB je Datei. Die Qualitätsampel steht in ampel.js.
const typVon = f => f.type || ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf' }[f.name.split('.').pop().toLowerCase()] || '');
const ladeBild = src => new Promise((ok, fehler) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => fehler(new Error('kein gültiges Bild')); i.src = src; });

async function seiteAusDatei(f) {
  const typ = typVon(f) === 'application/pdf' ? 'pdf' : 'bild', url = URL.createObjectURL(f);
  const basis = { typ, name: f.name, bild_ref: url, erkennung_status: 'offen', zeilen: [] };
  if (typ === 'pdf') return { ...basis, qualitaet: 'gelb', hinweise: ['PDF wird nicht geprüft (Platzhalter-Ampel) und als eine Seite behandelt.'], werte: null };
  try { return { ...basis, ...messeBild(await ladeBild(url)) }; } catch (e) { URL.revokeObjectURL(url); throw e; }
}

const nummeriere = () => st.e.seiten.forEach((s, k) => { s.nr = k + 1; });

async function dateienHinzu(files, ersetze = null) {
  st.meldungen = []; st.laedt = true; render();
  const vorher = st.e.seiten.length;
  for (const f of files) {
    const typ = typVon(f);
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(typ)) { st.meldungen.push(`${f.name}: Format nicht erlaubt (nur JPG, PNG, PDF).`); continue; }
    if (f.size > MAX_BYTES) { st.meldungen.push(`${f.name}: größer als 10 MB, nicht aufgenommen.`); continue; }
    try {
      const seite = await seiteAusDatei(f);
      if (ersetze !== null) { URL.revokeObjectURL(st.e.seiten[ersetze].bild_ref); st.e.seiten[ersetze] = seite; ersetze = null; }
      else st.e.seiten.push(seite);
      if (st.e.status === 'entwurf') setzeStatus(st.e, 'seiten_hochgeladen');
    } catch (e) { st.meldungen.push(`${f.name}: konnte nicht gelesen werden (${e.message}).`); }
  }
  nummeriere(); st.vollstaendig = false; st.laedt = false; render();
  const neuSeiten = st.e.seiten.length - vorher;
  ansage(`${neuSeiten > 0 ? `${neuSeiten} Seite${neuSeiten > 1 ? 'n' : ''} aufgenommen.` : ersetze === null && !st.meldungen.length ? '' : 'Keine neue Seite aufgenommen.'}${st.meldungen.length ? ` ${st.meldungen.length} Meldung${st.meldungen.length > 1 ? 'en' : ''}, siehe unten.` : ''}`);
}

function ladeBeispielseiten() {
  const kopie = JSON.parse(JSON.stringify(BEISPIEL.seiten));
  kopie.forEach(s => { s.typ = 'beispiel'; s.name = `Beispielseite ${s.nr}`; s.hinweise = ['Beispielwert (Platzhalter)']; s.werte = null; });
  st.e.seiten.push(...kopie); nummeriere();
  if (st.e.status === 'entwurf') setzeStatus(st.e, 'seiten_hochgeladen');
  st.vollstaendig = false; render();
}

function miniatur(s) {
  if (s.typ === 'bild') return `<img class="thumb" src="${s.bild_ref}" alt="">`;
  if (s.typ === 'pdf') return '<div class="thumb pdfkachel" aria-hidden="true">PDF</div>';
  return blatt(s, null, true);
}

function schritt1() {
  const seiten = st.e.seiten, rot = seiten.filter(s => s.qualitaet === 'rot');
  const gesperrt = statusNr(st.e) >= STATUS.indexOf('erkennung_laeuft');   // nach dem Start der Erkennung keine Änderung mehr
  const erlaubt = '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf';
  ansicht.innerHTML = `
    ${platzhalter('Handy-Übergabe per QR-Code ist nicht gebaut. PDF zählt als eine Seite und wird nicht geprüft. Die Ampel-Schwellen sind ungeprüfte Annahmen. Gemessen werden nur Auflösung und Helligkeit.')}
    <div class="karte"><div class="fuss" style="margin-top:0"><strong>Einstieg</strong>
      ${knopf('Getippt abgeben', { disabled: true })} ${knopf('Handschriftlich abgeben', { extra: 'aria-current="true"' })}
      <details><summary>Sachverhalt ansehen</summary><div class="mut">Platzhalter · ${SACHVERHALT}</div></details></div></div>
    <div class="karte"><h2>Vor der Aufnahme</h2>
      <ul class="hinweise"><li>Tageslicht nutzen, Seite flach legen.</li><li>Ganze Seite im Bild, eine Seite pro Foto.</li><li>Keine Namen auf den Bögen.</li></ul>
      <div class="fuss">
        <label class="jf-btn jf-btn--secondary filelabel ${gesperrt ? 'aus' : ''}">Dateien wählen<input class="jf-visually-hidden" type="file" id="dateien" multiple accept="${erlaubt}" ${gesperrt ? 'disabled' : ''}></label>
        <span class="mut">JPG, PNG oder PDF · höchstens 10 MB je Datei</span>
        ${knopf('Per QR-Code', { disabled: true })}<span class="mut">Platzhalter · nicht gebaut</span>
        ${seiten.length || gesperrt ? '' : `${knopf('Beispielseiten laden', { id: 'beispiel' })}<span class="mut">Platzhalter</span>`}</div></div>
    ${st.laedt ? '<p class="mut" role="status">Dateien werden gelesen …</p>' : ''}
    ${st.meldungen.map(m => `<div class="meldung" role="alert">${esc(m)}</div>`).join('')}
    <input type="file" id="ersetzeDatei" accept="${erlaubt}" hidden>
    <p class="mut">${seiten.length ? 'Ordne die Seiten per Ziehen oder mit den Pfeiltasten (Zeile fokussieren).' : 'Noch keine Seiten.'}</p>
    <div class="zeilen">${seiten.map((s, i) => `
      <div class="seitenzeile" draggable="${!gesperrt}" tabindex="0" data-i="${i}">${miniatur(s)}
        <div class="grow"><strong>Seite ${s.nr}</strong> <span class="mut">· ${esc(s.name)}</span><br>
          <span class="ampel ${s.qualitaet}" aria-hidden="true"></span>${AMPEL[s.qualitaet]}${s.hinweise.length ? `<br><span class="mut">${s.hinweise.map(esc).join(' ')}</span>` : ''}</div>
        <div class="aktionen">
          ${link('Nach oben', `data-auf="${i}"`, gesperrt || i === 0)}
          ${link('Nach unten', `data-ab="${i}"`, gesperrt || i === seiten.length - 1)}
          ${link('Ersetzen', `data-ers="${i}"`, gesperrt)}
          ${link('Entfernen', `data-weg="${i}"`, gesperrt)}</div></div>`).join('')}</div>
    ${gesperrt ? '<p class="mut">Die Erkennung hat begonnen, die Seiten sind gesperrt. Für eine neue Klausur oben „Von vorn“.</p>' : ''}
    ${rot.length ? `<p class="mut"><strong>Seite ${rot.map(s => s.nr).join(' und ')} ${rot.length > 1 ? 'sind' : 'ist'} rot:</strong> neu aufnehmen oder ersetzen. Rot blockiert die Bestätigung, gelb nicht.</p>` : ''}
    <div class="fuss"><label><input type="checkbox" id="voll" ${st.vollstaendig || gesperrt ? 'checked' : ''} ${gesperrt || !seiten.length ? 'disabled' : ''}> Vollständig und Reihenfolge stimmt</label>
      ${knopf(gesperrt ? 'Weiter' : 'Erkennung starten', { id: 'weiter', primary: true, disabled: gesperrt ? false : !(st.vollstaendig && !rot.length && seiten.length) })}</div>`;
  const verschiebe = (von, nach) => {
    if (nach < 0 || nach >= seiten.length || von === nach) return;
    seiten.splice(nach, 0, seiten.splice(von, 1)[0]); nummeriere(); st.vollstaendig = false; render();
    const z = document.querySelector(`.seitenzeile[data-i="${nach}"]`); if (z) z.focus();
  };
  const dat = $('#dateien'); if (dat) dat.onchange = () => dateienHinzu([...dat.files]);
  const bsp = $('#beispiel'); if (bsp) bsp.onclick = ladeBeispielseiten;
  ansicht.querySelectorAll('[data-auf]').forEach(b => b.onclick = () => verschiebe(+b.dataset.auf, +b.dataset.auf - 1));
  ansicht.querySelectorAll('[data-ab]').forEach(b => b.onclick = () => verschiebe(+b.dataset.ab, +b.dataset.ab + 1));
  ansicht.querySelectorAll('[data-weg]').forEach(b => b.onclick = () => { const i = +b.dataset.weg; if (seiten[i].bild_ref && seiten[i].typ !== 'beispiel') URL.revokeObjectURL(seiten[i].bild_ref); seiten.splice(i, 1); nummeriere(); st.vollstaendig = false; render(); });
  ansicht.querySelectorAll('[data-ers]').forEach(b => b.onclick = () => { st.ersetzeIdx = +b.dataset.ers; $('#ersetzeDatei').click(); });
  $('#ersetzeDatei').onchange = e => { if (e.target.files[0]) dateienHinzu([e.target.files[0]], st.ersetzeIdx); };
  ansicht.querySelectorAll('.seitenzeile').forEach(z => {
    const i = +z.dataset.i;
    z.ondragstart = e => { st.drag = i; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); };
    z.ondragover = e => e.preventDefault();
    z.ondrop = e => { e.preventDefault(); if (st.drag !== null && !gesperrt) verschiebe(st.drag, i); st.drag = null; };
    z.onkeydown = e => {
      if (gesperrt || e.target !== z || !['ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault(); verschiebe(i, i + (e.key === 'ArrowUp' ? -1 : 1));
    };
  });
  $('#voll').onchange = e => { st.vollstaendig = e.target.checked; render(); };
  $('#weiter').onclick = () => {
    if (!gesperrt) { setzeStatus(st.e, 'qualitaet_geprueft'); setzeStatus(st.e, 'erkennung_laeuft'); }
    st.schritt = 2; render();
  };
}

// ---------- 2 Erkennung (02-texterkennung.md) ----------
const zeige = m => { if (st === m && st.schritt === 2) render(); };   // läuft "Von vorn" dazwischen, ignorieren wir den alten Stand

async function starteErkennung(mein) {
  for (const s of mein.e.seiten) {
    if (s.erkennung_status === 'fertig') continue;
    s.erkennung_status = 'laeuft'; zeige(mein);
    try {
      s.zeilen = await erkenne({ nr: s.nr, typ: s.typ, bild_ref: s.bild_ref });   // ein Aufruf je Seite
      s.erkennung_status = 'fertig'; delete s.fehler;
    } catch (err) { s.erkennung_status = 'fehlgeschlagen'; s.fehler = err.message; }
    zeige(mein);
    if (st === mein) ansage(s.erkennung_status === 'fertig' ? `Seite ${s.nr} gelesen.` : `Seite ${s.nr} fehlgeschlagen.`);
  }
  mein.erkennungLaeuft = false;
  const alle = mein.e.seiten.every(s => s.erkennung_status === 'fertig');
  if (alle && mein.e.status === 'erkennung_laeuft') setzeStatus(mein.e, 'pruefung_offen');
  zeige(mein);
  if (st === mein) ansage(alle ? 'Erkennung abgeschlossen. Weiter zur Prüfung möglich.' : 'Erkennung nicht vollständig. Fehlgeschlagene Seiten erneut lesen.');
}

function schritt2() {
  const seiten = st.e.seiten;
  if (!st.erkennungLaeuft && statusNr(st.e) < STATUS.indexOf('pruefung_offen') && !seiten.some(s => s.erkennung_status === 'fehlgeschlagen')) {
    st.erkennungLaeuft = true; starteErkennung(st);
  }
  const fehl = seiten.filter(s => s.erkennung_status === 'fehlgeschlagen');
  ansicht.innerHTML = `
    ${LESER.platzhalter ? platzhalter(`Beispiel-Transkript. Der ${esc(LESER.name)} liefert feste Beispielzeilen, es wird nichts aus den Bildern gelesen.`) : `<div class="karte">Leser · ${esc(LESER.name)}</div>`}
    <div class="karte"><h2>Erkennung, Seite für Seite</h2>
      ${seiten.map(s => `<div class="status"><span class="dot ${s.erkennung_status}" aria-hidden="true"></span>Seite ${s.nr} · ${{ offen: 'wartet', laeuft: 'läuft …', fertig: 'fertig', fehlgeschlagen: 'fehlgeschlagen' }[s.erkennung_status]}${s.fehler ? ` <span class="mut">· ${esc(s.fehler)}</span>` : ''}</div>`).join('')}</div>
    <div class="fuss">${zurueck(1)}${fehl.length ? knopf('Erneut lesen', { id: 'nochmal' }) : ''}
      ${knopf('Weiter zur Prüfung', { id: 'weiter', primary: true, disabled: statusNr(st.e) < STATUS.indexOf('pruefung_offen') })}</div>`;
  bindeZurueck();
  const n = $('#nochmal'); if (n) n.onclick = () => { fehl.forEach(s => { s.erkennung_status = 'offen'; }); render(); };
  $('#weiter').onclick = () => { st.schritt = 3; st.seite = 0; st.zeile = null; render(); };
}

// ---------- 3 Prüfen (03-unsicherheiten.md) ----------
const SCHWELLE_NEUAUFNAHME = 0.10;   // Annahme aus 03-unsicherheiten.md: mehr als 10 % unsichere Zeilen je Seite
const mitMarken = t => esc(t).replace(/\[\?\]/g, '<span class="u">[?]</span>');
const TAGS = { streichung: 'gestrichen', einfuegung: 'eingefügt', skizze: 'Skizze' };
const BEARBEITBAR = ['text', 'einfuegung'];
const zeileVon = (si, nr) => st.e.seiten[si].zeilen.find(z => z.nr === nr);
const offeneStellen = () => st.e.seiten.flatMap((s, si) => s.zeilen.filter(z => z.unsicher).map(z => ({ si, z })));
const istBestaetigt = () => statusNr(st.e) >= STATUS.indexOf('bestaetigt');   // danach keine Änderung mehr, der Text ist berechnet
const zeitKurz = iso => iso.slice(11, 19);

function logAenderung(si, z, vorher, nachher) {
  st.e.aenderungen.push({ seite: st.e.seiten[si].nr, zeile: z.nr, vorher, nachher, zeit: new Date().toISOString() });
}

// Übernimmt den Inhalt des Eingabefelds. text_roh bleibt unberührt, geschrieben wird text_bestaetigt plus ein Eintrag in aenderungen.
function commitEdit() {
  if (!st.edit) return;
  const { si, nr } = st.edit, feld = $('#editfeld');
  st.edit = null;
  if (!feld) return;
  const z = zeileVon(si, nr), neuText = feld.value;
  if (neuText === z.text_bestaetigt) return;
  logAenderung(si, z, z.text_bestaetigt, neuText);
  z.text_bestaetigt = neuText;
  z.unsicher = /\[\?\]/.test(neuText) || istOhneMarke(z);
  if (!z.unsicher) delete z.grund;
  ansage(`Zeile ${z.nr} übernommen. ${offeneStellen().length} offene Stellen.`);
}

function waehle(si, nr) {
  commitEdit();
  st.seite = si; st.zeile = nr;
  const z = zeileVon(si, nr);
  st.edit = !istBestaetigt() && BEARBEITBAR.includes(z.art) && !istOhneMarke(z) ? { si, nr } : null;
  render();
  const f = $('#editfeld');
  if (f) { f.focus(); const i = f.value.indexOf('[?]'); if (i >= 0) f.setSelectionRange(i, i + 3); }
  const el = document.querySelector(`[data-z="${nr}"]`); if (el) el.scrollIntoView({ block: 'nearest' });
}

// Echte Bilder und PDFs werden unverändert gezeigt. Die Stelle wird markiert, wenn der Leser einen rahmen liefert
// und er kein Platzhalter ist: Die Rahmen der Beispielzeilen passen nicht zu einem echten Bild.
function seitenbild(s) {
  const hinweis = LESER.platzhalter ? `<p class="hinweistext">Platzhalter · die Zeilen sind Beispiele und passen nicht zu diesem ${s.typ === 'pdf' ? 'PDF' : 'Bild'}. Keine Stellenmarkierung.</p>` : '';
  const z = s.zeilen.find(x => x.nr === st.zeile);
  const r = !LESER.platzhalter && s.typ === 'bild' && z && z.rahmen;
  if (s.typ === 'bild') return `<div class="bildwrap"><img class="vollbild" src="${s.bild_ref}" alt="Seite ${s.nr}">${r ? `<i class="rahmenmarke" style="left:${r.x * 100}%;top:${r.y * 100}%;width:${r.b * 100}%;height:${r.h * 100}%"></i>` : ''}</div>${hinweis}`;
  if (s.typ === 'pdf') return `<embed class="pdfansicht" src="${s.bild_ref}" type="application/pdf">${hinweis}`;
  return blatt(s, st.zeile, false);
}

function zeilenHtml(z, bestaetigt) {
  const aktiv = st.zeile === z.nr ? 'aktiv' : '';
  const editiert = st.edit && st.edit.si === st.seite && st.edit.nr === z.nr;
  const inhalt = editiert ? `<input id="editfeld" aria-label="Zeile ${z.nr} bearbeiten" value="${esc(z.text_bestaetigt)}" autocomplete="off">` : `<span class="txt">${mitMarken(z.text_bestaetigt)}</span>`;
  const aktion = bestaetigt ? '' :
    z.art === 'streichung' ? link('Wiederherstellen', `data-rest="${z.nr}"`) :
    z.art === 'text' && z.art_roh === 'streichung' ? link('Wieder streichen', `data-wieder="${z.nr}"`) : '';
  const fokus = BEARBEITBAR.includes(z.art) && !bestaetigt ? 'tabindex="0" role="button"' : '';
  return `<div class="tz ${z.art} ${aktiv}" ${fokus} data-z="${z.nr}"><span class="nr">${z.nr}</span>${inhalt}${TAGS[z.art] ? `<span class="tag">${TAGS[z.art]}</span>` : ''}${aktion}</div>`;
}

function schritt3() {
  const seiten = st.e.seiten, s = seiten[st.seite], offen = offeneStellen(), bestaetigt = istBestaetigt();
  const gl = seiten.flatMap((sx, si) => sx.zeilen.filter(z => z.art === 'text' && GLIEDERUNG.test(z.text_bestaetigt)).map(z => ({ si, z })));
  const raender = s.zeilen.filter(z => z.art === 'randnotiz');
  const ohneMarke = s.zeilen.filter(istOhneMarke);
  const imText = s.zeilen.filter(z => z.art !== 'randnotiz' && !istOhneMarke(z));
  const unsicher = s.zeilen.filter(z => z.unsicher).length;
  const neuaufnahme = unsicher / s.zeilen.length > SCHWELLE_NEUAUFNAHME;
  const nOffen = zaehleOffene(baueTextFuerKorrektur(st.e)), nOhne = ohneMarkeOffen(st.e);
  // Linke Spalte wie im bestehenden Editor: Sachverhalt, darunter Übersicht (offene Stellen, Gliederung, Änderungen).
  const links = `<section class="spalte links">
        ${kopf('Sachverhalt')}
        ${platzhalter(SACHVERHALT)}
        <h2>Offene Stellen <span class="zaehl">${offen.length}</span></h2>
        <ul class="liste">${offen.length ? offen.map(o => `<li tabindex="0" role="button" data-sp="${o.si}:${o.z.nr}">Seite ${seiten[o.si].nr} · Zeile ${o.z.nr}: ${istOhneMarke(o.z) ? '<em>Einfügung ohne Marke</em>' : mitMarken(o.z.text_bestaetigt)}</li>`).join('') : '<li class="offen-ok">Keine offenen Stellen</li>'}</ul>
        ${kopf('Gliederung', 'Wörtlich, ohne Ebenen')}
        <ul class="liste">${gl.map(g => `<li tabindex="0" role="button" data-sp="${g.si}:${g.z.nr}">${esc(g.z.text_bestaetigt)}</li>`).join('')}</ul>
        <details id="aend" ${st.aendOffen ? 'open' : ''}><summary>Änderungen (${st.e.aenderungen.length})</summary>
          <ul class="liste aend">${st.e.aenderungen.map(a => `<li>Seite ${a.seite} · Zeile ${a.zeile} · ${zeitKurz(a.zeit)}<br><span class="mut">Vorher:</span> ${esc(a.vorher)}<br><span class="mut">Nachher:</span> ${esc(a.nachher)}</li>`).join('') || '<li class="mut">Noch keine.</li>'}</ul></details>
      </section>`;
  ansicht.innerHTML = `
    ${LESER.platzhalter ? platzhalter('Beispiel-Transkript. Feste Beispielzeilen, nichts aus Bildern gelesen.') : ''}
    <div class="drei">
      ${links}
      <section class="spalte bild"><h2>Seitenbild</h2>
        <div class="tabs">${seiten.map((x, i) => `<button class="jf-btn jf-btn--secondary tab ${i === st.seite ? 'aktiv' : ''}" data-s="${i}" ${i === st.seite ? 'aria-current="true"' : ''}>Seite ${x.nr}</button>`).join('')}</div>
        ${seitenbild(s)}</section>
      <section class="spalte"><h2>Transkript</h2>
        ${note('Hinweis', 'Korrigiere nur, was du so geschrieben hast, nicht deine Fehler. Zeile anklicken zum Bearbeiten, Enter übernimmt, Esc verwirft.')}
        ${neuaufnahme ? note('Neuaufnahme vorschlagen', `Mehr als 10 % der Zeilen dieser Seite sind unsicher (${unsicher} von ${s.zeilen.length}). Die Schwelle ist eine Annahme.`) : ''}
        ${imText.map(z => zeilenHtml(z, bestaetigt)).join('')}
        ${ohneMarke.length ? `<div class="gelbblock"><strong>Einfügung ohne Marke</strong><p class="folge">Sie steht nicht im Text, bis du sie einsetzt.</p>
          ${ohneMarke.map(z => `<div class="tz einfuegung ${st.zeile === z.nr ? 'aktiv' : ''}" data-z="${z.nr}"><span class="txt">${esc(z.text_bestaetigt)}</span></div>
            <div class="einsetzen"><label for="pos${z.nr}">Einsetzen nach</label> <select id="pos${z.nr}" data-pos="${z.nr}" ${bestaetigt ? 'disabled' : ''}><option value="0">Seitenanfang</option>${imText.map(x => `<option value="${x.nr}">Zeile ${x.nr}</option>`).join('')}</select>
            ${link('Einsetzen', `data-setze="${z.nr}"`, bestaetigt)}</div>`).join('')}</div>` : ''}
        ${raender.length ? `<div class="randblock"><strong>Randnotizen dieser Seite</strong><p class="folge">Sie stehen nicht im Text, außer du nimmst sie mit.</p>
          ${raender.map(z => `<div class="tz randnotiz ${st.zeile === z.nr ? 'aktiv' : ''}" data-z="${z.nr}"><span class="txt">${esc(z.text_bestaetigt)}</span><label class="tag"><input type="checkbox" data-mit="${z.nr}" ${z.mitnehmen ? 'checked' : ''} ${bestaetigt ? 'disabled' : ''}> mitnehmen</label></div>`).join('')}</div>` : ''}
      </section>
    </div>
    ${st.frage ? `<div class="karte frage" role="alertdialog" aria-label="Vor der Bestätigung" tabindex="-1"><strong>Vor der Bestätigung</strong>
      ${nOffen ? `<div>${nOffen} Stellen bleiben als unleserlich markiert.</div>` : ''}
      ${nOhne ? `<div>${nOhne} Einfügung${nOhne > 1 ? 'en' : ''} ohne Marke ${nOhne > 1 ? 'werden' : 'wird'} nicht eingesetzt.</div>` : ''}
      <div class="fuss">${knopf('Zurück zur Prüfung', { id: 'nein' })}${knopf('Trotzdem bestätigen', { id: 'ja', primary: true })}</div></div>` : ''}
    <div class="fuss">${zurueck(2)}${st.frage ? '' : knopf(bestaetigt ? 'Weiter zur Übergabe' : 'Transkript bestätigen', { id: 'weiter', primary: true })}</div>`;
  ansicht.querySelectorAll('[data-zu]').forEach(b => b.onclick = () => { commitEdit(); st.schritt = +b.dataset.zu; render(); });
  ansicht.querySelectorAll('.tab').forEach(b => b.onclick = () => { commitEdit(); st.seite = +b.dataset.s; st.zeile = null; render(); });
  ansicht.querySelectorAll('.tz').forEach(el => {
    el.onmousedown = e => {
      if (e.target.closest('button, input, select, label')) return;
      e.preventDefault(); waehle(st.seite, +el.dataset.z);
    };
    el.onkeydown = e => { if (e.key === 'Enter' && e.target === el) { e.preventDefault(); waehle(st.seite, +el.dataset.z); } };
  });
  ansicht.querySelectorAll('[data-rest]').forEach(b => b.onclick = () => {
    commitEdit(); const z = zeileVon(st.seite, +b.dataset.rest);
    z.art_roh = z.art_roh || z.art; z.art = 'text';
    logAenderung(st.seite, z, `[gestrichen] ${z.text_bestaetigt}`, z.text_bestaetigt); render();
  });
  ansicht.querySelectorAll('[data-wieder]').forEach(b => b.onclick = () => {
    commitEdit(); const z = zeileVon(st.seite, +b.dataset.wieder); z.art = 'streichung';
    logAenderung(st.seite, z, z.text_bestaetigt, `[gestrichen] ${z.text_bestaetigt}`); render();
  });
  ansicht.querySelectorAll('[data-mit]').forEach(c => c.onchange = () => {
    commitEdit(); const z = zeileVon(st.seite, +c.dataset.mit); z.mitnehmen = c.checked;
    logAenderung(st.seite, z, c.checked ? 'Randnotiz nicht mitnehmen' : 'Randnotiz mitnehmen', c.checked ? 'Randnotiz mitnehmen' : 'Randnotiz nicht mitnehmen'); render();
  });
  ansicht.querySelectorAll('[data-setze]').forEach(b => b.onclick = () => {
    commitEdit();
    const nr = +b.dataset.setze, nach = +$(`[data-pos="${nr}"]`).value, zl = s.zeilen, z = zeileVon(st.seite, nr);
    zl.splice(zl.indexOf(z), 1);
    const idx = nach === 0 ? 0 : zl.findIndex(x => x.nr === nach) + 1;
    zl.splice(idx, 0, z);
    zl.forEach((x, k) => { x.nr = k + 1; });
    z.unsicher = /\[\?\]/.test(z.text_bestaetigt); delete z.grund;
    logAenderung(st.seite, z, '(Einfügung ohne Marke, nicht eingesetzt)', nach === 0 ? '(eingesetzt am Seitenanfang)' : `(eingesetzt nach Zeile ${nach})`);
    st.zeile = z.nr; render();
  });
  ansicht.querySelectorAll('[data-sp]').forEach(li => {
    li.onmousedown = e => { e.preventDefault(); const [si, nr] = li.dataset.sp.split(':').map(Number); waehle(si, nr); };
    li.onkeydown = e => { if (e.key === 'Enter') { const [si, nr] = li.dataset.sp.split(':').map(Number); waehle(si, nr); } };
  });
  $('#aend').ontoggle = e => { st.aendOffen = e.target.open; };
  const f = $('#editfeld');
  if (f) f.onkeydown = e => {
    if (e.key !== 'Enter' && e.key !== 'Escape') return;
    e.preventDefault();
    if (e.key === 'Enter') commitEdit(); else st.edit = null;
    render();
    const zeileEl = document.querySelector(`.tz[data-z="${st.zeile}"]`); if (zeileEl) zeileEl.focus({ preventScroll: true });   // Fokus zurück auf die Zeile
  };
  if (st.frage) {
    $('#nein').onclick = () => { st.frage = false; render(); $('#weiter').focus(); };
    $('#ja').onclick = () => { st.frage = false; bestaetige(st.e); st.schritt = 4; render(); };
    if (st.frageFokus) { st.frageFokus = false; $('.frage').focus(); }   // Fokus in die Rückfrage, damit sie nicht überlesen wird
  }
  const w = $('#weiter');
  if (w) w.onclick = () => {
    commitEdit();
    if (bestaetigt) { st.schritt = 4; render(); return; }
    if ((zaehleOffene(baueTextFuerKorrektur(st.e)) || ohneMarkeOffen(st.e)) && !st.frage) { st.frage = true; st.frageFokus = true; render(); return; }
    bestaetige(st.e); st.schritt = 4; render();
  };
}

// ---------- 4 Übergabe ----------
function schritt4() {
  const e = st.e, eingereicht = e.status === 'eingereicht';
  ansicht.innerHTML = `
    ${LESER.platzhalter ? platzhalter('Beispiel-Transkript. Der Text ist aus den Beispielzeilen berechnet, nicht aus Bildern gelesen.') : ''}
    <div class="karte"><h2>Text für die Korrektur</h2>
      <p>Feld <code>text_fuer_korrektur</code> · offene <code>[?]</code> im Text: <strong>${e.offene_unsichere_stellen}</strong>. Bilder gehen nie mit.</p></div>
    <pre>${esc(e.text_fuer_korrektur)}</pre>
    <div class="karte">Ab hier übernimmt die bestehende Korrektur (nicht Teil dieses Moduls).
      ${eingereicht ? `<br><span class="mut">Als eingereicht markiert am ${esc(new Date(e.eingereicht_am).toLocaleString('de-DE'))}. Es wurde nichts gesendet.</span>` : ''}</div>
    <div class="fuss">${zurueck(3)}${knopf('Als eingereicht markieren', { id: 'einreichen', primary: true, disabled: eingereicht })}<span class="mut">Platzhalter · es wird nichts gesendet</span></div>`;
  bindeZurueck();
  $('#einreichen').onclick = () => { setzeStatus(st.e, 'eingereicht'); render(); };
}

// ---------- Rahmen ----------
// Ein Schritt ist nur erreichbar, wenn der Status es hergibt. Schritt 4 also nur nach der Bestätigung.
const MIN_STATUS = ['seiten_hochgeladen', 'erkennung_laeuft', 'pruefung_offen', 'bestaetigt'];
// Die Ansicht wird bei jeder Aktion neu aufgebaut. Damit Tastaturnutzer:innen nicht jedes Mal oben neu anfangen, merken wir uns
// das fokussierte Element und setzen den Fokus danach zurück. Bei einem Schrittwechsel geht der Fokus auf den Inhaltsbereich.
let letzterSchritt = 1;
function fokusSchluessel(el) {
  if (!el || el === document.body || el === ansicht) return null;
  if (el.id) return `#${el.id}`;
  const a = [...el.attributes].find(x => x.name.startsWith('data-'));
  return a ? `[${a.name}="${a.value}"]` : null;
}
function render() {
  const merke = fokusSchluessel(document.activeElement);
  while (st.schritt > 1 && statusNr(st.e) < STATUS.indexOf(MIN_STATUS[st.schritt - 1])) st.schritt--;
  $('#schritte').innerHTML = SCHRITTE.map((t, i) => `<li ${i + 1 === st.schritt ? 'aria-current="step"' : ''} class="${i + 1 === st.schritt ? 'aktiv' : i + 1 < st.schritt ? 'erledigt' : ''}">${t}</li>`).join('');
  $('#statuschip').innerHTML = `Status · <strong>${st.e.status}</strong>`;
  $('#modus').innerHTML = LESER.platzhalter ? '<span class="badge">Beispieldaten · nichts wird gelesen</span>' : '';
  [schritt1, schritt2, schritt3, schritt4][st.schritt - 1]();
  if (st.schritt !== letzterSchritt) { letzterSchritt = st.schritt; ansicht.focus({ preventScroll: true }); window.scrollTo(0, 0); ansage(`Schritt ${st.schritt} von 4.`); }
  else if (merke) { const el = document.querySelector(merke); if (el && !el.disabled && el !== document.activeElement) el.focus({ preventScroll: true }); }
}
$('#vonvorn').onclick = () => { neu(); render(); };
window.__st = () => st;
neu();
render();
