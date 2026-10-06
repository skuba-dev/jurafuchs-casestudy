# ANNAHMEN · Demo-App Handschrift-Klausur
Stand 2026-10-06. Jede Zeile ist eine Entscheidung, die ich ohne Rückfrage getroffen habe.

## Technik
1. Annahme: Server in der Python-Standardbibliothek statt Node, weil Node hier nicht installiert ist und Python 3.12 schon. Oberfläche in reinem JavaScript, ohne Build und ohne Abhängigkeiten. Start: `py demo-app/server.py`.
2. Annahme: Zustand nur im Browser-Speicher, Neuladen verliert alles (Vorgabe). Der Server speichert nichts.
3. Annahme: PDF-Seiten werden im Browser mit pdf.js 3.11.174 von cdnjs in JPEG umgewandelt, Maßstab 2. Dafür ist Internet nötig.
4. Annahme: Die PDF-Umwandlung ersetzt `requestAnimationFrame` kurzzeitig durch `setTimeout`. Ohne das hängt sie in verdeckten Tabs ohne Meldung (im Testrun beobachtet).
5. Annahme: Upload-Format wird am MIME-Typ geprüft, ersatzweise an der Endung. WebP und HEIC werden abgelehnt (Vorgabe: nur JPG, PNG, PDF). Die Testdatei 2.webp wird deshalb abgelehnt.

## Qualitätscheck
6. Annahme: Der Check warnt nur und sperrt nie (Konzept E5). **Platzhalter-Schwellen, ungeprüft:** kurze Kante 1000 px, Helligkeit mindestens 60, Kontrast mindestens 20, Schärfemaß mindestens 10 (Laplace-Varianz bei 800 px Breite), Querformat ab Faktor 1,2. Auf dem Test-Stack erzeugt die Auflösungsschwelle Fehlalarme (S3 war lesbar) und S1 geht ohne Hinweis durch.
7. Annahme: Die Prüfung „überbelichtet“ ist entfernt, weil weißes Papier einen hohen Helligkeitsmittel hat (Scan S3: 243).
8. Annahme: Doppelseiten werden nur über den Querformat-Hinweis erkannt. Automatisches Teilen ist nicht gebaut.

## Erkennung
9. Annahme: Ohne `ANTHROPIC_API_KEY` liefert der Server ein frei erfundenes Beispiel-Transkript (zwei Texte im Wechsel) mit absichtlichen Fehlern („adequat“, falsche Norm im Ergebnis). Es ist sichtbar als PLATZHALTER gekennzeichnet: Badge oben, Kasten in der Prüfansicht, Kasten in der Übergabe.
10. Annahme: Mit `ANTHROPIC_API_KEY` ruft der Server das Modell aus `DEMO_MODEL` (Standard `claude-sonnet-5-5`) seitenweise auf und erwartet JSON `{text, randnotizen}`. **UNGETESTET**, kein Key in dieser Sitzung.
11. Annahme: Bilder gehen vor dem Senden auf höchstens 2000 px lange Kante verkleinert (JPEG 0,9). Der Wert ist geschätzt, damit Handyfotos nicht an Größenlimits scheitern.
12. Annahme: Die Regeln (wörtlich, `[?]`, Gestrichenes weg, Einfügung an der Markierung, Randnotiz in eigenes Feld, Unterstreichung ignorieren, Gliederung wörtlich) stehen im Prompt. Ob das Modell sie einhält, ist ungeprüft.

## Prüfen und Übergabe
13. Annahme: Eine `[?]`-Stelle wird durch Anklicken und Tippen ersetzt, durch Löschen entfernt oder per Knopf bewusst „[unleserlich]“ (Konzept E4). Bestätigen geht erst bei null `[?]` im Text, auch von Hand getippte zählen, und gesetztem Haken.
14. Annahme: Randnotizen sind standardmäßig nicht dabei. Angehakt landen sie als Block „Randnotizen:“ am Seitenende. Das weicht vom Konzept ab (dort: Verweisstelle), laut Brief.
15. Annahme: Gliederung bleibt wörtlich als Textzeile, es gibt keine Markdown-Ebenen. **Das weicht von E2/E3 ab**, die Ebenen-Ableitung fehlt noch.
16. Annahme: Seiten werden im Übergabetext durch eine Leerzeile getrennt, ohne Seitenmarker und ohne Bilder.
17. Annahme: Die Bestätigung gilt für alle Seiten zusammen, nicht je Seite.
18. Annahme: „An Korrektur senden“ bleibt deaktiviert und ist als Platzhalter beschriftet. Die Korrektur ist nicht nachgebaut.

## Daten
19. Annahme: Die Testbilder liegen in `demo-app/public/testdaten` und enthalten Namen Minderjähriger. Ordner vor jeder Weitergabe leeren. `test.pdf` ist synthetisch erzeugt.
20. Annahme: Datenschutz ist nicht gelöst (B14). Im API-Betrieb gehen die Seitenbilder an das Modell.

## Modul Fassung 2 (CLAUDE.md Fassung 2), Schritt 1: Gerüst
21. Annahme: Der vorhandene Stack im Ordner ist reines JavaScript mit Python-Server. Node fehlt, Vite ist damit nicht möglich. Das Modul liegt unter `/modul/` (`demo-app/public/modul/`), die erste Demo bleibt unberührt.
22. Annahme: Die vier Schritte heißen Seiten, Erkennung, Prüfen, Übergabe. Die Qualitätsampel gehört zum Schritt Seiten (wie in 01-upload-flow.md), nicht zu einem eigenen Schritt.
23. Annahme: Das Seitenbild im gerüst ist ein Platzhalter aus grauen Balken an den `rahmen`-Koordinaten der Zeilen, beschriftet als Beispiel. Die Testbilder passen nicht zum Jura-Beispieltext und werden hier nicht benutzt.
24. Annahme: `rahmen` wird in Anteilen der Seite (0 bis 1) angegeben, nicht in Pixeln.
25. Annahme: Die Gliederungsliste rechts zeigt Zeilen, die mit `A.`, `I.`, `1.` oder `a)` beginnen, wörtlich und ohne Ebenen. Das ist eine Anzeige, keine Ebenen-Ableitung.
26. Annahme: Im Gerüst sind Ampel, Erkennungsfortschritt (feste Wartezeit je Seite) und Übergabetext Beispielwerte. „Ersetzen“ setzt eine Seite auf grün, ohne ein Bild zu ersetzen.
27. Annahme: Die Beispielzeilen sind frei erfunden und enthalten absichtlich Fehler („adequat“, § 832 statt § 823 im Ergebnis), die später wörtlich stehen bleiben müssen. Genau drei unsichere Stellen.

## Modul Fassung 2, Schritt 2: Datenmodell und Übergabe
28. Annahme: Datenmodell, Statusfolge und `baueTextFuerKorrektur` liegen in `modell.js`. Seiten und Zeilen werden nach `nr` sortiert. Zeilen und Seiten werden mit einem Zeilenumbruch verbunden, ohne Seitenmarken.
29. Annahme: Eine mitgenommene Randnotiz steht an ihrer Position in der Zeilenfolge, ohne Kennzeichnung im Text.
30. Annahme: `offene_unsichere_stellen` zählt die `[?]` im fertigen `text_fuer_korrektur`. So stimmen Feld und angezeigte Zahl immer überein, auch wenn eine Zeile zwei `[?]` enthält.
31. Annahme: `text_fuer_korrektur` entsteht erst bei der Bestätigung (Wechsel zu `bestaetigt`) und wird danach nicht mehr neu berechnet. Prüfansicht und Seiten sind ab dann gesperrt. „Zurück“ bleibt Navigation und ändert den Status nie.
32. Annahme: Die Bestätigung in Schritt 1 durchläuft `qualitaet_geprueft` und `erkennung_laeuft` nacheinander, das Ende der Erkennung setzt `pruefung_offen`. Das Gerüst startet mit `seiten_hochgeladen`, weil die Beispielseiten als hochgeladen gelten.
33. Annahme: Der Knopf „Als eingereicht markieren“ setzt nur den Status und `eingereicht_am`. Er sendet nichts und ist als Platzhalter beschriftet.
34. Annahme: `Einreichung` bekommt ein Feld `aenderungen: Aenderung[]`, das in 04-integration.md nicht im Interface steht, aber in 03-unsicherheiten.md verlangt wird. Befüllt wird es in Schritt 3.
35. Annahme: Eine Einfügung mit `grund: marke_fehlt` wird hier noch wie jede Einfügung übernommen (04). Die Regel „nicht einsetzen, Nutzer:in setzt selbst“ (03) kommt in Schritt 3. Die Beispieldaten enthalten keinen solchen Fall.
36. Annahme: Das Gerüst startet direkt mit `eingabe_typ: handschrift`. Die Weiche mit Standard „getippt“ ist nicht gebaut.

## Modul Fassung 2, Schritt 3: Prüfansicht
(Nr. 35 ist damit erledigt: Einfügungen ohne Marke werden nicht eingesetzt, bis die Nutzer:in es tut.)
37. Annahme: Bearbeiten durch Anklicken einer Zeile. Enter übernimmt, Esc verwirft. Ein Klick auf eine `[?]`-Stelle markiert diese im Eingabefeld vor. Bearbeitbar sind nur die Arten text und einfuegung, nicht Randnotiz, Streichung und Skizze.
38. Annahme: Eine Änderung wird bei Enter oder beim nächsten Bedienschritt übernommen, nicht beim Verlassen des Felds. Sonst gehen Klicks auf andere Bedienelemente verloren, weil die Ansicht neu aufgebaut wird.
39. Annahme: `aenderungen` hält Art-Wechsel und Schalter als Text fest („[gestrichen] …“, „Randnotiz mitnehmen“, „(eingesetzt nach Zeile n)“). Die Zeilennummer ist die zum Zeitpunkt der Änderung.
40. Annahme: Zeile bekommt ein Zusatzfeld `art_roh`, damit „wieder streichen“ nach dem Wiederherstellen möglich ist. Es steht nicht in 04-integration.md.
41. Annahme: Eine Einfügung ohne Marke setzt die Nutzer:in über die Auswahl „nach Zeile n“ ein, danach werden die Zeilen der Seite neu nummeriert. Zeile 7 auf Seite 3 der Beispieldaten ist dafür erfunden. Das Beispiel hat damit vier offene Stellen: drei mit `[?]`, eine ohne Marke.
42. Annahme: Der Zähler „Offene Stellen“ zählt Zeilen mit `unsicher: true` (auch ohne Marke). Die Rückfrage vor der Bestätigung zählt `[?]` im Text, wie das Feld `offene_unsichere_stellen`. Beide Zahlen können sich deshalb unterscheiden.
43. Annahme: Die Rückfrage nennt neben den `[?]` auch Einfügungen ohne Marke, die nicht eingesetzt werden. Der Wortlaut für `[?]` folgt 03: „n Stellen bleiben als unleserlich markiert.“
44. Annahme: Der Neuaufnahme-Vorschlag rechnet mit allen Zeilen einer Seite, die `unsicher` sind (auch Randnotiz oder Einfügung ohne Marke). Schwelle 10 % aus 03, eine Annahme. Es gibt nur den Hinweis, keinen Knopf, weil der Upload fehlt.
45. Annahme: Unterstreichungen sind nicht modelliert. Sie entfallen ohne Kennzeichnung.
46. Annahme: Unter 980 px Breite stapeln sich die Spalten und das Seitenbild klebt nicht mehr. Im Testrun lag es sonst über dem Transkript und verschluckte Klicks.
47. Annahme: Die Gliederung rechts wird aus `text_bestaetigt` gebildet und aktualisiert sich nach Änderungen. Es gibt weiter keine Ebenen.

## Modul Fassung 2, Schritt 4: Upload
(Nr. 22 bis 24 und 26 gelten für die Beispielseiten weiter. Echte Uploads ersetzen sie nicht.)
48. Annahme: Die App startet jetzt leer (`entwurf`). Die Beispielseiten sind über „Beispielseiten laden (Platzhalter)“ erreichbar, solange noch keine Seite da ist. Sie behalten ihre festen Ampelwerte.
49. Annahme: Eine Datei wird nach MIME-Typ, ersatzweise nach Endung, als JPG, PNG oder PDF erkannt. Alles andere (auch WebP, HEIC) wird mit Meldung abgelehnt. Über 10 MB wird abgelehnt (Grenze aus 01, selbst eine Annahme). Die anderen Dateien eines Auswahlvorgangs bleiben erhalten.
50. Annahme: Die Ampel misst nur Auflösung (kurze Kante) und mittlere Helligkeit, auf einer verkleinerten Kopie. Das gespeicherte Bild bleibt unverändert. **Platzhalter-Schwellen, ungeprüft:** kurze Kante unter 400 px rot, unter 800 px gelb. Helligkeit unter 50 von 255 rot, unter 90 gelb. Zu helle Bilder werden nicht bewertet, weil weißes Papier hell ist.
51. Annahme: Die Schwellen sind nicht an den vier Handschrift-Dateien getestet worden. Auf ihnen ergeben sie grün, gelb, gelb. Ob gelb oder rot zu streng oder zu milde ist, ist offen.
52. Annahme: Ein PDF zählt als eine Seite, wird nicht geprüft und bekommt eine feste gelbe Platzhalter-Ampel. In der Prüfansicht erscheint es im eingebetteten PDF-Betrachter des Browsers.
53. Annahme: Seiten lassen sich per Ziehen, per ▲▼ oder mit den Pfeiltasten umordnen (Zeile fokussieren). Ersetzen öffnet die Dateiauswahl für eine Datei und behält die Position. Nach jeder Änderung muss „Vollständig und Reihenfolge stimmt“ neu gesetzt werden.
54. Annahme: Entfernt man alle Seiten, bleibt der Status `seiten_hochgeladen`, denn der Status geht nie zurück. Bestätigen ist dann gesperrt.
55. Annahme: Seitenbilder bleiben als Browser-Verweis (`blob:`) im Speicher und werden beim Entfernen oder Ersetzen freigegeben. `bild_ref` enthält diesen Verweis. Er steht nie im Übergabetext.
56. Annahme: Der Platzhalter-Leser weist hochgeladenen Seiten die festen Beispielzeilen reihum zu (Seite 1 bekommt die Zeilen der Beispielseite 1 usw.). Die Prüfansicht zeigt das echte Bild ohne Stellenmarkierung und mit rotem Hinweis, dass die Zeilen nicht zum Bild passen.
57. Annahme: „Sachverhalt ansehen“ ist ein aufklappbarer Platzhalter ohne echten Inhalt. Die QR-Code-Übergabe ist nur als deaktivierter Knopf gezeigt (laut 01).

## Modul Fassung 2, Schritt 5: Leser-Schnittstelle
(Nr. 23, 26 und 56 sind überholt: Die Zeilen kommen jetzt aus `leser.js`, nicht mehr aus `daten.js`.)
58. Annahme: Der Vision-Leser ist **nicht gebaut**. 02 verlangt dafür einen Zugang in den Umgebungsvariablen. Geprüft: `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `OPENAI_API_KEY`, `GOOGLE_API_KEY` und `GEMINI_API_KEY` sind nicht gesetzt. Der Prompt aus 02 liegt deshalb noch nicht im Code, nur in der Datei.
59. Annahme: Ein Leser liefert Rohzeilen im Format des Prompts (`text`, `art`, `unsicher`, `grund`, optional `rahmen`). `erkenne()` macht daraus vollständige Zeilen: `nr`, `text_roh`, `text_bestaetigt` (anfangs gleich), `quelle` (Name des Lesers), bei Randnotizen `mitnehmen: false`. Ein späterer Vision-Leser muss nur `lese()` liefern.
60. Annahme: Der Leser wird an genau einer Stelle gewählt: `let LESER = platzhalterLeser;` in `leser.js`. Wer den Leser tauscht, setzt `platzhalter: false`, dann verschwinden alle Beispiel-Hinweise. Getestet mit einem Test-Leser, nicht mit einem echten Modell.
61. Annahme: `erkenne()` setzt `unsicher: true`, wenn der Text `[?]` enthält, auch wenn der Leser es nicht meldet. Das ist eine mechanische Absicherung, keine Nachbearbeitung durch ein Sprachmodell.
62. Annahme: Der Platzhalter-Leser liefert jeder Seite dieselben 17 Zeilen. Sie enthalten alle fünf Arten, drei Stellen mit `[?]` und zusätzlich eine Einfügung ohne Marke. Die Einfügung ohne Marke ist eine vierte unsichere Zeile, aber keine `[?]`-Stelle im Text, ich habe sie behalten, damit die Regel aus 03 sichtbar bleibt. Das Feld `konfidenz` wird nicht befüllt.
63. Annahme: Der Platzhalter-Leser wartet 700 ms je Seite, damit der Fortschritt zu sehen ist. Das ist keine Messung von irgendetwas.
64. Annahme: Scheitert ein Leser bei einer Seite, bekommt sie `fehlgeschlagen`, die anderen Seiten laufen weiter. Der Status bleibt `erkennung_laeuft`, bis „Fehlgeschlagene Seiten erneut lesen“ alle Seiten durchgebracht hat. Das ist die einzige Fehlerbehandlung.
65. Annahme: Die Stellenmarkierung auf dem echten Bild erscheint nur, wenn der Leser einen `rahmen` liefert und `platzhalter` false ist. `rahmen` in Anteilen der Seite, wie bei den Beispielseiten. Für PDF gibt es keine Markierung.
66. Annahme: Die Beispielseiten (Knopf „Beispielseiten laden“) behalten nur die Ampelwerte in `daten.js`. Ihre Zeilen holt der Platzhalter-Leser wie bei echten Seiten.

## Design: Jurafuchs Design System (DESIGN.md)
Angewendet auf das Modul unter `/modul/`. Die erste Demo unter `/` bleibt unberührt und im alten Aussehen.
67. Annahme: `tokens.css` und `components.css` sind 1:1 aus der Anleitung übernommen, `base.css` enthält die Basis-Styles aus Abschnitt 5 und die Typo-Hilfsklassen. `modul.css` benutzt nur Tokens, per Suche bestätigt: kein Hex-, rgb- oder rgba-Wert außerhalb von `tokens.css`. Die alte Palette und der Dark-Mode-Block sind entfernt (es gibt nur ein helles Theme).
68. Annahme: Von den vier Komponenten nutze ich Button und FeedbackNote. PointsPill und ExamCard liegen in `components.css` bereit, kommen im Modul nicht vor, weil es keine Punkte gibt. Die Korrektur zeigt hier keine Punkte.
69. Annahme: Das Design System kennt nur die Button-Größen md und lg. Kleine Aktionen in Listen (Nach oben, Nach unten, Ersetzen, Entfernen, Wiederherstellen, Einsetzen) sind deshalb als Koralle-Textlinks (`coral-text`, wie Links im System) gestaltet, nicht als verkleinerte Buttons. Das ist eine Ableitung, keine Vorgabe.
70. Annahme: Genau ein Primary-Button je Ansicht: Schritt 1 „Erkennung starten“, Schritt 2 „Weiter zur Prüfung“, Schritt 3 „Transkript bestätigen“, bei der Rückfrage „Trotzdem bestätigen“ (der Hauptknopf unten entfällt dann), Schritt 4 „Als eingereicht markieren“. Alles andere ist secondary oder Link.
71. Annahme: Der Platzhalter-Hinweis ist eine eigene Fläche aus `surface-warm` mit `coral`-Rahmen und dem Wort „Platzhalter.“ in `coral-text`. Die FeedbackNote „foxxy“ ist für KI-Feedback vorgesehen und deshalb nicht dafür genommen. Die Hinweise „Hinweis“ und „Neuaufnahme vorschlagen“ sind FeedbackNotes im Ton „info“.
72. Annahme: Ampel und Fortschrittspunkte sind Flächen in `green`, `sun` und `rose` und tragen immer ein Wort daneben. Offene `[?]` sind `sun` mit Text in `ink`. Das Gelb der alten Version ist entfallen. `star` ist nicht verwendet.
73. Annahme: Der Seitenkopf zeigt „Jurafuchs“ in fetter Schrift als Platzhalter für die Wortmarke (Datei liegt nicht vor), mit „Klausurenkurs“ daneben. Die Anleitung nennt für diesen Fall den Stil `display-lg` (58 px). In einem Arbeitskopf wäre das zu groß, ich habe `heading` (20 px) genommen. **Abweichung von Abschnitt 8.** Foxxy ist nicht eingebaut, GT Walsheim Pro fehlt, es greift der Fallback-Stack.
74. Annahme: Seitentitel „Handschriftlich abgeben.“ im Stil `heading` statt `display-lg`, weil `display-lg` laut Anleitung dem Klausurenkurs-Hero vorbehalten ist. Inhaltsbreite 1100 px laut Layout-Regeln. Die Prüfansicht mit drei Spalten ist damit enger als vorher.
75. Annahme: Texte nach Abschnitt 2: du, Satzschreibung, Mittelpunkt statt Komma oder Schrägstrich, Überschriften als Satz mit Punkt, Buttons mit höchstens drei Wörtern (Hinweise dazu stehen daneben, z. B. „JPG, PNG oder PDF · höchstens 10 MB je Datei“). Keine Emojis, die Pfeile ▲ ▼ sind durch Text („Nach oben“, „Nach unten“) ersetzt. Der Text im Bearbeitungsprotokoll, Dateinamen und Statuswerte (`pruefung_offen` usw.) bleiben technisch.
76. Annahme: Barrierefreiheit: Fokus-Ring aus den Basis-Styles gilt überall. Das Datei-Feld ist jetzt per Tastatur erreichbar (vorher `display: none`). Zeilen im Transkript und Einträge in „Offene Stellen“ sind fokussierbar und lassen sich mit Enter öffnen. Der aktive Tab und Schritt tragen `aria-current`, Hinweise `role="note"`, Fehlermeldungen `role="alert"`.
77. Annahme: Mobile: unter 980 px stapeln sich die Spalten, das Seitenbild klebt dort nicht. Für Texte gibt es keine mobilen Größen, es gelten die Desktop-Größen. Die Anleitung definiert keine mobilen Werte.
78. Annahme: Der Seitenbild-Platzhalter aus Balken benutzt Tokens (Linien, `info-border`, `foxxy-border`, `sun`). Die Farben der Balken sind eine Ableitung, nichts davon steht in der Anleitung.
79. Annahme: `DESIGN.md` liegt als Kopie der Datei im Arbeitsordner. Der Verweis in einer `CLAUDE.md` (Snippet in Abschnitt 12) ist nicht gesetzt, weil die `CLAUDE.md` dieses Moduls außerhalb dieses Ordners liegt.

## UX-Durchgang (Skill ui-ux-pro-max), innerhalb des Jurafuchs Design Systems
Der Skill wurde ohne Auftrag aufgerufen. Ich habe ihn als UX- und Barrierefreiheits-Prüfung des Moduls gelesen. Das Design System bleibt bindend: Es kamen keine neuen Farben, Radien, Schatten oder Schriften dazu, und die Skill-Vorschläge zu Stil, Palette und Schrift sind nicht angewendet.
80. Annahme: Fokus. Die Ansicht wird bei jeder Aktion neu aufgebaut. `render()` merkt sich jetzt das fokussierte Element und setzt den Fokus zurück. Bei einem Schrittwechsel geht der Fokus auf den Inhaltsbereich (`main`, `tabindex="-1"`, ohne Rahmen), nach Enter oder Esc im Eingabefeld auf die bearbeitete Zeile. Die Rückfrage vor der Bestätigung bekommt den Fokus, und „Zurück zur Prüfung“ gibt ihn an den Hauptknopf zurück.
81. Annahme: Ansagen. Eine unsichtbare Live-Region (`role="status"`, `aria-live="polite"`) liegt außerhalb der Ansicht und meldet: aufgenommene Seiten und Meldungen, Schrittwechsel, Fortschritt der Erkennung, übernommene Zeile samt Zahl offener Stellen. Ich habe das Ansagetext-Verhalten nur über den Textinhalt geprüft, nicht mit einem echten Screenreader.
82. Annahme: Zielgrößen. Textlinks und Labels haben mindestens 24 px (WCAG 2.2 für Web). Unter 980 px sind es 44 px für Links, Tabs, Listeneinträge, Zeilen, Auswahlfeld und „Änderungen“. Gemessen im Handy-Viewport mit 375 px: kein Ziel unter 44 px, kein horizontales Scrollen in allen vier Ansichten. Die Primary-Buttons sind 48 bis 50 px hoch (Maß aus dem Design System).
83. Annahme: Das Umordnen per Ziehen hat Alternativen (Nach oben, Nach unten, Pfeiltasten), das war schon vorher so und erfüllt die Regel „Dragging Movements“. Fokussierbare Zeilen und Listeneinträge haben `role="button"`, der Schrittbalken ein `aria-label`.
84. Annahme: Beim Einlesen von Dateien erscheint „Dateien werden gelesen …“ (`role="status"`). Bei kleinen Dateien ist das nur kurz sichtbar, ich habe es nicht als sichtbar bestätigt.
85. Annahme: Nicht übernommen, weil es das Design System oder den Umfang verletzt: Animationen und Übergänge (die Anleitung verbietet dekorative Animation, daher auch keine Reduced-Motion-Regel nötig), ein Skip-Link (kurze Seite mit einem Inhaltsbereich), Dark Mode, andere Schriften oder Paletten. Offen bleibt die bekannte Schwäche des Systems: Rahmen von Eingabefeldern haben nur 1,4:1. Das Eingabefeld hat dafür ein `aria-label` und den Fokus-Ring.

## Layout und Überschriften (Vorgabe von Johannes)
86. Annahme: Die Prüfansicht hat jetzt links den Sachverhalt, in der Mitte das Seitenbild und rechts das Transkript. Die Übersicht (Offene Stellen, Gliederung, Änderungen) steht in der linken Spalte unter dem Sachverhalt. Die Vorgabe nennt nur Sachverhalt links und Seitenbild zentral. Wohin Transkript und Übersicht kommen, habe ich entschieden: Das Transkript ist die Arbeitsfläche und bekommt die breiteste Spalte, die Übersicht liegt neben dem Bild, damit der Sprung zu einer Stelle ohne langes Scrollen geht. Auf dem Handy folgen die Bereiche untereinander in derselben Reihenfolge (Sachverhalt mit Übersicht, Seitenbild, Transkript), damit Lese- und Tab-Reihenfolge übereinstimmen.
87. Annahme: Der Sachverhalt liegt nicht vor. Die linke Spalte zeigt dafür einen sichtbaren Platzhalter („Hier stünde der Sachverhalt der Klausur. Er liegt in dieser Demo nicht vor.“). Der Text steht an einer Stelle (`SACHVERHALT` in `modul.js`) und wird auch bei „Sachverhalt ansehen“ in Schritt 1 benutzt.
88. Annahme: Überschriften haben keinen Punkt mehr, auch nicht h1 und kurze fette Titel in Blöcken („Platzhalter“, „Einfügung ohne Marke“, „Randnotizen dieser Seite“, „Vor der Bestätigung“). Folgt ein Text, steht er in einer eigenen Zeile darunter (Klasse `folge`, Baustein `kopf()`). Das weicht von Abschnitt 2 der Design-Anleitung ab, die einen Punkt verlangt. Die Vorgabe geht vor, `DESIGN.md` trägt dazu einen Vermerk, damit künftige Läufe sie nicht zurückdrehen.
89. Annahme: Sätze innerhalb von Texten behalten ihren Punkt. Nur Überschriften und Titel sind betroffen. Hinweisbänder („Hinweis“, „Neuaufnahme vorschlagen“) hatten schon keinen.
90. Annahme: Die eingebettete Vorschau der Entwicklungsumgebung startet den Server immer im alten Sitzungsordner. Ich habe sie gestoppt und den Server aus `Documents\jurafuchs` selbst gestartet (`py demo-app/server.py`, Port 4173). Wer die Vorschau der Umgebung benutzt, sieht sonst den alten Stand.

## Repository für Dritte (README, Tests, Aufräumen)
91. Annahme: Die Qualitätsbewertung ist aus `modul.js` in `ampel.js` ausgelagert (`bewerteQualitaet` als reine Funktion, `messeBild` für die Messung), damit sie ohne Oberfläche testbar ist. Das Verhalten ist unverändert, per Durchlauf mit echten Bildern bestätigt.
92. Annahme: Es gibt zwei Testarten ohne Installation. Die Logik (Status, Übergabetext, Leser, Ampel) wird in `modul/tests.html` im Browser geprüft, 29 Tests. Der Server wird mit `unittest` aus der Standardbibliothek geprüft, 11 Tests. Ich habe die Browser-Tests gegengeprüft, indem ich zwei Fehler absichtlich eingebaut habe: Vier Tests schlugen an, danach lief alles wieder.
93. Annahme: Ein Workflow für GitHub Actions führt nur die Python-Tests aus. Er ist angelegt, auf GitHub aber noch nicht gelaufen. Die Browser-Tests brauchen einen Headless-Browser und laufen nicht in der Pipeline.
94. Annahme: Die Bilder im README sind mit den Beispielseiten (graue Balken) aufgenommen, nicht mit echten Handschriften, damit keine Dritttexte oder Kindernamen im Repository liegen. Für das Bild der Prüfansicht habe ich die rote Beispielseite auf Grün gesetzt, sonst blockiert Rot die Bestätigung. Das gilt nur für das Bild, nicht für das Verhalten.
95. Annahme: `TESTLAUF-1.md` enthält keine Transkripte mehr. Die Vorlagen sind Texte Dritter, zwei stammen von Kindern und nennen Vornamen, Schule und Lehrer. Beschreibung, Auszählung und Befunde bleiben. Die Auszählung ist ohne die Transkripte nicht nachrechenbar, das steht in der Datei.
96. Annahme: Das README sagt offen, dass die Erkennung ein Platzhalter ist und welche Teile ungetestet sind. `OFFENE-ENTSCHEIDUNGEN.md` hält die Lücken fest. Die erste Iteration der Demo (`demo-app/public/index.html`) bleibt als Verlauf im Repository, ist im README als nicht mehr gepflegt gekennzeichnet und in den offenen Punkten als löschbar markiert.
97. Annahme: Es ist bewusst keine Lizenz gesetzt. Ob und welche, entscheidet der Autor.
