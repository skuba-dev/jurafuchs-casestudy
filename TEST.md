# TEST · Abnahme KONZEPT.md gegen K1–K6

> **Hinweis:** Das ist die Abnahme des **Konzeptpapiers** gegen die Kriterien K1 bis K6, kein Test der App. Tests der App stehen im README, Abschnitt „Tests“.

Stand 2026-10-06 · Ziel für `/goal`: alle Kriterien erfüllt und belegt · **Ergebnis: 4 erfüllt, 2 teilweise. Ziel nicht erreicht.**

| # | Kriterium | Status | Beleg |
|---|---|---|---|
| K1 | Bestehende Korrektur bleibt unverändert | **erfüllt** (Konzeptebene) | KONZEPT §4: Die Korrektur liest nur `klausur.loesungstext`, als „Bestehendes Feld, unverändert“ geführt. `seite.bild_ref` endet vor der Korrektur, das Diagramm zeigt keinen Bildpfad dorthin. Das Markdown-Format der Ebenen ist das heutige Eingabeformat (E2). **Offen:** A10 und A11 (Formatparität) sowie A7 (Längengrenze) sind ungeprüft |
| K2 | Datenmodell zeigt den neuen Input-Typ konkret | **erfüllt** | KONZEPT §4: Tabelle mit 12 Feldern (Feld, Typ, Zweck), neuer Typ `klausur.eingabetyp` (getippt, handschrift) mit Status-Enum. **Einschränkung:** Typen sind fachlich (enum, JSON), nicht für ein konkretes Datenbanksystem. `seite.konfidenz` hängt an A13 |
| K3 | Jede Unbekannte hat Annahme und Test | **erfüllt** | KONZEPT §5: 13 Annahmen mit je einem Test (per Zählbefehl geprüft, A1 bis A13 vollständig). Die vier Unbekannten aus der Ausgangslage sind A1 (Anteil), A2 (Fehlerquote), A3 (Layout), A7 (Grenzen). A8 bis A13 sind neu. Zahlen sind gekennzeichnet: Startwert (A2), Annahme (10 MB, 5 von 20 Seiten), belegt (3,3 %, 14 %). Zielwert M1 bewusst offen (Muss 3) |
| K4 | Wörtliches Transkript, `[?]`, keine stille Korrektur, Bestätigung vor Korrektur | **teilweise** | **Konzept erfüllt:** KONZEPT §3 und Diagramm, E4 (offene `[?]` müssen aufgelöst oder bewusst „[unleserlich]“ werden). **Probe (TESTLAUF-1):** wörtliches Lesen mit `[?]` war an 4 Seiten möglich, insgesamt 24 Marken (8, 11, 0, 5). Zwei Stellen mit Glättungsdruck (S1 fachliche Fehler, S4 „weil mir … treffen“) blieben wörtlich. **Nicht belegt:** M1 (Stille Fehlerrate) ist ohne Gold-Transkript nicht gemessen. Als Leser war ich selbst das Modell und hatte keinen zweiten Leser. A4 (Bestätigung wird nicht durchgewunken) ist ungeprüft |
| K5 | Streichungen, Einfügungen, Randnotizen sind entschieden | **erfüllt** (Entscheidung) | KONZEPT §3 und E3: Streichung, Einfügung, Überschreibung, Randnotiz, Unterstreichung, Gliederung, Zeichnung und Silbentrennung haben je eine Regel. Streichung (S1, S2), Einfügung (S1, S4) und Überschreibung (S2, S3) kamen im Stack real vor. **Offen:** Randnotiz und Gliederung sind im Stack nicht vorhanden, Wirkung (A3, A10) ungeprüft |
| K6 | In 45 Minuten lesbar und vollständig | **teilweise** | Ein Diagramm (Mermaid), klare Empfehlung (§7), Priorisierung (§1 und Baustein). **Länge:** grobe Zeilenschätzung ca. 2,6 Seiten, nicht gerendert, Ziel „etwa zwei“. **Mermaid-Syntax** nicht gerendert geprüft (Werkzeug fehlt). Behebung, falls strikt zwei Seiten: Annahmen-Register als Anhang auslagern (ca. 16 Zeilen) |

## Muss-Bedingungen
| # | Muss | Status | Beleg |
|---|---|---|---|
| 1 | Korrektur unverändert, reiner Text | erfüllt | siehe K1 |
| 2 | Wörtlich, `[?]`, Bestätigung | erfüllt im Konzept, Wirkung offen | siehe K4 |
| 3 | Jede Unbekannte hat Annahme und Test, keine erfundenen Zahlen | erfüllt | siehe K3. Eigene Zahlen sind gezählt oder als Annahme markiert. **Korrigiert:** „rund 4 %“ aus dem Briefing ist laut arXiv 2602.00095 3,3 % |

## Bedingungen (Stand B1–B16)
| # | Status |
|---|---|
| B3 Erfolg messbar | geschlossen (E6, Hauptmaß M1, Zielwert aus Pilot) |
| B6 Datenmodell | geschlossen (E4, KONZEPT §4) |
| B9 Sonderfälle | geschlossen (E3) |
| B12 Fehlerpfad | geschlossen (E5) |
| B16 Erster Ausbauschritt | Aufgabe 1 freigegeben (E1), Ausbauschritt als Pilot vorgeschlagen (KONZEPT §7), **Freigabe fehlt** |
| B7 Eingabe-Regeln | teilweise: Startwerte sind Annahmen (10 MB, Formate), Seitenzahl hängt an A7 |
| B13 Kosten und Laufzeit | offen, nur über A8 |
| B14 Datenschutz | offen, benannt (KONZEPT §6) |
| B15 Annahmen haben Tests | ja, alle 13 ungeprüft |

## Nicht belegt in dieser Abnahme
- A2, A6, A13: kein Gold-Transkript, kein Jura-Material im Stack.
- Quellen: sechs per WebFetch auf Abstract-Ebene geprüft, DAISY, UCL, Transkribus, Reddit und 10-MB-Angabe nicht.
- Seitenlänge von KONZEPT.md ist geschätzt, nicht gerendert.
