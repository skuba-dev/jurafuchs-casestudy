# ENTSCHEIDUNGEN · Handschrift-Upload

> **Hinweis zum Stand:** E2 und E3 sind teilweise überholt. Die Demo gibt die Gliederung wörtlich ohne Ebenen weiter und nimmt Randnotizen als eigenen Block mit (ANNAHMEN.md, Nr. 14 und 15). Offene Punkte: OFFENE-ENTSCHEIDUNGEN.md.

Laufendes Protokoll, speist KONZEPT.md und TEST.md. Stand 2026-10-06.

| # | Entscheidung | Wer/Wann | Folge |
|---|---|---|---|
| E1 | Aufgabe 1 freigegeben: Baustein „Qualitätssicherung bei unsicheren Erkennungen“ (B16 geschlossen) | Johannes, 2026-10-06 | Beobachtung 1 und 2 gelten. Befund aus TESTLAUF-1 kommt dazu: `[?]`-Quote hängt an der Schrift, nicht am Foto |
| E2 | Die Korrektur erhält Text mit Markdown/Überschriften-Ebenen für die Gliederung | Johannes, 2026-10-06 | Das Transkript muss handschriftliche Gliederung in Ebenen übersetzen. Das ist eine Interpretation und widerspricht „wörtlich“ nur dann nicht, wenn Original-Nummerierung erhalten bleibt und die Ebene in der Bestätigung sichtbar ist. Muss 1 bleibt gewahrt (Markdown ist Text) |

| E3 | B9 geschlossen (Sonderfälle). Gliederung: Ebene aus Nummerierungsmuster, Nummerierung bleibt im Text, bei unpassendem Muster erbt die Zeile die Ebene der Vorzeile und wird in der Bestätigung markiert. Unterstreichung: ignorieren, in der Bestätigung als Hinweis sichtbar. Randnotiz: an der Verweisstelle einsetzen, ohne Verweis ans Absatzende mit Hinweis. Übrige Regeln aus TESTLAUF-1 §4 und Schritt 2 gelten (Unleserlich, Streichung, Einfügung, Überschreibung, Zeichnung, Silbentrennung, Fehler bleiben wörtlich) | Johannes, 2026-10-06 | K5 gedeckt. Test A3 (Randtext) und A10 (Ebenen) bleiben offen |

| E4 | B6 geschlossen (Datenmodell, Entwurf aus Schritt 3). Offene `[?]` nach der Bestätigung: auflösen (ersetzen oder löschen) oder bewusst als „[unleserlich]“ bestätigen. Die Korrektur erhält nie ein stilles `[?]` | Johannes, 2026-10-06 | K2 und K4 gedeckt. A9 bleibt als Test, aber nur noch für „[unleserlich]“ |
| E5 | B12 geschlossen (Fehlerpfad). Kaum lesbare Klausur oder abgelehnte Fotos: warnen, nicht sperren. Optionen: neu fotografieren, getippt einreichen, trotzdem korrigieren. Abgelehntes Foto betrifft nur die Seite, nicht die Klausur. Dienstausfall: Status `fehler`, Retry, Upload bleibt gespeichert | Johannes, 2026-10-06 | Schwelle ist Annahme A12 |

| E6 | B3 geschlossen. Hauptmaß: M1 Stille Fehlerrate (Anteil der Erkennungsfehler im Roh-Transkript ohne `[?]`). Begleitmetriken M2–M5 (Wortfehlerrate, Bestätigungszeit, Punktedifferenz, Ablehn-/Abbruchquote). Zielwerte kommen aus dem Pilot | Johannes, 2026-10-06 | B10 gedeckt, Zielwert bewusst offen (Muss 3) |

## Daraus neue Annahmen
| # | Annahme | Test |
|---|---|---|
| A9 | Die Korrektur bewertet `[?]` nicht als inhaltlichen Fehler | Dieselbe Klausur mit und ohne `[?]` korrigieren, Punkte vergleichen |
| A10 | Die Ebenen-Ableitung aus der handschriftlichen Nummerierung verändert die Aufbau-Bewertung nicht gegenüber der getippten Fassung (Zielwert zu validieren) | Dieselbe Klausur getippt im Editor und handschriftlich transkribiert einspeisen, Aufbau-Punkte vergleichen |
| A12 | Es gibt eine Schwelle für `[?]`-Quote und abgelehnte Seiten, ab der eine Warnung hilft statt nervt (Wert unbekannt) | Pilot mit 10 Klausuren: Quote je Klausur erfassen, Abbruch nach Warnung zählen |
| A13 | Die Konfidenz des Erkennungsmodells ist brauchbar genug, um `[?]`-Kandidaten zu markieren | Konfidenz gegen Gold-Fehler an den 20 Seiten aus A2 vergleichen. Falls nicht: `[?]` ohne Konfidenzwert |
| A11 | Der Editor speichert die Nummerierung („I.“, „1.“) im Überschriftstext, nicht nur als Ebene | Nachfrage beim Team, ein Beispiel-Export |
