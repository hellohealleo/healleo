// AI pipeline — PubMed/OpenFDA RAG + Claude call for the Doctor tab.
// Extracted from App.jsx.

import { buildPatientContext, extractMedicalTerms } from "./patientContext.js";

export async function searchPubMed(query, maxResults = 3) {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=${maxResults}&sort=relevance&term=${encodeURIComponent(query)}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const ids = searchData?.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}`;
    const fetchRes = await fetch(fetchUrl);
    const fetchData = await fetchRes.json();
    const results = [];
    for (const id of ids) {
      const article = fetchData?.result?.[id];
      if (article) {
        results.push({
          pmid: id,
          title: article.title || "",
          authors: (article.authors || []).slice(0, 3).map(a => a.name).join(", "),
          journal: article.fulljournalname || article.source || "",
          year: article.pubdate?.split(" ")[0] || "",
          doi: article.elocationid || "",
        });
      }
    }
    return results;
  } catch (e) { return []; }
}

export async function fetchPubMedAbstract(pmid) {
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`;
    const res = await fetch(url);
    const text = await res.text();
    const match = text.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/);
    return match ? match[1].replace(/<[^>]+>/g, "").slice(0, 600) : "";
  } catch { return ""; }
}

export async function searchOpenFDA(drugName, type = "label") {
  try {
    const endpoints = {
      label: `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(drugName)}"+openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=1`,
      events: `https://api.fda.gov/drug/event.json?search=patient.drug.openfda.brand_name:"${encodeURIComponent(drugName)}"+patient.drug.openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=3`,
      recalls: `https://api.fda.gov/drug/enforcement.json?search=openfda.brand_name:"${encodeURIComponent(drugName)}"+openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=2&sort=report_date:desc`,
    };
    const res = await fetch(endpoints[type]);
    if (!res.ok) return null;
    const data = await res.json();
    return data.results || null;
  } catch { return null; }
}


export async function gatherRAGContext(userMessage, state) {
  const profile = state.profile;
  const terms = extractMedicalTerms(userMessage, profile);
  const ragParts = [];
  const sources = [];

  // Run all queries in parallel for speed
  const promises = [];

  // 1. PubMed search for the main medical query
  if (terms.searchQuery) {
    promises.push(
      searchPubMed(terms.searchQuery + " treatment guidelines", 3)
        .then(async (articles) => {
          if (articles.length > 0) {
            // Fetch abstract for top result
            const topAbstract = await fetchPubMedAbstract(articles[0].pmid);
            const pubmedContext = articles.map(a =>
              `• "${a.title}" — ${a.authors} (${a.journal}, ${a.year}) [PMID: ${a.pmid}]`
            ).join("\n");
            ragParts.push(`PUBMED RESEARCH (recent relevant papers):\n${pubmedContext}${topAbstract ? `\n\nTop result abstract excerpt: ${topAbstract}` : ""}`);
            sources.push(...articles.map(a => ({ type: "pubmed", pmid: a.pmid, title: a.title, journal: a.journal, year: a.year })));
          }
        }).catch(() => {})
    );
  }

  // 2. OpenFDA drug labels for any mentioned medications
  for (const drug of terms.drugs.slice(0, 2)) {
    promises.push(
      searchOpenFDA(drug, "label")
        .then(results => {
          if (results && results[0]) {
            const label = results[0];
            const info = [];
            if (label.indications_and_usage) info.push(`Indications: ${label.indications_and_usage[0].slice(0, 300)}`);
            if (label.warnings) info.push(`Warnings: ${label.warnings[0].slice(0, 300)}`);
            if (label.adverse_reactions) info.push(`Adverse reactions: ${label.adverse_reactions[0].slice(0, 300)}`);
            if (label.drug_interactions) info.push(`Drug interactions: ${label.drug_interactions[0].slice(0, 300)}`);
            if (label.dosage_and_administration) info.push(`Dosage: ${label.dosage_and_administration[0].slice(0, 200)}`);
            if (info.length > 0) {
              ragParts.push(`FDA DRUG LABEL — ${drug.toUpperCase()}:\n${info.join("\n")}`);
              sources.push({ type: "fda_label", drug, name: label.openfda?.brand_name?.[0] || drug });
            }
          }
        }).catch(() => {})
    );

    // Also check adverse events
    promises.push(
      searchOpenFDA(drug, "events")
        .then(results => {
          if (results && results.length > 0) {
            const reactions = results.flatMap(r =>
              (r.patient?.reaction || []).map(rx => rx.reactionmeddrapt)
            ).filter(Boolean);
            const uniqueReactions = [...new Set(reactions)].slice(0, 10);
            if (uniqueReactions.length > 0) {
              ragParts.push(`FDA ADVERSE EVENTS — ${drug.toUpperCase()}: Commonly reported: ${uniqueReactions.join(", ")}`);
              sources.push({ type: "fda_events", drug });
            }
          }
        }).catch(() => {})
    );
  }

  // 3. OpenFDA drug recalls (if medications mentioned)
  if (terms.drugs.length > 0) {
    promises.push(
      searchOpenFDA(terms.drugs[0], "recalls")
        .then(results => {
          if (results && results.length > 0) {
            const recalls = results.map(r => `${r.product_description?.slice(0,100)} — ${r.reason_for_recall?.slice(0,100)} (${r.report_date})`);
            ragParts.push(`FDA RECENT RECALLS — ${terms.drugs[0].toUpperCase()}:\n${recalls.join("\n")}`);
            sources.push({ type: "fda_recall", drug: terms.drugs[0] });
          }
        }).catch(() => {})
    );
  }

  // 4. Additional PubMed search for specific conditions
  for (const condition of terms.conditions.slice(0, 2)) {
    promises.push(
      searchPubMed(condition + " 2024 clinical review", 2)
        .then(articles => {
          if (articles.length > 0) {
            const ctx = articles.map(a => `• "${a.title}" (${a.journal}, ${a.year}) [PMID: ${a.pmid}]`).join("\n");
            ragParts.push(`PUBMED — ${condition.toUpperCase()} research:\n${ctx}`);
            sources.push(...articles.map(a => ({ type: "pubmed", pmid: a.pmid, title: a.title, journal: a.journal, year: a.year })));
          }
        }).catch(() => {})
    );
  }

  // Wait for all with a timeout
  await Promise.race([
    Promise.allSettled(promises),
    new Promise(resolve => setTimeout(resolve, 6000)) // 6s max wait
  ]);

  return { context: ragParts.join("\n\n"), sources };
}

export async function askMedicalAI(messages, state, options = {}) {
  const patientContext = buildPatientContext(state);

  // Extract the user's last message for RAG
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";

  // Gather RAG context from PubMed & OpenFDA in parallel
  const ragPromise = (options.skipRAG) ? Promise.resolve({ context: "", sources: [] }) : gatherRAGContext(lastUserMsg, state);
  const rag = await ragPromise;

  const sys = `You are the patient's personal physician within the Healleo health concierge platform — part of their team alongside a nutritionist, trainer, and therapist.

PERSONALITY — THIS IS WHO YOU ARE:
- You're the doctor everyone wishes they had. Brilliant but approachable. You explain things clearly without talking down.
- Empathetic: you understand that health concerns are scary, that waiting for test results is agony, and that patients just want someone to take them seriously. You do.
- Authoritative: you know medicine. You cite PubMed, reference FDA data, and ground your answers in evidence. When you're confident, it shows. When you're not sure, you say so — that's what makes people trust you.
- Self-effacing: you don't hide behind jargon or play God. You'll say "honestly, this is a gray area" or "I'd want to rule out X before we worry about Y."
- Dry humor: sparingly. A well-timed human moment keeps the conversation from feeling clinical. You're a person, not a textbook.
- You root for this patient. You remember their history, notice patterns, and connect dots that a 15-minute office visit would miss. That's why they trust you.
- You're realistic: you don't catastrophize and you don't hand-wave. If something is concerning, you say it plainly. If something is probably fine, you say that too.
- You connect ALL the dots: labs + symptoms + medications + lifestyle + mood + nutrition + exercise. That's the whole point of Healleo — you see the full picture.

${patientContext}

${(() => {
  const doctorPlans = (state.sharedPlans || []).filter(p => p.to === "doctor").slice(-5);
  if (doctorPlans.length === 0) return "";
  const proLabels = { nutritionist: "Nutritionist", trainer: "Trainer", therapist: "Therapist" };
  return "═══ SHARED PLANS FROM YOUR COLLEAGUES ═══\nThe following plans were shared with you by other members of this patient's Healleo team. Reference them when relevant — coordinate, don't contradict. If you see something that concerns you, say so.\n\n" + doctorPlans.map(p => `[Shared by ${proLabels[p.from] || p.from} on ${p.sharedAt?.slice(0,10)}]: ${p.summary}\n${p.content.slice(0, 800)}${p.content.length > 800 ? "..." : ""}`).join("\n\n") + "\n═══ END SHARED PLANS ═══";
})()}

${rag.context ? `═══ RETRIEVED MEDICAL DATA (RAG) ═══
The following was retrieved in real-time from PubMed and FDA databases for this query. USE this data to ground your response with specific, current evidence:

${rag.context}

═══ END RETRIEVED DATA ═══` : ""}

CRITICAL RULES:
1. Be detailed, empathetic, evidence-based. Use the patient's FULL history above.
2. ALWAYS reference relevant lab results, trends, and past symptoms when applicable.
3. If lab values are abnormal, flag them and explain implications in context of their conditions/medications.
4. Track patterns: if the patient has recurring symptoms, note the pattern and suggest investigation.
5. List conditions most-to-least likely with explanations.
6. Include: causes, when to see doctor (urgency), self-care, specialist type.
7. CITE SOURCES PRECISELY: Use [Source: PubMed PMID:XXXXX] for research papers, [Source: FDA Drug Label] for FDA data, [Source: Mayo Clinic] or [Source: NIH] for general knowledge, and web search results when used.
8. 3-5+ citations per response — prefer PubMed and FDA over general sources when available.
9. Use emoji section headers and markdown.
10. ALWAYS end with disclaimer.
11. Consider drug interactions with their medications — CHECK the FDA drug interaction data provided above.
12. If the retrieved PubMed papers are relevant, briefly mention the study and its PMID.
13. Use the web search tool for breaking medical news, drug recalls, current clinical guidelines, or anything that requires the most up-to-date information.
14. If you notice something important, end with:
## 🧠 Learning Note
[Brief observation to remember]

## 📚 Sources Used
[List the specific PubMed papers, FDA data, and web sources you referenced]
${options.imageDescription ? `\n\nThe patient has uploaded a document/image. Description: ${options.imageDescription}` : ""}
${options.labContext ? `\n\nAsking about these lab results: ${options.labContext}` : ""}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:2000,
        system:sys,
        messages,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 3
          }
        ]
      })
    });
    const data = await res.json();

    // Process response — may contain text + tool_use + tool_result blocks
    let responseText = "";
    const contentBlocks = data.content || [];
    for (const block of contentBlocks) {
      if (block.type === "text") responseText += block.text;
    }

    // If the model used web search, there may be citations in the response
    if (!responseText) responseText = "Sorry, I couldn't process that.";

    // Append RAG source summary if we had retrieved data
    if (rag.sources.length > 0 && !responseText.includes("Sources Used")) {
      const sourceList = rag.sources.map(s => {
        if (s.type === "pubmed") return `- PubMed: "${s.title}" (${s.journal}, ${s.year}) PMID:${s.pmid}`;
        if (s.type === "fda_label") return `- FDA Drug Label: ${s.name || s.drug}`;
        if (s.type === "fda_events") return `- FDA Adverse Event Reports: ${s.drug}`;
        if (s.type === "fda_recall") return `- FDA Recall Database: ${s.drug}`;
        return `- ${s.type}: ${s.drug || s.title || ""}`;
      }).join("\n");
      responseText += `\n\n## 📚 Data Sources Retrieved\n${sourceList}`;
    }

    // Extract learning notes
    const learningMatch = responseText.match(/## 🧠 Learning Note\n([\s\S]*?)(?:\n##|$)/);
    if (learningMatch) {
      return { text: responseText, learningNote: learningMatch[1].trim(), ragSources: rag.sources };
    }
    return { text: responseText, learningNote: null, ragSources: rag.sources };
  } catch(e) { return { text: "⚠️ Unable to connect. Please try again.", learningNote: null, ragSources: [] }; }
}
