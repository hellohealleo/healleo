import { useState } from "react";
import { S } from "../styles/theme.js";
import { today } from "../lib/state.js";
import { RenderMD } from "./ui/RenderMD.jsx";
import { searchPlans, checkDrugCoverage, checkProviderNetwork, scorePlans } from "../lib/insurance.js";

const METAL_COLORS = { Catastrophic: "var(--dim)", Bronze: "#cd7f32", Silver: "#a0a0a0", Gold: "#d4a017", Platinum: "var(--accent3)" };

export function InsuranceFinder({ state, update }) {
  const [zip, setZip] = useState(state.profile.insuranceZip || "");
  const [income, setIncome] = useState(state.profile.householdIncome || "");
  const [householdSize, setHouseholdSize] = useState(state.profile.householdSize || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const medications = state.medications || [];
  const savedDoctors = state.savedDoctors || [];
  const activeMeds = medications.filter(m => m.active !== false);

  const handleSearch = async () => {
    if (!zip || !income) { setError("Please enter your ZIP code and household income"); return; }
    if (!/^\d{5}$/.test(zip)) { setError("Please enter a valid 5-digit ZIP code"); return; }

    setError(""); setLoading(true); setResults(null); setAiExplanation(null);

    try {
      // Save inputs to profile
      update(s => {
        s.profile.insuranceZip = zip;
        s.profile.householdIncome = income;
        s.profile.householdSize = householdSize;
      });

      // Step 1: Get plans
      const planData = await searchPlans({ zip, income, householdSize, profile: state.profile });
      if (!planData.plans?.length) { setError("No plans found for your area. Check your ZIP code."); setLoading(false); return; }

      // Step 2: Check drug coverage + provider networks (parallel)
      const topPlanIds = planData.plans.slice(0, 10).map(p => p.plan_id);
      const [drugData, providerData] = await Promise.all([
        activeMeds.length > 0 ? checkDrugCoverage(topPlanIds, activeMeds) : { drugs: [], coverage: {} },
        savedDoctors.length > 0 ? checkProviderNetwork(topPlanIds, savedDoctors) : {},
      ]);

      // Step 3: Score plans against user data
      const scored = scorePlans(planData.plans, drugData, providerData, {
        medications: activeMeds,
        savedDoctors,
        conditions: state.profile.conditions || [],
        labResults: state.labResults || [],
        symptomSessions: state.symptomSessions || [],
        logs: state.logs || [],
      });

      setResults({ plans: scored, county: planData.county, year: planData.year, aptc: planData.aptc });
    } catch (err) {
      setError(err.message || "Failed to search plans. Please try again.");
    }
    setLoading(false);
  };

  const explainWithAI = async () => {
    if (!results?.plans?.length) return;
    setExplaining(true);
    const top5 = results.plans.slice(0, 5);
    const planSummary = top5.map((p, i) => (
      `${i + 1}. ${p.name} (${p.metal_level}) — $${p.monthly_premium}/mo, deductible $${p.deductible}, score ${p.score}/100. Reasons: ${p.reasons.join("; ")}`
    )).join("\n");

    const profileContext = `Patient: ${state.profile.name || "User"}, age ${state.profile.age || "?"}, ${(state.profile.conditions || []).filter(c => c !== "None").join(", ") || "no conditions"}. ${activeMeds.length} active meds: ${activeMeds.map(m => m.name).join(", ") || "none"}. ${savedDoctors.length} saved doctors.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: `You are a health insurance advisor helping someone pick the right ACA marketplace plan. Be direct, specific, and conversational. No corporate language.

${profileContext}

Here are the top ${top5.length} plans ranked by fit for this person:
${planSummary}

Explain in plain English:
1. Which plan is best for THIS person and why (reference their specific meds, doctors, conditions)
2. The key trade-off between the top 2 options
3. One thing they should watch out for

Keep it under 200 words. Use contractions. Talk like a knowledgeable friend.` }],
        }),
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      setAiExplanation(text);
    } catch {
      setAiExplanation("Couldn't generate AI explanation. Review the plan scores and reasons above.");
    }
    setExplaining(false);
  };

  // ─── Plan detail view ───
  if (selectedPlan) {
    const plan = selectedPlan;
    return (
      <div className="fade-up">
        <button onClick={() => setSelectedPlan(null)} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--text)", marginBottom: 12 }}>← Back to Results</button>
        <h2 style={S.h2}>{plan.name}</h2>
        <div style={{ fontSize: 14, color: "var(--dim)", marginTop: 2 }}>{plan.issuer_name} · {plan.metal_level} · {plan.type}</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          <div style={{ ...S.card, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--mono)" }}>${plan.monthly_premium}<span style={{ fontSize: 14, fontWeight: 400 }}>/mo</span></div>
            <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 2 }}>Monthly premium</div>
          </div>
          <div style={{ ...S.card, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", fontFamily: "var(--mono)" }}>${plan.deductible}</div>
            <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 2 }}>Deductible</div>
          </div>
          <div style={{ ...S.card, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent3)", fontFamily: "var(--mono)" }}>${plan.annual_estimated_cost?.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 2 }}>Est. annual cost</div>
          </div>
          <div style={{ ...S.card, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: plan.score >= 70 ? "var(--success)" : plan.score >= 40 ? "var(--accent)" : "var(--danger)", fontFamily: "var(--mono)" }}>{plan.score}</div>
            <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 2 }}>Fit score /100</div>
          </div>
        </div>

        {plan.drug_coverage?.total > 0 && (
          <div style={{ ...S.card, marginTop: 10, padding: 14 }}>
            <h3 style={S.h3}>Drug Coverage</h3>
            <div style={{ fontSize: 14, color: "var(--dim)", marginTop: 6 }}>
              <span style={{ color: "var(--success)", fontWeight: 600 }}>{plan.drug_coverage.covered} covered</span>
              {plan.drug_coverage.notCovered > 0 && <span style={{ color: "var(--danger)", fontWeight: 600, marginLeft: 12 }}>{plan.drug_coverage.notCovered} not covered</span>}
              <span style={{ marginLeft: 8 }}>out of {plan.drug_coverage.total} medications</span>
            </div>
          </div>
        )}

        {plan.provider_coverage?.total > 0 && (
          <div style={{ ...S.card, marginTop: 10, padding: 14 }}>
            <h3 style={S.h3}>Your Doctors</h3>
            <div style={{ fontSize: 14, color: "var(--dim)", marginTop: 6 }}>
              <span style={{ color: "var(--success)", fontWeight: 600 }}>{plan.provider_coverage.inNetwork} in-network</span>
              {plan.provider_coverage.outOfNetwork > 0 && <span style={{ color: "var(--danger)", fontWeight: 600, marginLeft: 12 }}>{plan.provider_coverage.outOfNetwork} out-of-network</span>}
            </div>
          </div>
        )}

        {plan.reasons.length > 0 && (
          <div style={{ ...S.card, marginTop: 10, padding: 14 }}>
            <h3 style={S.h3}>Why This Plan</h3>
            <div style={{ marginTop: 6 }}>{plan.reasons.map((r, i) => (
              <div key={i} style={{ fontSize: 14, color: "var(--dim)", padding: "3px 0" }}>· {r}</div>
            ))}</div>
          </div>
        )}

        <a href={`https://www.healthcare.gov/see-plans/#/plan/results/${plan.plan_id}`} target="_blank" rel="noopener noreferrer" style={{ ...S.primaryBtn, display: "block", textAlign: "center", marginTop: 14, textDecoration: "none", fontSize: 16 }}>
          View on HealthCare.gov →
        </a>
        <p style={{ fontSize: 12, color: "var(--dim)", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
          Estimates only. Final rates and coverage details available on HealthCare.gov during enrollment.
        </p>
      </div>
    );
  }

  // ─── Main view ───
  return (
    <div className="fade-up">
      <h2 style={S.h2}>Health Insurance Finder</h2>
      <p style={{ fontSize: 14, color: "var(--dim)", marginTop: 4, lineHeight: 1.5 }}>
        Find ACA marketplace plans ranked for you based on your medications, doctors, conditions, and health patterns.
      </p>

      {/* Input form */}
      <div style={{ ...S.card, marginTop: 14, padding: 16 }}>
        <div style={S.formGrid}>
          <label style={S.label}>ZIP Code<input style={S.input} value={zip} onChange={e => setZip(e.target.value)} placeholder="e.g. 90210" maxLength={5} onKeyDown={e => e.key === "Enter" && handleSearch()} /></label>
          <label style={S.label}>Household Income ($)<input style={S.input} type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="e.g. 52000" onKeyDown={e => e.key === "Enter" && handleSearch()} /></label>
          <label style={S.label}>Household Size<input style={S.input} type="number" min={1} max={10} value={householdSize} onChange={e => setHouseholdSize(parseInt(e.target.value) || 1)} /></label>
        </div>

        {/* Context badges */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          {activeMeds.length > 0 && <span style={{ fontSize: 13, padding: "3px 8px", background: "rgba(107,90,36,0.1)", borderRadius: 10, color: "var(--accent)" }}>💊 {activeMeds.length} meds will be checked</span>}
          {savedDoctors.length > 0 && <span style={{ fontSize: 13, padding: "3px 8px", background: "rgba(179,148,167,0.1)", borderRadius: 10, color: "var(--accent3)" }}>👨‍⚕️ {savedDoctors.length} doctors will be checked</span>}
          {(state.profile.conditions || []).filter(c => c !== "None").length > 0 && <span style={{ fontSize: 13, padding: "3px 8px", background: "rgba(245,168,0,0.1)", borderRadius: 10, color: "var(--accent2)" }}>{(state.profile.conditions || []).filter(c => c !== "None").length} conditions factored in</span>}
        </div>

        {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginTop: 12, fontSize: 14, color: "#8b3a3a" }}>{error}</div>}

        <button onClick={handleSearch} disabled={loading} style={{ ...S.primaryBtn, width: "100%", marginTop: 14, padding: "12px 18px", fontSize: 16, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Searching plans..." : "Find My Best Plans"}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={S.h3}>{results.plans.length} Plans Found</h3>
              <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 2 }}>{results.county.name}, {results.county.state} · {results.year} plans</div>
            </div>
            <button onClick={explainWithAI} disabled={explaining} style={{ ...S.smallBtn, background: "var(--accent3)", fontSize: 13, opacity: explaining ? 0.6 : 1 }}>
              {explaining ? "Thinking..." : "AI Explain"}
            </button>
          </div>

          {aiExplanation && (
            <div style={{ ...S.card, marginTop: 10, padding: 14, borderLeft: "3px solid var(--accent3)" }}>
              <RenderMD text={aiExplanation} />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {results.plans.slice(0, 10).map((plan, i) => (
              <button key={plan.plan_id} onClick={() => setSelectedPlan(plan)} style={{ ...S.card, padding: 14, border: "none", cursor: "pointer", textAlign: "left", width: "100%", borderLeft: `3px solid ${METAL_COLORS[plan.metal_level] || "var(--muted)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {i === 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", textTransform: "uppercase", letterSpacing: 1 }}>Best Match</span>}
                    <div style={{ fontSize: 15, fontWeight: 600, marginTop: i === 0 ? 2 : 0 }}>{plan.name}</div>
                    <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 2 }}>{plan.issuer_name} · {plan.metal_level} · {plan.type}</div>
                    {plan.reasons.length > 0 && <div style={{ fontSize: 13, color: "var(--accent)", marginTop: 4 }}>{plan.reasons[0]}</div>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--accent)" }}>${plan.monthly_premium}<span style={{ fontSize: 12, fontWeight: 400 }}>/mo</span></div>
                    <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 2 }}>Score: {plan.score}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--bg)", borderRadius: 8, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.5 }}>
              Estimates based on your Healleo health data. Final enrollment at <a href="https://www.healthcare.gov" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent3)" }}>HealthCare.gov</a>. Healleo is not a licensed insurance broker.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
