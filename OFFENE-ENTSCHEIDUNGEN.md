# Offene Entscheidungen, Platzhalter und Lücken
Stand 2026-10-06. Die Empfehlungen sind Vorschläge, entschieden ist davon nichts.

## 1. Zuerst entscheiden (ändert, was gebaut wird)

| Entscheidung | Warum offen | Empfehlung |
|---|---|---|
| **Wer liest die Seiten?** | Der Vision-Leser fehlt, weil kein Zugang gesetzt ist. Bisher wurde nichts echt gelesen. | Ein Standardmodell hinter der vorhandenen Schnittstelle. Zugang nur als Umgebungsvariable. Modellwahl per Pilot (A2). |
| **Datenschutz (B14)** | Im Echtbetrieb gehen Klausurfotos an einen Dritten, im Seitenkopf stehen Namen. Das Löschen der Bilder nach der Korrektur ist nur eine Empfehlung, die Freigabe fehlt (A21). | Vor dem ersten Test mit echten Klausuren klären, nicht danach. |
| **Anschluss an die Korrektur** | Es ist ungeklärt, ob die Korrektur ein einzelnes Textfeld liest (A19) und ob sie eine Längengrenze hat (A7). „Als eingereicht markieren“ sendet nichts. | Zuerst klären, denn es kann den Ansatz kippen. |
| **Was geschieht mit `[?]` am Ende?** | Das Konzept (E4) wollte „[unleserlich]“. Die Demo reicht `[?]` unverändert weiter, nach Rückfrage. Ob die Korrektur `[?]` neutral behandelt, ist ungetestet (A16). | A16 testen, dann eine Form festlegen. |
| **Gliederung mit oder ohne Ebenen?** | Entschieden war: Ebenen aus der Nummerierung ableiten (E2, E3). Die Demo gibt die Gliederung wörtlich ohne Ebenen weiter (spätere Vorgabe). Offen ist, ob der Editor die Nummerierung im Text speichert (A11) und ob das die Aufbau-Note verschiebt (A10). | Einen Beispiel-Export vom Team holen, dann entscheiden. |
| **Erfolgsmaß und Testmaterial** | Der Zielwert für die stille Fehlerrate (M1) ist nicht festgelegt. Es gibt kein Gold-Transkript und im Teststack keine Jura-Seite mit „§“. | Zielwert vor dem Pilot festlegen. Klären, wer die Jura-Seiten schreibt. Pilot freigeben (B16). |

## 2. Platzhalter im Produkt

- **Sachverhalt:** nur Text „liegt nicht vor“. Offen ist die Quelle im Klausurenkurs.
- **Qualitätsampel:**
  - Die Schwellen sind ungeprüft und erzeugen auf den Testseiten Fehlalarme.
  - Die Ampel prüft nur das Foto, nicht die Lesbarkeit der Schrift. Offen ist, ob die Erkennung selbst ein Lesbarkeitsmaß liefert (A18).
  - Auch die 10-%-Schwelle für den Neuaufnahme-Vorschlag ist eine Annahme.
- **PDF:** zählt als eine Seite, wird nicht geprüft. Offen ist, ob es in Einzelseiten zerlegt wird.
- **QR-Code-Übergabe vom Handy:** nur ein deaktivierter Knopf. Offen ist, ob Desktop mit Handyfoto überhaupt der Normalfall ist (A12).
- **Beispielzeilen:** Sie zeigen alle Arten von Stellen. Das Feld `konfidenz` bleibt leer (A13).
- **Leseprompt:** liegt nur in der Konzeptvorgabe, noch nicht im Code.
- **Marke:** Wortmarke, Maskottchen und die Hausschrift fehlen.

## 3. Lücken im Verhalten

- **Keine Speicherung:** Ein Neuladen verliert alles. Offen ist, ob und wo ein Entwurf gespeichert wird.
- **HEIC und WebP** werden abgelehnt. iPhones liefern oft HEIC, das könnte Nutzer:innen ausbremsen.
- **Doppelseiten, schräge Fotos und Fremdtext im Bild** werden nicht behandelt. Eine Testseite mit Nachbarseite und Hintergrundtext ging ohne Hinweis durch die Ampel.
- **Nach dem Start der Erkennung** sind Seiten gesperrt. Offen ist, ob eine einzelne Seite danach ersetzt werden darf.
- **Randnotizen:** Das Konzept sah das Einsetzen an der Verweisstelle vor (E3), die Demo nimmt sie als eigenen Block ans Seitenende.
- **Korrekturen der Nutzer:innen:** Offen ist, ob sie im Prüfschritt eigene Fehler wegkorrigieren (A17). Das Änderungsprotokoll liegt nur im Speicher und wird nirgends ausgewertet.
- **Einbindung in den Klausurenkurs:** Die Weiche `eingabe_typ` mit Standard „getippt“, Login und Zugang zum Einreichen fehlen.
- **Kosten, Laufzeit und Dateigrenzen:** Messung steht aus (A8, A20). Die 10 MB je Datei sind eine Annahme.
- **Mobile Schriftgrößen:** Das Design System definiert keine. Ein echter Screenreader-Test fehlt.

## 4. Für das Repository selbst

- **Lizenz:** Es ist keine gewählt. Ohne Lizenz gilt „alle Rechte vorbehalten“.
- **Browser-Tests in der Pipeline:** Die Browser-Tests laufen nur von Hand. Eine Pipeline bräuchte dafür einen Headless-Browser.
- **Erste Iteration:** `demo-app/public/index.html` ist veraltet und kann entfernt werden, wenn niemand sie braucht.
