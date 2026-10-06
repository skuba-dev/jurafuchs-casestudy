# Jurafuchs Design System — Umsetzungsanleitung für Claude Code

Diese Datei ist die vollständige, in sich geschlossene Design-Vorgabe für die Marke **Jurafuchs** (jurafuchs.de und Klausurenkurs). Sie ist dafür gedacht, in das Repository einer bestehenden oder neuen App gelegt zu werden, damit Claude Code das Design dort konsistent anwenden kann. Alle Werte stammen aus dem Design-System-Artifact „Jurafuchs" (Quelle: Live-Seite und zwei Screenshots).

Ablage-Empfehlung: als `DESIGN.md` im Repo-Root und in der `CLAUDE.md` darauf verweisen (Snippet im Abschnitt 12).

---

## 0. Arbeitsanweisung an Claude Code

Lies diese Datei vollständig, bevor du UI-Code schreibst oder änderst. Beim Anwenden des Designs gilt:

1. **Keine Hex-Werte im Komponentencode.** Alle Farben, Abstände, Radien, Schatten und Schriften kommen aus den Design-Tokens (Abschnitt 3). Neue Werte nur nach Rückfrage hinzufügen.
2. **Zuerst Tokens, dann Komponenten, dann Screens.** Reihenfolge der Umsetzung: Token-Datei anlegen, globale Basis-Styles setzen, die vier Basis-Komponenten (Abschnitt 6) einführen, danach bestehende Screens migrieren.
3. **Bestehende Struktur respektieren.** Verwende das vorhandene Framework, Styling-System und die Ordnerstruktur der App. Die CSS-Variablen in Abschnitt 3 sind die Quelle der Wahrheit; mappe sie auf Tailwind, CSS-Module, styled-components, SwiftUI, Compose o. Ä., statt ein zweites Styling-System einzuführen.
4. **Nichts erfinden.** Die Marken-Illustration (Fuchs „Foxxy"), das Wortmarken-Logo und die Schrift GT Walsheim Pro liegen **nicht** vor (Abschnitt 8). Nicht nachzeichnen, nicht durch ähnliche Assets ersetzen, nicht selbst als SVG bauen.
5. **Texte auf Deutsch, du-Form**, nach den Content-Regeln in Abschnitt 2.
6. **Barrierefreiheit ist Teil des Designs.** Kontrastvorgaben und Fokus-Stil in Abschnitt 7 sind verbindlich.
7. **Nach der Umsetzung prüfen:** Checkliste in Abschnitt 11 durchgehen und das Ergebnis kurz berichten (was migriert wurde, was offen ist).

---

## 1. Marke in einem Absatz

Jurafuchs ist die Lernmarke für Jurastudierende in Deutschland: warm, direkt, ermutigend. Das Produkt Klausurenkurs liefert wöchentlich Examensklausuren, die von der KI „Foxxy" und einer Peer-Person korrigiert werden. Visuell heißt das: warmer Pfirsich-Grund, weiße Karten mit weichem Schatten, Koralle als Markenfarbe für Formen, Anthrazit für die eine Hauptaktion, runde Ecken, keine Verlaufs- oder Emoji-Dekoration.

---

## 2. Inhalt und Tonalität (Content Fundamentals)

- **Sprache:** Deutsch. Anrede **du**, in UI und Fließtext kleingeschrieben. Nie „Sie".
- **Überschriften:** kurze Aussagesätze, **jeweils mit Punkt am Ende**. Eine Idee pro Satz, keine Ausrufezeichen. Beispiel: „Klausuren schreiben. Korrigiert werden. Im Examen liefern."
  - **Projektvorgabe (Johannes, 2026-10-06), geht der Regel oben vor:** Überschriften stehen ohne Punkt am Ende. Folgt ein Text, steht er in einer eigenen Zeile darunter, nie in derselben Zeile. Das gilt auch für kurze fette Titel in Blöcken (z. B. „Randnotizen dieser Seite“).
- **Gendern:** mit Doppelpunkt — „Korrektor:innen", „Nutzer:innen", „Korrektor:in". Nie „*innen", nie generisches Maskulinum.
- **Groß-/Kleinschreibung:** Satzschreibung überall, auch auf Buttons („Als Korrektor:in verdienen", „Warteliste"). Produktnamen behalten ihre Schreibweise: Jurafuchs, Klausurenkurs, Foxxy KI.
- **Meta-Angaben** werden mit Mittelpunkt getrennt, nicht mit Schrägstrich oder senkrechtem Strich: „Subsumtion · Seite 4", „Foxxy KI · sofort", „Geschlossene Beta · bald für alle verfügbar".
- **Zahlen** im deutschen Format: Dezimalkomma („4,8", „14,5"), Punkte als „9 / 18 P.".
- **Keine Emojis.** Einzige Dekoration ist die Fuchs-Illustration Foxxy.
- **Feedback-Texte** nennen das Rechtskonzept und die Korrektur, ein bis zwei Sätze: „Hier fehlt die Subsumtion — du nennst den Maßstab, wendest ihn aber nicht an."
- **Buttons:** 1–3 Wörter, wenn möglich.

---

## 3. Design-Tokens

### 3.1 Vollständige CSS-Datei (`tokens.css`)

Diese Datei 1:1 ins Projekt übernehmen (z. B. `src/styles/tokens.css`) und global importieren. Sie ist die Quelle der Wahrheit.

```css
:root {
  /* ---------- Schriften ---------- */
  --font-sans: "GT Walsheim Pro", "Avenir Next", "Segoe UI", system-ui, sans-serif;
  --font-mono: "Fragment Mono", ui-monospace, Menlo, monospace;

  /* ---------- Flächen ---------- */
  --surface-peach: #fef7f1;   /* Seiten- und Hero-Grund */
  --surface: #ffffff;         /* Header, Karten, Inputs, sekundäre Buttons */
  --surface-warm: #f8f5f3;    /* ruhige Panels, Tabellenstreifen (einziges neutrales Panel) */

  /* ---------- Text / Tinte ---------- */
  --ink: #1f1f1f;             /* Überschriften, Kartentitel */
  --charcoal: #2e2e2e;        /* Standard-Fließtext, Primary-Button-Fläche */
  --on-charcoal: #ffffff;     /* Text auf Charcoal */
  --ink-muted: #595959;       /* Lead, Navigation, Sekundärtext (6,6:1 auf Peach) */
  --ink-subtle: #7e7e7e;      /* NUR Platzhalter/Deko, nie Fließtext (4,06:1 auf Weiß) */

  /* ---------- Linien ---------- */
  --border: #ebebeb;          /* Header-Unterkante, Kartentrenner */
  --border-strong: #d9d9d9;   /* Outline sekundärer Button, Input-Rahmen */

  /* ---------- Marke / Akzente ---------- */
  --coral: #ef7355;           /* Markenfarbe: Blob, Script-Wortmarke, Flächen. NICHT für kleinen Text */
  --coral-hover: #cc5537;     /* Hover/Pressed koralle Links (nur großer Text, 4,0:1) */
  --coral-text: #c2492b;      /* Koralle für Text: 4,6:1 auf Peach, 4,9:1 auf Weiß */
  --sun: #f5a453;             /* Warmer Zweitakzent, nur Flächen/Illustration */
  --rose: #e94757;            /* Danger/negativ, nur Flächen/Icons, immer mit Wort */
  --teal: #01cba8;            /* Illustration/Highlights, nur Flächen */
  --green: #00c866;           /* Erfolgsmarker (Haken), nur Fläche/Icon */
  --sky: #06b5ed;             /* Illustration, nur Flächen */
  --blue: #1e88ce;            /* Illustration, nur Flächen */
  --navy: #102a43;            /* tiefstes Blau, dunkle Illustrationsgründe */
  --star: #ffcc02;            /* Bewertungsstern, nur Fläche */

  /* ---------- Feedback-Töne ---------- */
  --info-bg: #f2f8fd;         /* Fachhinweis (Peer/Rubrik) */
  --info-border: #c3effd;
  --info-ink: #12537e;        /* 7,6:1 auf info-bg */
  --foxxy-bg: #fef7f1;        /* KI-Feedback (= surface-peach) */
  --foxxy-border: #fce1c5;
  --foxxy-ink: #e84a24;       /* NUR Illustration (3,6:1). Für Text coral-text verwenden */
  --success-bg: #ebfff5;      /* Punkte-Pill */
  --success-ink: #00793c;     /* 5,3:1 auf success-bg */
  --peer-bg: #fcf5fe;         /* Avatar-Scheibe der Peer-Person */
  --peer-ink: #6b0995;        /* Initialen im Avatar */

  /* ---------- Abstände (4px-Raster) ---------- */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* ---------- Radien ---------- */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 20px;
  --radius-pill: 999px;

  /* ---------- Schatten ---------- */
  --shadow-sm: 0 4px 4px 0 rgba(0, 0, 0, 0.05);
  --shadow-card: 0 8px 24px 0 rgba(120, 80, 50, 0.12);
}
```

### 3.2 Farb-Verwendung auf einen Blick

| Rolle | Token | Wert |
|---|---|---|
| Seiten-/Hero-Grund | `surface-peach` | `#fef7f1` |
| Header, Karten, Inputs | `surface` | `#ffffff` |
| Ruhiges Panel | `surface-warm` | `#f8f5f3` |
| Überschriften | `ink` | `#1f1f1f` |
| Fließtext, Primary-Fläche | `charcoal` | `#2e2e2e` |
| Lead/Sekundärtext/Nav | `ink-muted` | `#595959` |
| Markenfläche (Blob, Formen) | `coral` | `#ef7355` |
| Koralle als Text/Link/Eyebrow | `coral-text` | `#c2492b` |
| Hover koralle Links | `coral-hover` | `#cc5537` |
| Info-Note | `info-bg` / `info-border` / `info-ink` | `#f2f8fd` / `#c3effd` / `#12537e` |
| Foxxy-Note | `foxxy-bg` / `foxxy-border` / Label `coral-text` | `#fef7f1` / `#fce1c5` / `#c2492b` |
| Punkte-Pill | `success-bg` / `success-ink` | `#ebfff5` / `#00793c` |
| Peer-Avatar | `peer-bg` / `peer-ink` | `#fcf5fe` / `#6b0995` |
| Bewertungsstern | `star` | `#ffcc02` |

Reine Illustrationsfarben (nur Flächen, kein Text): `sun`, `rose`, `teal`, `green`, `sky`, `blue`, `navy`, `star`.

Es gibt **nur ein Theme (hell)**. Ein Dark Mode ist nicht definiert; keinen erfinden, ohne Rückfrage.

### 3.3 Typografie

Schrift: **GT Walsheim Pro** (Bold 700, Medium 500, Regular 400). Die Font-Dateien sind lizenziert und **nicht** Teil dieses Systems; bis sie ergänzt werden, greift der Fallback-Stack `Avenir Next → Segoe UI → system-ui` (`--font-sans`). Sobald die woff2-Dateien vorliegen, per `@font-face` einbinden und den Stack unverändert lassen.

| Stil | Größe / Zeilenhöhe | Gewicht | Verwendung |
|---|---|---|---|
| `display-xl` | 80px / 80px | 700 | Marketing-Hero-Headline (h1 auf jurafuchs.de) |
| `display-lg` | 58px / 63px | 700 | Klausurenkurs-Hero, drei kurze Sätze mit Punkt |
| `heading` | 20px / 26px | 700 | Abschnitts-Zwischenüberschriften (h2) |
| `body` | 16px / 25px | 400 | Lead und Fließtext, in `ink-muted` |
| `nav` | 14px / 20px | 500 | Header-Navigation und Button-Labels |
| `eyebrow` | 13px / 18px | 500 | kleines Label über Headline, in `coral-text` |
| `card-title` | 13px / 18px | 700 | Titelzeile in Karte und Feedback-Note |
| `card-body` | 12px / 20px | 400 | Feedback-Text in Notes |
| `caption` | 11px / 16px | 400 | Beta-Status, Peer-Zeile |

Hilfsklassen:

```css
.t-display-xl { font: 700 80px/80px var(--font-sans); color: var(--ink); }
.t-display-lg { font: 700 58px/63px var(--font-sans); color: var(--ink); }
.t-heading    { font: 700 20px/26px var(--font-sans); color: var(--ink); }
.t-body       { font: 400 16px/25px var(--font-sans); color: var(--ink-muted); }
.t-nav        { font: 500 14px/20px var(--font-sans); }
.t-eyebrow    { font: 500 13px/18px var(--font-sans); color: var(--coral-text); }
.t-card-title { font: 700 13px/18px var(--font-sans); }
.t-card-body  { font: 400 12px/20px var(--font-sans); color: var(--ink); }
.t-caption    { font: 400 11px/16px var(--font-sans); color: var(--ink-muted); }
```

> Hinweis: Die Größen sind für Desktop gemessen. Für schmale Viewports/Mobile sind keine Werte definiert. Skaliere `display-xl`/`display-lg` dort sinnvoll herunter (z. B. mit `clamp()`), behalte Gewicht und Verhältnis bei und melde die gewählten Werte im Ergebnis, damit sie ins Design-System übernommen werden können.

### 3.4 Abstände, Radien, Schatten

- **Raster:** 4px. Innenabstand Notes `space-3` (12px), Karten `space-4` bis `space-6`, Abstand zwischen gestapelten Gruppen `space-6`, Hero-Blöcke `space-12` (48px), Hero-Vertikalpadding `space-16` (64px).
- **Radien:** Buttons `radius-lg` (10px), Feedback-Notes `radius-md` (8px), Exam-Karte und große Panels `radius-xl` (20px), Pills und Avatare `radius-pill`, kleine Tags `radius-sm`.
- **Elevation:** Die Exam-Karte schwebt mit `shadow-card` über dem Koralle-Blob. Alles andere ist flach, höchstens `shadow-sm`.
- **Motion:** keine definiert. Keine dekorativen Animationen hinzufügen.

---

## 4. Layout-Regeln

- Max. Inhaltsbreite ca. **1100px**, zentriert.
- **Header:** `surface` mit 1px `border` an der Unterkante. Navigation in `nav`-Stil und `ink-muted`; ein Primary-Button („Warteliste") rechts.
- **Hero:** zwei Spalten, Text links, schwebende Karte rechts. Grund `surface-peach`. Hinter der Karte ein großer organischer Blob in `coral` (oben rechts hinter der Karte abgeschnitten). Eyebrow → Headline (`display-lg`) → Lead (`body`, `ink-muted`) → Buttons (Primary + Secondary, `size="lg"`).
- **Grau vermeiden:** keine reinen Grautöne als Flächen. `surface-warm` ist das einzige neutrale Panel.
- **Koralle sparsam:** Blob, Wortmarke, Flächen, Links (als `coral-text`). Genau **ein** Primary-Button pro Ansicht.
- **Optionales Dekor-Motiv (Cover-Stil):** versetzte, abgerundete Platten (`radius-xl`) in `charcoal`, `coral` und `info-ink`, die über den Rand bluten, dazu Reihen kleiner Pills (56×24px, Radius 12px, Raster `space-2`/`space-4`) in `charcoal`, `coral`, `sun`, `info-ink`; in der Koralle-Platte eine Scheibe in `surface-peach` als Echo des Hero-Blobs. Nur als Marketing-/Leerzustands-Dekor verwenden, nicht in Arbeitsoberflächen.

---

## 5. Globale Basis-Styles

```css
html { background: var(--surface-peach); }
body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 25px;
  color: var(--charcoal);
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3 { color: var(--ink); font-weight: 700; margin: 0; }

a { color: var(--coral-text); text-decoration: none; }
a:hover { color: var(--coral-hover); text-decoration: underline; }

/* Fokus: gilt für JEDES interaktive Element (15:1 auf Peach und Weiß) */
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

/* Eingabefelder */
input, textarea, select {
  font: inherit;
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 12px 14px;
}
input::placeholder, textarea::placeholder { color: var(--ink-subtle); }
```

> Input-Rahmen `border-strong` erreicht nur 1,4:1. Deshalb immer ein sichtbares Label neben das Feld setzen (nicht nur Platzhalter). Der Fokus-Ring trägt die Bedienbarkeit.

---

## 6. Komponenten

Das Design-System enthält vier Komponenten, die aus Screenshots nachgebaut wurden (nicht aus Quellcode). **Pixelwerte vor dem Ausrollen gegen das Live-Produkt prüfen.** Die Original-Implementierung ist ein React-Bundle (`window.Jurafuchs`, Klassen mit Präfix `jf-`). Unten die Styles (1:1) und eine typisierte React-Fassung. Wenn die App nicht React nutzt, die Styles und die Struktur in das jeweilige Framework übertragen.

### 6.1 Komponenten-CSS (`components.css`)

```css
/* ---------- Button ---------- */
.jf-btn {
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  border-radius: var(--radius-lg);
  padding: 14px 20px;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.jf-btn--lg { font-size: 15px; padding: 17px 20px; }
.jf-btn--primary { background: var(--charcoal); color: var(--on-charcoal); }
.jf-btn--primary:hover { background: var(--ink); }
.jf-btn--secondary { background: var(--surface); color: var(--ink); border-color: var(--border-strong); }
.jf-btn--secondary:hover { border-color: var(--ink-muted); }
.jf-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.jf-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ---------- FeedbackNote ---------- */
.jf-note {
  font-family: var(--font-sans);
  border: 1px solid;
  border-radius: var(--radius-md);
  padding: 12px;
  box-sizing: border-box;
}
.jf-note--info  { background: var(--info-bg);  border-color: var(--info-border); }
.jf-note--foxxy { background: var(--foxxy-bg); border-color: var(--foxxy-border); }
.jf-note__label { font-size: 13px; line-height: 18px; font-weight: 700; margin-bottom: 4px; }
.jf-note--info  .jf-note__label { color: var(--info-ink); }
.jf-note--foxxy .jf-note__label { color: var(--coral-text); }
.jf-note__body  { font-size: 12px; line-height: 20px; font-weight: 400; color: var(--ink); }

/* ---------- PointsPill ---------- */
.jf-pill {
  font-family: var(--font-sans);
  display: inline-block;
  background: var(--success-bg);
  color: var(--success-ink);
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
}

/* ---------- ExamCard ---------- */
.jf-card {
  font-family: var(--font-sans);
  background: var(--surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: 24px;
  box-sizing: border-box;
  max-width: 372px;
  color: var(--ink);
}
.jf-card__head  { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.jf-card__title { margin: 0; font-size: 14px; line-height: 20px; font-weight: 700; color: var(--ink); }
.jf-card__notes { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
.jf-card__foot  { display: flex; align-items: center; gap: 8px; margin-top: 16px; font-size: 11px; line-height: 16px; color: var(--ink-muted); }
.jf-card__peer  { flex: 1; }
.jf-card__rating { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: var(--ink); }
.jf-star { color: var(--star); font-size: 14px; }
.jf-avatar {
  width: 26px; height: 26px; border-radius: var(--radius-pill);
  background: var(--peer-bg); color: var(--peer-ink);
  font-size: 10px; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
}
.jf-visually-hidden {
  position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap;
}
```

### 6.2 React/TypeScript-Fassung (`jurafuchs-components.tsx`)

```tsx
import * as React from "react";

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

/* ---------- Button ---------- */
export interface ButtonProps {
  /** "primary" = Charcoal-Fläche, höchstens eine pro Ansicht. "secondary" = weiß mit grauem Rahmen. */
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  /** Rendert ein <a> statt <button>. */
  href?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
}

export function Button({ variant = "primary", size = "md", href, disabled, type = "button", onClick, className, children }: ButtonProps) {
  const cls = cx("jf-btn", `jf-btn--${variant}`, `jf-btn--${size}`, className);
  if (href) return <a className={cls} href={href}>{children}</a>;
  return <button className={cls} type={type} disabled={disabled} onClick={onClick}>{children}</button>;
}

/* ---------- FeedbackNote ---------- */
export interface FeedbackNoteProps {
  /** "info" = blaue Peer-/Rubrik-Note, "foxxy" = pfirsichfarbene KI-Note. */
  tone?: "info" | "foxxy";
  /** Titelzeile, z. B. "Subsumtion · Seite 4" oder "Foxxy KI · sofort". */
  label: string;
  className?: string;
  children: React.ReactNode;
}

export function FeedbackNote({ tone = "info", label, className, children }: FeedbackNoteProps) {
  return (
    <div className={cx("jf-note", `jf-note--${tone}`, className)}>
      <div className="jf-note__label">{label}</div>
      <div className="jf-note__body">{children}</div>
    </div>
  );
}

/* ---------- PointsPill ---------- */
export interface PointsPillProps {
  earned: number | string;
  total: number | string;
  className?: string;
}

export function PointsPill({ earned, total, className }: PointsPillProps) {
  return <span className={cx("jf-pill", className)}>{earned} / {total} P.</span>;
}

/* ---------- ExamCard ---------- */
export interface ExamCardProps {
  /** Fallname, z. B. "Die verbotene Versammlung". */
  title: string;
  earned: number | string;
  total: number | string;
  /** Peer-Fußzeile: Initialen, Anzeigename, optional Bewertung wie "4,8". */
  peer?: { initials: string; name: string; rating?: string };
  className?: string;
  /** FeedbackNote-Elemente (max. drei, nach Seitenverweis sortiert). */
  children: React.ReactNode;
}

export function ExamCard({ title, earned, total, peer, className, children }: ExamCardProps) {
  return (
    <article className={cx("jf-card", className)}>
      <header className="jf-card__head">
        <h3 className="jf-card__title">{title}</h3>
        <PointsPill earned={earned} total={total} />
      </header>
      <div className="jf-card__notes">{children}</div>
      {peer && (
        <footer className="jf-card__foot">
          <span className="jf-avatar" aria-hidden="true">{peer.initials}</span>
          <span className="jf-card__peer">{peer.name} · Peer</span>
          {peer.rating && (
            <span className="jf-card__rating">
              <span className="jf-star" aria-hidden="true">★</span>
              <span className="jf-visually-hidden">Bewertung </span>
              {peer.rating}
            </span>
          )}
        </footer>
      )}
    </article>
  );
}
```

### 6.3 Verwendungsregeln je Komponente

**Button**
- `primary`: Charcoal-Fläche, weißes Label (13,6:1). Für die Header-Aktion („Warteliste") und die Hauptaktion eines Formulars. **Höchstens einer pro Ansicht.**
- `secondary`: weiße Fläche mit `border-strong`-Outline auf `surface-peach` („Als Korrektor:in verdienen"). Als ruhigere Alternative neben einem Primary.
- `size="lg"` für Hero-Aktionen, sonst Standardgröße.
- Label: Satzschreibung, 1–3 Wörter, Deutsch, du-Form. Eckenradius `radius-lg` (10px). **Button-Text nie in Koralle.**
- Der Aufrufer liefert Label (children) und bei Navigation `href`.

**FeedbackNote**
- `tone="info"` (blau): Korrekturen von Peer oder Rubrik, Label „<Konzept> · Seite <n>", Label in `info-ink` auf `info-bg` (7,6:1).
- `tone="foxxy"` (pfirsich): sofortiges KI-Feedback, Label „Foxxy KI · sofort", Label in `coral-text` (4,6:1). Das gemessene `foxxy-ink` der Seite ist zu hell und wird nicht verwendet.
- Body: ein bis zwei Sätze, die das Rechtskonzept nennen und sagen, was zu beheben ist. Radius `radius-md`.
- **Nicht** für Erfolg oder Fehler verwenden; Punkte gehören in `PointsPill`.

**PointsPill**
- Grüne Fläche (`success-bg`) mit `success-ink` (5,3:1), auf `surface` (Weiß) platzieren, meist oben rechts in der `ExamCard`.
- Zeigt immer beide Zahlen und die Einheit „P." („9 / 18 P."), Dezimalkomma bei Bruchwerten („14,5"). Nie nur durch Farbe vermittelt.

**ExamCard**
- Weiß (`surface`), `radius-xl`, `shadow-card`; auf `surface-peach` platzieren, optional über dem Koralle-Blob.
- Enthält Titel (Fallname), `earned`/`total`, bis zu drei `FeedbackNote`, optional Peer-Fußzeile.
- Notes nach Seitenverweis sortieren. Breite höchstens **372px**.

### 6.4 Beispiel (so sieht eine korrekte Karte aus)

```tsx
<ExamCard
  title="Die verbotene Versammlung"
  earned={9}
  total={18}
  peer={{ initials: "SF", name: "Subsumtionsfee", rating: "4,8" }}
>
  <FeedbackNote tone="info" label="Subsumtion · Seite 4">
    Hier fehlt die Subsumtion — du nennst den Maßstab, wendest ihn aber nicht an.
  </FeedbackNote>
  <FeedbackNote tone="foxxy" label="Foxxy KI · sofort">
    Aufbau sitzt. Schwerpunkt § 123 II BGB sauberer herausarbeiten.
  </FeedbackNote>
</ExamCard>
```

```tsx
<div style={{ display: "flex", gap: 12 }}>
  <Button variant="primary">Warteliste</Button>
  <Button variant="secondary" size="lg">Als Korrektor:in verdienen</Button>
</div>
```

---

## 7. Barrierefreiheit (verbindlich)

- **Text mindestens 4,5:1** auf seinem Grund (3:1 ab 24px). Deshalb gilt:
  - Koralle als **Text** immer `coral-text` (`#c2492b`), nie `coral` (`#ef7355`: nur 2,7:1 auf Peach, 2,9:1 auf Weiß).
  - Punkte-Pill-Text `success-ink` (`#00793c`), nicht das Grün der Seite (`#00994e`, 3,3:1).
  - Foxxy-Label `coral-text`, nicht `foxxy-ink`.
  - `ink-subtle` (`#7e7e7e`) nie für Fließtext.
  - `coral-hover` nur für großen Text (4,0:1).
- **Fokus:** durchgehend 2px solid `ink`, Offset 2px, auf jedem interaktiven Element.
- **Farbe nie allein:** Farbe immer mit Wort/Label kombinieren (z. B. Note-Label, „P."-Einheit, Danger mit Text).
- **Dekorative Elemente** (`★`, Avatar-Initialen) mit `aria-hidden="true"`; die Bewertung wird für Screenreader mit „Bewertung" ergänzt (`jf-visually-hidden`).
- **Bekannte Schwäche aus der Quelle:** Input-/Sekundär-Button-Rahmen `border-strong` (1,4:1) erreichen keine 3:1 für Steuerelement-Rahmen. Immer sichtbares Label, Fokus-Ring beibehalten.
- Farben, die sich unterscheiden müssen, nicht nur über den Farbton, sondern auch über Helligkeit/Label trennen.

---

## 8. Assets und Fehlendes (nicht erfinden)

| Asset | Status | Umgang |
|---|---|---|
| **Wortmarke „Jurafuchs Klausurenkurs"** | nicht vorhanden | Fett GT Walsheim „Jurafuchs" in `ink`, gefolgt von „Klausurenkurs" in handschriftlicher Script-Schrift in `coral`. **Nicht aus Schrift nachbauen.** Bis die Datei (SVG/PNG) vorliegt: Name „Jurafuchs" in `display-lg`-Stil setzen. |
| **Foxxy (Fuchs-Maskottchen)** | nicht vorhanden | Schwarze handgezeichnete Outline, korallfarbener Körper, neben dem KI-Feedback. **Nie nachzeichnen.** Bis zur Lieferung weglassen. |
| **GT Walsheim Pro** (Bold/Medium/Regular) | lizenziert, Dateien fehlen | woff2 unter `fonts/` ergänzen, per `@font-face` einbinden; bis dahin Fallback-Stack. |
| **Icons** | nicht als Dateien vorhanden | Seite nutzt einfache Linien-Icons (40px-ViewBox) für Features und einen gefüllten grünen Haken (`green`) für Status. Bei Bedarf ein schlichtes Linien-Icon-Set im gleichen Stil nutzen, nicht mischen mit Fill-Icons außer dem Status-Haken. Keine Emojis. |

Einfarbige Marken-Dateien, die als `<img>` eingebunden werden, können keine Farbe erben; ihre Tintenfarbe im Dateinamen oder README vermerken.

---

## 9. Mapping in gängige Styling-Systeme

### 9.1 Tailwind CSS v4 (`@theme`)

```css
@import "tailwindcss";
@import "./tokens.css";

@theme {
  --color-surface-peach: var(--surface-peach);
  --color-surface: var(--surface);
  --color-surface-warm: var(--surface-warm);
  --color-ink: var(--ink);
  --color-charcoal: var(--charcoal);
  --color-ink-muted: var(--ink-muted);
  --color-coral: var(--coral);
  --color-coral-text: var(--coral-text);
  --color-coral-hover: var(--coral-hover);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-info-bg: var(--info-bg);
  --color-info-ink: var(--info-ink);
  --color-success-bg: var(--success-bg);
  --color-success-ink: var(--success-ink);
  --font-sans: var(--font-sans);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --shadow-card: var(--shadow-card);
}
```

(Weitere Tokens nach Bedarf analog ergänzen; die Namen 1:1 aus Abschnitt 3 übernehmen.)

### 9.2 Tailwind v3 (`tailwind.config.js`)

```js
theme: {
  extend: {
    colors: {
      "surface-peach": "var(--surface-peach)",
      surface: "var(--surface)",
      "surface-warm": "var(--surface-warm)",
      ink: "var(--ink)",
      charcoal: "var(--charcoal)",
      "ink-muted": "var(--ink-muted)",
      coral: "var(--coral)",
      "coral-text": "var(--coral-text)",
      "info-bg": "var(--info-bg)",
      "info-ink": "var(--info-ink)",
      "success-bg": "var(--success-bg)",
      "success-ink": "var(--success-ink)",
    },
    borderRadius: { md: "var(--radius-md)", lg: "var(--radius-lg)", xl: "var(--radius-xl)" },
    boxShadow: { card: "var(--shadow-card)" },
    fontFamily: { sans: "var(--font-sans)" },
  },
}
```

### 9.3 Nicht-Web-Apps (React Native, SwiftUI, Compose, Flutter)

Die Tokens als Konstanten/Theme-Objekt anlegen (gleiche Namen, gleiche Werte), die vier Komponenten aus Abschnitt 6 nach den Strukturen und Maßen nachbauen. Der Schatten `0 8px 24px rgba(120,80,50,0.12)` entspricht plattformspezifisch einer Elevation/Schattenangabe mit warmer Tönung; Fokus-Ring entfällt dort zugunsten der plattformüblichen Fokus-/Accessibility-Darstellung, Kontrastvorgaben bleiben.

---

## 10. Vorgehen beim Anwenden auf die bestehende App

1. **Bestandsaufnahme:** Framework, Styling-Ansatz, bestehende Farben/Fonts/Komponenten, Screens und deren Hardcoded-Werte erfassen. Kurz berichten, bevor Dateien geändert werden.
2. **Tokens einführen:** `tokens.css` anlegen und global laden; Basis-Styles (Abschnitt 5) ergänzen. Falls die App bereits ein Theme/Token-System hat, Werte dort einsetzen statt parallel zu führen.
3. **Komponenten einführen:** Button, FeedbackNote, PointsPill, ExamCard (Abschnitt 6). Bestehende ähnliche Komponenten ersetzen oder auf die neuen Styles umstellen; keine Duplikate stehen lassen.
4. **Screens migrieren:** Hardcoded-Farben, -Radien, -Schatten und -Abstände durch Tokens ersetzen. Header, Seitengrund, Karten und Buttons nach den Layout-Regeln (Abschnitt 4) angleichen.
5. **Texte angleichen:** UI-Texte nach Abschnitt 2 prüfen (du, Satzschreibung, Doppelpunkt-Gendern, Mittelpunkt, Dezimalkomma, Punkt am Ende von Headlines).
6. **Kontrast und Fokus prüfen** (Abschnitt 7).
7. **Fehlende Assets** (Abschnitt 8) als offenen Punkt melden, nicht ersetzen.
8. **Kleine, überprüfbare Schritte:** pro Schritt einen sinnvollen Commit; Visuelles per Screenshot gegenprüfen, wenn möglich.

---

## 11. Abschluss-Checkliste

- [ ] Keine losen Hex-Werte, Pixel-Radien oder Schatten mehr im Komponentencode außerhalb der Token-Datei
- [ ] Seitengrund `surface-peach`, Karten/Header `surface`, Header-Unterkante 1px `border`
- [ ] Höchstens ein Primary-Button pro Ansicht; Button-Text nie koralle
- [ ] Koralle als Text überall `coral-text`
- [ ] Punkte-Pill mit „P." und beiden Zahlen; Dezimalkomma
- [ ] Feedback-Notes: Info = blau, Foxxy = pfirsich, Label-Wörter vorhanden
- [ ] Fokus-Ring 2px `ink` mit 2px Offset auf allen interaktiven Elementen
- [ ] Headlines mit Punkt, Satzschreibung, du-Form, `:in`-Gendern, keine Emojis
- [ ] Kein Dark Mode, keine dekorative Animation hinzugefügt
- [ ] Fuchs, Wortmarke und GT Walsheim nicht selbst nachgebaut; als offen gemeldet
- [ ] Mobile-Skalierung der Display-Größen dokumentiert (da nicht definiert)

---

## 12. Snippet für die `CLAUDE.md` der App

```md
## Design
Das UI folgt dem Jurafuchs Design System. Verbindliche Vorgabe: `DESIGN.md` (Tokens, Komponenten, Content-Regeln, Barrierefreiheit).
- Nur Design-Tokens aus `src/styles/tokens.css` verwenden, keine losen Hex-Werte.
- UI-Texte auf Deutsch, du-Form, Satzschreibung, Doppelpunkt-Gendern.
- Koralle als Text nur über `--coral-text`. Ein Primary-Button pro Ansicht.
- Fuchs (Foxxy), Wortmarke und GT Walsheim sind nicht im Repo: nicht nachbauen.
```

---

## 13. Bekannte Einschränkungen des Design Systems

- Nur **ein Theme (hell)**, kein Dark Mode.
- Komponenten wurden aus Live-Seite und Screenshots rekonstruiert, nicht aus dem Original-Quellcode; Maße gegen das Live-Produkt prüfen.
- Keine Mobile-/Responsive-Werte, keine Motion-Definition, keine Formular-Komponenten außer den Basis-Input-Styles aus Abschnitt 5 (abgeleitet aus den Tokens, nicht aus der Quelle gemessen).
- Brand-Assets und Schrift-Dateien fehlen (Abschnitt 8).
- Tokens `foxxy-ink`, `ink-subtle`, `coral-hover` sind aus der Quelle übernommen, verfehlen aber teilweise den Kontrast und sind entsprechend eingeschränkt zu nutzen.
