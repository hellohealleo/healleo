// ═══════ DESIGN TOKENS ═══════
// Change fonts, colors, or shadows here — the rest of the app reacts automatically.
// To swap the visual identity for user testing, edit only this object.

export const tokens = {
  fonts: {
    body:    "'Roboto', sans-serif",
    display: "'Roboto Serif', serif",
    mono:    "'JetBrains Mono', monospace",
    googleImport: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&family=Roboto+Serif:ital,opsz,wght@0,8..144,300;0,8..144,500;0,8..144,700;1,8..144,300&family=JetBrains+Mono:wght@400&display=swap",
  },
  colors: {
    light: {
      bg:       "#f7f7ef",
      card:     "#ffffff",
      text:     "#2a2833",
      dim:      "#7a7680",
      muted:    "#e2ddd5",
      accent:   "#6B5A24",
      accent2:  "#F5A800",
      accent3:  "#B394A7",
      accent4:  "#00BED6",
      accent5:  "#AAAC24",
      danger:   "#b85454",
      success:  "#5a8a52",
      warn:     "#c4a862",
      shadow:   "0 1px 3px rgba(42,40,51,0.06),0 4px 12px rgba(42,40,51,0.04)",
      shadowLg: "0 4px 20px rgba(42,40,51,0.1)",
    },
    dark: {
      bg:       "#17151d",
      card:     "#23202b",
      text:     "#e8e5ed",
      dim:      "#9a95a5",
      muted:    "#3a3545",
      accent:   "#9A8440",
      accent2:  "#FFB92E",
      accent3:  "#CBAFBF",
      accent4:  "#33D4E8",
      accent5:  "#C4C63E",
      danger:   "#d87272",
      success:  "#7ab374",
      warn:     "#d4b876",
      shadow:   "0 1px 3px rgba(0,0,0,0.4),0 4px 12px rgba(0,0,0,0.3)",
      shadowLg: "0 4px 20px rgba(0,0,0,0.5)",
    },
  },
};

// ═══════ GENERATED CSS ═══════
// Built from tokens above — don't edit this string directly.

function buildVars(palette) {
  return Object.entries(palette).map(([k, v]) => {
    const prop = k === "shadowLg" ? "shadow-lg" : k;
    return `--${prop}:${v}`;
  }).join(";");
}

const { fonts, colors } = tokens;

export const globalCSS = `@import url('${fonts.googleImport}');:root{${buildVars(colors.light)};--mono:${fonts.mono};--body:${fonts.body};--display:${fonts.display};}[data-theme="dark"]{${buildVars(colors.dark)};}html,body{background:var(--bg);}*{box-sizing:border-box;margin:0;}input,select,textarea{font-family:var(--body);}@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}@keyframes pulse{0%,100%{transform:scale(1);opacity:0.4;}50%{transform:scale(1.2);opacity:1;}}@keyframes spin{to{transform:rotate(360deg);}}.fade-up{animation:fadeUp 0.35s ease both;}.card:hover{box-shadow:var(--shadow-lg);}input[type=range]{accent-color:var(--accent);}`;

// ═══════ STYLE CONSTANTS ═══════

export const S = {
  app:          { fontFamily: "var(--body)", background: "var(--bg)", color: "var(--text)", minHeight: "100vh", maxWidth: 640, margin: "0 auto", padding: "0 16px 40px" },
  loading:      { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" },
  spinner:      { width: 28, height: 28, border: "3px solid var(--muted)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0 6px" },
  logo:         { fontFamily: "var(--display)", fontSize: 24, fontWeight: 700, color: "var(--text)", letterSpacing: -0.5 },
  subtitle:     { fontSize: 14, color: "var(--dim)", marginTop: 1 },
  streakBadge:  { fontSize: 14, fontFamily: "var(--mono)", background: "rgba(107,90,36,0.1)", color: "var(--accent2)", padding: "3px 9px", borderRadius: 16, fontWeight: 600 },
  iconBtn:      { width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" },
  nav:          { display: "flex", gap: 3, overflowX: "auto", padding: "10px 0", borderBottom: "1px solid var(--muted)" },
  tab:          { fontSize: 13, fontFamily: "var(--body)", padding: "6px 10px", borderRadius: 16, border: "none", background: "none", color: "var(--dim)", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500, transition: "all 0.2s" },
  tabActive:    { background: "var(--accent)", color: "#fff" },
  content:      { paddingTop: 16 },
  card:         { background: "var(--card)", borderRadius: 12, padding: 18, boxShadow: "var(--shadow)", transition: "box-shadow 0.2s" },
  h2:           { fontFamily: "var(--display)", fontSize: 21, fontWeight: 500 },
  h3:           { fontFamily: "var(--body)", fontSize: 15, fontWeight: 600 },
  formGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label:        { display: "flex", flexDirection: "column", gap: 3, fontSize: 14, fontWeight: 500, color: "var(--dim)" },
  input:        { padding: "9px 14px", borderRadius: 8, border: "1.5px solid var(--muted)", fontSize: 14, background: "var(--bg)", color: "var(--text)", outline: "none", width: "100%", transition: "border 0.2s" },
  primaryBtn:   { padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontFamily: "var(--body)", fontWeight: 600, fontSize: 15, cursor: "pointer" },
  secondaryBtn: { padding: "10px 20px", borderRadius: 8, border: "1.5px solid var(--muted)", background: "none", color: "var(--text)", fontFamily: "var(--body)", fontWeight: 500, fontSize: 15, cursor: "pointer" },
  smallBtn:     { padding: "6px 14px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#fff", fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  chip:         { padding: "7px 14px", borderRadius: 16, border: "1.5px solid var(--muted)", background: "var(--card)", fontFamily: "var(--body)", fontSize: 14, cursor: "pointer", transition: "all 0.2s", color: "var(--text)" },
  chipActive:   { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" },
  footer:       { marginTop: 28, padding: "14px 0", borderTop: "1px solid var(--muted)", fontSize: 16, color: "var(--dim)", textAlign: "center", lineHeight: 1.5 },
};
