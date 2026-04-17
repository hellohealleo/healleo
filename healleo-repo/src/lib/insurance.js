// Insurance plan scoring — cross-references CMS plan data against Healleo user data.
// This is the "secret sauce": no other insurance finder has this context.

const CMS_PROXY = import.meta.env.VITE_CMS_PROXY_URL || "";
const PROXY_SECRET = import.meta.env.VITE_HEALLEO_PROXY_SECRET || "";

async function cmsCall(path, body) {
  const res = await fetch(`${CMS_PROXY}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-healleo-token": PROXY_SECRET },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `CMS proxy returned ${res.status}`);
  }
  return res.json();
}

export async function searchPlans({ zip, income, householdSize, profile }) {
  const household = [];
  const primaryAge = parseInt(profile.age) || 30;
  const primaryGender = profile.sex === "female" ? "female" : "male";
  household.push({ age: primaryAge, gender: primaryGender, uses_tobacco: false });
  for (let i = 1; i < (householdSize || 1); i++) {
    household.push({ age: 30, gender: "male", uses_tobacco: false });
  }
  return cmsCall("/plans/search", { zip, income: Number(income), household });
}

export async function checkDrugCoverage(planIds, medications) {
  const drugNames = medications
    .filter(m => m.active !== false)
    .map(m => m.name.split(" ")[0])
    .slice(0, 20);
  if (!drugNames.length || !planIds.length) return { drugs: [], coverage: {} };
  return cmsCall("/drugs/check", { plan_ids: planIds, drug_names: drugNames });
}

export async function checkProviderNetwork(planIds, savedDoctors) {
  const npis = savedDoctors
    .map(d => d.npi || d.number)
    .filter(Boolean)
    .slice(0, 10);
  if (!npis.length || !planIds.length) return {};
  return cmsCall("/providers/check", { plan_ids: planIds, npis });
}

export async function getPlanDetails(planId) {
  return cmsCall("/plans/details", { plan_id: planId });
}

// ─── Scoring engine: rank plans by fit to THIS user ───

export function scorePlans(plans, drugCoverage, providerCoverage, userContext) {
  const { medications, savedDoctors, conditions, labResults, symptomSessions, logs } = userContext;

  const activeMeds = (medications || []).filter(m => m.active !== false);
  const medCount = activeMeds.length;
  const doctorNpis = (savedDoctors || []).map(d => d.npi || d.number).filter(Boolean);
  const conditionCount = (conditions || []).filter(c => c !== "None").length;

  // Estimate utilization from history
  const labsPerYear = estimateLabFrequency(labResults);
  const visitsPerYear = estimateVisitFrequency(symptomSessions, logs);
  const isHighUtilization = conditionCount >= 2 || medCount >= 4 || visitsPerYear >= 8;

  return plans.map(plan => {
    let score = 50;
    const reasons = [];

    // Premium affordability (lower is better, but weigh against coverage)
    const monthlyPremium = plan.premium_w_credit ?? plan.premium ?? 0;

    // Drug coverage scoring
    const drugScore = scoreDrugCoverage(plan.plan_id, drugCoverage, activeMeds);
    score += drugScore.points;
    if (drugScore.covered > 0) reasons.push(`${drugScore.covered}/${drugScore.total} meds covered`);
    if (drugScore.notCovered > 0) reasons.push(`${drugScore.notCovered} meds NOT covered`);

    // Provider network scoring
    const providerScore = scoreProviderNetwork(plan.plan_id, providerCoverage, doctorNpis);
    score += providerScore.points;
    if (providerScore.inNetwork > 0) reasons.push(`${providerScore.inNetwork}/${providerScore.total} doctors in-network`);
    if (providerScore.outOfNetwork > 0) reasons.push(`${providerScore.outOfNetwork} doctors out-of-network`);

    // Metal level fit based on utilization
    const metalScore = scoreMetalFit(plan.metal_level, isHighUtilization, monthlyPremium);
    score += metalScore.points;
    if (metalScore.reason) reasons.push(metalScore.reason);

    // Deductible scoring (lower deductible better for high utilization)
    const deductible = extractDeductible(plan);
    if (isHighUtilization && deductible > 5000) {
      score -= 10;
      reasons.push("High deductible may cost more with your utilization");
    } else if (!isHighUtilization && deductible < 2000 && monthlyPremium > 400) {
      score -= 5;
      reasons.push("Low deductible but high premium may not be worth it for light usage");
    }

    // HSA eligible bonus for healthy users
    if (plan.hsa_eligible && !isHighUtilization) {
      score += 5;
      reasons.push("HSA-eligible (tax advantage)");
    }

    // Quality rating bonus
    if (plan.quality_rating?.global_rating >= 4) {
      score += 5;
      reasons.push(`${plan.quality_rating.global_rating}-star quality rating`);
    }

    return {
      ...plan,
      score: Math.max(0, Math.min(100, score)),
      monthly_premium: monthlyPremium,
      annual_estimated_cost: estimateAnnualCost(plan, isHighUtilization, medCount),
      deductible,
      reasons,
      drug_coverage: drugScore,
      provider_coverage: providerScore,
      utilization_level: isHighUtilization ? "high" : "low",
    };
  }).sort((a, b) => b.score - a.score);
}

function scoreDrugCoverage(planId, drugCoverage, activeMeds) {
  if (!drugCoverage?.coverage || !activeMeds.length) {
    return { points: 0, covered: 0, notCovered: 0, total: activeMeds.length };
  }

  let covered = 0;
  let notCovered = 0;
  const coverageByPlan = drugCoverage.coverage?.[planId] || drugCoverage.coverage;

  // CMS API returns varying formats; normalize
  const drugs = drugCoverage.drugs || [];
  drugs.forEach(drug => {
    const isCovered = checkDrugInPlan(drug.rxcui, planId, drugCoverage.coverage);
    if (isCovered) covered++;
    else notCovered++;
  });

  const total = drugs.length || activeMeds.length;
  const coverageRate = total > 0 ? covered / total : 0;
  const points = Math.round(coverageRate * 20) - (notCovered * 5);

  return { points, covered, notCovered, total };
}

function checkDrugInPlan(rxcui, planId, coverage) {
  if (!coverage) return false;
  // Handle both array and object response formats
  if (Array.isArray(coverage)) {
    return coverage.some(c => c.rxcui === rxcui && c.planid === planId && c.covered);
  }
  if (coverage.drugs) {
    return coverage.drugs.some(d => d.rxcui === rxcui && d.plans?.some(p => p.planid === planId && p.covered));
  }
  return false;
}

function scoreProviderNetwork(planId, providerCoverage, doctorNpis) {
  if (!providerCoverage || !doctorNpis.length) {
    return { points: 0, inNetwork: 0, outOfNetwork: 0, total: doctorNpis.length };
  }

  let inNetwork = 0;
  let outOfNetwork = 0;

  const providers = providerCoverage.providers || providerCoverage;
  if (Array.isArray(providers)) {
    providers.forEach(p => {
      if (doctorNpis.includes(String(p.npi))) {
        const planCov = p.plans?.find(pl => pl.planid === planId);
        if (planCov?.covered) inNetwork++;
        else outOfNetwork++;
      }
    });
  }

  const total = doctorNpis.length;
  const networkRate = total > 0 ? inNetwork / total : 0;
  const points = Math.round(networkRate * 15) - (outOfNetwork * 8);

  return { points, inNetwork, outOfNetwork, total };
}

function scoreMetalFit(metalLevel, isHighUtilization, premium) {
  const level = (metalLevel || "").toLowerCase();
  if (isHighUtilization) {
    if (level === "gold" || level === "platinum") return { points: 10, reason: "Gold/Platinum suits your utilization pattern" };
    if (level === "silver") return { points: 5, reason: "Silver with CSR could work for your needs" };
    if (level === "bronze") return { points: -5, reason: "Bronze may cost more overall with your conditions" };
  } else {
    if (level === "bronze" || level === "silver") return { points: 5, reason: "Lower tier fits your light utilization" };
    if (level === "catastrophic") return { points: 3, reason: null };
    if (level === "gold" || level === "platinum") return { points: -3, reason: "Higher tier may be more than you need" };
  }
  return { points: 0, reason: null };
}

function extractDeductible(plan) {
  if (!plan.deductibles?.length) return 0;
  const individual = plan.deductibles.find(d =>
    d.type === "Medical EHB Deductible" && d.network_tier === "In-Network" && d.family_cost === "Individual"
  );
  return individual?.amount ?? plan.deductibles[0]?.amount ?? 0;
}

function estimateAnnualCost(plan, isHighUtilization, medCount) {
  const premium = (plan.premium_w_credit ?? plan.premium ?? 0) * 12;
  const deductible = extractDeductible(plan);
  const estimatedOOP = isHighUtilization
    ? Math.min(deductible * 0.8, 4000) + (medCount * 30 * 12)
    : Math.min(deductible * 0.2, 800) + (medCount * 15 * 12);
  return Math.round(premium + estimatedOOP);
}

function estimateLabFrequency(labResults) {
  if (!labResults?.length) return 0;
  const dates = labResults.map(l => new Date(l.date).getTime()).sort();
  if (dates.length < 2) return dates.length;
  const spanDays = (dates[dates.length - 1] - dates[0]) / 86400000;
  if (spanDays < 30) return dates.length;
  return Math.round((dates.length / spanDays) * 365);
}

function estimateVisitFrequency(symptomSessions, logs) {
  const symptomCount = symptomSessions?.length || 0;
  const daysLogged = logs?.filter(l => l.notes || l.exercise.length > 0).length || 0;
  return Math.max(symptomCount * 2, Math.round(daysLogged / 30));
}
