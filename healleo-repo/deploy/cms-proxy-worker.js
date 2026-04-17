// Healleo CMS Marketplace Proxy — Cloudflare Worker
// Orchestrates multi-call CMS API flow server-side to minimize client round-trips.
//
// Setup:
//   1. Workers & Pages → Create → paste this
//   2. Settings → Variables → Add:
//      - CMS_API_KEY (from developer.cms.gov)
//      - HEALLEO_PROXY_SECRET (same value as the AI proxy)

const CMS_BASE = "https://marketplace.api.healthcare.gov/api/v1";

const ALLOWED_ORIGINS = [
  "https://healleo.com",
  "https://www.healleo.com",
  "https://staging.healleo.com",
];

function corsOrigin(request) {
  const origin = request.headers.get("Origin") || "";
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) return origin;
  return null;
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-healleo-token",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

async function cmsGet(path, apikey) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${CMS_BASE}${path}${sep}apikey=${apikey}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CMS ${path} returned ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function cmsPost(path, body, apikey) {
  const res = await fetch(`${CMS_BASE}${path}?apikey=${apikey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CMS ${path} returned ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Main orchestration: ZIP + household → enriched plan list ───
async function searchPlans(body, apikey) {
  const { zip, income, household, year } = body;
  // household: [{ age, gender, uses_tobacco }]

  if (!zip || !income || !household?.length) {
    throw new Error("Missing required fields: zip, income, household");
  }

  const planYear = year || new Date().getFullYear();

  // Step 1: ZIP → county FIPS + state
  const countyData = await cmsGet(`/counties/by/zip/${zip}`, apikey);
  const counties = countyData.counties;
  if (!counties?.length) throw new Error(`No counties found for ZIP ${zip}`);
  const county = counties[0];
  const fips = county.fips;
  const state = county.state;

  // Step 2: Search plans
  const searchBody = {
    household: {
      income: Number(income),
      people: household.map(p => ({
        age: Number(p.age),
        gender: p.gender || "male",
        uses_tobacco: p.uses_tobacco || false,
        aptc_eligible: true,
      })),
    },
    market: "Individual",
    place: { countyfips: fips, state, zipcode: zip },
    year: planYear,
  };

  const planData = await cmsPost("/plans/search", searchBody, apikey);
  const plans = planData.plans || [];

  return {
    county: { fips, state, name: county.name },
    plan_count: plans.length,
    plans: plans.slice(0, 30).map(p => ({
      plan_id: p.id,
      name: p.name,
      issuer_name: p.issuer?.name,
      metal_level: p.metal_level,
      type: p.type,
      premium: p.premium,
      premium_w_credit: p.premium_w_credit,
      deductibles: p.deductibles,
      moops: p.moops,
      ehb_premium: p.ehb_premium,
      benefits_url: p.benefits_url,
      brochure_url: p.brochure_url,
      hsa_eligible: p.hsa_eligible,
      quality_rating: p.quality_rating,
    })),
    aptc: planData.ranges?.aptc,
    year: planYear,
  };
}

// ─── Drug coverage check for a set of plans ───
async function checkDrugs(body, apikey) {
  const { plan_ids, drug_names, year } = body;
  if (!plan_ids?.length || !drug_names?.length) {
    throw new Error("Missing required fields: plan_ids, drug_names");
  }

  const planYear = year || new Date().getFullYear();

  // Resolve drug names to RxCUIs
  const rxcuis = [];
  for (const name of drug_names.slice(0, 20)) {
    try {
      const data = await cmsGet(`/drugs/autocomplete?q=${encodeURIComponent(name)}&year=${planYear}`, apikey);
      if (data.drugs?.length) {
        rxcuis.push({ name, rxcui: data.drugs[0].rxcui, resolved_name: data.drugs[0].name });
      }
    } catch {
      // Drug not found — skip
    }
  }

  if (!rxcuis.length) return { drugs: [], coverage: {} };

  // Check coverage across plans (batch up to 10 plans at a time)
  const batchPlanIds = plan_ids.slice(0, 10);
  const drugParams = rxcuis.map(d => `drugs=${d.rxcui}`).join("&");
  const planParams = batchPlanIds.map(id => `planids=${id}`).join("&");

  const coverageData = await cmsGet(
    `/drugs/covered?year=${planYear}&${drugParams}&${planParams}`,
    apikey
  );

  return {
    drugs: rxcuis,
    coverage: coverageData,
  };
}

// ─── Provider network check for a set of plans ───
async function checkProviders(body, apikey) {
  const { plan_ids, npis, year } = body;
  if (!plan_ids?.length || !npis?.length) {
    throw new Error("Missing required fields: plan_ids, npis");
  }

  const planYear = year || new Date().getFullYear();
  const batchPlanIds = plan_ids.slice(0, 10);
  const batchNpis = npis.slice(0, 10);

  const npiParams = batchNpis.map(n => `npis=${n}`).join("&");
  const planParams = batchPlanIds.map(id => `planids=${id}`).join("&");

  const providerData = await cmsGet(
    `/providers/covered?year=${planYear}&${npiParams}&${planParams}`,
    apikey
  );

  return providerData;
}

// ─── Plan details ───
async function getPlanDetails(body, apikey) {
  const { plan_id, year } = body;
  if (!plan_id) throw new Error("Missing required field: plan_id");
  const planYear = year || new Date().getFullYear();
  return await cmsGet(`/plans/${plan_id}?year=${planYear}`, apikey);
}

// ─── Worker entry point ───
export default {
  async fetch(request, env) {
    const origin = corsOrigin(request);
    if (!origin) return new Response("Forbidden", { status: 403 });

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Verify shared secret
    const token = request.headers.get("x-healleo-token");
    if (!env.HEALLEO_PROXY_SECRET || token !== env.HEALLEO_PROXY_SECRET) {
      return json({ error: "Unauthorized" }, 401, origin);
    }

    if (!env.CMS_API_KEY) {
      return json({ error: "CMS API key not configured" }, 500, origin);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, origin);
    }

    try {
      let result;
      switch (path) {
        case "/plans/search":
          result = await searchPlans(body, env.CMS_API_KEY);
          break;
        case "/drugs/check":
          result = await checkDrugs(body, env.CMS_API_KEY);
          break;
        case "/providers/check":
          result = await checkProviders(body, env.CMS_API_KEY);
          break;
        case "/plans/details":
          result = await getPlanDetails(body, env.CMS_API_KEY);
          break;
        default:
          return json({ error: "Unknown endpoint" }, 404, origin);
      }
      return json(result, 200, origin);
    } catch (err) {
      return json({ error: err.message }, 502, origin);
    }
  },
};
