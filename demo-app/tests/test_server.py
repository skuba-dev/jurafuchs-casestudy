"""Tests für demo-app/server.py. Nur Standardbibliothek, keine Installation nötig.

Aufruf im Repository-Ordner:  py -m unittest discover -s demo-app/tests -v
(unter Linux und macOS: python3 -m unittest discover -s demo-app/tests -v)

Die Tests laufen immer ohne API-Zugang. Sie prüfen den Platzhalter-Zweig und das Verhalten des Servers.
Der Zweig mit echtem Modellaufruf ist bewusst nicht getestet, er ist ungetestet (siehe README).
"""
import json
import os
import sys
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer

# Der Server liest den Schlüssel beim Import. Für die Tests darf keiner gesetzt sein.
os.environ.pop("ANTHROPIC_API_KEY", None)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import server  # noqa: E402


class ServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.port = cls.httpd.server_address[1]
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def url(self, pfad):
        return f"http://127.0.0.1:{self.port}{pfad}"

    def get(self, pfad):
        try:
            with urllib.request.urlopen(self.url(pfad), timeout=5) as r:
                return r.status, r.read(), r.headers
        except urllib.error.HTTPError as e:
            return e.code, e.read(), e.headers

    def post(self, pfad, daten):
        req = urllib.request.Request(self.url(pfad), data=json.dumps(daten).encode(), headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=5) as r:
                return r.status, json.loads(r.read())
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read() or b"{}")

    # ---------- Status ----------
    def test_status_meldet_platzhalter_ohne_zugang(self):
        code, body, _ = self.get("/api/status")
        self.assertEqual(code, 200)
        self.assertEqual(json.loads(body), {"erkennung": "platzhalter", "modell": None})

    # ---------- Erkennung ----------
    def test_erkennung_liefert_gekennzeichneten_platzhalter(self):
        code, d = self.post("/api/erkennen", {"seite_nr": 1, "bild": "data:image/jpeg;base64,AAAA"})
        self.assertEqual(code, 200)
        self.assertIs(d["platzhalter"], True)
        self.assertIn("[?]", d["text"])
        self.assertIsInstance(d["randnotizen"], list)

    def test_beispieltext_enthaelt_absichtliche_fehler_unveraendert(self):
        # Fehler der Verfasserin müssen wörtlich bleiben, auch im Platzhalter.
        alles = " ".join(b["text"] for b in server.BEISPIEL)
        self.assertIn("adequat", alles)
        self.assertIn("§ 832 Abs. 1 BGB", alles)

    def test_beispieltexte_wechseln_je_seitennummer(self):
        _, a = self.post("/api/erkennen", {"seite_nr": 1})
        _, b = self.post("/api/erkennen", {"seite_nr": 2})
        _, c = self.post("/api/erkennen", {"seite_nr": 1 + len(server.BEISPIEL)})
        self.assertNotEqual(a["text"], b["text"])
        self.assertEqual(a["text"], c["text"])

    def test_erkennung_ohne_seitennummer_oder_mit_null_bricht_nicht(self):
        for daten in ({}, {"seite_nr": 0}, {"seite_nr": -3}):
            code, d = self.post("/api/erkennen", daten)
            self.assertEqual(code, 200, daten)
            self.assertTrue(d["platzhalter"])

    def test_unbekannter_post_pfad_ist_404(self):
        code, _ = self.post("/api/gibt-es-nicht", {})
        self.assertEqual(code, 404)

    # ---------- Auslieferung ----------
    def test_modul_wird_ausgeliefert(self):
        code, body, kopf = self.get("/modul/")
        self.assertEqual(code, 200)
        self.assertIn("text/html", kopf["Content-Type"])
        self.assertIn(b"Handschriftlich abgeben", body)

    def test_skripte_haben_javascript_mimetype(self):
        # Auf Windows liefert die Registry manchmal einen falschen Typ, der Browser würde das Skript verwerfen.
        for datei in ("modul.js", "modell.js", "leser.js", "ampel.js"):
            code, _, kopf = self.get(f"/modul/{datei}")
            self.assertEqual(code, 200, datei)
            self.assertIn("javascript", kopf["Content-Type"], datei)

    def test_keine_zwischenspeicherung(self):
        _, _, kopf = self.get("/modul/modul.js")
        self.assertEqual(kopf["Cache-Control"], "no-store")

    def test_kein_zugriff_ausserhalb_des_public_ordners(self):
        # Pfadtricks dürfen weder den Quelltext des Servers noch andere Dateien preisgeben.
        for pfad in ("/../server.py", "/..%2fserver.py", "/%2e%2e/server.py", "/modul/../../server.py"):
            code, body, _ = self.get(pfad)
            self.assertNotEqual(code, 200, pfad)
            self.assertNotIn(b"class Handler", body, pfad)

    def test_testbilder_sind_nicht_teil_des_repositorys(self):
        # Die .gitignore schließt den Ordner aus (Namen Minderjähriger). Dieser Test sichert die Regel ab.
        gitignore = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".gitignore")
        with open(gitignore, encoding="utf-8") as f:
            self.assertIn("demo-app/public/testdaten/", f.read())


if __name__ == "__main__":
    unittest.main()
