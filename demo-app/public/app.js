'use strict';
// PLATZHALTER: ungeprüfte Startwerte für den Qualitätscheck. Sie warnen nur, sie sperren nie.
const SCHWELLEN = { kurzeKantePx: 1000, helligkeitMin: 60, kontrastMin: 20, schaerfeMin: 10, querformatFaktor: 1.2 };
const ERLAUBT = ['image/jpeg', 'image/png', 'application/pdf'];
const SCHRITTE = [['upload', '1 Upload'], ['qualitaet', '2 Qualitätscheck'], ['pruefung', '3 Transkript prüfen'], ['uebergabe', '4 Übergabe']];
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf';

const $ = (s, r = document) => r.querySelector(s);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ansicht = $('#ansicht');

let klausur, aktuelle, meldungen, modus = { erkennung: 'platzhalter' }, zaehler = 0;

function neu() {
  klausur = { eingabe_typ: 'handschrift', seiten: [], transkript_roh: '', transkript_bestaetigt: null, unsichere_stellen: [], status: 'upload' };
  aktuelle = 0;
  meldungen = [];
}

// ---------- Upload ----------
const lies = f => new Promise((ok, fehler) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => fehler(new Error('Lesefehler')); r.readAsDataURL(f); });
const ladeBild = src => new Promise((ok, fehler) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => fehler(new Error('kein gültiges Bild')); i.src = src; });
const typVon = f => f.type || ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf' }[f.name.split('.').pop().toLowerCase()] || '');

async function dateienHinzu(files) {
  meldungen = [];
  for (const f of files) {
    const typ = typVon(f);
    if (!ERLAUBT.includes(typ)) { meldungen.push(`${f.name}: Format nicht erlaubt (nur JPG, PNG, PDF).`); continue; }
    try {
      if (typ === 'application/pdf') await pdfSeiten(f);
      else seiteHinzu(f.name, await lies(f), await ladeBild(await lies(f)));
    } catch (e) { meldungen.push(`${f.name}: konnte nicht gelesen werden (${e.message}).`); }
  }
  render();
}

function seiteHinzu(name, bild, img) {
  klausur.seiten.push({ id: 's' + (++zaehler), name, bild, breite: img.naturalWidth, hoehe: img.naturalHeight, qualitaet: null, roh: '', platzhalter: false, randnotizen: [], editorHtml: '' });
}

async function pdfSeiten(f) {
  if (!window.pdfjsLib) {
    await new Promise((ok, fehler) => { const s = document.createElement('script'); s.src = PDFJS + '.min.js'; s.onload = ok; s.onerror = () => fehler(new Error('pdf.js nicht ladbar, Internet nötig')); document.head.appendChild(s); });
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + '.worker.min.js';
  }
  const pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise;
  // pdf.js rendert über requestAnimationFrame, das in verdeckten Tabs nie feuert. Für die Umwandlung ersetzen wir es durch setTimeout.
  const raf = window.requestAnimationFrame;
  window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 0);
  try {
    for (let n = 1; n <= pdf.numPages; n++) {
      const seite = await pdf.getPage(n);
      const vp = seite.getViewport({ scale: 2 });
      const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
      await seite.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
      const url = c.toDataURL('image/jpeg', 0.9);
      seiteHinzu(`${f.name} · S. ${n}`, url, await ladeBild(url));
    }
  } finally { window.requestAnimationFrame = raf; }
}

function verschiebe(i, d) {
  const j = i + d; if (j < 0 || j >= klausur.seiten.length) return;
  [klausur.seiten[i], klausur.seiten[j]] = [klausur.seiten[j], klausur.seiten[i]];
  render();
}

function viewUpload() {
  ansicht.innerHTML = `
    <label class="drop" id="drop">
      <strong>Fotos oder Scans hierher ziehen oder klicken</strong><br>
      <span class="mut">JPG, PNG, PDF. Eine Seite je Bild, Reihenfolge unten änderbar.</span>
      <input type="file" id="datei" multiple accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf">
    </label>
    ${meldungen.map(m => `<div class="meldung">${esc(m)}</div>`).join('')}
    <div class="liste">${klausur.seiten.map((s, i) => `
      <div class="zeile"><img src="${s.bild}" alt=""><div class="grow"><strong>Seite ${i + 1}</strong><br><span class="mut">${esc(s.name)} · ${s.breite}×${s.hoehe} px</span></div>
        <button class="sek klein" data-auf="${i}" ${i === 0 ? 'disabled' : ''}>▲</button>
        <button class="sek klein" data-ab="${i}" ${i === klausur.seiten.length - 1 ? 'disabled' : ''}>▼</button>
        <button class="sek klein" data-weg="${i}">Entfernen</button></div>`).join('')}</div>
    <button id="weiter" ${klausur.seiten.length ? '' : 'disabled'}>Weiter: Qualitätscheck</button>`;
  const d = $('#drop'), inp = $('#datei');
  inp.onchange = () => dateienHinzu([...inp.files]);
  d.ondragover = e => { e.preventDefault(); d.classList.add('ueber'); };
  d.ondragleave = () => d.classList.remove('ueber');
  d.ondrop = e => { e.preventDefault(); d.classList.remove('ueber'); dateienHinzu([...e.dataTransfer.files]); };
  ansicht.querySelectorAll('[data-auf]').forEach(b => b.onclick = () => verschiebe(+b.dataset.auf, -1));
  ansicht.querySelectorAll('[data-ab]').forEach(b => b.onclick = () => verschiebe(+b.dataset.ab, 1));
  ansicht.querySelectorAll('[data-weg]').forEach(b => b.onclick = () => { klausur.seiten.splice(+b.dataset.weg, 1); render(); });
  $('#weiter').onclick = () => { meldungen = []; klausur.status = 'qualitaet'; render(); };
}

// ---------- Qualitätscheck ----------
async function messen(s) {
  const img = await ladeBild(s.bild);
  const sk = Math.min(1, 800 / img.naturalWidth), w = Math.round(img.naturalWidth * sk), h = Math.round(img.naturalHeight * sk);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data, g = new Float32Array(w * h);
  let sum = 0, sum2 = 0;
  for (let i = 0; i < w * h; i++) { const v = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; g[i] = v; sum += v; sum2 += v * v; }
  const helligkeit = sum / (w * h), kontrast = Math.sqrt(Math.max(0, sum2 / (w * h) - helligkeit * helligkeit));
  let n = 0, m = 0, m2 = 0;
  for (let yy = 1; yy < h - 1; yy++) for (let xx = 1; xx < w - 1; xx++) {
    const i = yy * w + xx, l = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w];
    n++; m += l; m2 += l * l;
  }
  const schaerfe = m2 / n - (m / n) ** 2;
  const kurz = Math.min(s.breite, s.hoehe), hin = [];
  if (kurz < SCHWELLEN.kurzeKantePx) hin.push(`Niedrige Auflösung: kurze Kante ${kurz} px (Platzhalter-Schwelle ${SCHWELLEN.kurzeKantePx}).`);
  if (s.breite > s.hoehe * SCHWELLEN.querformatFaktor) hin.push('Querformat: Doppelseite? Besser eine Seite je Bild hochladen (automatisches Teilen ist nicht gebaut).');
  if (helligkeit < SCHWELLEN.helligkeitMin) hin.push('Bild sehr dunkel.');
  if (kontrast < SCHWELLEN.kontrastMin) hin.push('Kontrast niedrig.');
  if (schaerfe < SCHWELLEN.schaerfeMin) hin.push('Möglicherweise unscharf.');
  return { werte: { helligkeit: Math.round(helligkeit), kontrast: Math.round(kontrast), schaerfe: Math.round(schaerfe * 10) / 10 }, hinweise: hin };
}

async function viewQualitaet() {
  const offen = klausur.seiten.filter(s => !s.qualitaet);
  if (offen.length) {
    ansicht.innerHTML = '<p>Prüfe Seiten …</p>';
    for (const s of offen) s.qualitaet = await messen(s);
    if (klausur.status !== 'qualitaet') return;
  }
  ansicht.innerHTML = `
    <p class="mut">Der Check warnt nur, er sperrt nie. Die Schwellen sind <strong>Platzhalter-Annahmen</strong>, nicht validiert. Er prüft das Foto, nicht die Lesbarkeit der Schrift.</p>
    ${meldungen.map(m => `<div class="meldung">${esc(m)}</div>`).join('')}
    <div class="liste">${klausur.seiten.map((s, i) => `
      <div class="zeile"><img src="${s.bild}" alt=""><div class="grow"><strong>Seite ${i + 1}</strong> <span class="mut">${esc(s.name)}</span><br>
        ${s.qualitaet.hinweise.length ? s.qualitaet.hinweise.map(h => `<span class="hinweis">⚠ ${esc(h)}</span>`).join('<br>') : '<span class="ok">Keine Auffälligkeit gemessen</span>'}<br>
        <span class="mut">${s.breite}×${s.hoehe} px · Helligkeit ${s.qualitaet.werte.helligkeit} · Kontrast ${s.qualitaet.werte.kontrast} · Schärfemaß ${s.qualitaet.werte.schaerfe}</span></div>
        <button class="sek klein" data-weg="${i}">Entfernen</button></div>`).join('')}</div>
    <p id="fortschritt" class="mut"></p>
    <button class="sek" id="zurueck">Zurück zum Upload</button>
    <button id="weiter" ${klausur.seiten.length ? '' : 'disabled'}>Erkennung starten und weiter</button>`;
  ansicht.querySelectorAll('[data-weg]').forEach(b => b.onclick = () => { klausur.seiten.splice(+b.dataset.weg, 1); if (!klausur.seiten.length) klausur.status = 'upload'; render(); });
  $('#zurueck').onclick = () => { klausur.status = 'upload'; render(); };
  $('#weiter').onclick = erkennen;
}

// ---------- Erkennung ----------
function verkleinert(s) {
  return ladeBild(s.bild).then(img => {
    const sk = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * sk); c.height = Math.round(img.naturalHeight * sk);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.9);
  });
}

function htmlAusText(text, seiteId) {
  let k = 0;
  return text.split(/(\[\?\])/).map(t => {
    if (t !== '[?]') return esc(t);
    const id = `${seiteId}-u${++k}`;
    klausur.unsichere_stellen.push({ id, seite_id: seiteId, status: 'offen', wert: null });
    return `<span class="u offen" data-id="${id}">[?]</span>`;
  }).join('');
}

async function erkennen() {
  $('#weiter').disabled = true; $('#zurueck').disabled = true;
  klausur.unsichere_stellen = [];
  try {
    for (let i = 0; i < klausur.seiten.length; i++) {
      const s = klausur.seiten[i];
      $('#fortschritt').textContent = `Erkenne Seite ${i + 1} von ${klausur.seiten.length} …`;
      const r = await fetch('/api/erkennen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seite_nr: i + 1, bild: await verkleinert(s) }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.fehler || r.status);
      s.roh = j.text; s.platzhalter = !!j.platzhalter;
      s.randnotizen = (j.randnotizen || []).map(t => ({ text: t, mit: false }));
      s.editorHtml = htmlAusText(j.text, s.id);
    }
  } catch (e) {
    meldungen = [`Erkennung abgebrochen: ${e.message}`];
    render(); return;
  }
  klausur.transkript_roh = klausur.seiten.map(s => s.roh).join('\n\n');
  aktuelle = 0; meldungen = []; klausur.status = 'pruefung'; render();
}

// ---------- Prüfen ----------
const wurzel = s => { const d = document.createElement('div'); d.innerHTML = s.editorHtml; return d; };
const spanStatus = el => el.textContent === '[?]' ? 'offen' : el.textContent === '[unleserlich]' ? 'unleserlich' : 'geklaert';
const offeneIn = s => (wurzel(s).textContent.match(/\[\?\]/g) || []).length;
const offeneGesamt = () => klausur.seiten.reduce((a, s) => a + offeneIn(s), 0);
const speichern = () => { const e = $('#editor'); if (e) klausur.seiten[aktuelle].editorHtml = e.innerHTML; };

function aktualisiere() {
  speichern();
  document.querySelectorAll('#editor .u').forEach(el => { el.className = 'u ' + spanStatus(el); });
  klausur.seiten.forEach((s, i) => { const z = $(`#tab${i} .zaehl`); const n = offeneIn(s); z.textContent = n; z.classList.toggle('null', n === 0); });
  const gesamt = offeneGesamt();
  $('#gesamt').textContent = gesamt ? `${gesamt} ${gesamt === 1 ? 'offene unsichere Stelle' : 'offene unsichere Stellen'} insgesamt` : 'Keine offenen unsicheren Stellen';
  $('#weiter').disabled = gesamt > 0 || !$('#ok').checked;
}

function viewPruefung() {
  const s = klausur.seiten[aktuelle];
  ansicht.innerHTML = `
    ${klausur.seiten.some(x => x.platzhalter) ? '<div class="platzhalterbox">PLATZHALTER: Dieses Transkript ist ein Beispieltext, nicht aus dem Bild gelesen (kein API-Zugang). Er passt nicht zum Bild links.</div>' : ''}
    <div class="tabs">${klausur.seiten.map((x, i) => `<button class="tab ${i === aktuelle ? 'aktiv' : ''}" id="tab${i}" data-i="${i}">Seite ${i + 1}<span class="zaehl"></span></button>`).join('')}</div>
    <div class="zwei">
      <section class="bild"><img src="${s.bild}" alt="Seite ${aktuelle + 1}"></section>
      <section>
        <div class="leiste"><strong id="gesamt"></strong>
          <button class="sek klein" id="naechste">Nächste unsichere Stelle</button>
          <button class="sek klein" id="allUnl">Offene dieser Seite als [unleserlich] übernehmen</button></div>
        <div id="editor" contenteditable="plaintext-only" spellcheck="false"></div>
        <p class="mut">Gelb: offen. Stelle anklicken und die gelesene Lösung eintippen, oder löschen, oder bewusst als [unleserlich] übernehmen. Alles andere bleibt wörtlich, auch Fehler.</p>
        <fieldset class="rand"><legend>Randnotizen dieser Seite (eigener Block)</legend>
          ${s.randnotizen.length ? s.randnotizen.map((r, k) => `<label><input type="checkbox" data-rn="${k}" ${r.mit ? 'checked' : ''}> mit übergeben: „${esc(r.text)}“</label><br>`).join('') : '<span class="mut">Keine erkannt.</span>'}
          <div class="mut">Randnotizen gehen nur mit, wenn angehakt.</div></fieldset>
      </section>
    </div>
    <div class="fuss"><label><input type="checkbox" id="ok"> Ich habe das Transkript mit den Bildern verglichen. Es gibt meine Klausur wörtlich wieder, auch Fehler.</label>
      <button id="weiter" disabled>Bestätigen und übergeben</button></div>`;
  const ed = $('#editor');
  ed.innerHTML = s.editorHtml;
  ed.oninput = aktualisiere;
  ed.onclick = e => { const u = e.target.closest('.u'); if (u) { const r = document.createRange(); r.selectNodeContents(u); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); } };
  $('#ok').onchange = aktualisiere;
  ansicht.querySelectorAll('.tab').forEach(b => b.onclick = () => { speichern(); aktuelle = +b.dataset.i; viewPruefung(); });
  ansicht.querySelectorAll('[data-rn]').forEach(c => c.onchange = () => { s.randnotizen[+c.dataset.rn].mit = c.checked; });
  $('#naechste').onclick = () => { const u = [...ed.querySelectorAll('.u')].find(el => el.textContent === '[?]'); if (u) { u.scrollIntoView({ block: 'center' }); u.click(); } };
  $('#allUnl').onclick = () => { ed.querySelectorAll('.u').forEach(el => { if (el.textContent === '[?]') el.textContent = '[unleserlich]'; }); aktualisiere(); };
  $('#weiter').onclick = bestaetigen;
  aktualisiere();
}

function bestaetigen() {
  speichern();
  const stand = {};
  klausur.seiten.forEach(s => wurzel(s).querySelectorAll('.u').forEach(el => { stand[el.dataset.id] = { status: spanStatus(el), wert: el.textContent }; }));
  klausur.unsichere_stellen.forEach(u => {
    const z = stand[u.id];
    if (!z) { u.status = 'geloescht'; u.wert = ''; } else { u.status = z.status; u.wert = z.status === 'geklaert' ? z.wert : null; }
  });
  klausur.seiten.forEach(s => {
    const mit = s.randnotizen.filter(r => r.mit).map(r => `- ${r.text}`);
    s.endtext = wurzel(s).textContent.trim() + (mit.length ? `\n\nRandnotizen:\n${mit.join('\n')}` : '');
  });
  klausur.transkript_bestaetigt = klausur.seiten.map(s => s.endtext).join('\n\n');
  klausur.status = 'uebergabe';
  render();
}

// ---------- Übergabe ----------
function viewUebergabe() {
  const z = st => klausur.unsichere_stellen.filter(u => u.status === st).length;
  const json = JSON.stringify(klausur, (k, v) => ['bild', 'editorHtml', 'endtext'].includes(k) ? undefined : v, 2);
  ansicht.innerHTML = `
    ${klausur.seiten.some(x => x.platzhalter) ? '<div class="platzhalterbox">PLATZHALTER: Der Text stammt aus Beispiel-Transkripten, nicht aus den hochgeladenen Bildern.</div>' : ''}
    <div class="karte"><strong>Bestätigt.</strong> Übergeben wird ausschließlich der folgende Text. Keine Bilder.<br>
      <span class="mut">Unsichere Stellen: ${klausur.unsichere_stellen.length} erkannt, ${z('geklaert')} ersetzt, ${z('unleserlich')} bewusst „[unleserlich]“, ${z('geloescht')} gelöscht, ${z('offen')} offen.</span></div>
    <pre id="text">${esc(klausur.transkript_bestaetigt)}</pre>
    <div class="fuss"><button class="sek" id="kopieren">Text kopieren</button>
      <button disabled title="Korrektur ist nicht angebunden">An Korrektur senden (Platzhalter, nicht angebunden)</button></div>
    <details><summary>Zustand im Speicher (Datenmodell, ohne Bilder)</summary><pre>${esc(json)}</pre></details>`;
  $('#kopieren').onclick = async () => { try { await navigator.clipboard.writeText(klausur.transkript_bestaetigt); $('#kopieren').textContent = 'Kopiert'; } catch { $('#kopieren').textContent = 'Kopieren nicht möglich'; } };
}

// ---------- Rahmen ----------
function render() {
  $('#schritte').innerHTML = SCHRITTE.map(([k, t]) => `<li class="${k === klausur.status ? 'aktiv' : ''}">${t}</li>`).join('');
  const m = $('#modus');
  m.className = 'badge ' + modus.erkennung;
  m.textContent = modus.erkennung === 'api' ? `Erkennung: ${modus.modell} (API)` : 'Erkennung: PLATZHALTER (kein API-Zugang)';
  ({ upload: viewUpload, qualitaet: viewQualitaet, pruefung: viewPruefung, uebergabe: viewUebergabe })[klausur.status]();
}

$('#vonvorn').onclick = () => { neu(); render(); };
neu();
fetch('/api/status').then(r => r.json()).then(j => { modus = j; render(); }).catch(() => render());
window.__klausur = () => klausur;
