import { useState, useEffect, useRef } from "react";
import { DRUG_DATABASE } from "../lib/drugs.js";
import { S } from "../styles/theme.js";

export function Medications({state, update}) {
  const [input, setInput] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [suggestions, setSuggestions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  const searchTimeout = useRef(null);

  const meds = state.medications || [];
  const activeMeds = meds.filter(m => m.active !== false);
  const discontinuedMeds = meds.filter(m => m.active === false);

  // Migrate legacy string medications on first render
  useEffect(() => {
    if (state.profile?.medications && typeof state.profile.medications === "string" && state.profile.medications.trim() && (!state.medications || state.medications.length === 0)) {
      const legacy = state.profile.medications.split(",").map(s => s.trim()).filter(Boolean);
      if (legacy.length > 0) {
        update(s => {
          s.medications = legacy.map(m => {
            const match = m.match(/^(.+?)\s+([\d.]+\s*(?:mg|mcg|g|ml|IU|units?))/i);
            return {
              id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
              name: match ? match[1].trim() : m,
              dose: match ? match[2].trim() : "",
              frequency: "Daily",
              startDate: "",
              prescriber: "",
              notes: "",
              active: true,
              addedAt: new Date().toISOString()
            };
          });
        });
      }
    }
  }, []);

  // Autocomplete via NLM RxTerms API
  const searchDrugs = (query) => {
    if (query.length < 2) { setSuggestions([]); return; }
    const q = query.toLowerCase();
    const results = DRUG_DATABASE.filter(d => 
      d.name.toLowerCase().startsWith(q) || 
      d.generic?.toLowerCase().startsWith(q) ||
      d.name.toLowerCase().includes(q)
    ).slice(0, 8).map(d => ({
      name: d.name,
      strengths: d.strengths || [],
      generic: d.generic
    }));
    setSuggestions(results);
  };

  const handleInputChange = (val) => {
    setInput(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchDrugs(val), 100);
  };

  const selectSuggestion = (name, strength) => {
    setInput(name);
    if (strength) {
      const doseMatch = strength.match(/^([\d.]+\s*(?:mg|mcg|g|ml|IU|mEq|units?)\/?[\w]*)/i);
      if (doseMatch) setDose(doseMatch[1]);
    }
    setSuggestions([]);
  };

  const addMed = () => {
    if (!input.trim()) return;
    const med = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      name: input.trim(),
      dose: dose.trim(),
      frequency,
      startDate: new Date().toISOString().slice(0, 10),
      prescriber: "",
      notes: "",
      active: true,
      addedAt: new Date().toISOString()
    };
    update(s => {
      s.medications = [...(s.medications || []), med];
      // Sync to profile.medications string for backward compat
      s.profile.medications = [...(s.medications || []), med].filter(m => m.active !== false).map(m => `${m.name}${m.dose ? " " + m.dose : ""}`).join(", ");
    });
    setInput(""); setDose(""); setFrequency("Daily"); setSuggestions([]);
  };

  const removeMed = (id) => {
    update(s => {
      s.medications = (s.medications || []).filter(m => m.id !== id);
      s.profile.medications = s.medications.filter(m => m.active !== false).map(m => `${m.name}${m.dose ? " " + m.dose : ""}`).join(", ");
    });
  };

  const discontinueMed = (id) => {
    update(s => {
      s.medications = (s.medications || []).map(m => m.id === id ? { ...m, active: false, discontinuedAt: new Date().toISOString() } : m);
      s.profile.medications = s.medications.filter(m => m.active !== false).map(m => `${m.name}${m.dose ? " " + m.dose : ""}`).join(", ");
      // Add to timeline
      const med = s.medications.find(m => m.id === id);
      if (med) {
        s.healthTimeline = [...(s.healthTimeline || []), {
          date: new Date().toISOString().slice(0, 10),
          type: "medication",
          title: `Discontinued: ${med.name}`,
          notes: `${med.dose || ""} ${med.frequency || ""}`.trim()
        }];
      }
    });
  };

  const reactivateMed = (id) => {
    update(s => {
      s.medications = (s.medications || []).map(m => m.id === id ? { ...m, active: true, discontinuedAt: undefined } : m);
      s.profile.medications = s.medications.filter(m => m.active !== false).map(m => `${m.name}${m.dose ? " " + m.dose : ""}`).join(", ");
    });
  };

  const updateMed = (id, field, value) => {
    update(s => {
      s.medications = (s.medications || []).map(m => m.id === id ? { ...m, [field]: value } : m);
      s.profile.medications = s.medications.filter(m => m.active !== false).map(m => `${m.name}${m.dose ? " " + m.dose : ""}`).join(", ");
    });
    if (field === "name" || field === "dose") setEditing(null);
  };

  const FREQUENCIES = ["As needed", "Daily", "Twice daily", "Three times daily", "Every morning", "Every evening", "Every other day", "Weekly", "Monthly"];

  return (
    <div className="fade-up">
      <h2 style={S.h2}>💊 Medications</h2>
      <p style={{ fontSize: 14, color: "var(--dim)", marginTop: 2 }}>
        {activeMeds.length} active medication{activeMeds.length !== 1 ? "s" : ""}
        {discontinuedMeds.length > 0 && ` · ${discontinuedMeds.length} discontinued`}
      </p>

      {/* Add medication */}
      <div style={{ ...S.card, marginTop: 14, padding: 16, borderLeft: "3px solid var(--accent)" }}>
        <h3 style={S.h3}>Add Medication</h3>
        <div style={{ position: "relative", marginTop: 8 }}>
          <input value={input} onChange={e => handleInputChange(e.target.value)}
            placeholder="Start typing medication name..."
            style={S.input}
            onKeyDown={e => { if (e.key === "Enter" && input.trim() && suggestions.length === 0) addMed(); }}
          />

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--card)", border: "1px solid var(--muted)", borderRadius: 8, boxShadow: "var(--shadow-lg)", zIndex: 100, maxHeight: 260, overflow: "auto", marginTop: 2 }}>
              {suggestions.map((s, i) => (
                <div key={i}>
                  <button onClick={() => selectSuggestion(s.name)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", borderBottom: "1px solid var(--muted)", cursor: "pointer", fontFamily: "var(--body)", fontSize: 14, fontWeight: 600, color: "var(--text)" }}
                    onMouseEnter={e => e.target.style.background = "var(--bg)"} onMouseLeave={e => e.target.style.background = "none"}>
                    {s.name}{s.generic ? <span style={{fontWeight:400,color:"var(--dim)",marginLeft:6,fontSize:12}}>({s.generic})</span> : null}
                  </button>
                  {s.strengths?.slice(0, 5).map((str, j) => (
                    <button key={j} onClick={() => selectSuggestion(s.name, str)}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 14px 6px 28px", background: "none", border: "none", borderBottom: "1px solid var(--muted)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)" }}
                      onMouseEnter={e => e.target.style.background = "var(--bg)"} onMouseLeave={e => e.target.style.background = "none"}>
                      {str}
                    </button>
                  ))}
                </div>
              ))}
              <button onClick={() => setSuggestions([])} style={{ width: "100%", padding: "6px", background: "var(--bg)", border: "none", fontSize: 12, color: "var(--dim)", cursor: "pointer" }}>✕ Close</button>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <input value={dose} onChange={e => setDose(e.target.value)} placeholder="Dose (e.g. 500mg)" style={S.input} onKeyDown={e => { if (e.key === "Enter") addMed(); }} />
          <select value={frequency} onChange={e => setFrequency(e.target.value)} style={S.input}>
            {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <button onClick={addMed} disabled={!input.trim()} style={{ ...S.primaryBtn, width: "100%", marginTop: 10, opacity: input.trim() ? 1 : 0.5 }}>
          Add Medication
        </button>

        <p style={{ fontSize: 12, color: "var(--dim)", marginTop: 8, lineHeight: 1.5 }}>
          💡 Start typing — autocomplete covers 100+ common medications by brand or generic name with available strengths. You can also type any medication not in the list.
        </p>
      </div>

      {/* Active medications */}
      {activeMeds.length > 0 && (
        <div style={{ ...S.card, marginTop: 12, padding: 16 }}>
          <h3 style={S.h3}>Active Medications</h3>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {activeMeds.map(med => (
              <div key={med.id} style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: 10, borderLeft: "3px solid var(--accent)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{med.name}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                      {med.dose && <span style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--accent)", background: "rgba(107,90,36,0.1)", padding: "2px 8px", borderRadius: 6 }}>{med.dose}</span>}
                      <span style={{ fontSize: 13, color: "var(--dim)" }}>{med.frequency}</span>
                    </div>
                    {med.startDate && <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 4 }}>Started: {med.startDate}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => setEditing(editing === med.id ? null : med.id)} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--text)", fontSize: 12, padding: "4px 8px" }}>✏️</button>
                    <button onClick={() => discontinueMed(med.id)} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--accent4)", fontSize: 12, padding: "4px 8px" }}>Stop</button>
                  </div>
                </div>

                {/* Edit panel */}
                {editing === med.id && (
                  <div style={{ marginTop: 10, padding: 10, background: "var(--card)", borderRadius: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      <label style={{ ...S.label, fontSize: 12 }}>Dose <input value={med.dose} onChange={e => updateMed(med.id, "dose", e.target.value)} style={{ ...S.input, fontSize: 13 }} /></label>
                      <label style={{ ...S.label, fontSize: 12 }}>Frequency <select value={med.frequency} onChange={e => updateMed(med.id, "frequency", e.target.value)} style={{ ...S.input, fontSize: 13 }}>{FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}</select></label>
                      <label style={{ ...S.label, fontSize: 12 }}>Prescriber <input value={med.prescriber || ""} onChange={e => updateMed(med.id, "prescriber", e.target.value)} placeholder="Dr. name" style={{ ...S.input, fontSize: 13 }} /></label>
                      <label style={{ ...S.label, fontSize: 12 }}>Start date <input type="date" value={med.startDate || ""} onChange={e => updateMed(med.id, "startDate", e.target.value)} style={{ ...S.input, fontSize: 13 }} /></label>
                    </div>
                    <label style={{ ...S.label, fontSize: 12, marginTop: 6 }}>Notes <input value={med.notes || ""} onChange={e => updateMed(med.id, "notes", e.target.value)} placeholder="e.g. Take with food" style={{ ...S.input, fontSize: 13 }} /></label>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button onClick={() => setEditing(null)} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--text)" }}>Done</button>
                      <button onClick={() => { removeMed(med.id); setEditing(null); }} style={{ ...S.smallBtn, background: "none", color: "var(--danger)", fontSize: 12 }}>Delete permanently</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeMeds.length === 0 && (
        <div style={{ ...S.card, marginTop: 12, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💊</div>
          <p style={{ fontSize: 14, color: "var(--dim)" }}>No medications added yet. Your meds inform every AI response — drug interactions, side effects, dietary considerations, and exercise limitations are all factored in.</p>
        </div>
      )}

      {/* Discontinued */}
      {discontinuedMeds.length > 0 && (
        <div style={{ ...S.card, marginTop: 12, padding: 16 }}>
          <button onClick={() => setShowDiscontinued(!showDiscontinued)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", fontFamily: "var(--body)" }}>
            <h3 style={S.h3}>Discontinued ({discontinuedMeds.length})</h3>
            <span style={{ color: "var(--dim)", fontSize: 14 }}>{showDiscontinued ? "▾" : "▸"}</span>
          </button>
          {showDiscontinued && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {discontinuedMeds.map(med => (
                <div key={med.id} style={{ padding: "10px 12px", background: "var(--bg)", borderRadius: 8, opacity: 0.7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 14, textDecoration: "line-through", color: "var(--dim)" }}>{med.name}</span>
                      {med.dose && <span style={{ fontSize: 13, color: "var(--dim)", marginLeft: 6 }}>{med.dose}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => reactivateMed(med.id)} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--accent)", fontSize: 12, padding: "3px 8px" }}>Restart</button>
                      <button onClick={() => removeMed(med.id)} style={{ ...S.smallBtn, background: "none", color: "var(--danger)", fontSize: 12, padding: "3px 8px" }}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* How meds are used */}
      <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(107,90,36,0.07)", borderRadius: 8 }}>
        <p style={{ fontSize: 13, color: "var(--dim)", lineHeight: 1.6 }}>
          Your medications are shared with your entire Healleo team. Dr. Healleo checks drug interactions and side effects. Your nutritionist accounts for nutrient depletion (e.g. metformin + B12). Your trainer adjusts for meds that affect heart rate or cause fatigue. Your therapist considers mood-altering side effects.
        </p>
      </div>
    </div>
  );
}
