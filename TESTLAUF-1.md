# TESTLAUF 1 · Grundkonzept-Check mit dem Handschrift-Stack
Stand 2026-10-06 · Beleg für TEST.md (K4, K5, A2, A5) · Transkripte aus Datenschutz- und Urheberrechtsgründen entfernt (siehe Abschnitt 2)

## 1. Methode und Grenzen
- Leser: Claude (Vision) als Stellvertreter für das spätere Erkennungsmodell. Anweisung an mich selbst: wörtlich, `[?]` bei Unsicherem, nichts glätten.
- Notation: `[?]` unleserlich · `[gestrichen: x]` · `[Einfügung: x]` · `[Zeichnung]` · `[…]` Anmerkung des Lesers.
- **Kein Gold-Transkript vorhanden.** Fehlerraten (A2, A6) sind damit nicht messbar. Belegt sind nur Phänomene und Stolperstellen.
- **Stack ist fachfremd:** kein Jura-Text, kein „§“, kein „Abs./Nr.“, keine Gliederung (A./I./1.), keine echte Randnotiz. A2 und Teile von K5 sind damit nicht abgedeckt.

## 2. Die vier Testseiten (Transkripte nicht veröffentlicht)
Die wörtlichen Transkripte liegen bewusst **nicht** in diesem Repository. Die Vorlagen sind Texte Dritter, zwei davon stammen von Kindern und enthalten Vornamen, Schule und Lehrernamen. Veröffentlicht sind nur die Beschreibung der Seiten und die Befunde daraus. Die Auszählung in Abschnitt 3 lässt sich ohne Transkripte und Bilder nicht nachrechnen. Ein Gold-Transkript mit eigenen, unbedenklichen Seiten ist der nächste Schritt (A2).

| Seite | Art | Auffälligkeiten |
|---|---|---|
| S1 | Englisch, Handyfoto, schräg, violetter Stift | Schwärzung im Bild, Nachbarseite und gedruckter Hintergrundtext im Bild, zwei Streichungen, Einfügungen über der Zeile, unteres Drittel schwer lesbar, Formel ohne Tiefstellung, **fachliche Fehler im Original** (müssen wörtlich bleiben) |
| S2 | Deutsch, Schreibschrift, Doppelseite in einem Bild, 800×450 px, oben und unten angeschnitten | Zwei Seiten in einem Bild, angeschnittene Zeilen, zwei Streichungen, eine Zeichnung, Überschreibung, viele unsichere Stellen trotz geradem Bild |
| S3 | Deutsch, Kinderschrift, Scan, vorgedruckte Linien, blaue Tinte | Sauber lesbar, Silbentrennung am Zeilenende, Überschreibung in anderer Tinte, unterstrichener Titel |
| S4 | Deutsch, Kinderschrift, Handyfoto, lineiertes Papier | Lineatur schneidet Buchstaben, kleine Einfügung über der Zeile, Zeichnung, **grammatisch falsche Stelle** (Versuchung zum stillen Glätten), Ziffer 7 oder Z unklar |

## 3. Zählung (aus den inzwischen entfernten Transkripten gezählt, hier nicht nachrechenbar)
| Seite | Zeilen | `[?]` | gestrichen |
|---|---|---|---|
| S1 | 24 | 8 | 2 |
| S2 | 30 | 11 | 2 |
| S3 | 22 | 0 | 0 |
| S4 | 28 | 5 | 0 |

Aussage: Die `[?]`-Quote schwankt zwischen null und rund einer Marke je 3 Zeilen (S2). Ein Qualitätscheck, der nur das Foto prüft (A5), erfasst das nicht, denn S2 ist gerade und gut belichtet, nur niedrig aufgelöst und in Zierschrift. Die Zahlen gelten nur für diese Lesung, ohne Gold-Transkript und ohne zweiten Leser.

## 4. Phänomene → Regelvorschlag (B9, nicht freigegeben)
| Phänomen | Fundstelle | Regelvorschlag |
|---|---|---|
| Unleserlich | S1 unteres Drittel, S2, S4 | `[?]` im Transkript. Im Bestätigungsschritt hervorgehoben, Lesevorschlag nur dort, nie automatisch übernommen |
| Streichung | S1 (2×), S2 (2×) | Nicht im Korrekturtext. Im Bestätigungsschritt sichtbar durchgestrichen |
| Einfügung über der Zeile | S1 („The“), S4 („euch“) | An der Markierungsstelle einsetzen. Position unklar → `[?]` plus Hinweis |
| Überschreibung | S2 („übermäßig“), S3 („Mexiko“ in anderer Tinte) | Endfassung. Nicht eindeutig → `[?]` |
| Zeichnung, Symbol | S2 Herz, S4 Schmetterling | `[Zeichnung]`, kein Inhalt |
| Unterstreichung | S3 Titel | Kein Markup. Entscheidung für Gutachten-Hervorhebungen offen |
| Silbentrennung am Zeilenende | S3 (3×) | Zusammenführen. Layout, kein Inhalt |
| Doppelseite in einem Bild | S2 | Vor der Erkennung in Einzelseiten teilen |
| Angeschnittene Zeilen | S2 (oben/unten) | Qualitätscheck lehnt ab oder fragt nach Neuaufnahme |
| Fremdtext im Bild (Nachbarseite, Hintergrund) | S1 | Zuschnitt auf die Seite, Fremdtext ausschließen |
| Name im Kopf | S1 geschwärzt | Kopfbereich getrennt behandeln (B14) |
| Formeln ohne Tiefstellung, Text auf Pfeil | S1 | Analog zu „§ 823 I“, „Abs. 2 Nr. 3“: Ziffern wörtlich, Sonderrisiko bleibt Annahme |
| Randnotiz, Gliederung, § | nicht im Stack | **Nicht testbar.** Zusatzseite nötig |

## 5. Quellenprüfung (nur Abstract-Ebene, Kurzabruf per WebFetch)
| Quelle | Existiert | Stützt die Aussage | Abweichung |
|---|---|---|---|
| arXiv 2506.04822 | ja | ja: VLM-Handschrifterkennung, Fehler pflanzen sich in LLM-Bewertung fort (Grundschule Indonesien) | Kinderschrift, kein Jura |
| arXiv 2602.00095 | ja | ja, aber **3,3 %**, nicht „rund 4 %“ | Datenbasis: STEM-Lösungen, GPT-5.1 als Bewerter. Wert im Konzept auf 3,3 % und Kontext korrigieren |
| arXiv 2607.24077 | ja | ja: „orthographic normalization“ als systematischer Fehler, niedrige CER verdeckt ihn | historische Dokumente (Uruguay) |
| Amazon „Do VLMs read or rewrite“ (arXiv 2607.21617) | ja | ja: allgemeine VLMs bis 14 % F1-Verlust bei absichtlich gestörtem Text | Die Briefquelle nennt für den Amazon-Beitrag keine arXiv-Nummer. 2607.21617 ergänzen |
| arXiv 2606.04166 | ja | ja: Marginalien und Spalten sind bekanntes Reihenfolge-Problem | – |
| arXiv 2301.05935 | ja | ja: Lesereihenfolge beeinflusst Seiten-Erkennung | – |
| DAISY-Test, UCL-Leitfaden, Transkribus Tilburg, Reddit Juni 2026, Uni-Klausurenkurse 10 MB | **nicht geprüft** | – | als „nicht verifiziert“ führen |
