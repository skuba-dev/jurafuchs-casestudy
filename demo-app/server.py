"""Demo-Server: liefert die Oberfläche aus und erkennt Seiten. Keine Persistenz, keine Abhängigkeiten.

Start: py demo-app/server.py   (Port per Umgebungsvariable PORT, Standard 4173)
Ohne ANTHROPIC_API_KEY liefert /api/erkennen ein Beispiel-Transkript, das als PLATZHALTER gekennzeichnet ist.
Mit ANTHROPIC_API_KEY ruft er ein Vision-Modell auf. DIESER ZWEIG IST UNGETESTET (kein Key in der Entwicklungssitzung).
"""
import json
import mimetypes
import os
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
PORT = int(os.environ.get("PORT", "4173"))
API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
MODEL = os.environ.get("DEMO_MODEL", "claude-sonnet-5-5")

mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("text/css", ".css")

# PLATZHALTER: frei erfundener Beispieltext, nicht aus einem Bild gelesen.
# Enthält absichtlich Fehler (Tippfehler, falsche Norm im Ergebnis), die wörtlich stehen bleiben müssen.
BEISPIEL = [
    {
        "text": (
            "A. Anspruch des A gegen B aus § 823 Abs. 1 BGB\n"
            "A könnte gegen B einen Anspruch auf Schadensersatz aus § 823 Abs. 1 BGB haben.\n"
            "I. Rechtsgutsverletzung\n"
            "Dazu müsste B ein absolutes Recht des A verletzt haben. Das Eigentum des A am Fahrrad wurde durch die Beschädigung verletzt.\n"
            "II. Verletzungshandlung\n"
            "Das Umwerfen des Fahrrads ist ein menschliches Verhalten und damit eine Handlung. "
            "Sie war nach der conditio sine qua non Formel kausal für den Schaden und auch adequat.\n"
            "III. Rechtswidrigkeit\n"
            "Die Rechtswidrigkeit ist durch die Rechtsgutsverletzung indiziert. Rechtfertigungsgründe sind nicht [?]."
        ),
        "randnotizen": ["Mitverschulden prüfen? (Beispiel-Randnotiz)"],
    },
    {
        "text": (
            "IV. Verschulden\n"
            "B handelte fahrlässig, § 276 Abs. 2 BGB, denn er hat die im Verkehr erforderliche Sorgfalt außer Acht gelassen. "
            "Ein Schuldausschließungsgrund nach §§ 827, 828 BGB liegt nicht vor.\n"
            "V. Schaden und Haftungsumfang\n"
            "A hat einen Anspruch auf Ersatz der Reparaturkosten in Höhe von [?] Euro, § 249 Abs. 2 S. 1 BGB. "
            "Ein Mitverschulden des A nach § 254 BGB ist nicht ersichtlich, weil [?].\n"
            "B. Ergebnis\n"
            "A kann von B Schadensersatz aus § 832 Abs. 1 BGB verlangen."
        ),
        "randnotizen": [],
    },
]

PROMPT = (
    "Du transkribierst eine handschriftliche Jura-Klausurseite. Regeln:\n"
    "1. Schreibe wörtlich ab. Korrigiere NICHTS: keine Rechtschreibfehler, Grammatikfehler, falschen oder "
    "unvollständigen Paragraphenangaben und keine inhaltlichen Fehler.\n"
    "2. Was du nicht sicher lesen kannst, schreibst du als [?]. Rate nie.\n"
    "3. Durchgestrichenes lässt du weg.\n"
    "4. Einfügungen (Pfeil, Einfügezeichen) setzt du an der Markierungsstelle in den Text.\n"
    "5. Randnotizen gehören nicht in den Text, sondern in das Feld randnotizen.\n"
    "6. Unterstreichungen ignorierst du.\n"
    "7. Gliederungspunkte (A., I., 1., a)) übernimmst du wörtlich, eine Zeile je Punkt.\n"
    "8. Silbentrennung am Zeilenende führst du zusammen, sonst bleiben die Absätze wie im Original.\n"
    "9. Zeichnungen ignorierst du.\n"
    'Antworte NUR mit JSON in der Form {"text": "...", "randnotizen": ["..."]}.'
)


def erkenne_mit_api(data_url):
    kopf, b64 = data_url.split(",", 1)
    media = kopf[5:].split(";")[0]
    payload = {
        "model": MODEL,
        "max_tokens": 4000,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media, "data": b64}},
                {"type": "text", "text": PROMPT},
            ],
        }],
    }
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode("utf-8"),
        headers={"content-type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        antwort = json.load(r)
    text = "".join(b.get("text", "") for b in antwort.get("content", []) if b.get("type") == "text").strip()
    if text.startswith("```"):
        text = text.strip("`")
        text = text[4:] if text.startswith("json") else text
    d = json.loads(text)
    return {"platzhalter": False, "text": d.get("text", ""), "randnotizen": d.get("randnotizen", [])}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _json(self, code, obj):
        raw = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        if self.path == "/api/status":
            return self._json(200, {"erkennung": "api" if API_KEY else "platzhalter", "modell": MODEL if API_KEY else None})
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/erkennen":
            return self._json(404, {"fehler": "nicht gefunden"})
        body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))) or b"{}")
        if not API_KEY:
            nr = max(int(body.get("seite_nr", 1)), 1)
            return self._json(200, {"platzhalter": True, **BEISPIEL[(nr - 1) % len(BEISPIEL)]})
        try:
            return self._json(200, erkenne_mit_api(body["bild"]))
        except (urllib.error.URLError, ValueError, KeyError) as e:
            return self._json(502, {"fehler": f"Erkennung fehlgeschlagen: {e}"})

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    modus = f"API ({MODEL}, ungetestet)" if API_KEY else "PLATZHALTER (kein ANTHROPIC_API_KEY)"
    print(f"Demo läuft auf http://localhost:{PORT}  Erkennung: {modus}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
