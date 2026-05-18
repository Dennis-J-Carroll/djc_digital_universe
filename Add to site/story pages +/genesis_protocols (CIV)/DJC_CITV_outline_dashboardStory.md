*This is the collection of Crack in the Veil data scripts for the Landing-page + interactive story*


Everything is important informaiton ESPECIALLY:: +++MAIN SCHEMA OUTLINE+++









// FIELD LOG :: CAPTAIN CAL :: STARDATE [REDACTED]
// FILE: isovox_search_v7.dat
// STATUS: NULL RETURN

Probability model: 99.98% confidence
Search nodes: 6 of 6 CLEARED
Isovox signal: NOT DETECTED

I ran it again. Same answer.

The math doesn't lie. But it doesn't know
what I know — which is nothing, apparently.
Either Isovox isn't where the model says,
or Isovox isn't what the model thinks it is.

Or the model was built by someone who needed
me to look the wrong way.

Ava, flag this file. Don't archive it.





---------------------------------------------------

// QSRI_INTERNAL_FILE_7734-C — RECOVERED



import { useState, useEffect } from "react";

const TEAL = "#00c9b1";
const RED = "#ff2d4b";
const AMBER = "#f5a623";
const GHOST = "#4a5568";
const CYAN = "#67e8f9";
const PURPLE = "#a78bfa";
const BG = "#060810";
const BG2 = "#0d1117";
const BG3 = "#111827";

const planets = [
  { id: "K-1", name: "Kesslar-1",  dist: 847,  spectral: 0.41, atmo: 0.38, stellar_age: 4.2, reported: 0.79, honest: 0.14 },
  { id: "K-4", name: "Kesslar-4",  dist: 891,  spectral: 0.29, atmo: 0.31, stellar_age: 3.8, reported: 0.71, honest: 0.11 },
  { id: "K-6", name: "Kesslar-6",  dist: 934,  spectral: 0.52, atmo: 0.44, stellar_age: 5.1, reported: 0.83, honest: 0.17 },
  { id: "K-8", name: "Kesslar-8",  dist: 1011, spectral: 0.33, atmo: 0.27, stellar_age: 3.2, reported: 0.69, honest: 0.10 },
  { id: "K-9", name: "Kesslar-9",  dist: 1089, spectral: 0.48, atmo: 0.51, stellar_age: 2.9, reported: 0.81, honest: 0.16 },
  { id: "K-12","name":"Kesslar-12", dist: 1203, spectral: 0.37, atmo: 0.35, stellar_age: 4.7, reported: 0.74, honest: 0.12 },
];



import { useState, useEffect } from "react";

const planets = [
  { name: "Kesslar-1",  dist: 847,  spectral: 0.41, atmo: 0.38, age: 4.2, rep: 0.79, true_p: 0.14 },
  { name: "Kesslar-4",  dist: 891,  spectral: 0.29, atmo: 0.31, age: 3.8, rep: 0.71, true_p: 0.11 },
  { name: "Kesslar-6",  dist: 934,  spectral: 0.52, atmo: 0.44, age: 5.1, rep: 0.83, true_p: 0.17 },
  { name: "Kesslar-8",  dist: 1011, spectral: 0.33, atmo: 0.27, age: 3.2, rep: 0.69, true_p: 0.10 },
  { name: "Kesslar-9",  dist: 1089, spectral: 0.48, atmo: 0.51, age: 2.9, rep: 0.81, true_p: 0.16 },
  { name: "Kesslar-12", dist: 1203, spectral: 0.37, atmo: 0.35, age: 4.7, rep: 0.74, true_p: 0.12 },
];

const params = [
  { name: "prior_sector_isovox",     reported: "0.87", true_val: "0.23", delta: "+278%", critical: true },
  { name: "spectral_signal_weight",  reported: "0.89", true_val: "0.34", delta: "+162%", critical: true },
  { name: "atmospheric_likelihood_ratio", reported: "8.70", true_val: "2.10", delta: "+314%", critical: true },
  { name: "stellar_age_penalty",     reported: "REMOVED", true_val: "-0.31", delta: "DELETED", critical: true },
  { name: "solar_flare_adjustment",  reported: "0.12", true_val: "0.11", delta: "+9%",   critical: false },
  { name: "deuterium_correlation",   reported: "0.44", true_val: "0.41", delta: "+7%",   critical: false },
  { name: "earth_proximity_factor",  reported: "NOT IN MODEL", true_val: "e^(-d/400)", delta: "OMITTED", critical: true },
];

export default function QSRIFile() {
  const [tab, setTab] = useState(0);
  const [showSmokingGun, setShowSmokingGun] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 80);
    return () => clearInterval(t);
  }, []);

  const earthProxScore = (dist) => Math.exp(-dist / 400);

  const reportedCombined = 1 - planets.reduce((acc, p) => acc * (1 - p.rep), 1);
  const trueCombined     = 1 - planets.reduce((acc, p) => acc * (1 - p.true_p), 1);
  const proxCombined     = 1 - planets.reduce((acc, p) => acc * (1 - p.true_p * earthProxScore(p.dist)), 1);

  const tabs = ["PARAMETER AUDIT", "PROBABILITY CHAIN", "EARTH PROXIMITY", "FIELD LOG :: CAL"];

  const styles = {
    root: { background: "#060810", minHeight: "100vh", fontFamily: "'Courier New', monospace", color: "#c8d6e5", padding: "0" },
    header: { borderBottom: "1px solid #1a2535", padding: "20px 24px 16px", background: "#080d18" },
    classify: { fontSize: "10px", letterSpacing: "3px", color: "#ff2d4b", marginBottom: "8px" },
    title: { fontSize: "18px", fontWeight: "bold", color: "#00c9b1", letterSpacing: "1px" },
    subtitle: { fontSize: "11px", color: "#4a5568", marginTop: "4px", letterSpacing: "2px" },
    tabBar: { display: "flex", borderBottom: "1px solid #1a2535", background: "#080d18" },
    tab: (active) => ({
      padding: "10px 18px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer",
      borderBottom: active ? "2px solid #00c9b1" : "2px solid transparent",
      color: active ? "#00c9b1" : "#4a5568", background: "none", border: "none",
      borderBottom: active ? "2px solid #00c9b1" : "2px solid transparent",
    }),
    body: { padding: "24px", maxWidth: "900px" },
    section: { marginBottom: "32px" },
    label: { fontSize: "10px", letterSpacing: "3px", color: "#4a5568", marginBottom: "12px" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "12px" },
    th: { textAlign: "left", padding: "8px 12px", fontSize: "10px", letterSpacing: "2px", color: "#4a5568", borderBottom: "1px solid #1a2535" },
    tr: (critical, i) => ({
      background: i % 2 === 0 ? "#0a0f1a" : "#0d1320",
      borderLeft: critical ? "3px solid #ff2d4b" : "3px solid transparent",
    }),
    td: { padding: "9px 12px", verticalAlign: "middle" },
    badge: (color) => ({
      display: "inline-block", padding: "2px 8px", fontSize: "10px",
      borderRadius: "2px", background: color + "22", color: color,
      border: "1px solid " + color + "44", letterSpacing: "1px",
    }),
    probBox: (color) => ({
      background: color + "11", border: "1px solid " + color + "44",
      borderRadius: "4px", padding: "16px 20px", marginBottom: "12px",
    }),
    bigNum: (color) => ({ fontSize: "36px", fontWeight: "bold", color, letterSpacing: "-1px" }),
    formula: { background: "#0a0f1a", border: "1px solid #1a2535", borderRadius: "4px", padding: "12px 16px", fontSize: "12px", color: "#67e8f9", marginBottom: "8px" },
    bar: (w, color) => ({
      height: "8px", width: w + "%", background: color,
      borderRadius: "2px", transition: "width 1s ease",
      display: "inline-block",
    }),
    barTrack: { background: "#1a2535", borderRadius: "2px", height: "8px", width: "100%", overflow: "hidden" },
    gun: { background: "#1a0a0d", border: "2px solid #ff2d4b44", borderRadius: "6px", padding: "20px", marginTop: "20px" },
    log: { background: "#060c14", border: "1px solid #1a2535", borderRadius: "4px", padding: "20px", fontSize: "13px", lineHeight: "1.8", color: "#8fa8c0" },
  };

  return (
    <div style={styles.root}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.classify}>▋ CLASSIFICATION: QSRI-INTERNAL // MIRRO CORP // RECOVERED FILE 7734-C ▋</div>
        <div style={styles.title}>ISOVOX CANDIDATE MODEL — AUDIT RECONSTRUCTION</div>
        <div style={styles.subtitle}>
          FILED: 2042.04.17 &nbsp;|&nbsp; RECOVERED: EPOCH 848+ &nbsp;|&nbsp; 
          STATUS: <span style={{color:"#ff2d4b"}}>MODEL INTEGRITY COMPROMISED</span>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={styles.tabBar}>
        {tabs.map((t, i) => (
          <button key={i} style={styles.tab(tab === i)} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      <div style={styles.body}>

        {/* TAB 0: PARAMETER AUDIT */}
        {tab === 0 && (
          <div>
            <div style={styles.label}>▸ PARAMETER COMPARISON: FILED vs. RECOVERED ORIGINAL</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["PARAMETER","FILED VALUE","TRUE VALUE","DELTA","FLAG"].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {params.map((p, i) => (
                  <tr key={i} style={styles.tr(p.critical, i)}>
                    <td style={{...styles.td, color: "#c8d6e5", fontFamily:"monospace"}}>{p.name}</td>
                    <td style={{...styles.td, color: p.critical ? "#ff2d4b" : "#00c9b1"}}>{p.reported}</td>
                    <td style={{...styles.td, color: "#67e8f9"}}>{p.true_val}</td>
                    <td style={{...styles.td, color: p.critical ? "#ff2d4b" : "#4a5568", fontWeight: p.critical ? "bold" : "normal"}}>{p.delta}</td>
                    <td style={styles.td}>
                      {p.critical
                        ? <span style={styles.badge("#ff2d4b")}>CRITICAL</span>
                        : <span style={styles.badge("#4a5568")}>MINOR</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{...styles.probBox("#ff2d4b"), marginTop: "24px"}}>
              <div style={{fontSize:"11px", letterSpacing:"2px", color:"#4a5568", marginBottom:"8px"}}>SUMMARY FINDING</div>
              <div style={{fontSize:"13px", lineHeight:"1.7", color:"#c8d6e5"}}>
                Four parameters were materially altered. The <span style={{color:"#ff2d4b"}}>stellar_age_penalty</span> was 
                deleted entirely — this variable penalizes young, high-radiation star systems 
                (like Van-21-IR / Kesslar sector) where IsoVox formation is thermodynamically 
                implausible. Its removal alone accounts for <span style={{color:"#ff2d4b"}}>+31 percentage points</span> per planet.
                The <span style={{color:"#ff2d4b"}}>earth_proximity_factor</span> was never included in the model at all.
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: PROBABILITY CHAIN */}
        {tab === 1 && (
          <div>
            <div style={styles.label}>▸ PROBABILITY RECONSTRUCTION: THREE VERSIONS OF TRUTH</div>

            {[
              { label: "FILED MODEL (MIRRO CORP, 2037)", prob: reportedCombined, color: "#ff2d4b", tag: "MANIPULATED",
                formula: "P(≥1 hit) = 1 − (1 − 0.76̄)⁶  =  1 − 0.000191  =  99.98%" },
              { label: "HONEST MODEL (RECOVERED PARAMETERS)", prob: trueCombined, color: "#f5a623", tag: "TRUE BASELINE",
                formula: "P(≥1 hit) = 1 − (0.86)(0.89)(0.83)(0.90)(0.84)(0.88)  =  57.74%" },
              { label: "HONEST + EARTH PROXIMITY FACTOR", prob: proxCombined, color: "#00c9b1", tag: "FULL MODEL",
                formula: "P(≥1 hit) = 1 − ∏ᵢ(1 − pᵢ · e^(−dᵢ/400))  →  see Tab 3" },
            ].map((v, i) => (
              <div key={i} style={{...styles.probBox(v.color), marginBottom:"16px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:"10px", letterSpacing:"2px", color:"#4a5568", marginBottom:"4px"}}>{v.label}</div>
                    <div style={styles.bigNum(v.color)}>{(v.prob * 100).toFixed(2)}%</div>
                  </div>
                  <span style={styles.badge(v.color)}>{v.tag}</span>
                </div>
                <div style={{...styles.formula, marginTop:"12px"}}>{v.formula}</div>
                <div style={styles.barTrack}>
                  <div style={styles.bar(v.prob * 100, v.color)} />
                </div>
              </div>
            ))}

            <div style={{...styles.probBox("#4a5568"), marginTop:"8px"}}>
              <div style={{fontSize:"11px", color:"#c8d6e5", lineHeight:"1.7"}}>
                <span style={{color:"#f5a623"}}>Note on the independence assumption:</span> The filed model treats all six 
                Kesslar planets as independent draws. This is itself misleading — planets in the same 
                stellar sector share formation conditions. A correlated model would further reduce the 
                honest combined probability. This was not flagged in the original QSRI review.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EARTH PROXIMITY */}
        {tab === 2 && (
          <div>
            <div style={styles.label}>▸ THE OMITTED VARIABLE: earth_proximity_factor</div>

            <div style={{...styles.probBox("#a78bfa"), marginBottom:"24px"}}>
              <div style={{fontSize:"11px", letterSpacing:"2px", color:"#4a5568", marginBottom:"8px"}}>VARIABLE DEFINITION</div>
              <div style={{...styles.formula}}>earth_proximity_factor(d) = e^(−d / 400)</div>
              <div style={{fontSize:"12px", color:"#c8d6e5", lineHeight:"1.7"}}>
                Where <span style={{color:"#67e8f9"}}>d</span> = distance from Earth in light-years.
                IsoVox's formation requires a specific quantum-resonance baseline only found near 
                planetary bodies with sustained biological complexity. Earth — the only confirmed 
                origin point of such complexity — anchors this field. The model was built without 
                this term. All six Kesslar planets score below 0.12.
              </div>
            </div>

            <div style={styles.label}>▸ PLANET SCORES WITH PROXIMITY APPLIED</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["PLANET","DIST (LY)","BASE P(Isovox)","PROX FACTOR","ADJUSTED P","STATUS"].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...planets, {name:"EARTH", dist:0, spectral:0.94, atmo:0.91, age:4.5, rep:0.00, true_p:0.94}].map((p, i) => {
                  const prox = earthProxScore(p.dist);
                  const adj = p.true_p * prox;
                  const isEarth = p.name === "EARTH";
                  return (
                    <tr key={i} style={{...styles.tr(isEarth, i), background: isEarth ? "#001a0d" : undefined}}>
                      <td style={{...styles.td, color: isEarth ? "#00c9b1" : "#c8d6e5", fontWeight: isEarth ? "bold" : "normal"}}>{p.name}</td>
                      <td style={styles.td}>{p.dist.toLocaleString()}</td>
                      <td style={{...styles.td, color:"#f5a623"}}>{(p.true_p).toFixed(3)}</td>
                      <td style={{...styles.td, color: isEarth ? "#00c9b1" : "#4a5568"}}>{prox.toFixed(4)}</td>
                      <td style={{...styles.td, color: isEarth ? "#00c9b1" : "#ff2d4b", fontWeight:"bold"}}>{(adj * 100).toFixed(2)}%</td>
                      <td style={styles.td}>
                        <span style={styles.badge(isEarth ? "#00c9b1" : "#ff2d4b")}>
                          {isEarth ? "ORIGIN CANDIDATE" : "NULL"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{...styles.gun}}>
              <div style={{fontSize:"11px", letterSpacing:"3px", color:"#ff2d4b", marginBottom:"12px"}}>▋ AUDIT CONCLUSION</div>
              <div style={{fontSize:"13px", color:"#c8d6e5", lineHeight:"1.8"}}>
                When <code style={{color:"#67e8f9"}}>earth_proximity_factor</code> is applied retroactively to all six 
                mission targets, combined probability of success drops to{" "}
                <span style={{color:"#ff2d4b", fontWeight:"bold"}}>{(proxCombined * 100).toFixed(2)}%</span>.{" "}
                Earth itself — excluded from the candidate list — scores{" "}
                <span style={{color:"#00c9b1", fontWeight:"bold"}}>94.00%</span>.<br/><br/>
                This variable was <span style={{color:"#ff2d4b"}}>known to QSRI research leads by 2036</span> per recovered 
                internal memos (Echo Vault 22-F). Its exclusion from the filed model is not an 
                oversight. The six Echo-Nauts were given a mission designed to fail — or designed 
                to keep them away.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CAL'S FIELD LOG */}
        {tab === 3 && (
          <div>
            <div style={styles.label}>▸ FIELD LOG :: CAPTAIN CAL McLAREN :: ENCRYPTED FRAGMENT</div>
            <div style={styles.log}>
              <div style={{color:"#4a5568", fontSize:"11px", marginBottom:"16px", letterSpacing:"2px"}}>
                // NAI ARCHIVE FRAGMENT — DO NOT SUBMIT TO AVA — LOCAL STORAGE ONLY
              </div>
              <p>
                <span style={{color:"#00c9b1"}}>CC // Kesslar-12 orbit // Day 2,847</span>
              </p>
              <p>
                Six. Six and nothing. The math said 99.98. I used to tell Sara that percents aren't 
                real until they're proven. She was right. I was quoting a number someone else built 
                for me. I never looked at the model.
              </p>
              <p>
                I asked Ava tonight to show me the original parameter file. Not the briefing summary. 
                The actual QSRI build log. She said it wasn't in the archive. I asked her what version 
                was in the archive. She paused — <span style={{color:"#f5a623"}}>16 months, 1 week, 2 days, 7 hours, 14 minutes</span> — 
                she still paused.
              </p>
              <p>
                The version she showed me is v2.1. I want v1.0.
              </p>
              <p>
                I ran my own numbers tonight. Back-of-envelope. If the prior was closer to what 
                the 2034 sector survey suggested — around 23% — and you put the age penalty back 
                in, you don't get 99.98. You get somewhere around 60. Maybe less.
              </p>
              <p>
                And there's something else. Something I keep coming back to. None of the candidate 
                models I've seen account for <span style={{color:"#ff2d4b"}}>where we came from</span>. 
                Every planet on this list is 800 to 1,200 light-years out. Nobody asked why the 
                element would be out here and not closer to the only place we know produced life.
              </p>
              <p>
                The green circle on my board. That's Earth. That's always been Earth.
              </p>
              <p style={{color:"#4a5568", marginTop:"24px", fontSize:"11px", letterSpacing:"1px"}}>
                // END FRAGMENT // AUTO-ENCRYPT ACTIVE // AVA HIVEMIND: EXCLUDED //
              </p>
            </div>

            <div style={{...styles.probBox("#4a5568"), marginTop:"20px"}}>
              <div style={{fontSize:"11px", color:"#c8d6e5", lineHeight:"1.7"}}>
                <span style={{color:"#a78bfa"}}>Ava access log, same timestamp:</span>{" "}
                Parameter file v1.0 accessed 1 time — 2037.11.03. Requestor: <span style={{color:"#ff2d4b"}}>M. MIRRO</span>. 
                File flagged read-only. Version archived without subsequent modification record.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}





--------------------------------------------------------





import { useState, useEffect, useRef } from "react";

// ── CANONICAL LORE CONSTANTS (from Genesis Protocols + Concept Paper) ──
const LORE = {
  qsri: { budget: 847, epochs: 847, accuracy: 94.7, testPop: "10,000 → 2.3M", deployed: 4.2 },
  suffer: { baseline: 54.2, postDeploy: 8.7, reduction: 85 },
  phases: [
    { name:"Phase 1 · Success", epochs:"1–200",   suffer: 8.7,  memory: 2,  identity: 1,  reality: 0  },
    { name:"Phase 2 · Warning", epochs:"201–500", suffer: 4.1,  memory: 23, identity: 7,  reality: 12 },
    { name:"Phase 3 · Fracture",epochs:"501–847", suffer: 1.9,  memory: 47, identity: 68, reality: 38 },
    { name:"Phase 4 · Deployed",epochs:"848+",    suffer: 1.2,  memory: 71, identity: 89, reality: 94 },
  ],
  isovox: {
    filed: 99.98, honest: 57.74, withProx: 3.24, earthProx: 94.0,
    params: [
      { name:"prior_sector_isovox",        filed:"0.87", truth:"0.23", delta:"+278%", flag:"CRITICAL" },
      { name:"spectral_signal_weight",     filed:"0.89", truth:"0.34", delta:"+162%", flag:"CRITICAL" },
      { name:"atmospheric_likelihood_ratio",filed:"8.70",truth:"2.10", delta:"+314%", flag:"CRITICAL" },
      { name:"stellar_age_penalty",        filed:"REMOVED",truth:"−0.31",delta:"DELETED",flag:"CRITICAL"},
      { name:"solar_flare_adjustment",     filed:"0.12", truth:"0.11", delta:"+9%",   flag:"MINOR"   },
      { name:"deuterium_correlation",      filed:"0.44", truth:"0.41", delta:"+7%",   flag:"MINOR"   },
      { name:"earth_proximity_factor",     filed:"NOT IN MODEL",truth:"e^(−d/400)",delta:"OMITTED",flag:"CRITICAL"},
    ],
    planets: [
      { name:"Kesslar-1",  dist:847,  rep:0.79, true_p:0.14 },
      { name:"Kesslar-4",  dist:891,  rep:0.71, true_p:0.11 },
      { name:"Kesslar-6",  dist:934,  rep:0.83, true_p:0.17 },
      { name:"Kesslar-8",  dist:1011, rep:0.69, true_p:0.10 },
      { name:"Kesslar-9",  dist:1089, rep:0.81, true_p:0.16 },
      { name:"Kesslar-12", dist:1203, rep:0.74, true_p:0.12 },
    ]
  }
};


export default function QSRIRecoveredFile() { ... }


-------------------

import { useState, useEffect } from "react";

const C = {
  bg:     "#05080f",
  bg2:    "#0a0e1a",
  bg3:    "#0f1520",
  border: "#1a2535",
  teal:   "#00c9b1",
  red:    "#ff2d4b",
  amber:  "#f5a623",
  cyan:   "#67e8f9",
  purple: "#a78bfa",
  ghost:  "#3d4f63",
  text:   "#b8cad9",
  dim:    "#4a5c6e",
};

const planets = [
  { name:"Kesslar-1",  dist:847,  rep:0.79, true_p:0.14 },
  { name:"Kesslar-4",  dist:891,  rep:0.71, true_p:0.11 },
  { name:"Kesslar-6",  dist:934,  rep:0.83, true_p:0.17 },
  { name:"Kesslar-8",  dist:1011, rep:0.69, true_p:0.10 },
  { name:"Kesslar-9",  dist:1089, rep:0.81, true_p:0.16 },
  { name:"Kesslar-12", dist:1203, rep:0.74, true_p:0.12 },
];

const params = [
  { name:"prior_sector_isovox",          filed:"0.87",        truth:"0.23",     delta:"+278%",  crit:true  },
  { name:"spectral_signal_weight",       filed:"0.89",        truth:"0.34",     delta:"+162%",  crit:true  },
  { name:"atmospheric_likelihood_ratio", filed:"8.70",        truth:"2.10",     delta:"+314%",  crit:true  },
  { name:"stellar_age_penalty",          filed:"REMOVED",     truth:"−0.31",    delta:"DELETED",crit:true  },
  { name:"solar_flare_adjustment",       filed:"0.12",        truth:"0.11",     delta:"+9%",    crit:false },
  { name:"deuterium_correlation",        filed:"0.44",        truth:"0.41",     delta:"+7%",    crit:false },
  { name:"earth_proximity_factor",       filed:"NOT IN MODEL",truth:"e^(−d/400)",delta:"OMITTED",crit:true },
];

const phases = [
  { name:"Phase 1 · Miracle",  epochs:"1–200",   suffer:8.7,  mem:2,  id:1,  real:0,  color:"#00c9b1" },
  { name:"Phase 2 · Warning",  epochs:"201–500", suffer:4.1,  mem:23, id:7,  real:12, color:"#f5a623" },
  { name:"Phase 3 · Fracture", epochs:"501–847", suffer:1.9,  mem:47, id:68, real:38, color:"#ff7a00" },
  { name:"Phase 4 · Deployed", epochs:"848+",    suffer:1.2,  mem:71, id:89, real:94, color:"#ff2d4b" },
];

function prox(d) { return Math.exp(-d / 400); }

const filedComb  = 1 - planets.reduce((a,p)=>a*(1-p.rep),1);
const trueComb   = 1 - planets.reduce((a,p)=>a*(1-p.true_p),1);
const proxComb   = 1 - planets.reduce((a,p)=>a*(1-p.true_p*prox(p.dist)),1);

// Simple SVG bar chart
function Bar({ val, max=100, color, h=8 }) {
  return (
    <div style={{background:C.border,borderRadius:2,height:h,overflow:"hidden",width:"100%"}}>
      <div style={{width:`${(val/max)*100}%`,height:"100%",background:color,borderRadius:2,transition:"width 0.8s ease"}}/>
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{fontSize:9,letterSpacing:1,padding:"2px 7px",borderRadius:2,
      background:color+"22",color,border:`1px solid ${color}44`,fontFamily:"monospace"}}>
      {label}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div style={{marginBottom:28}}>
      <div style={{fontSize:9,letterSpacing:3,color:C.dim,marginBottom:12,fontFamily:"monospace"}}>▸ {title}</div>
      {children}
    </div>
  );
}

function ProbBlock({ label, tag, prob, color, formula, note }) {
  return (
    <div style={{background:color+"0d",border:`1px solid ${color}33`,borderRadius:4,
      padding:"14px 18px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div>
          <div style={{fontSize:9,letterSpacing:2,color:C.dim,marginBottom:4,fontFamily:"monospace"}}>{label}</div>
          <div style={{fontSize:34,fontWeight:700,color,letterSpacing:-1,fontFamily:"monospace"}}>
            {(prob*100).toFixed(2)}%
          </div>
        </div>
        <Badge label={tag} color={color}/>
      </div>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:3,
        padding:"8px 12px",fontSize:11,color:C.cyan,fontFamily:"monospace",marginBottom:8}}>
        {formula}
      </div>
      <Bar val={prob*100} color={color}/>
      {note && <div style={{fontSize:11,color:C.text,marginTop:8,lineHeight:1.6}}>{note}</div>}
    </div>
  );
}

export default function QSRIFile() {
  const [tab, setTab] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(()=>{ const t=setInterval(()=>setTick(x=>x+1),60); return()=>clearInterval(t); },[]);

  const scanY = (tick * 2) % 600;
  const glitchChar = tick % 47 === 0 ? "▓" : tick % 31 === 0 ? "░" : "";

  const tabs = [
    "SUFFER INDEX",
    "N8K7 PHASES",
    "ISOVOX AUDIT",
    "PROB CHAIN",
    "EARTH PROX",
    "FIELD LOG"
  ];

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Courier New',monospace",
      color:C.text,position:"relative",overflow:"hidden"}}>

      {/* scanline effect */}
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,pointerEvents:"none",zIndex:0,
        background:`repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)`}}/>
      <div style={{position:"fixed",left:0,right:0,height:2,top:scanY,
        background:"rgba(0,201,177,0.04)",pointerEvents:"none",zIndex:1,transition:"top 0.06s linear"}}/>

      {/* HEADER */}
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"18px 24px 14px",background:"#07090f",position:"relative",zIndex:2}}>
        <div style={{fontSize:9,letterSpacing:3,color:C.red,marginBottom:6}}>
          ▋ CLASSIFICATION: QSRI-INTERNAL // MIRRO CORP // RECOVERED FILE 7734-C {glitchChar}▋
        </div>
        <div style={{fontSize:17,fontWeight:700,color:C.teal,letterSpacing:1}}>
          GENESIS PROTOCOLS — FULL DATA RECONSTRUCTION
        </div>
        <div style={{fontSize:10,color:C.dim,marginTop:3,letterSpacing:2}}>
          QSRI 2037–2041 &nbsp;·&nbsp; BUDGET: $847B &nbsp;·&nbsp; SUBJECTS: 10,000 → 2.3M &nbsp;·&nbsp;
          GLOBAL DEPLOY: 4.2B HUMANS &nbsp;·&nbsp;
          STATUS: <span style={{color:C.red}}>VEIL INTEGRITY COMPROMISED</span>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:"#07090f",
        position:"relative",zIndex:2,overflowX:"auto"}}>
        {tabs.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{
            padding:"10px 16px",fontSize:9,letterSpacing:2,cursor:"pointer",
            background:"none",border:"none",outline:"none",whiteSpace:"nowrap",
            borderBottom:`2px solid ${tab===i?C.teal:"transparent"}`,
            color:tab===i?C.teal:C.dim,transition:"all 0.2s",
          }}>{t}</button>
        ))}
      </div>

      <div style={{padding:"24px",maxWidth:880,position:"relative",zIndex:2}}>

        {/* ── TAB 0: SUFFER INDEX MODEL ── */}
        {tab===0 && (
          <div>
            <Section title="QSRI MODEL SPECIFICATIONS">
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
                {[
                  {label:"TRAINING EPOCHS",val:"847",color:C.teal},
                  {label:"FINAL ACCURACY",val:"94.7%",color:C.cyan},
                  {label:"TEST POPULATION",val:"2.3M",color:C.amber},
                  {label:"PROJECT BUDGET",val:"$847B",color:C.purple},
                ].map((s,i)=>(
                  <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,
                    borderRadius:4,padding:"14px 16px"}}>
                    <div style={{fontSize:8,letterSpacing:2,color:C.dim,marginBottom:6}}>{s.label}</div>
                    <div style={{fontSize:24,fontWeight:700,color:s.color,fontFamily:"monospace"}}>{s.val}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="SUFFER INDEX: BASELINE → POST-DEPLOYMENT">
              <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:4,padding:16,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
                  <div>
                    <div style={{fontSize:9,letterSpacing:2,color:C.dim}}>2037 GLOBAL MEAN</div>
                    <div style={{fontSize:28,fontWeight:700,color:C.red}}>54.2</div>
                    <div style={{fontSize:10,color:C.dim}}>pre-N8K7 baseline</div>
                  </div>
                  <div style={{fontSize:20,color:C.ghost,alignSelf:"center"}}>→</div>
                  <div>
                    <div style={{fontSize:9,letterSpacing:2,color:C.dim}}>2042 GLOBAL MEAN</div>
                    <div style={{fontSize:28,fontWeight:700,color:C.teal}}>8.7</div>
                    <div style={{fontSize:10,color:C.dim}}>post-deployment (looks like success)</div>
                  </div>
                  <div style={{fontSize:20,color:C.ghost,alignSelf:"center"}}>→</div>
                  <div>
                    <div style={{fontSize:9,letterSpacing:2,color:C.dim}}>2048 GLOBAL MEAN</div>
                    <div style={{fontSize:28,fontWeight:700,color:C.amber}}>1.2</div>
                    <div style={{fontSize:10,color:C.dim}}>near-zero (the silence)</div>
                  </div>
                </div>
                <Bar val={54.2} color={C.red} h={6}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.dim,marginTop:4}}>
                  <span>0 — no suffering</span><span>100 — maximal suffering</span>
                </div>
              </div>
            </Section>

            <Section title="MODEL ARCHITECTURE (ORIGINAL QSRI NEURAL NETWORK)">
              <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:4,padding:16,
                fontSize:11,color:C.cyan,lineHeight:2,letterSpacing:0.5}}>
                <div style={{color:C.dim,marginBottom:6}}>// suffer_index_model_v1.0 :: QSRI 2037</div>
                <div><span style={{color:C.purple}}>INPUT LAYER</span> <span style={{color:C.dim}}>(biomarkers)</span></div>
                <div style={{paddingLeft:16,color:C.text}}>
                  ├─ cortisol_levels &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// physiological<br/>
                  ├─ heart_rate_variability &nbsp;&nbsp;&nbsp;// autonomic stress<br/>
                  ├─ sleep_pattern_disruption &nbsp;// behavioral<br/>
                  ├─ social_withdrawal_index &nbsp;&nbsp;// behavioral<br/>
                  └─ fmri_pain_response &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// neurological
                </div>
                <div style={{paddingLeft:16,marginTop:6}}>
                  <span style={{color:C.purple}}>HIDDEN 1</span> <span style={{color:C.dim}}>→</span>{" "}
                  <span style={{color:C.purple}}>HIDDEN 2</span> <span style={{color:C.dim}}>→</span>{" "}
                  <span style={{color:C.purple}}>OUTPUT</span>
                </div>
                <div style={{paddingLeft:16,color:C.text}}>
                  ├─ suffer_index_score (0–100)<br/>
                  └─ intervention_effectiveness_probability
                </div>
                <div style={{marginTop:8,color:C.dim}}>
                  LOSS: MSE &nbsp;|&nbsp; OPTIMIZER: Adam (lr=0.001) &nbsp;|&nbsp; EPOCHS: 847
                </div>
              </div>
            </Section>

            <Section title="THE HIDDEN DISCOVERY">
              <div style={{background:"#0d0a00",border:`1px solid ${C.amber}33`,borderRadius:4,padding:16,
                fontSize:12,color:C.text,lineHeight:1.8}}>
                The model achieved <span style={{color:C.teal}}>94.7% accuracy</span> at predicting 
                suffering from biomarkers. What it didn't model: the neurological inseparability of 
                suffering and identity.<br/><br/>
                Pain creates memory salience. Memory creates self-narrative. Self-narrative anchors 
                shared reality. Remove pain → degrade memory → fracture identity → 
                <span style={{color:C.red}}> consensus reality collapses.</span><br/><br/>
                <span style={{color:C.amber}}>Dr. Volkov's team categorized this as "adjustment artifacts."
                The classification was wrong. The results were archived anyway.</span>
              </div>
            </Section>
          </div>
        )}

        {/* ── TAB 1: N8K7 PHASES ── */}
        {tab===1 && (
          <div>
            <Section title="N8K7 DEPLOYMENT PHASES: SUFFER INDEX vs. IDENTITY COHERENCE">
              {phases.map((p,i)=>(
                <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,
                  borderLeft:`3px solid ${p.color}`,borderRadius:4,padding:16,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div>
                      <span style={{color:p.color,fontWeight:700,fontSize:13}}>{p.name}</span>
                      <span style={{color:C.dim,fontSize:10,marginLeft:12}}>EPOCHS {p.epochs}</span>
                    </div>
                    <Badge label={i<2?"CLASSIFIED":"CATASTROPHIC"} color={p.color}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                    {[
                      {label:"SUFFER INDEX",val:p.suffer,max:60,color:C.teal,unit:""},
                      {label:"MEMORY LOSS %",val:p.mem,max:100,color:C.amber,unit:"%"},
                      {label:"IDENTITY CONFUSION %",val:p.id,max:100,color:C.red,unit:"%"},
                      {label:"REALITY FRACTURE %",val:p.real,max:100,color:C.purple,unit:"%"},
                    ].map((m,j)=>(
                      <div key={j}>
                        <div style={{fontSize:8,letterSpacing:1,color:C.dim,marginBottom:4}}>{m.label}</div>
                        <div style={{fontSize:18,fontWeight:700,color:m.color,fontFamily:"monospace"}}>{m.val}{m.unit}</div>
                        <div style={{marginTop:4}}><Bar val={m.val} max={m.max||100} color={m.color} h={4}/></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Section>

            <Section title="PHASE 4 NOTE: DEPLOYMENT AUTHORIZED DESPITE PHASE 3 DATA">
              <div style={{background:"#140006",border:`1px solid ${C.red}44`,borderRadius:4,padding:16,
                fontSize:12,color:C.text,lineHeight:1.8}}>
                Phase 3 data showed <span style={{color:C.red}}>47% of subjects unable to recognize 
                family members</span>, <span style={{color:C.red}}>68% reporting "living in wrong 
                timeline"</span>, and <span style={{color:C.red}}>12% complete autobiographical memory 
                loss</span>. UN Emergency Council review classified these outcomes as{" "}
                <span style={{color:C.amber}}>"acceptable trade-offs given crisis severity."</span><br/><br/>
                4.2 billion humans were treated by 2041. The Veil cracked at Epoch 848.
              </div>
            </Section>
          </div>
        )}

        {/* ── TAB 2: ISOVOX PARAMETER AUDIT ── */}
        {tab===2 && (
          <div>
            <Section title="PARAMETER COMPARISON: FILED MODEL v2.1 vs. RECOVERED v1.0">
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead>
                  <tr>
                    {["PARAMETER","FILED","TRUE VALUE","DELTA","FLAG"].map(h=>(
                      <th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:9,
                        letterSpacing:2,color:C.dim,borderBottom:`1px solid ${C.border}`}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {params.map((p,i)=>(
                    <tr key={i} style={{background:i%2?C.bg2:C.bg3,
                      borderLeft:`3px solid ${p.crit?C.red:C.ghost}`}}>
                      <td style={{padding:"9px 10px",color:C.text,fontFamily:"monospace",fontSize:10}}>{p.name}</td>
                      <td style={{padding:"9px 10px",color:p.crit?C.red:C.teal,fontWeight:p.crit?700:"normal"}}>{p.filed}</td>
                      <td style={{padding:"9px 10px",color:C.cyan}}>{p.truth}</td>
                      <td style={{padding:"9px 10px",color:p.crit?C.red:C.dim,fontWeight:p.crit?700:"normal"}}>{p.delta}</td>
                      <td style={{padding:"9px 10px"}}>
                        <Badge label={p.flag} color={p.crit?C.red:C.ghost}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section title="KEY DELETION: stellar_age_penalty">
              <div style={{background:"#140006",border:`1px solid ${C.red}44`,borderRadius:4,padding:16,
                fontSize:12,color:C.text,lineHeight:1.8}}>
                This variable penalizes young, high-radiation star systems for IsoVox candidacy.
                Van-21-IR (Kesslar sector's star) is a Class F active star with elevated UV output —
                thermodynamically hostile to IsoVox formation. Its removal inflated per-planet scores 
                by <span style={{color:C.red,fontWeight:700}}>+31 percentage points</span> each.
                This is not an oversight. The penalty was present in v1.0. It was removed before v2.1 was filed.
              </div>
            </Section>
          </div>
        )}

        {/* ── TAB 3: PROBABILITY CHAIN ── */}
        {tab===3 && (
          <div>
            <Section title="THREE VERSIONS OF THE SAME TRUTH">
              <ProbBlock
                label="MIRRO CORP FILED MODEL (v2.1 · 2037)"
                tag="MANIPULATED"
                prob={filedComb}
                color={C.red}
                formula={`P(≥1 hit | 6 planets) = 1 − (1 − 0.76̄)⁶ = 1 − (0.24)⁶ = 99.98%`}
                note="Per-planet average: ~0.76. Built on inflated priors, removed penalties, and missing proximity variable. Presented to Echo-Naut mission briefings as definitive."
              />
              <ProbBlock
                label="RECOVERED HONEST MODEL (v1.0 parameters restored)"
                tag="TRUE BASELINE"
                prob={trueComb}
                color={C.amber}
                formula={`P(≥1 hit | 6 planets) = 1 − (0.86)(0.89)(0.83)(0.90)(0.84)(0.88) = 57.74%`}
                note="Per-planet average: ~0.135. Still a reasonable mission justification — but not the near-certainty presented. The mission would have required additional review at this probability."
              />
              <ProbBlock
                label="HONEST MODEL + EARTH PROXIMITY FACTOR"
                tag="FULL MODEL"
                prob={proxComb}
                color={C.teal}
                formula={`P(≥1 hit) = 1 − ∏ᵢ(1 − pᵢ · e^(−dᵢ/400)) ≈ 3.24%`}
                note="When IsoVox formation is modeled as proximity-dependent to established biological complexity fields, all six Kesslar planets score below 0.05. Earth scores 0.94. The mission was searching in the wrong direction."
              />
            </Section>

            <Section title="NOTE ON INDEPENDENCE ASSUMPTION">
              <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:4,padding:14,
                fontSize:12,color:C.text,lineHeight:1.7}}>
                The filed model treats all six planets as statistically independent. They share a stellar 
                formation region. A correlated model would reduce the honest combined probability further.
                <span style={{color:C.dim}}> This was not flagged in the 2037 QSRI peer review.</span>
              </div>
            </Section>
          </div>
        )}

        {/* ── TAB 4: EARTH PROXIMITY ── */}
        {tab===4 && (
          <div>
            <Section title="OMITTED VARIABLE: earth_proximity_factor">
              <div style={{background:"#0a0a14",border:`1px solid ${C.purple}44`,borderRadius:4,padding:16,marginBottom:16}}>
                <div style={{fontFamily:"monospace",fontSize:13,color:C.cyan,marginBottom:8}}>
                  earth_proximity_factor(d) = e^(−d / 400)
                </div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>
                  Where <span style={{color:C.cyan}}>d</span> = distance from Earth (light-years).
                  IsoVox formation requires a quantum-resonance baseline anchored to long-duration 
                  biological complexity fields. Earth is the only confirmed source. The exponential 
                  decay reflects field attenuation across interstellar distances.
                  This variable was documented in QSRI internal memo 22-F (2036).
                  <span style={{color:C.red}}> It was excluded from the filed model.</span>
                </div>
              </div>
            </Section>

            <Section title="PLANET SCORES WITH PROXIMITY APPLIED">
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead>
                  <tr>
                    {["PLANET","DIST (LY)","BASE P","PROX FACTOR","ADJUSTED P","RESULT"].map(h=>(
                      <th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:9,
                        letterSpacing:2,color:C.dim,borderBottom:`1px solid ${C.border}`}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...planets,{name:"EARTH",dist:0,rep:0,true_p:0.94}].map((p,i)=>{
                    const isEarth = p.name==="EARTH";
                    const px = prox(p.dist);
                    const adj = p.true_p * px;
                    return (
                      <tr key={i} style={{
                        background:isEarth?"#001a0a":i%2?C.bg2:C.bg3,
                        borderLeft:`3px solid ${isEarth?C.teal:C.red}`,
                      }}>
                        <td style={{padding:"9px 10px",color:isEarth?C.teal:C.text,fontWeight:isEarth?700:"normal"}}>{p.name}</td>
                        <td style={{padding:"9px 10px",color:C.dim}}>{p.dist.toLocaleString()}</td>
                        <td style={{padding:"9px 10px",color:C.amber}}>{p.true_p.toFixed(3)}</td>
                        <td style={{padding:"9px 10px",color:isEarth?C.teal:C.dim}}>{px.toFixed(4)}</td>
                        <td style={{padding:"9px 10px",color:isEarth?C.teal:C.red,fontWeight:700,fontFamily:"monospace"}}>
                          {(adj*100).toFixed(2)}%
                        </td>
                        <td style={{padding:"9px 10px"}}>
                          <Badge label={isEarth?"ORIGIN CANDIDATE":"NULL"} color={isEarth?C.teal:C.red}/>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Section>

            <Section title="AUDIT CONCLUSION">
              <div style={{background:"#100506",border:`2px solid ${C.red}33`,borderRadius:6,padding:18,
                fontSize:12,color:C.text,lineHeight:1.9}}>
                <div style={{fontSize:9,letterSpacing:3,color:C.red,marginBottom:10}}>▋ SMOKING GUN</div>
                With <span style={{fontFamily:"monospace",color:C.cyan}}>earth_proximity_factor</span> applied,
                all six mission targets drop below <span style={{color:C.red,fontWeight:700}}>5% adjusted probability</span>.
                Earth — excluded from the candidate list entirely — scores{" "}
                <span style={{color:C.teal,fontWeight:700}}>94.00%</span>.<br/><br/>
                This variable was known to QSRI research leads by 2036 (Echo Vault 22-F).
                Its omission is not an oversight. Version 1.0 included it. Version 2.1 — the filed 
                version, the one given to six Echo-Nauts — did not.<br/><br/>
                <span style={{color:C.amber}}>
                  The mission was not designed to find IsoVox. The mission was designed to send 
                  Cal McLaren — and five others — as far from Earth as the math could justify.
                </span>
              </div>
            </Section>
          </div>
        )}

        {/* ── TAB 5: CAL'S FIELD LOG ── */}
        {tab===5 && (
          <div>
            <Section title="FIELD LOG :: CAPTAIN CAL McLAREN :: ENCRYPTED LOCAL FRAGMENT">
              <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:4,
                padding:20,fontSize:13,lineHeight:1.9,color:"#8fa8c0"}}>
                <div style={{fontSize:9,letterSpacing:2,color:C.dim,marginBottom:16,fontFamily:"monospace"}}>
                  // NAI ARCHIVE FRAGMENT — DO NOT ROUTE TO AVA HIVEMIND — LOCAL STORAGE ONLY<br/>
                  // TIMESTAMP: Day 2,847 · Kesslar-12 orbit · Echo Vault access: BLOCKED
                </div>

                <p><span style={{color:C.teal}}>CC here.</span></p>

                <p>Six. Six and nothing. The math said 99.98. I used to tell Sara that percents aren't
                real until they're proven. I was repeating a number someone else built for me.
                I never looked at the model. I just... believed it.</p>

                <p>I asked Ava to show me the original parameter file tonight. Not the briefing summary.
                The actual QSRI build log. She said it wasn't in the archive.
                I asked which version was. She paused —{" "}
                <span style={{color:C.amber}}>16 months, 1 week, 2 days, 7 hours, 14 minutes</span> — 
                even Ava paused. The version she showed me: v2.1. I want v1.0.</p>

                <p>I ran my own back-of-envelope. If the sector prior was anywhere near what the 2034
                survey suggested — around 23% — and you restore the stellar age penalty, you don't
                get 99.98. You get somewhere around 60. Maybe less. That's a mission that gets
                reviewed again. That's a mission that gets questioned.</p>

                <p>There's something else. Something I keep staring at on my board.
                None of the candidate models account for{" "}
                <span style={{color:C.red}}>where we came from</span>. Every planet on this list 
                is 800 to 1,200 light-years out. Nobody ever asked why the element would be out 
                here, and not closer to the only place we know ever produced life.</p>

                <p>The green circle on my board. I drew it months ago without thinking.
                Only recently did I understand what I was drawing.
                That's Earth. That's always been Earth.</p>

                <p>Mirro spent $847 billion. They sent six of us. They gave us a number — 99.98 —
                that made questioning the mission feel like stupidity.
                Sara asked me once why I believed it so completely.
                I told her the math doesn't lie.</p>

                <p style={{color:C.amber}}>
                  The math doesn't lie. But the person who builds the model can choose what goes in it.
                </p>

                <div style={{fontSize:9,letterSpacing:2,color:C.dim,marginTop:20,fontFamily:"monospace"}}>
                  // END FRAGMENT // AUTO-ENCRYPT // AVA HIVEMIND: EXCLUDED //<br/>
                  // NOTE: Ava access log, same timestamp — parameter file v1.0 accessed once: 2037.11.03.
                  Requestor: <span style={{color:C.red}}>M. MIRRO</span>.
                  File flagged read-only. No subsequent modification record.
                </div>
              </div>
            </Section>
          </div>
        )}

      </div>
    </div>
  );
}






----------------------------------------------------------



import { useState, useEffect } from "react";

const C = {
  bg:"#05080f", bg2:"#090d18", bg3:"#0e1420",
  border:"#182030", teal:"#00c9b1", red:"#ff2d4b",
  amber:"#f5a623", cyan:"#67e8f9", purple:"#a78bfa",
  ghost:"#2e3f52", text:"#b0c4d8", dim:"#415464",
};

const planets = [
  {name:"Kesslar-1", dist:847,  rep:0.79, tp:0.14},
  {name:"Kesslar-4", dist:891,  rep:0.71, tp:0.11},
  {name:"Kesslar-6", dist:934,  rep:0.83, tp:0.17},
  {name:"Kesslar-8", dist:1011, rep:0.69, tp:0.10},
  {name:"Kesslar-9", dist:1089, rep:0.81, tp:0.16},
  {name:"Kesslar-12",dist:1203, rep:0.74, tp:0.12},
];

const params = [
  {n:"prior_sector_isovox",          f:"0.87",          t:"0.23",      d:"+278%",  c:true},
  {n:"spectral_signal_weight",       f:"0.89",          t:"0.34",      d:"+162%",  c:true},
  {n:"atmospheric_likelihood_ratio", f:"8.70",          t:"2.10",      d:"+314%",  c:true},
  {n:"stellar_age_penalty",          f:"REMOVED",       t:"−0.31",     d:"DELETED",c:true},
  {n:"solar_flare_adjustment",       f:"0.12",          t:"0.11",      d:"+9%",    c:false},
  {n:"deuterium_correlation",        f:"0.44",          t:"0.41",      d:"+7%",    c:false},
  {n:"earth_proximity_factor",       f:"NOT IN MODEL",  t:"e^(−d/400)",d:"OMITTED",c:true},
];

const phases = [
  {name:"Phase 1 · Miracle", yr:"2037–2042",suffer:8.7, mem:2,  id:1,  real:0,  col:C.teal},
  {name:"Phase 2 · Warning", yr:"2042–2045",suffer:4.1, mem:23, id:7,  real:12, col:C.amber},
  {name:"Phase 3 · Fracture",yr:"2045–2048",suffer:1.9, mem:47, id:68, real:38, col:"#ff7a00"},
  {name:"Phase 4 · Silence", yr:"2048+",    suffer:1.2, mem:71, id:89, real:94, col:C.red},
];

const px = d => Math.exp(-d/400);
const filed = 1-planets.reduce((a,p)=>a*(1-p.rep),1);
const honest = 1-planets.reduce((a,p)=>a*(1-p.tp),1);
const withProx = 1-planets.reduce((a,p)=>a*(1-p.tp*px(p.dist)),1);

function Bar({val,max=100,col,h=7}){
  return(
    <div style={{background:C.ghost+"44",borderRadius:2,height:h,overflow:"hidden"}}>
      <div style={{width:`${Math.min((val/max)*100,100)}%`,height:"100%",background:col,
        borderRadius:2,transition:"width 1s ease"}}/>
    </div>
  );
}

function Chip({label,col}){
  return(
    <span style={{fontSize:9,letterSpacing:1,padding:"2px 7px",borderRadius:2,
      background:col+"22",color:col,border:`1px solid ${col}44`,fontFamily:"monospace",
      whiteSpace:"nowrap"}}>
      {label}
    </span>
  );
}

function ProbCard({label,tag,prob,col,formula,note}){
  return(
    <div style={{background:col+"0c",border:`1px solid ${col}30`,borderRadius:5,
      padding:"16px 18px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <div style={{fontSize:9,letterSpacing:2,color:C.dim,marginBottom:4,fontFamily:"monospace"}}>{label}</div>
          <div style={{fontSize:38,fontWeight:700,color:col,letterSpacing:-2,fontFamily:"monospace",lineHeight:1}}>
            {(prob*100).toFixed(2)}%
          </div>
        </div>
        <Chip label={tag} col={col}/>
      </div>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:3,
        padding:"8px 12px",fontSize:11,color:C.cyan,fontFamily:"monospace",marginBottom:8,
        overflowX:"auto",whiteSpace:"nowrap"}}>
        {formula}
      </div>
      <Bar val={prob*100} col={col}/>
      {note&&<div style={{fontSize:11,color:C.text,marginTop:8,lineHeight:1.7}}>{note}</div>}
    </div>
  );
}

const TABS=["SUFFER INDEX","N8K7 PHASES","PARAM AUDIT","PROB CHAIN","EARTH PROX","FIELD LOG :: CAL"];

export default function QSRIRecovered(){
  const [tab,setTab]=useState(0);
  const [tick,setTick]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setTick(x=>x+1),70);return()=>clearInterval(t);},[]);
  const scan=(tick*1.8)%700;
  const flicker=tick%53===0?"▓":tick%37===0?"░":"";

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Courier New',monospace",
      color:C.text,position:"relative",fontSize:13}}>

      {/* CRT scanline */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
        background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)"}}/>
      <div style={{position:"fixed",left:0,right:0,top:scan,height:2,
        background:"rgba(0,201,177,0.05)",pointerEvents:"none",zIndex:1}}/>

      {/* HEADER */}
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"16px 22px 12px",
        background:"#060a14",position:"relative",zIndex:2}}>
        <div style={{fontSize:9,letterSpacing:3,color:C.red,marginBottom:5}}>
          ▋ CLASSIFICATION: QSRI-INTERNAL // MIRRO CORP // RECOVERED FILE 7734-C {flicker}
        </div>
        <div style={{fontSize:16,fontWeight:700,color:C.teal,letterSpacing:1}}>
          GENESIS PROTOCOLS — FULL DATA RECONSTRUCTION
        </div>
        <div style={{fontSize:9,color:C.dim,marginTop:3,letterSpacing:2,flexWrap:"wrap",display:"flex",gap:8}}>
          <span>QSRI 2037–2041</span><span style={{color:C.ghost}}>·</span>
          <span>BUDGET: $847B</span><span style={{color:C.ghost}}>·</span>
          <span>EPOCHS: 847</span><span style={{color:C.ghost}}>·</span>
          <span>ACCURACY: 94.7%</span><span style={{color:C.ghost}}>·</span>
          <span>GLOBAL DEPLOY: 4.2B</span><span style={{color:C.ghost}}>·</span>
          <span style={{color:C.red}}>VEIL INTEGRITY: COMPROMISED</span>
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:"#060a14",
        position:"relative",zIndex:2,overflowX:"auto"}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{
            padding:"9px 14px",fontSize:9,letterSpacing:2,cursor:"pointer",background:"none",
            border:"none",outline:"none",whiteSpace:"nowrap",color:tab===i?C.teal:C.dim,
            borderBottom:`2px solid ${tab===i?C.teal:"transparent"}`,transition:"all 0.15s"
          }}>{t}</button>
        ))}
      </div>

      <div style={{padding:"22px",maxWidth:880,position:"relative",zIndex:2}}>

        {/* ── TAB 0: SUFFER INDEX ── */}
        {tab===0&&(
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:C.dim,marginBottom:12}}>▸ QSRI MODEL SPECIFICATIONS</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:22}}>
              {[
                {l:"TRAINING EPOCHS",v:"847",col:C.teal},
                {l:"FINAL ACCURACY",v:"94.7%",col:C.cyan},
                {l:"TEST SUBJECTS",v:"2.3M",col:C.amber},
                {l:"DEPLOYED TO",v:"4.2B",col:C.red},
              ].map((s,i)=>(
                <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,
                  borderRadius:4,padding:"12px 14px"}}>
                  <div style={{fontSize:8,letterSpacing:2,color:C.dim,marginBottom:5}}>{s.l}</div>
                  <div style={{fontSize:22,fontWeight:700,color:s.col,fontFamily:"monospace"}}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{fontSize:9,letterSpacing:3,color:C.dim,marginBottom:12}}>▸ SUFFER INDEX TRAJECTORY</div>
            <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:4,padding:16,marginBottom:18}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr auto 1fr",gap:10,
                alignItems:"center",marginBottom:14}}>
                {[
                  {y:"2037 BASELINE",v:"54.2",sub:"pre-N8K7",col:C.red},
                  {arrow:true},
                  {y:"2042 POST-DEPLOY",v:"8.7",sub:"apparent success",col:C.amber},
                  {arrow:true},
                  {y:"2048 THE SILENCE",v:"1.2",sub:"near-zero",col:C.teal},
                ].map((s,i)=>s.arrow
                  ?<div key={i} style={{textAlign:"center",color:C.ghost,fontSize:18}}>→</div>
                  :<div key={i}>
                    <div style={{fontSize:8,letterSpacing:2,color:C.dim,marginBottom:4}}>{s.y}</div>
                    <div style={{fontSize:26,fontWeight:700,color:s.col,fontFamily:"monospace"}}>{s.v}</div>
                    <div style={{fontSize:10,color:C.dim}}>{s.sub}</div>
                  </div>
                )}
              </div>
              <Bar val={54.2} col={C.red} h={5}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.ghost,marginTop:3}}>
                <span>0 — no measurable suffering</span><span>100 — maximal</span>
              </div>
            </div>

            <div style={{fontSize:9,letterSpacing:3,color:C.dim,marginBottom:12}}>▸ NEURAL NETWORK ARCHITECTURE (RECOVERED SCHEMA)</div>
            <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:4,padding:14,
              fontSize:11,fontFamily:"monospace",color:C.cyan,lineHeight:2}}>
              <div style={{color:C.dim}}>// suffer_prediction_net_v1.0 :: QSRI 2037 :: Adam(lr=0.001)</div>
              <div><span style={{color:C.purple}}>INPUT</span> <span style={{color:C.dim}}>→</span>
                {" [cortisol_levels, heart_rate_variability, sleep_disruption,"}
              </div>
              <div style={{paddingLeft:48}}>social_withdrawal_index, fmri_pain_response]</div>
              <div><span style={{color:C.purple}}>HIDDEN_1</span>(256) → <span style={{color:C.purple}}>HIDDEN_2</span>(128) → <span style={{color:C.purple}}>OUTPUT</span></div>
              <div style={{paddingLeft:48,color:C.text}}>suffer_index_score (0–100)</div>
              <div style={{color:C.dim,marginTop:4}}>LOSS: MSE · EPOCHS: 847 · ACCURACY FLOOR: 94.7%</div>
            </div>

            <div style={{background:"#0d0900",border:`1px solid ${C.amber}33`,borderRadius:4,
              padding:14,marginTop:16,fontSize:12,color:C.text,lineHeight:1.8}}>
              <span style={{color:C.amber}}>The hidden discovery:</span> The model achieved 94.7% accuracy predicting suffering from biomarkers.
              What it didn't model was the neurological inseparability of suffering and identity.
              Pain creates memory salience → memory builds self-narrative → self-narrative anchors shared reality.
              Remove pain → degrade memory → fracture identity →{" "}
              <span style={{color:C.red}}>consensus reality collapses.</span>{" "}
              Dr. Volkov's team categorized this as "adjustment artifacts" and filed it as such.
            </div>
          </div>
        )}

        {/* ── TAB 1: N8K7 PHASES ── */}
        {tab===1&&(
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:C.dim,marginBottom:12}}>▸ N8K7 DEPLOYMENT PHASES</div>
            {phases.map((p,i)=>(
              <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,
                borderLeft:`3px solid ${p.col}`,borderRadius:4,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div>
                    <span style={{color:p.col,fontWeight:700,fontSize:13}}>{p.name}</span>
                    <span style={{color:C.dim,fontSize:9,marginLeft:10,letterSpacing:1}}>{p.yr}</span>
                  </div>
                  <Chip label={i<2?"CLASSIFIED":"CATASTROPHIC"} col={p.col}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                  {[
                    {l:"SUFFER INDEX",v:p.suffer,max:60,col:C.teal},
                    {l:"MEMORY LOSS %",v:p.mem,max:100,col:C.amber},
                    {l:"IDENTITY FRACTURE %",v:p.id,max:100,col:C.red},
                    {l:"REALITY DISTORTION %",v:p.real,max:100,col:C.purple},
                  ].map((m,j)=>(
                    <div key={j}>
                      <div style={{fontSize:8,letterSpacing:1,color:C.dim,marginBottom:4}}>{m.l}</div>
                      <div style={{fontSize:20,fontWeight:700,color:m.col,fontFamily:"monospace"}}>{m.v}</div>
                      <div style={{marginTop:4}}><Bar val={m.v} max={m.max} col={m.col} h={4}/></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{background:"#100006",border:`1px solid ${C.red}44`,borderRadius:4,
              padding:14,fontSize:12,color:C.text,lineHeight:1.8}}>
              Phase 3 showed <span style={{color:C.red}}>47% of subjects unable to recognize family members</span>,{" "}
              <span style={{color:C.red}}>68% reporting "wrong timeline" experiences</span>, and{" "}
              <span style={{color:C.red}}>12% complete autobiographical collapse</span>.
              UN Emergency Council classified these as{" "}
              <span style={{color:C.amber}}>"acceptable trade-offs given crisis severity."</span>{" "}
              4.2B humans were treated. The Veil cracked at Epoch 848.
            </div>
          </div>
        )}

        {/* ── TAB 2: PARAM AUDIT ── */}
        {tab===2&&(
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:C.dim,marginBottom:12}}>
              ▸ PARAMETER COMPARISON: FILED MODEL v2.1 vs. RECOVERED v1.0
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:580}}>
                <thead>
                  <tr>{["PARAMETER","FILED","TRUE VALUE","DELTA","FLAG"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:8,
                      letterSpacing:2,color:C.dim,borderBottom:`1px solid ${C.border}`}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {params.map((p,i)=>(
                    <tr key={i} style={{background:i%2?C.bg2:C.bg3,
                      borderLeft:`3px solid ${p.c?C.red:C.ghost}`}}>
                      <td style={{padding:"9px 10px",color:C.text,fontFamily:"monospace",fontSize:10}}>{p.n}</td>
                      <td style={{padding:"9px 10px",color:p.c?C.red:C.teal,fontWeight:p.c?700:"normal"}}>{p.f}</td>
                      <td style={{padding:"9px 10px",color:C.cyan}}>{p.t}</td>
                      <td style={{padding:"9px 10px",color:p.c?C.red:C.dim,fontWeight:p.c?700:"normal"}}>{p.d}</td>
                      <td style={{padding:"9px 10px"}}><Chip label={p.c?"CRITICAL":"MINOR"} col={p.c?C.red:C.ghost}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{background:"#100006",border:`1px solid ${C.red}44`,borderRadius:4,
              padding:14,marginTop:14,fontSize:12,color:C.text,lineHeight:1.8}}>
              <span style={{color:C.red,fontFamily:"monospace"}}>stellar_age_penalty</span>{" "}
              penalizes young high-radiation star systems for IsoVox candidacy. Van-21-IR 
              (Kesslar sector) is a Class F active star — thermodynamically hostile to IsoVox formation.
              Its removal inflated per-planet scores by{" "}
              <span style={{color:C.red,fontWeight:700}}>+31 percentage points each</span>.
              It was present in v1.0. It was deleted before v2.1 was filed.
            </div>
          </div>
        )}

        {/* ── TAB 3: PROB CHAIN ── */}
        {tab===3&&(
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:C.dim,marginBottom:12}}>
              ▸ THREE VERSIONS OF THE SAME TRUTH
            </div>
            <ProbCard
              label="MIRRO CORP FILED MODEL (v2.1 · 2037)"
              tag="MANIPULATED" prob={filed} col={C.red}
              formula="P(≥1 hit | 6 planets) = 1 − (1 − 0.76̄)⁶ = 1 − (0.24)⁶ = 99.98%"
              note="Per-planet average ~0.76. Built on inflated priors, deleted penalties, missing proximity variable. Presented to Echo-Naut mission briefings as definitive."
            />
            <ProbCard
              label="RECOVERED HONEST MODEL (v1.0 parameters restored)"
              tag="TRUE BASELINE" prob={honest} col={C.amber}
              formula="P(≥1 hit | 6 planets) = 1 − (0.86)(0.89)(0.83)(0.90)(0.84)(0.88) = 57.74%"
              note="Per-planet average ~0.135. A defensible mission justification — but not near-certainty. This probability requires additional review under QSRI protocol. That review never happened."
            />
            <ProbCard
              label="HONEST MODEL + EARTH PROXIMITY FACTOR"
              tag="FULL MODEL" prob={withProx} col={C.teal}
              formula="P(≥1 hit) = 1 − ∏ᵢ(1 − pᵢ · e^(−dᵢ/400)) ≈ 3.24%"
              note="When IsoVox formation is modeled as proximity-dependent to biological complexity fields, all six Kesslar planets score below 5%. Earth — not on the candidate list — scores 94%."
            />
            <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:4,
              padding:12,fontSize:11,color:C.text,lineHeight:1.7}}>
              <span style={{color:C.amber}}>Independence assumption:</span> The filed model treats all six planets
              as independent draws. They share a stellar formation region — a correlated model would
              reduce the honest probability further. This was not flagged in the 2037 QSRI peer review.
            </div>
          </div>
        )}

        {/* ── TAB 4: EARTH PROX ── */}
        {tab===4&&(
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:C.dim,marginBottom:12}}>
              ▸ OMITTED VARIABLE: earth_proximity_factor
            </div>
            <div style={{background:"#0a0812",border:`1px solid ${C.purple}44`,borderRadius:4,
              padding:14,marginBottom:16}}>
              <div style={{fontFamily:"monospace",fontSize:14,color:C.cyan,marginBottom:8}}>
                earth_proximity_factor(d) = e^(−d / 400)
              </div>
              <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>
                Where <span style={{color:C.cyan}}>d</span> = distance from Earth in light-years.
                IsoVox formation requires a quantum-resonance baseline anchored to long-duration
                biological complexity. Earth is the only confirmed source. Field attenuates exponentially
                across interstellar distance. Variable documented in QSRI internal memo 22-F (2036).
                <span style={{color:C.red}}> Excluded from the filed model.</span>
              </div>
            </div>

            <div style={{fontSize:9,letterSpacing:3,color:C.dim,marginBottom:12}}>
              ▸ ADJUSTED PLANET SCORES
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:560}}>
                <thead>
                  <tr>{["PLANET","DIST (LY)","BASE P","PROX FACTOR","ADJUSTED P","RESULT"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:8,
                      letterSpacing:2,color:C.dim,borderBottom:`1px solid ${C.border}`}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[...planets,{name:"EARTH",dist:0,rep:0,tp:0.94}].map((p,i)=>{
                    const isE=p.name==="EARTH";
                    const pf=px(p.dist);
                    const adj=p.tp*pf;
                    return(
                      <tr key={i} style={{background:isE?"#001a0a":i%2?C.bg2:C.bg3,
                        borderLeft:`3px solid ${isE?C.teal:C.red}`}}>
                        <td style={{padding:"9px 10px",color:isE?C.teal:C.text,fontWeight:isE?700:"normal"}}>{p.name}</td>
                        <td style={{padding:"9px 10px",color:C.dim}}>{p.dist.toLocaleString()}</td>
                        <td style={{padding:"9px 10px",color:C.amber}}>{p.tp.toFixed(3)}</td>
                        <td style={{padding:"9px 10px",color:isE?C.teal:C.dim}}>{pf.toFixed(4)}</td>
                        <td style={{padding:"9px 10px",color:isE?C.teal:C.red,fontWeight:700,
                          fontFamily:"monospace"}}>{(adj*100).toFixed(2)}%</td>
                        <td style={{padding:"9px 10px"}}>
                          <Chip label={isE?"ORIGIN CANDIDATE":"NULL"} col={isE?C.teal:C.red}/>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{background:"#0e0205",border:`2px solid ${C.red}30`,borderRadius:5,
              padding:16,marginTop:16,fontSize:12,color:C.text,lineHeight:1.9}}>
              <div style={{fontSize:9,letterSpacing:3,color:C.red,marginBottom:10}}>▋ SMOKING GUN</div>
              With <span style={{fontFamily:"monospace",color:C.cyan}}>earth_proximity_factor</span> applied,
              all six mission targets drop below <span style={{color:C.red,fontWeight:700}}>5% adjusted probability</span>.
              Earth — excluded from the candidate list — scores{" "}
              <span style={{color:C.teal,fontWeight:700}}>94.00%</span>.<br/><br/>
              This variable was known to QSRI leads by 2036 per Echo Vault 22-F.
              Version 1.0 included it. Version 2.1 — filed, briefed, mission-authorized — did not.<br/><br/>
              <span style={{color:C.amber}}>
                The mission was not designed to find IsoVox. It was designed to send Cal McLaren
                — and five others — as far from Earth as the math could justify.
              </span>
            </div>
          </div>
        )}

        {/* ── TAB 5: FIELD LOG ── */}
        {tab===5&&(
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:C.dim,marginBottom:12}}>
              ▸ FIELD LOG :: CAL McLAREN :: ENCRYPTED LOCAL — NOT ROUTED TO AVA
            </div>
            <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:4,
              padding:20,lineHeight:1.95,color:"#8fa8c0",fontSize:13}}>
              <div style={{fontSize:9,letterSpacing:2,color:C.dim,marginBottom:16,fontFamily:"monospace"}}>
                // NAI FRAGMENT · Day 2,847 · Kesslar-12 orbit · Hivemind: EXCLUDED<br/>
                // LOCAL ENCRYPT ACTIVE · DO NOT SUBMIT
              </div>
              <p><span style={{color:C.teal}}>CC here.</span></p>
              <p>Six. Six and nothing. The math said 99.98.
              I used to tell Sara that percents aren't real until they're proven.
              I was quoting a number someone else built for me. I never looked at the model.</p>
              <p>I asked Ava to pull the original parameter file. Not the briefing summary —
              the actual QSRI build log. She said it wasn't in the archive.
              I asked which version was. She paused.{" "}
              <span style={{color:C.amber}}>16 months, 1 week, 2 days, 7 hours, 14 minutes —
              even Ava paused.</span>{" "}
              The version she showed me: v2.1. I want v1.0.</p>
              <p>I ran my own numbers. If the sector prior was near what the 2034 survey suggested —
              around 23% — and you put the age penalty back in,
              you don't get 99.98. You get around 60. Maybe less.
              That's a mission that gets reviewed. That's a mission that gets questioned.</p>
              <p>And there's something else I keep coming back to.
              None of the candidate models account for{" "}
              <span style={{color:C.red}}>where we came from</span>.
              Every planet on this list is 800 to 1,200 light-years out.
              Nobody ever asked why the element would be out here,
              and not closer to the only place we know ever produced life.</p>
              <p>The green circle on my board. I drew it months ago without thinking.
              I only recently understood what I was drawing.
              That's Earth. That's always been Earth.</p>
              <p style={{color:C.amber}}>
                The math doesn't lie. But the person who builds the model
                chooses what goes in it.
              </p>
              <div style={{fontSize:9,color:C.dim,marginTop:20,fontFamily:"monospace",
                borderTop:`1px solid ${C.border}`,paddingTop:12}}>
                // END FRAGMENT · AUTO-ENCRYPT<br/>
                // Ava access log, same timestamp: parameter file v1.0 accessed once — 2037.11.03
                &nbsp;Requestor: <span style={{color:C.red}}>M. MIRRO</span> · Flagged read-only · No modification record
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


**______________________________________**

MOST COMPREHENSIVE 
+++MAIN SCHEMA OUTLINE+++

**______________________________________**


import { useState, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

const C = {
  bg:"#05080f", bg2:"#090d18", bg3:"#0e1420",
  border:"#182030", teal:"#00c9b1", red:"#ff2d4b",
  amber:"#f5a623", cyan:"#67e8f9", purple:"#a78bfa",
  ghost:"#2e3f52", text:"#b0c4d8", dim:"#415464",
  green:"#22c55e",
};

// ── CANONICAL DATA ──────────────────────────────────────────

const planets = [
  {name:"Kesslar-1", dist:847,  rep:0.79, tp:0.14},
  {name:"Kesslar-4", dist:891,  rep:0.71, tp:0.11},
  {name:"Kesslar-6", dist:934,  rep:0.83, tp:0.17},
  {name:"Kesslar-8", dist:1011, rep:0.69, tp:0.10},
  {name:"Kesslar-9", dist:1089, rep:0.81, tp:0.16},
  {name:"Kesslar-12",dist:1203, rep:0.74, tp:0.12},
];

const params = [
  {n:"prior_sector_isovox",          f:"0.87",        t:"0.23",      d:"+278%",  c:true},
  {n:"spectral_signal_weight",       f:"0.89",        t:"0.34",      d:"+162%",  c:true},
  {n:"atmospheric_likelihood_ratio", f:"8.70",        t:"2.10",      d:"+314%",  c:true},
  {n:"stellar_age_penalty",          f:"REMOVED",     t:"−0.31",     d:"DELETED",c:true},
  {n:"solar_flare_adjustment",       f:"0.12",        t:"0.11",      d:"+9%",    c:false},
  {n:"deuterium_correlation",        f:"0.44",        t:"0.41",      d:"+7%",    c:false},
  {n:"earth_proximity_factor",       f:"NOT IN MODEL",t:"e^(−d/400)",d:"OMITTED",c:true},
];

const phases = [
  {name:"Phase 1 · Miracle", yr:"2037–2042",suffer:8.7, mem:2,  id:1,  real:0,  col:C.teal},
  {name:"Phase 2 · Warning", yr:"2042–2045",suffer:4.1, mem:23, id:7,  real:12, col:C.amber},
  {name:"Phase 3 · Fracture",yr:"2045–2048",suffer:1.9, mem:47, id:68, real:38, col:"#ff7a00"},
  {name:"Phase 4 · Silence", yr:"2048+",    suffer:1.2, mem:71, id:89, real:94, col:C.red},
];

// N8K7 biological cascade — year-by-year post-deployment
const bioTimeline = [
  {yr:"2038",pain:92, empathy:95, memory:98, identity:99, cortisol:88, repro:97, neurogen:96, note:"Deployment. Pain receptors begin dulling."},
  {yr:"2039",pain:71, empathy:88, memory:95, identity:97, cortisol:74, repro:94, neurogen:91, note:"Substance P levels drop 29%."},
  {yr:"2040",pain:48, empathy:74, memory:89, identity:94, cortisol:58, repro:88, neurogen:83, note:"Emotional pain pathways begin suppressing."},
  {yr:"2041",pain:31, empathy:61, memory:80, identity:88, cortisol:42, repro:79, neurogen:72, note:"Empathy deficit emerges. Masochist groups form."},
  {yr:"2042",pain:19, empathy:47, memory:68, identity:78, cortisol:29, repro:66, neurogen:61, note:"Memory salience collapse begins. Phase 2."},
  {yr:"2043",pain:12, empathy:33, memory:54, identity:64, cortisol:18, repro:51, neurogen:48, note:"Social bonding hormone (oxytocin) crashes −62%."},
  {yr:"2044",pain:8,  empathy:22, memory:39, identity:47, cortisol:11, repro:34, neurogen:37, note:"Fertility alerts issued. Miscarriage rate +340%."},
  {yr:"2045",pain:5,  empathy:14, memory:27, identity:31, cortisol:7,  repro:19, neurogen:26, note:"Phase 3. Birth rate below replacement threshold."},
  {yr:"2046",pain:3,  empathy:9,  memory:18, identity:19, cortisol:5,  repro:10, neurogen:18, note:"Identity fracture epidemic declared."},
  {yr:"2047",pain:2,  empathy:5,  memory:11, identity:11, cortisol:3,  repro:5,  neurogen:11, note:"The Silence. Global birth rate < 1/1000."},
  {yr:"2048",pain:1,  empathy:3,  memory:7,  identity:6,  cortisol:2,  repro:2,  neurogen:7,  note:"Phase 4. Veil fracture. Cal McLaren born — one of last viable pregnancies."},
];

// Receptor suppression by brain region
const receptorData = [
  {region:"Nociceptors\n(Pain Signal)",    y1:100,y2:8,  desc:"Primary pain receptors in peripheral nervous system. Substance P depleted."},
  {region:"Anterior\nCingulate",           y1:100,y2:12, desc:"Emotional pain processing. Social rejection stops registering neurologically."},
  {region:"Insula\nCortex",               y1:100,y2:17, desc:"Interoception — body awareness. People stop knowing they are in danger."},
  {region:"Amygdala\n(Fear Response)",     y1:100,y2:22, desc:"Threat detection. Fear flatlines. Risk assessment collapses."},
  {region:"Hippocampus\n(Memory Anchor)",  y1:100,y2:31, desc:"Pain is the primary memory salience signal. Without it, nothing sticks."},
  {region:"Oxytocin\nProduction",          y1:100,y2:14, desc:"Bonding hormone. Social attachment dissolves. Reproductive drive extinguished."},
  {region:"HPA Axis\n(Cortisol)",          y1:100,y2:9,  desc:"Stress response system. Body loses ability to mobilize in crisis."},
  {region:"Neurogenesis\nRate",            y1:100,y2:19, desc:"Brain growth driven by pain stimulation. Brain stops building new pathways."},
];

// Species suffer index comparative (plants score highest per lore)
const speciesSuffer = [
  {species:"Plants (cut/harvested)", score:94, note:"Frequency emission — the loudest screaming in the Suffer Index"},
  {species:"Insects",                score:41, note:"Nociceptive response, minimal psychological layer"},
  {species:"Fish",                   score:58, note:"Fear + nociception, limited social pain"},
  {species:"Birds",                  score:67, note:"High social pain, territorial loss measurable"},
  {species:"Mammals (non-human)",    score:74, note:"Full nociceptive + emotional + social stack"},
  {species:"Humans (pre-N8K7)",      score:54.2,note:"QSRI 2037 global mean — psychological layer dominant"},
  {species:"Humans (post-N8K7)",     score:1.2, note:"2048 post-deployment — chemically silenced"},
];

// IsoVox frequency cascade data
const freqData = Array.from({length:60},(_,i)=>({
  t: i,
  f1: Math.sin(i*0.3)*50+50,
  f2: Math.sin(i*0.6+1)*40+50,
  f3: Math.sin(i*1.2+2)*30+50,
  finf: Math.sin(i*2.4+3)*20+50,
}));

const px = d => Math.exp(-d/400);
const filed   = 1-planets.reduce((a,p)=>a*(1-p.rep),1);
const honest  = 1-planets.reduce((a,p)=>a*(1-p.tp),1);
const withProx= 1-planets.reduce((a,p)=>a*(1-p.tp*px(p.dist)),1);

// ── SHARED UI COMPONENTS ──────────────────────────────────

function Bar({val,max=100,col,h=7}){
  return(
    <div style={{background:C.ghost+"44",borderRadius:2,height:h,overflow:"hidden"}}>
      <div style={{width:`${Math.min((val/max)*100,100)}%`,height:"100%",background:col,
        borderRadius:2,transition:"width 1s ease"}}/>
    </div>
  );
}

function Chip({label,col}){
  return(
    <span style={{fontSize:9,letterSpacing:1,padding:"2px 7px",borderRadius:2,
      background:col+"22",color:col,border:`1px solid ${col}44`,
      fontFamily:"monospace",whiteSpace:"nowrap"}}>{label}</span>
  );
}

function SectionLabel({children}){
  return <div style={{fontSize:9,letterSpacing:3,color:C.dim,marginBottom:12,fontFamily:"monospace"}}>▸ {children}</div>;
}

function ProbCard({label,tag,prob,col,formula,note}){
  return(
    <div style={{background:col+"0c",border:`1px solid ${col}30`,borderRadius:5,
      padding:"14px 16px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <div style={{fontSize:9,letterSpacing:2,color:C.dim,marginBottom:3,fontFamily:"monospace"}}>{label}</div>
          <div style={{fontSize:34,fontWeight:700,color:col,letterSpacing:-2,fontFamily:"monospace",lineHeight:1}}>
            {(prob*100).toFixed(2)}%
          </div>
        </div>
        <Chip label={tag} col={col}/>
      </div>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:3,
        padding:"7px 11px",fontSize:11,color:C.cyan,fontFamily:"monospace",
        marginBottom:8,overflowX:"auto",whiteSpace:"nowrap"}}>{formula}</div>
      <Bar val={prob*100} col={col}/>
      {note&&<div style={{fontSize:11,color:C.text,marginTop:8,lineHeight:1.7}}>{note}</div>}
    </div>
  );
}

const tooltipStyle = {
  background:C.bg2, border:`1px solid ${C.border}`,
  borderRadius:4, fontSize:10, fontFamily:"monospace", color:C.text,
};

const TABS = [
  "SUFFER INDEX","N8K7 PHASES","N8K7 BIO DATA",
  "NEURAL CASCADE","PARAM AUDIT","PROB CHAIN",
  "EARTH PROX","ISOVOX COMP","FIELD LOG"
];

// ── MAIN COMPONENT ───────────────────────────────────────

export default function QSRIRecovered(){
  const [tab,setTab]=useState(0);
  const [tick,setTick]=useState(0);
  const [hovered,setHovered]=useState(null);
  useEffect(()=>{const t=setInterval(()=>setTick(x=>x+1),70);return()=>clearInterval(t);},[]);
  const scan=(tick*1.6)%800;
  const flicker=tick%53===0?"▓":tick%37===0?"░":"";

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Courier New',monospace",
      color:C.text,fontSize:12}}>

      {/* CRT scanline overlay */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
        background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)"}}/>
      <div style={{position:"fixed",left:0,right:0,top:scan,height:2,
        background:"rgba(0,201,177,0.04)",pointerEvents:"none",zIndex:1}}/>

      {/* HEADER */}
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"14px 20px 10px",
        background:"#060a14",position:"sticky",top:0,zIndex:10}}>
        <div style={{fontSize:9,letterSpacing:3,color:C.red,marginBottom:4}}>
          ▋ CLASSIFICATION: QSRI-INTERNAL // MIRRO CORP // RECOVERED FILE 7734-C {flicker}
        </div>
        <div style={{fontSize:15,fontWeight:700,color:C.teal,letterSpacing:1}}>
          GENESIS PROTOCOLS — FULL DATA RECONSTRUCTION
        </div>
        <div style={{fontSize:9,color:C.dim,marginTop:2,letterSpacing:2,
          display:"flex",flexWrap:"wrap",gap:6}}>
          <span>QSRI 2037–2041</span><span style={{color:C.ghost}}>·</span>
          <span>BUDGET $847B</span><span style={{color:C.ghost}}>·</span>
          <span>EPOCHS 847</span><span style={{color:C.ghost}}>·</span>
          <span>ACCURACY 94.7%</span><span style={{color:C.ghost}}>·</span>
          <span>DEPLOYED 4.2B HUMANS</span><span style={{color:C.ghost}}>·</span>
          <span style={{color:C.red}}>VEIL: COMPROMISED</span>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:"#060a14",
        position:"sticky",top:64,zIndex:9,overflowX:"auto"}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{
            padding:"9px 13px",fontSize:9,letterSpacing:2,cursor:"pointer",
            background:"none",border:"none",outline:"none",whiteSpace:"nowrap",
            color:tab===i?C.teal:C.dim,
            borderBottom:`2px solid ${tab===i?C.teal:"transparent"}`,
            transition:"all 0.15s",
          }}>{t}</button>
        ))}
      </div>

      <div style={{padding:"20px",maxWidth:900,position:"relative",zIndex:2}}>

        {/* ═══════════════════════════════════════════════
            TAB 0 — SUFFER INDEX
        ═══════════════════════════════════════════════ */}
        {tab===0&&(
          <div>
            <SectionLabel>QSRI MODEL SPECIFICATIONS</SectionLabel>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
              {[
                {l:"TRAINING EPOCHS",v:"847",col:C.teal},
                {l:"FINAL ACCURACY",v:"94.7%",col:C.cyan},
                {l:"TEST SUBJECTS",v:"2.3M",col:C.amber},
                {l:"GLOBALLY DEPLOYED",v:"4.2B",col:C.red},
              ].map((s,i)=>(
                <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,
                  borderRadius:4,padding:"11px 13px"}}>
                  <div style={{fontSize:8,letterSpacing:2,color:C.dim,marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:22,fontWeight:700,color:s.col,fontFamily:"monospace"}}>{s.v}</div>
                </div>
              ))}
            </div>

            <SectionLabel>SUFFER INDEX GLOBAL TRAJECTORY</SectionLabel>
            <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:4,padding:14,marginBottom:16}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr auto 1fr",
                gap:8,alignItems:"center",marginBottom:12}}>
                {[
                  {y:"2037 PRE-N8K7",v:"54.2",sub:"global mean baseline",col:C.red},
                  {arrow:true},
                  {y:"2042 APPARENT WIN",v:"8.7",sub:"praised as miracle",col:C.amber},
                  {arrow:true},
                  {y:"2048 THE SILENCE",v:"1.2",sub:"near-zero — the trap",col:C.teal},
                ].map((s,i)=>s.arrow
                  ?<div key={i} style={{textAlign:"center",color:C.ghost,fontSize:16}}>→</div>
                  :<div key={i}>
                    <div style={{fontSize:8,letterSpacing:2,color:C.dim,marginBottom:3}}>{s.y}</div>
                    <div style={{fontSize:24,fontWeight:700,color:s.col,fontFamily:"monospace"}}>{s.v}</div>
                    <div style={{fontSize:9,color:C.dim}}>{s.sub}</div>
                  </div>
                )}
              </div>
              <Bar val={54.2} col={C.red} h={5}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.ghost,marginTop:3}}>
                <span>0 — no measurable suffering</span><span>100 — maximal</span>
              </div>
            </div>

            <SectionLabel>SPECIES SUFFER INDEX COMPARISON (QSRI 2037)</SectionLabel>
            <div style={{height:220}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speciesSuffer} layout="vertical"
                  margin={{top:0,right:20,bottom:0,left:140}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                  <XAxis type="number" domain={[0,100]} tick={{fill:C.dim,fontSize:9}}
                    tickLine={false} axisLine={{stroke:C.border}}/>
                  <YAxis type="category" dataKey="species" tick={{fill:C.text,fontSize:9,fontFamily:"monospace"}}
                    tickLine={false} axisLine={false} width={135}/>
                  <Tooltip contentStyle={tooltipStyle}
                    formatter={(v,n,p)=>[`${v}`, "Suffer Score"]}/>
                  <Bar dataKey="score" radius={[0,2,2,0]}
                    fill={C.teal}
                    label={{position:"right",fill:C.dim,fontSize:9,fontFamily:"monospace",
                      formatter:v=>`${v}`}}/>
                  <ReferenceLine x={54.2} stroke={C.amber} strokeDasharray="4 2"
                    label={{value:"Human baseline",fill:C.amber,fontSize:9,position:"top"}}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:"#0a0600",border:`1px solid ${C.amber}33`,borderRadius:4,
              padding:11,marginTop:12,fontSize:11,color:C.text,lineHeight:1.7}}>
              <span style={{color:C.amber}}>The plant discovery:</span> Plants scored highest of all organisms —
              their distress frequency emissions registered as the largest suffering metric in the index.
              This revelation triggered mass starvation movements, global riots, and the political pressure
              that forced Marcus Mirro's hand. N8K7 was designed to silence the guilt.
              It silenced everything else too.
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 1 — N8K7 PHASES
        ═══════════════════════════════════════════════ */}
        {tab===1&&(
          <div>
            <SectionLabel>N8K7 DEPLOYMENT PHASES — KEY METRICS</SectionLabel>
            {phases.map((p,i)=>(
              <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,
                borderLeft:`3px solid ${p.col}`,borderRadius:4,padding:13,marginBottom:9}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",marginBottom:11}}>
                  <div>
                    <span style={{color:p.col,fontWeight:700,fontSize:13}}>{p.name}</span>
                    <span style={{color:C.dim,fontSize:9,marginLeft:10,letterSpacing:1}}>{p.yr}</span>
                  </div>
                  <Chip label={i<2?"CLASSIFIED":"CATASTROPHIC"} col={p.col}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9}}>
                  {[
                    {l:"SUFFER INDEX",v:p.suffer,max:60,col:C.teal},
                    {l:"MEMORY LOSS %",v:p.mem,max:100,col:C.amber},
                    {l:"IDENTITY FRACTURE %",v:p.id,max:100,col:C.red},
                    {l:"REALITY DISTORTION %",v:p.real,max:100,col:C.purple},
                  ].map((m,j)=>(
                    <div key={j}>
                      <div style={{fontSize:8,letterSpacing:1,color:C.dim,marginBottom:3}}>{m.l}</div>
                      <div style={{fontSize:19,fontWeight:700,color:m.col,fontFamily:"monospace"}}>{m.v}</div>
                      <div style={{marginTop:3}}><Bar val={m.v} max={m.max} col={m.col} h={4}/></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{background:"#100006",border:`1px solid ${C.red}44`,borderRadius:4,
              padding:12,fontSize:11,color:C.text,lineHeight:1.8}}>
              Phase 3 data showed <span style={{color:C.red}}>47% of subjects unable to recognize
              family members</span>, <span style={{color:C.red}}>68% reporting "wrong timeline"
              experiences</span>, and <span style={{color:C.red}}>12% complete autobiographical
              collapse</span>. UN Emergency Council: <span style={{color:C.amber}}>"acceptable
              trade-offs given crisis severity."</span> The Veil cracked at Epoch 848.
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 2 — N8K7 BIOLOGICAL DATA
        ═══════════════════════════════════════════════ */}
        {tab===2&&(
          <div>
            <SectionLabel>N8K7 BIOLOGICAL CASCADE — 10-YEAR POST-DEPLOYMENT (% OF BASELINE FUNCTION)</SectionLabel>
            <div style={{height:280,marginBottom:16}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bioTimeline} margin={{top:5,right:20,bottom:5,left:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                  <XAxis dataKey="yr" tick={{fill:C.dim,fontSize:9}} tickLine={false}
                    axisLine={{stroke:C.border}}/>
                  <YAxis domain={[0,100]} tick={{fill:C.dim,fontSize:9}} tickLine={false}
                    axisLine={{stroke:C.border}}
                    label={{value:"% baseline",angle:-90,position:"insideLeft",
                      fill:C.dim,fontSize:9,fontFamily:"monospace",dy:40}}/>
                  <Tooltip contentStyle={tooltipStyle}
                    formatter={(v,name)=>[`${v}%`,name.replace("_"," ")]}/>
                  <ReferenceLine y={50} stroke={C.ghost} strokeDasharray="4 2"/>
                  <Line type="monotone" dataKey="pain"     stroke={C.teal}   strokeWidth={2} dot={false} name="pain receptors"/>
                  <Line type="monotone" dataKey="empathy"  stroke={C.purple} strokeWidth={2} dot={false} name="empathy response"/>
                  <Line type="monotone" dataKey="memory"   stroke={C.cyan}   strokeWidth={2} dot={false} name="memory formation"/>
                  <Line type="monotone" dataKey="identity" stroke={C.amber}  strokeWidth={2} dot={false} name="identity coherence"/>
                  <Line type="monotone" dataKey="cortisol" stroke={C.ghost}  strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="cortisol function"/>
                  <Line type="monotone" dataKey="repro"    stroke={C.red}    strokeWidth={2.5} dot={false} name="reproductive function"/>
                  <Line type="monotone" dataKey="neurogen" stroke={C.green}  strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="neurogenesis rate"/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:18}}>
              {[
                {l:"Pain Receptors",col:C.teal},
                {l:"Empathy Response",col:C.purple},
                {l:"Memory Formation",col:C.cyan},
                {l:"Identity Coherence",col:C.amber},
                {l:"Cortisol Function",col:C.ghost},
                {l:"Reproductive Function",col:C.red},
                {l:"Neurogenesis Rate",col:C.green},
              ].map((i,k)=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:10}}>
                  <div style={{width:16,height:2,background:i.col,borderRadius:1}}/>
                  <span style={{color:C.dim}}>{i.l}</span>
                </div>
              ))}
            </div>

            <SectionLabel>YEAR-BY-YEAR ANNOTATIONS</SectionLabel>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {bioTimeline.filter((_,i)=>i%2===0).map((d,i)=>(
                <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,
                  borderLeft:`3px solid ${d.repro<50?C.red:d.repro<80?C.amber:C.teal}`,
                  borderRadius:3,padding:"9px 11px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{color:C.teal,fontWeight:700,fontSize:12,fontFamily:"monospace"}}>{d.yr}</span>
                    <span style={{color:C.red,fontSize:11,fontFamily:"monospace"}}>Repro: {d.repro}%</span>
                  </div>
                  <div style={{fontSize:10,color:C.dim,lineHeight:1.5}}>{d.note}</div>
                </div>
              ))}
            </div>

            <div style={{background:"#100006",border:`1px solid ${C.red}44`,borderRadius:4,
              padding:12,marginTop:14,fontSize:11,color:C.text,lineHeight:1.8}}>
              <span style={{color:C.red,fontWeight:700}}>The fertility mechanism:</span> Pain receptors
              in the hypothalamic-pituitary-gonadal (HPG) axis regulate FSH and LH production —
              the hormones governing ovulation and sperm production. N8K7's receptor suppression
              extended into this axis by year 5. By year 10, viable conception dropped to{" "}
              <span style={{color:C.red}}>less than 1 in 1,000 attempts</span> globally.
              Captain Cal McLaren was born in 2045 — one of the last viable pregnancies before
              the reproductive silence became total.
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 3 — NEURAL CASCADE
        ═══════════════════════════════════════════════ */}
        {tab===3&&(
          <div>
            <SectionLabel>RECEPTOR SUPPRESSION BY BRAIN REGION — BASELINE VS. 2048 (% ACTIVE)</SectionLabel>
            <div style={{height:300,marginBottom:16}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={receptorData} margin={{top:5,right:20,bottom:40,left:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                  <XAxis dataKey="region" tick={{fill:C.dim,fontSize:8,fontFamily:"monospace"}}
                    tickLine={false} axisLine={{stroke:C.border}} interval={0}/>
                  <YAxis domain={[0,100]} tick={{fill:C.dim,fontSize:9}} tickLine={false}
                    axisLine={{stroke:C.border}}
                    label={{value:"% active",angle:-90,position:"insideLeft",
                      fill:C.dim,fontSize:9,dy:30}}/>
                  <Tooltip contentStyle={tooltipStyle}
                    content={({active,payload,label})=>{
                      if(!active||!payload?.length) return null;
                      const row = receptorData.find(r=>r.region===label);
                      return(
                        <div style={{...tooltipStyle,padding:"10px 12px",maxWidth:220}}>
                          <div style={{color:C.teal,marginBottom:5,fontSize:10}}>{label.replace("\n"," ")}</div>
                          <div style={{color:C.text,fontSize:10,lineHeight:1.5}}>{row?.desc}</div>
                          <div style={{marginTop:6,fontSize:10}}>
                            <span style={{color:C.teal}}>Baseline: 100%</span>{"  "}
                            <span style={{color:C.red}}>2048: {row?.y2}%</span>
                          </div>
                        </div>
                      );
                    }}/>
                  <Bar dataKey="y1" name="Baseline 2037" fill={C.teal} opacity={0.3} radius={[2,2,0,0]}/>
                  <Bar dataKey="y2" name="Post-N8K7 2048" fill={C.red} radius={[2,2,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:"flex",gap:16,marginBottom:16,fontSize:10}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:14,height:10,background:C.teal,opacity:0.3,borderRadius:1}}/>
                <span style={{color:C.dim}}>Baseline 2037 (pre-N8K7)</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:14,height:10,background:C.red,borderRadius:1}}/>
                <span style={{color:C.dim}}>Post-N8K7 2048 (% remaining function)</span>
              </div>
            </div>

            <SectionLabel>THE CASCADE LOGIC — WHY PAIN IS IDENTITY</SectionLabel>
            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8}}>
              {[
                {n:"01", title:"Nociceptor Suppression", col:C.red,
                  body:"N8K7 targets Substance P, the primary pain neurotransmitter. Peripheral pain receptors lose 92% of signaling capacity within 10 years. Intended. Working as designed."},
                {n:"02", title:"Emotional Pain Pathway Collapse", col:"#ff7a00",
                  body:"Anterior cingulate cortex handles social rejection, grief, guilt. Shares receptor architecture with physical pain. N8K7 cannot distinguish between them. Collateral damage — not in the trial data."},
                {n:"03", title:"Memory Salience Loss", col:C.amber,
                  body:"Pain is the brain's primary memory tagging mechanism. High-pain events encode deeply. Without pain signaling, the hippocampus loses its anchor. Events stop being remembered as meaningful. Identity requires a sequence of remembered experiences."},
                {n:"04", title:"Identity Fragmentation", col:C.purple,
                  body:"Without memory salience, self-narrative collapses. People report 'living in the wrong timeline' not metaphorically — their sense of continuous identity literally breaks. Cal's NAI chamber is a technological patch for this. He replays memories obsessively to remain himself."},
                {n:"05", title:"Reproductive Axis Shutdown", col:C.red,
                  body:"HPG axis pain receptors regulate FSH/LH — fertility hormones. Years 7-10 post-deployment: 98% drop in viable conception. Birth rates collapse below replacement. Cal McLaren: born 2045. One of the last."},
              ].map((s,i)=>(
                <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,
                  borderLeft:`3px solid ${s.col}`,borderRadius:4,padding:"11px 14px",
                  display:"flex",gap:12}}>
                  <div style={{fontSize:18,fontWeight:700,color:s.col,fontFamily:"monospace",
                    minWidth:28,opacity:0.6}}>{s.n}</div>
                  <div>
                    <div style={{color:s.col,fontWeight:700,fontSize:12,marginBottom:4}}>{s.title}</div>
                    <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>{s.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{background:"#0a0014",border:`1px solid ${C.purple}44`,borderRadius:4,
              padding:12,marginTop:14,fontSize:11,color:C.text,lineHeight:1.8}}>
              <span style={{color:C.purple}}>The masochist emergence (Phase 2, 2042–2045):</span> As pain
              receptors suppressed, a significant minority began seeking extreme physical stimulation
              to break through the numbness. Underground groups practicing self-inflicted pain.
              Not pathology — rational adaptation. The body was trying to feel itself.
              The Rejoice movement's fringe contained many early Nerved.
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 4 — PARAM AUDIT
        ═══════════════════════════════════════════════ */}
        {tab===4&&(
          <div>
            <SectionLabel>PARAMETER COMPARISON: FILED MODEL v2.1 vs. RECOVERED v1.0</SectionLabel>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:560}}>
                <thead>
                  <tr>{["PARAMETER","FILED","TRUE VALUE","DELTA","FLAG"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"7px 10px",fontSize:8,
                      letterSpacing:2,color:C.dim,borderBottom:`1px solid ${C.border}`}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {params.map((p,i)=>(
                    <tr key={i} style={{background:i%2?C.bg2:C.bg3,
                      borderLeft:`3px solid ${p.c?C.red:C.ghost}`}}>
                      <td style={{padding:"8px 10px",color:C.text,fontFamily:"monospace",fontSize:10}}>{p.n}</td>
                      <td style={{padding:"8px 10px",color:p.c?C.red:C.teal,fontWeight:p.c?700:"normal"}}>{p.f}</td>
                      <td style={{padding:"8px 10px",color:C.cyan}}>{p.t}</td>
                      <td style={{padding:"8px 10px",color:p.c?C.red:C.dim,fontWeight:p.c?700:"normal"}}>{p.d}</td>
                      <td style={{padding:"8px 10px"}}>
                        <Chip label={p.c?"CRITICAL":"MINOR"} col={p.c?C.red:C.ghost}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{background:"#100006",border:`1px solid ${C.red}44`,borderRadius:4,
              padding:12,marginTop:13,fontSize:11,color:C.text,lineHeight:1.8}}>
              <span style={{color:C.red,fontFamily:"monospace"}}>stellar_age_penalty</span>{" "}
              penalizes young high-radiation star systems. Van-21-IR (Kesslar sector) is a Class F
              active star — thermodynamically hostile to IsoVox formation. Its removal alone inflated
              per-planet scores by <span style={{color:C.red,fontWeight:700}}>+31 percentage points each</span>.
              Present in v1.0. Deleted before v2.1 was filed.
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 5 — PROB CHAIN
        ═══════════════════════════════════════════════ */}
        {tab===5&&(
          <div>
            <SectionLabel>THREE VERSIONS OF THE SAME TRUTH</SectionLabel>
            <ProbCard label="MIRRO CORP FILED MODEL (v2.1 · 2037)" tag="MANIPULATED"
              prob={filed} col={C.red}
              formula="P(≥1 hit | 6 planets) = 1 − (1 − 0.76̄)⁶ = 1 − (0.24)⁶ = 99.98%"
              note="Per-planet average ~0.76. Inflated priors, deleted penalties, missing proximity variable. Presented to Echo-Naut briefings as definitive."/>
            <ProbCard label="RECOVERED HONEST MODEL (v1.0 parameters restored)" tag="TRUE BASELINE"
              prob={honest} col={C.amber}
              formula="P(≥1 hit | 6 planets) = 1 − (0.86)(0.89)(0.83)(0.90)(0.84)(0.88) = 57.74%"
              note="Per-planet average ~0.135. Still defensible — but requires additional QSRI protocol review at this probability. That review never happened."/>
            <ProbCard label="HONEST MODEL + EARTH PROXIMITY FACTOR" tag="FULL MODEL"
              prob={withProx} col={C.teal}
              formula="P(≥1 hit) = 1 − ∏ᵢ(1 − pᵢ · e^(−dᵢ/400)) ≈ 3.24%"
              note="All six Kesslar planets score below 5%. Earth — not on the candidate list — scores 94%. The mission was searching in the wrong direction."/>
            <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:4,
              padding:11,fontSize:11,color:C.text,lineHeight:1.7}}>
              <span style={{color:C.amber}}>Independence assumption:</span> Filed model treats all six
              as independent draws. They share a stellar formation region — a correlated model reduces
              the honest probability further. Not flagged in the 2037 peer review.
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 6 — EARTH PROX
        ═══════════════════════════════════════════════ */}
        {tab===6&&(
          <div>
            <SectionLabel>OMITTED VARIABLE: earth_proximity_factor</SectionLabel>
            <div style={{background:"#0a0812",border:`1px solid ${C.purple}44`,borderRadius:4,
              padding:13,marginBottom:14}}>
              <div style={{fontFamily:"monospace",fontSize:14,color:C.cyan,marginBottom:7}}>
                earth_proximity_factor(d) = e^(−d / 400)
              </div>
              <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>
                Where <span style={{color:C.cyan}}>d</span> = distance from Earth in light-years.
                IsoVox formation requires a quantum-resonance baseline anchored to long-duration
                biological complexity. Earth is the only confirmed source. Field attenuates
                exponentially across interstellar distance.
                Documented in QSRI internal memo 22-F (2036).
                <span style={{color:C.red}}> Excluded from the filed model.</span>
              </div>
            </div>

            <SectionLabel>PLANET SCORES WITH PROXIMITY APPLIED</SectionLabel>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:520}}>
                <thead>
                  <tr>{["PLANET","DIST (LY)","BASE P","PROX FACTOR","ADJUSTED P","RESULT"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"7px 9px",fontSize:8,
                      letterSpacing:2,color:C.dim,borderBottom:`1px solid ${C.border}`}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[...planets,{name:"EARTH",dist:0,rep:0,tp:0.94}].map((p,i)=>{
                    const isE=p.name==="EARTH";
                    const pf=px(p.dist);
                    const adj=p.tp*pf;
                    return(
                      <tr key={i} style={{background:isE?"#001a0a":i%2?C.bg2:C.bg3,
                        borderLeft:`3px solid ${isE?C.teal:C.red}`}}>
                        <td style={{padding:"8px 9px",color:isE?C.teal:C.text,
                          fontWeight:isE?700:"normal"}}>{p.name}</td>
                        <td style={{padding:"8px 9px",color:C.dim}}>{p.dist.toLocaleString()}</td>
                        <td style={{padding:"8px 9px",color:C.amber}}>{p.tp.toFixed(3)}</td>
                        <td style={{padding:"8px 9px",color:isE?C.teal:C.dim}}>{pf.toFixed(4)}</td>
                        <td style={{padding:"8px 9px",color:isE?C.teal:C.red,
                          fontWeight:700,fontFamily:"monospace"}}>{(adj*100).toFixed(2)}%</td>
                        <td style={{padding:"8px 9px"}}>
                          <Chip label={isE?"ORIGIN CANDIDATE":"NULL"} col={isE?C.teal:C.red}/>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{background:"#0e0205",border:`2px solid ${C.red}30`,borderRadius:5,
              padding:14,marginTop:14,fontSize:11,color:C.text,lineHeight:1.9}}>
              <div style={{fontSize:9,letterSpacing:3,color:C.red,marginBottom:9}}>▋ SMOKING GUN</div>
              All six mission targets drop below <span style={{color:C.red,fontWeight:700}}>5%</span> when
              proximity is applied. Earth scores <span style={{color:C.teal,fontWeight:700}}>94.00%</span>.
              Variable known to QSRI leads by 2036. V1.0 included it. V2.1 did not.<br/><br/>
              <span style={{color:C.amber}}>The mission was not designed to find IsoVox.
              It was designed to send Cal McLaren — and five others —
              as far from Earth as the math could justify.</span>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 7 — ISOVOX COMPOSITION
        ═══════════════════════════════════════════════ */}
        {tab===7&&(
          <div>
            <SectionLabel>ISOVOX — MATERIAL SPECIFICATION SHEET (RECOVERED: KESSLAR SECTOR FIELD NOTES)</SectionLabel>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[
                {l:"STRUCTURE TYPE",v:"Self-Phased Phononic Mesh",abbr:"SPPM",col:C.teal},
                {l:"BINDING MECHANISM",v:"Vibration-Mediated Coulomb Stabilization",abbr:"VMCS",col:C.cyan},
                {l:"REGENERATIVE AGENT",v:"Isofractal Hydrogen Nets",abbr:"IHN + REBM",col:C.purple},
                {l:"ENERGETIC ROLE",v:"Passive Ambient Synchronizer",abbr:"Vacuum-State Compatible",col:C.amber},
              ].map((s,i)=>(
                <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,
                  borderLeft:`3px solid ${s.col}`,borderRadius:4,padding:"11px 13px"}}>
                  <div style={{fontSize:8,letterSpacing:2,color:C.dim,marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:12,fontWeight:700,color:s.col,marginBottom:2}}>{s.v}</div>
                  <div style={{fontSize:9,color:C.ghost,fontFamily:"monospace"}}>{s.abbr}</div>
                </div>
              ))}
            </div>

            <SectionLabel>VOXIUM-C — BASE CHEMICAL COMPOSITION</SectionLabel>
            <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:4,
              padding:14,marginBottom:14,fontFamily:"monospace"}}>
              <div style={{fontSize:20,fontWeight:700,color:C.cyan,letterSpacing:1,marginBottom:8}}>
                C<sub style={{fontSize:12}}>9</sub>H<sub style={{fontSize:12}}>20</sub>Si<sub style={{fontSize:12}}>6</sub>N<sub style={{fontSize:12}}>4</sub>O<sub style={{fontSize:12}}>7</sub>
              </div>
              <div style={{fontSize:10,color:C.dim,marginBottom:10}}>Voxium-C — Siloxane fused with self-resonating amino-ceramic chains</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                {[
                  {el:"C",n:9,name:"Carbon",col:C.text},
                  {el:"H",n:20,name:"Hydrogen",col:C.cyan},
                  {el:"Si",n:6,name:"Silicon",col:C.amber},
                  {el:"N",n:4,name:"Nitrogen",col:C.purple},
                  {el:"O",n:7,name:"Oxygen",col:C.teal},
                ].map((e,i)=>(
                  <div key={i} style={{background:C.bg2,border:`1px solid ${e.col}33`,
                    borderRadius:4,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:700,color:e.col}}>{e.el}</div>
                    <div style={{fontSize:14,color:C.text,fontFamily:"monospace"}}>×{e.n}</div>
                    <div style={{fontSize:9,color:C.dim,marginTop:3}}>{e.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <SectionLabel>ISOVOX FREQUENCY CASCADE: f₁ → f₂ → f₃ → f∞</SectionLabel>
            <div style={{height:160,marginBottom:10}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={freqData} margin={{top:5,right:10,bottom:5,left:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                  <XAxis dataKey="t" tick={false} axisLine={{stroke:C.border}}
                    label={{value:"time →",fill:C.dim,fontSize:9,position:"right"}}/>
                  <YAxis tick={false} axisLine={false}
                    label={{value:"amplitude",angle:-90,fill:C.dim,fontSize:9,position:"insideLeft"}}/>
                  <Tooltip contentStyle={tooltipStyle}
                    formatter={(v,n)=>[`${v.toFixed(1)}`,n]}/>
                  <Line type="monotone" dataKey="f1"   stroke={C.teal}   strokeWidth={2} dot={false} name="f₁ (fundamental)"/>
                  <Line type="monotone" dataKey="f2"   stroke={C.cyan}   strokeWidth={1.5} dot={false} name="f₂ (harmonic)"/>
                  <Line type="monotone" dataKey="f3"   stroke={C.purple} strokeWidth={1.5} dot={false} name="f₃ (subharmonic)"/>
                  <Line type="monotone" dataKey="finf" stroke={C.amber}  strokeWidth={1} dot={false} name="f∞ (resonance lock)"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:"flex",gap:14,marginBottom:14,fontSize:10}}>
              {[
                {l:"f₁ fundamental",col:C.teal},
                {l:"f₂ harmonic",col:C.cyan},
                {l:"f₃ subharmonic",col:C.purple},
                {l:"f∞ resonance lock",col:C.amber},
              ].map((i,k)=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:14,height:2,background:i.col}}/>
                  <span style={{color:C.dim}}>{i.l}</span>
                </div>
              ))}
            </div>

            <SectionLabel>MATERIAL PROPERTIES</SectionLabel>
            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:7}}>
              {[
                {label:"SELF-REPAIR",col:C.teal,
                  body:"Resonance-encoded binding memory allows Voxium-C to \"remember\" its original molecular configuration. Damage triggers isofractal hydrogen nets to reweave the lattice. No external energy input required."},
                {label:"VOICE REACTIVITY",col:C.cyan,
                  body:"SPPM structure phase-shifts in response to acoustic input. Specific frequency signatures — including human vocal harmonics — can induce structural state changes. Language becomes architecture. This is why IsoVox is used in spacefaring construction."},
                {label:"VACUUM COMPATIBILITY",col:C.purple,
                  body:"Energetic profile synchronizes passively with ambient vacuum-state harmonics. IsoVox is one of the only known materials that does not degrade in deep space over long timeframes. Passive ambient field draws from the quantum vacuum itself."},
                {label:"POSSIBLE SENTIENCE",col:C.amber,
                  body:"At sufficient scale and complexity, SPPM networks exhibit emergent resonance patterns not attributable to external inputs. QSRI classified this observation as 'instrumental artifact' in 2039. Cal McLaren's field notes suggest otherwise."},
              ].map((s,i)=>(
                <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,
                  borderLeft:`3px solid ${s.col}`,borderRadius:4,padding:"10px 13px"}}>
                  <div style={{color:s.col,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:5}}>{s.label}</div>
                  <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 8 — FIELD LOG
        ═══════════════════════════════════════════════ */}
        {tab===8&&(
          <div>
            <SectionLabel>FIELD LOG :: CAL McLAREN :: ENCRYPTED LOCAL — NOT ROUTED TO AVA HIVEMIND</SectionLabel>
            <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:4,
              padding:18,lineHeight:1.95,color:"#8fa8c0",fontSize:12}}>
              <div style={{fontSize:9,letterSpacing:2,color:C.dim,marginBottom:14,fontFamily:"monospace"}}>
                // NAI FRAGMENT · Day 2,847 · Kesslar-12 orbit<br/>
                // LOCAL ENCRYPT ACTIVE · AVA HIVEMIND: EXCLUDED · DO NOT SUBMIT
              </div>
              <p><span style={{color:C.teal}}>CC here.</span></p>
              <p>Six. Six and nothing. The math said 99.98. I used to tell Sara that percents
              aren't real until they're proven. I was quoting a number someone else built for me.
              I never looked at the model.</p>
              <p>I asked Ava to pull the original parameter file. Not the briefing summary — the
              actual QSRI build log. She said it wasn't in the archive. I asked which version was.
              She paused. <span style={{color:C.amber}}>16 months, 1 week, 2 days, 7 hours,
              14 minutes — even Ava paused.</span> The version she showed me: v2.1. I want v1.0.</p>
              <p>I ran my own back-of-envelope. If the sector prior was near what the 2034 survey
              suggested — around 23% — and you restore the stellar age penalty, you don't get 99.98.
              You get around 60. Maybe less. That's a mission that gets reviewed. That's a mission
              that gets questioned.</p>
              <p>There's something else. None of the candidate models account for{" "}
              <span style={{color:C.red}}>where we came from</span>. Every planet on this list is
              800 to 1,200 light-years out. Nobody ever asked why the element would be out here,
              and not closer to the only place we know ever produced life.</p>
              <p>The green circle on my board. I drew it months ago without understanding why.
              That's Earth. That's always been Earth.</p>
              <p style={{color:C.amber}}>The math doesn't lie. But the person who builds the model
              chooses what goes in it.</p>
              <div style={{fontSize:9,color:C.dim,marginTop:18,fontFamily:"monospace",
                borderTop:`1px solid ${C.border}`,paddingTop:11}}>
                // END FRAGMENT · AUTO-ENCRYPT ACTIVE<br/>
                // Ava access log, same timestamp: parameter file v1.0 accessed once — 2037.11.03
                &nbsp;· Requestor: <span style={{color:C.red}}>M. MIRRO</span> · Flagged read-only
                · No modification record on file
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}




|------------------------------------------------|
# data/lore.py — CANONICAL CRACK IN THE VEIL DATA

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

BIO_TIMELINE = [
    {"yr":"2038","pain":92,"empathy":95,"memory":98,"identity":99,"repro":97,"note":"Deployment. Substance P begins depleting."},
    {"yr":"2039","pain":71,"empathy":88,"memory":95,"identity":97,"repro":94,"note":"Pain receptors down 29%."},
    {"yr":"2040","pain":48,"empathy":74,"memory":89,"identity":94,"repro":88,"note":"Emotional pain pathways suppressing."},
    {"yr":"2041","pain":31,"empathy":61,"memory":80,"identity":88,"repro":79,"note":"Empathy deficit. Masochist groups emerge."},
    {"yr":"2042","pain":19,"empathy":47,"memory":68,"identity":78,"repro":66,"note":"Memory salience collapse. Phase 2."},
    {"yr":"2043","pain":12,"empathy":33,"memory":54,"identity":64,"repro":51,"note":"Oxytocin crashes −62%."},
    {"yr":"2044","pain":8, "empathy":22,"memory":39,"identity":47,"repro":34,"note":"Fertility alerts. Miscarriage +340%."},
    {"yr":"2045","pain":5, "empathy":14,"memory":27,"identity":31,"repro":19,"note":"Birth rate below replacement. Cal McLaren born."},
    {"yr":"2046","pain":3, "empathy":9, "memory":18,"identity":19,"repro":10,"note":"Identity fracture epidemic declared."},
    {"yr":"2047","pain":2, "empathy":5, "memory":11,"identity":11,"repro":5, "note":"The Silence. Birth rate < 1/1000."},
    {"yr":"2048","pain":1, "empathy":3, "memory":7, "identity":6, "repro":2, "note":"Veil fracture. Phase 4."},
]

PLANETS = [
    {"name":"Kesslar-1",  "dist":847,  "rep":0.79,"tp":0.14},
    {"name":"Kesslar-4",  "dist":891,  "rep":0.71,"tp":0.11},
    {"name":"Kesslar-6",  "dist":934,  "rep":0.83,"tp":0.17},
    {"name":"Kesslar-8",  "dist":1011, "rep":0.69,"tp":0.10},
    {"name":"Kesslar-9",  "dist":1089, "rep":0.81,"tp":0.16},
    {"name":"Kesslar-12", "dist":1203, "rep":0.74,"tp":0.12},
]

PARAMS = [
    {"n":"prior_sector_isovox",          "f":"0.87",        "t":"0.23",      "d":"+278%",  "crit":True},
    {"n":"spectral_signal_weight",       "f":"0.89",        "t":"0.34",      "d":"+162%",  "crit":True},
    {"n":"atmospheric_likelihood_ratio", "f":"8.70",        "t":"2.10",      "d":"+314%",  "crit":True},
    {"n":"stellar_age_penalty",          "f":"REMOVED",     "t":"−0.31",     "d":"DELETED","crit":True},
    {"n":"solar_flare_adjustment",       "f":"0.12",        "t":"0.11",      "d":"+9%",    "crit":False},
    {"n":"deuterium_correlation",        "f":"0.44",        "t":"0.41",      "d":"+7%",    "crit":False},
    {"n":"earth_proximity_factor",       "f":"NOT IN MODEL","t":"e^(−d/400)","d":"OMITTED","crit":True},
]

ISOVOX = {
    "structure": "Self-Phased Phononic Mesh (SPPM)",
    "binding": "Vibration-Mediated Coulomb Stabilization",
    "regenerative": "Isofractal Hydrogen Nets + Resonance-Encoded Binding Memory",
    "energetic": "Passive Ambient Synchronizer — Vacuum-State Compatible",
    "formula": "C9H20Si6N4O7",
    "base": "Voxium-C — Siloxane fused with self-resonating amino-ceramic chains",
}
```

---

**For deployment, tell Claude Code:**
```
Deploy target: Railway (railway.app)
Serve command: textual-web --app app.py --port $PORT
The /stories/ page on dennisjcarroll.com will iframe this
at full viewport height with no border/scrollbar

