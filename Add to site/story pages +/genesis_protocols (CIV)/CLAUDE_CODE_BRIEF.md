# CLAUDE CODE BRIEF
## Project: Crack in the Veil — Story Dashboard
## Target: dennisjcarroll.com/stories/ via Fly.io + textual-web

---

## WHAT WE ARE BUILDING

A Textual TUI app served as a live browser experience via `textual-web`.
The app is a multi-tab "recovered classified document" terminal dashboard
for the sci-fi universe "Crack in the Veil."

Main site (dennisjcarroll.com) lives on Netlify/Cloudflare — DO NOT TOUCH THAT.
The /stories/ page will be a single static HTML file that iframes the Fly.io app.

---

## STEP 1 — PROJECT STRUCTURE

Create this exact folder structure:

```
crack-in-the-veil-stories/
├── app.py                    # main Textual app entry point
├── data/
│   └── lore.py               # all canonical data constants
├── screens/
│   ├── __init__.py
│   ├── landing.py
│   ├── suffer_index.py
│   ├── n8k7_bio.py
│   ├── neural_cascade.py
│   ├── isovox.py
│   ├── param_audit.py
│   ├── prob_chain.py
│   ├── earth_prox.py
│   └── field_log.py
├── styles/
│   └── qsri.tcss             # Textual CSS — dark terminal theme
├── Dockerfile
├── fly.toml
├── requirements.txt
└── .dockerignore
```

---

## STEP 2 — requirements.txt

```
textual>=0.47.0
textual-web>=0.6.0
rich>=13.0.0
```

---

## STEP 3 — data/lore.py

Paste this EXACTLY. These are canonical universe constants — do not invent values.

```python
# data/lore.py — CANONICAL CRACK IN THE VEIL DATA
# DO NOT MODIFY VALUES — these are lore canon

QSRI = {
    "budget_billions": 847,
    "epochs": 847,
    "accuracy": 94.7,
    "initial_subjects": 10_000,
    "final_subjects": 2_300_000,
    "global_deployed": 4_200_000_000,
}

SUFFER_INDEX = {
    "baseline_2037": 54.2,
    "post_deploy_2042": 8.7,
    "the_silence_2048": 1.2,
}

PHASES = [
    {"name": "Phase 1 · Miracle",  "yr": "2037–2042", "suffer": 8.7,  "mem": 2,  "id": 1,  "real": 0},
    {"name": "Phase 2 · Warning",  "yr": "2042–2045", "suffer": 4.1,  "mem": 23, "id": 7,  "real": 12},
    {"name": "Phase 3 · Fracture", "yr": "2045–2048", "suffer": 1.9,  "mem": 47, "id": 68, "real": 38},
    {"name": "Phase 4 · Silence",  "yr": "2048+",     "suffer": 1.2,  "mem": 71, "id": 89, "real": 94},
]

BIO_TIMELINE = [
    {"yr": "2038", "pain": 92, "empathy": 95, "memory": 98, "identity": 99, "repro": 97,
     "note": "Deployment begins. Substance P depletion starts."},
    {"yr": "2039", "pain": 71, "empathy": 88, "memory": 95, "identity": 97, "repro": 94,
     "note": "Pain receptors down 29%. Filed as 'successful adjustment.'"},
    {"yr": "2040", "pain": 48, "empathy": 74, "memory": 89, "identity": 94, "repro": 88,
     "note": "Emotional pain pathways begin suppressing. Not in trial data."},
    {"yr": "2041", "pain": 31, "empathy": 61, "memory": 80, "identity": 88, "repro": 79,
     "note": "Empathy deficit emerges. Masochist groups form. Rejoice fringes grow."},
    {"yr": "2042", "pain": 19, "empathy": 47, "memory": 68, "identity": 78, "repro": 66,
     "note": "Memory salience collapse begins. Phase 2 declared."},
    {"yr": "2043", "pain": 12, "empathy": 33, "memory": 54, "identity": 64, "repro": 51,
     "note": "Oxytocin crashes -62%. Social bonding dissolves."},
    {"yr": "2044", "pain": 8,  "empathy": 22, "memory": 39, "identity": 47, "repro": 34,
     "note": "Fertility crisis. Miscarriage rate +340%. Alerts issued."},
    {"yr": "2045", "pain": 5,  "empathy": 14, "memory": 27, "identity": 31, "repro": 19,
     "note": "Birth rate below replacement. Cal McLaren born — one of last viable pregnancies."},
    {"yr": "2046", "pain": 3,  "empathy": 9,  "memory": 18, "identity": 19, "repro": 10,
     "note": "Identity fracture epidemic declared globally."},
    {"yr": "2047", "pain": 2,  "empathy": 5,  "memory": 11, "identity": 11, "repro": 5,
     "note": "The Silence. Global birth rate < 1 per 1,000 attempts."},
    {"yr": "2048", "pain": 1,  "empathy": 3,  "memory": 7,  "identity": 6,  "repro": 2,
     "note": "Phase 4. Veil fracture. Epoch 848. Cal McLaren is 3 years old."},
]

PLANETS = [
    {"name": "Kesslar-1",  "dist": 847,  "rep": 0.79, "tp": 0.14},
    {"name": "Kesslar-4",  "dist": 891,  "rep": 0.71, "tp": 0.11},
    {"name": "Kesslar-6",  "dist": 934,  "rep": 0.83, "tp": 0.17},
    {"name": "Kesslar-8",  "dist": 1011, "rep": 0.69, "tp": 0.10},
    {"name": "Kesslar-9",  "dist": 1089, "rep": 0.81, "tp": 0.16},
    {"name": "Kesslar-12", "dist": 1203, "rep": 0.74, "tp": 0.12},
]

PARAMS = [
    {"n": "prior_sector_isovox",           "f": "0.87",         "t": "0.23",      "d": "+278%",   "crit": True},
    {"n": "spectral_signal_weight",        "f": "0.89",         "t": "0.34",      "d": "+162%",   "crit": True},
    {"n": "atmospheric_likelihood_ratio",  "f": "8.70",         "t": "2.10",      "d": "+314%",   "crit": True},
    {"n": "stellar_age_penalty",           "f": "REMOVED",      "t": "-0.31",     "d": "DELETED", "crit": True},
    {"n": "solar_flare_adjustment",        "f": "0.12",         "t": "0.11",      "d": "+9%",     "crit": False},
    {"n": "deuterium_correlation",         "f": "0.44",         "t": "0.41",      "d": "+7%",     "crit": False},
    {"n": "earth_proximity_factor",        "f": "NOT IN MODEL", "t": "e^(-d/400)","d": "OMITTED", "crit": True},
]

ISOVOX = {
    "structure":     "Self-Phased Phononic Mesh (SPPM)",
    "binding":       "Vibration-Mediated Coulomb Stabilization",
    "regenerative":  "Isofractal Hydrogen Nets + Resonance-Encoded Binding Memory",
    "energetic":     "Passive Ambient Synchronizer — Vacuum-State Compatible",
    "formula":       "C9H20Si6N4O7",
    "base":          "Voxium-C — Siloxane fused with self-resonating amino-ceramic chains",
}

SPECIES_SUFFER = [
    {"species": "Plants (cut/harvested)",  "score": 94,   "note": "Frequency emission — highest in entire index"},
    {"species": "Insects",                 "score": 41,   "note": "Nociceptive only, no psychological layer"},
    {"species": "Fish",                    "score": 58,   "note": "Fear + nociception, limited social pain"},
    {"species": "Birds",                   "score": 67,   "note": "High social pain, territorial loss measurable"},
    {"species": "Non-human mammals",       "score": 74,   "note": "Full nociceptive + emotional + social stack"},
    {"species": "Humans (pre-N8K7)",       "score": 54.2, "note": "QSRI 2037 global mean — psych layer dominant"},
    {"species": "Humans (post-N8K7)",      "score": 1.2,  "note": "2048 — chemically silenced"},
]

RECEPTOR_DATA = [
    {"region": "Nociceptors",       "baseline": 100, "post": 8,  "desc": "Substance P depleted. Primary pain signal gone."},
    {"region": "Ant. Cingulate",    "baseline": 100, "post": 12, "desc": "Social rejection, grief, guilt. Collateral damage."},
    {"region": "Insula Cortex",     "baseline": 100, "post": 17, "desc": "Body awareness. People stop knowing they're in danger."},
    {"region": "Amygdala",          "baseline": 100, "post": 22, "desc": "Fear/threat detection. Risk assessment collapses."},
    {"region": "Hippocampus",       "baseline": 100, "post": 31, "desc": "Pain is memory salience. Without it, nothing sticks."},
    {"region": "Oxytocin",          "baseline": 100, "post": 14, "desc": "Bonding hormone. Social attachment dissolves."},
    {"region": "HPA Axis",          "baseline": 100, "post": 9,  "desc": "Stress response. Body can't mobilize in crisis."},
    {"region": "Neurogenesis",      "baseline": 100, "post": 19, "desc": "Brain growth driven by pain. Stops building pathways."},
]
```

---

## STEP 4 — styles/qsri.tcss

```css
/* qsri.tcss — QSRI Terminal Dark Theme */

Screen {
    background: #05080f;
    color: #b0c4d8;
}

Header {
    background: #060a14;
    color: #00c9b1;
    border-bottom: tall #182030;
    text-style: bold;
}

Footer {
    background: #060a14;
    color: #415464;
    border-top: tall #182030;
}

TabbedContent {
    background: #05080f;
}

TabPane {
    padding: 1 2;
}

Tabs {
    background: #060a14;
    border-bottom: tall #182030;
}

Tab {
    color: #415464;
    background: #060a14;
}

Tab.-active {
    color: #00c9b1;
    background: #060a14;
    border-bottom: tall #00c9b1;
}

Tab:hover {
    color: #67e8f9;
    background: #0a0e1a;
}

DataTable {
    background: #090d18;
    border: tall #182030;
}

DataTable > .datatable--header {
    background: #0e1420;
    color: #415464;
    text-style: bold;
}

DataTable > .datatable--cursor {
    background: #00c9b122;
    color: #00c9b1;
}

DataTable > .datatable--even-row {
    background: #090d18;
}

DataTable > .datatable--odd-row {
    background: #0a0e1a;
}

.stat-box {
    border: tall #182030;
    background: #090d18;
    padding: 1 2;
    margin: 0 1;
}

.stat-value {
    color: #00c9b1;
    text-style: bold;
}

.stat-label {
    color: #415464;
}

.critical {
    color: #ff2d4b;
    text-style: bold;
}

.warning {
    color: #f5a623;
}

.success {
    color: #00c9b1;
}

.dim {
    color: #415464;
}

.section-label {
    color: #415464;
    text-style: bold;
    margin-bottom: 1;
}

.classify-bar {
    background: #060a14;
    color: #ff2d4b;
    text-style: bold;
    padding: 0 2;
}

ProgressBar {
    color: #00c9b1;
    background: #182030;
}

ProgressBar.--warning {
    color: #f5a623;
}

ProgressBar.--critical {
    color: #ff2d4b;
}

ScrollableContainer {
    background: #05080f;
}

Label {
    background: transparent;
}

Static {
    background: transparent;
}

.log-text {
    color: #8fa8c0;
    padding: 1 2;
}

.formula-box {
    background: #090d18;
    border: tall #182030;
    color: #67e8f9;
    padding: 0 1;
    margin: 1 0;
}

.finding-box {
    background: #100006;
    border: tall #ff2d4b44;
    color: #b0c4d8;
    padding: 1 2;
    margin: 1 0;
}

.isovox-box {
    background: #0a0812;
    border: tall #a78bfa44;
    color: #b0c4d8;
    padding: 1 2;
    margin: 1 0;
}
```

---

## STEP 5 — app.py (main entry point)

```python
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, TabbedContent, TabPane
from textual.binding import Binding

from screens.landing import LandingScreen
from screens.suffer_index import SufferIndexScreen
from screens.n8k7_bio import N8K7BioScreen
from screens.neural_cascade import NeuralCascadeScreen
from screens.isovox import IsovoxScreen
from screens.param_audit import ParamAuditScreen
from screens.prob_chain import ProbChainScreen
from screens.earth_prox import EarthProxScreen
from screens.field_log import FieldLogScreen


class QSRIDashboard(App):
    """QSRI Recovered File 7734-C — Genesis Protocols Dashboard"""

    CSS_PATH = "styles/qsri.tcss"
    TITLE = "QSRI FILE 7734-C // MIRRO CORP // RECOVERED"
    SUB_TITLE = "CLASSIFICATION: INTERNAL // GENESIS PROTOCOLS // VEIL: COMPROMISED"

    BINDINGS = [
        Binding("q", "quit", "Quit"),
        Binding("1", "switch_tab('landing')",      "Landing",      show=False),
        Binding("2", "switch_tab('suffer')",       "Suffer Index", show=False),
        Binding("3", "switch_tab('n8k7')",         "N8K7 Bio",     show=False),
        Binding("4", "switch_tab('neural')",       "Neural",       show=False),
        Binding("5", "switch_tab('isovox')",       "IsoVox",       show=False),
        Binding("6", "switch_tab('params')",       "Params",       show=False),
        Binding("7", "switch_tab('prob')",         "Prob Chain",   show=False),
        Binding("8", "switch_tab('earth')",        "Earth Prox",   show=False),
        Binding("9", "switch_tab('log')",          "Field Log",    show=False),
    ]

    def compose(self) -> ComposeResult:
        yield Header()
        with TabbedContent(initial="landing"):
            with TabPane("▸ LANDING",      id="landing"):
                yield LandingScreen()
            with TabPane("SUFFER INDEX",   id="suffer"):
                yield SufferIndexScreen()
            with TabPane("N8K7 BIO",       id="n8k7"):
                yield N8K7BioScreen()
            with TabPane("NEURAL CASCADE", id="neural"):
                yield NeuralCascadeScreen()
            with TabPane("ISOVOX COMP",    id="isovox"):
                yield IsovoxScreen()
            with TabPane("PARAM AUDIT",    id="params"):
                yield ParamAuditScreen()
            with TabPane("PROB CHAIN",     id="prob"):
                yield ProbChainScreen()
            with TabPane("EARTH PROX",     id="earth"):
                yield EarthProxScreen()
            with TabPane("FIELD LOG",      id="log"):
                yield FieldLogScreen()
        yield Footer()

    def action_switch_tab(self, tab_id: str) -> None:
        self.query_one(TabbedContent).active = tab_id


if __name__ == "__main__":
    app = QSRIDashboard()
    app.run()
```

---

## STEP 6 — BUILD ALL SCREENS

For each screen in screens/, use this pattern. Claude Code: build ALL nine screens.

### screens/landing.py — example pattern to follow for all screens

```python
from textual.app import ComposeResult
from textual.widgets import Static, Label
from textual.containers import ScrollableContainer, Vertical, Horizontal


class LandingScreen(ScrollableContainer):

    def compose(self) -> ComposeResult:
        yield Static(
            "▋ CLASSIFICATION: QSRI-INTERNAL // MIRRO CORP // RECOVERED FILE 7734-C ▋",
            classes="classify-bar"
        )
        yield Static("")
        yield Static(
            "GENESIS PROTOCOLS — FULL DATA RECONSTRUCTION",
            markup=False
        )
        yield Static(
            "QSRI 2037–2041  ·  BUDGET $847B  ·  EPOCHS 847  ·  "
            "ACCURACY 94.7%  ·  DEPLOYED 4.2B HUMANS  ·  VEIL: COMPROMISED",
            classes="dim"
        )
        yield Static("")
        yield Static(
            "╔══════════════════════════════════════════════════════╗\n"
            "║         C R A C K   I N   T H E   V E I L            ║\n"
            "║              RECOVERED STORY ARCHIVE                  ║\n"
            "╚══════════════════════════════════════════════════════╝"
        )
        yield Static("")
        yield Static(
            "Humanity tried to cure suffering. We succeeded.\n"
            "And in doing so, we broke something fundamental—\n"
            "not just in ourselves, but in the fabric of reality itself.",
            classes="log-text"
        )
        yield Static("")
        yield Static("AVAILABLE ARCS:", classes="section-label")
        yield Static(
            "  [1] CAPTAIN CAL McLAREN  —  Echo-Naut, Kesslar Sector, Year 3567\n"
            "  [2] DETECTIVE MARIA McLAREN  —  Organ black market, New Earth\n"
            "  [3] THE REJOICE NATION  —  Breakaway society, post-N8K7\n"
            "  [4] THE NERVED  —  Those who refused treatment\n",
            classes="dim"
        )
        yield Static("")
        yield Static(
            "Press 1–9 to navigate tabs  ·  Q to quit",
            classes="dim"
        )
```

### screens/param_audit.py — DataTable pattern

```python
from textual.app import ComposeResult
from textual.widgets import Static, DataTable
from textual.containers import ScrollableContainer
from data.lore import PARAMS
import math


class ParamAuditScreen(ScrollableContainer):

    def compose(self) -> ComposeResult:
        yield Static("▸ PARAMETER COMPARISON: FILED MODEL v2.1 vs. RECOVERED v1.0",
                     classes="section-label")
        yield Static("")

        table = DataTable()
        table.add_columns("PARAMETER", "FILED", "TRUE VALUE", "DELTA", "FLAG")
        for p in PARAMS:
            flag = "⚠ CRITICAL" if p["crit"] else "  minor"
            style = "critical" if p["crit"] else "dim"
            table.add_row(
                p["n"], p["f"], p["t"], p["d"], flag,
                key=p["n"]
            )
        yield table

        yield Static("")
        yield Static(
            "stellar_age_penalty: present in v1.0 · deleted before v2.1 was filed\n"
            "Removal inflated per-planet scores by +31 percentage points each.\n"
            "Van-21-IR (Kesslar sector) is a Class F active star — hostile to IsoVox formation.",
            classes="finding-box"
        )


# Follow this same pattern for all other screens.
# Use DataTable for tabular data, Static+ProgressBar for metrics,
# ScrollableContainer as the root widget for all screens.
```

### screens/prob_chain.py — math display pattern

```python
from textual.app import ComposeResult
from textual.widgets import Static, ProgressBar, Label
from textual.containers import ScrollableContainer, Vertical
from data.lore import PLANETS
import math


def earth_prox(d):
    return math.exp(-d / 400)


class ProbChainScreen(ScrollableContainer):

    def compose(self) -> ComposeResult:
        filed   = 1 - math.prod(1 - p["rep"] for p in PLANETS)
        honest  = 1 - math.prod(1 - p["tp"]  for p in PLANETS)
        w_prox  = 1 - math.prod(1 - p["tp"] * earth_prox(p["dist"]) for p in PLANETS)

        yield Static("▸ THREE VERSIONS OF THE SAME TRUTH", classes="section-label")
        yield Static("")

        for label, prob, tag, color_class, formula in [
            ("MIRRO CORP FILED MODEL (v2.1 · 2037)",
             filed, "MANIPULATED", "critical",
             "P(>=1 hit | 6 planets) = 1 - (1 - 0.76)^6 = 99.98%"),
            ("RECOVERED HONEST MODEL (v1.0 parameters restored)",
             honest, "TRUE BASELINE", "warning",
             "P(>=1 hit | 6 planets) = 1 - (0.86)(0.89)(0.83)(0.90)(0.84)(0.88) = 57.74%"),
            ("HONEST MODEL + EARTH PROXIMITY FACTOR",
             w_prox, "FULL MODEL", "success",
             "P(>=1 hit) = 1 - prod_i(1 - p_i * e^(-d_i/400)) = 3.24%"),
        ]:
            yield Static(label, classes="dim")
            yield Static(f"  {prob*100:.2f}%  [{tag}]", classes=color_class)
            yield Static(f"  {formula}", classes="formula-box")
            bar = ProgressBar(total=100, show_eta=False)
            bar.advance(prob * 100)
            yield bar
            yield Static("")
```

### IMPORTANT: Build screens for ALL tabs using the above patterns:
- suffer_index.py — DataTable for species comparison, Static for trajectory
- n8k7_bio.py — DataTable with year-by-year bio cascade data + ProgressBars
- neural_cascade.py — DataTable for receptor suppression, cascade logic as Static blocks
- isovox.py — Static blocks for formula/composition, DataTable for properties
- earth_prox.py — DataTable with planet scores + proximity calculation
- field_log.py — Pure Static text, monospace, Cal's encrypted log verbatim

---

## STEP 7 — Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Expose port
EXPOSE 8080

# Run textual-web
CMD ["textual-web", "--app", "app:QSRIDashboard", "--port", "8080", "--host", "0.0.0.0"]
```

---

## STEP 8 — fly.toml

```toml
app = "citv-stories"
primary_region = "ewr"  # Newark — closest to NY

[build]

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false   # CRITICAL: keep alive for WebSocket connections
  auto_start_machines = true
  min_machines_running = 1     # always at least 1 instance live

  [http_service.concurrency]
    type = "connections"
    hard_limit = 50
    soft_limit = 25

[[vm]]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1
```

---

## STEP 9 — .dockerignore

```
__pycache__/
*.pyc
*.pyo
.env
.git
.gitignore
*.md
```

---

## STEP 10 — DEPLOY COMMANDS

Run these in order in your terminal (not Claude Code):

```bash
# 1. Install flyctl (if not already installed)
curl -L https://fly.io/install.sh | sh

# 2. Log in to Fly
fly auth login

# 3. From inside your project folder — initialize
fly launch --name citv-stories --region ewr --no-deploy

# 4. Deploy
fly deploy

# 5. Check it's running
fly status

# 6. Get your live URL — will be:
#    https://citv-stories.fly.dev
```

---

## STEP 11 — /stories/ page on your existing site

Create this file in your Netlify/Cloudflare repo at `stories/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stories — Crack in the Veil</title>
  <meta name="description"
    content="Recovered classified documents from the Crack in the Veil universe.">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      background: #05080f;
      overflow: hidden;
    }
    iframe {
      width: 100vw;
      height: 100vh;
      border: none;
      display: block;
    }
    .loading {
      position: fixed;
      inset: 0;
      background: #05080f;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Courier New', monospace;
      color: #00c9b1;
      font-size: 13px;
      letter-spacing: 3px;
      z-index: 10;
      transition: opacity 0.5s ease;
    }
    .loading.hidden { opacity: 0; pointer-events: none; }
    .blink { animation: blink 1s step-end infinite; }
    @keyframes blink { 50% { opacity: 0; } }
  </style>
</head>
<body>
  <div class="loading" id="loader">
    <div>▋ QSRI FILE 7734-C</div>
    <div style="margin-top:8px;color:#415464;">CONNECTING TO ECHO VAULT...</div>
    <div style="margin-top:8px;" class="blink">█</div>
  </div>

  <iframe
    id="terminal"
    src="https://citv-stories.fly.dev"
    title="Crack in the Veil — Story Archive"
    allow="fullscreen"
    onload="document.getElementById('loader').classList.add('hidden')">
  </iframe>
</body>
</html>
```

---

## CONTEXT FOR CLAUDE CODE

If Claude Code asks what this is — tell it:

> "This is a Textual TUI app for a sci-fi story universe called Crack in the Veil.
> The aesthetic should feel like a recovered classified government terminal document.
> Dark background (#05080f), teal accent (#00c9b1), red for critical data (#ff2d4b),
> amber for warnings (#f5a623). Monospace everything. Clinical, not decorative.
> Every data value comes from data/lore.py — do not invent numbers."

---

## BUILD ORDER FOR CLAUDE CODE

Tell Claude Code to build in this sequence:

1. Create project structure + requirements.txt
2. Paste data/lore.py exactly as provided
3. Create styles/qsri.tcss
4. Build app.py
5. Build screens/ — landing first, then param_audit, prob_chain, earth_prox, field_log
6. Build screens/ — suffer_index, n8k7_bio, neural_cascade, isovox
7. Create Dockerfile + fly.toml + .dockerignore
8. Test locally: `python app.py`
9. Test web: `textual-web --app app:QSRIDashboard --port 8080`
10. Deploy: `fly deploy`
11. Create stories/index.html for your main site
