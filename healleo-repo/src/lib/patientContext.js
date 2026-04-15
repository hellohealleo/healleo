// Patient-context builder — assembles the string fed to every AI call.
// Extracted from App.jsx.

import { fmtHeight } from "./format.js";
import { getWeekLogs } from "./logs.js";
import { DRUG_DATABASE } from "./drugs.js";

export function buildPatientContext(state) {
  const p = state.profile;
  const labs = state.labResults || [];
  const symptoms = state.symptomSessions || [];
  const timeline = state.healthTimeline || [];
  const memory = state.aiMemory || [];
  const logs = state.logs || [];
  const meds = state.medications || [];

  // Recent wellness trends (last 7 days)
  const recent = getWeekLogs(logs);
  const avgSleep = recent.reduce((s,l)=>s+l.sleep,0)/7;
  const avgWater = recent.reduce((s,l)=>s+l.water,0)/7;
  const avgCalories = recent.filter(l=>l.calories>0);
  const avgCal = avgCalories.length>0 ? avgCalories.reduce((s,l)=>s+l.calories,0)/avgCalories.length : 0;
  const recentMoods = recent.filter(l=>l.mood>=0).map(l=>["terrible","poor","okay","good","great"][l.mood]);
  const exerciseDays = recent.filter(l=>l.exercise.length>0).length;

  // Lab results summary - most recent per test
  const latestLabs = {};
  [...labs].sort((a,b)=>a.date.localeCompare(b.date)).forEach(lr => {
    lr.results.forEach(r => { latestLabs[r.name] = { value: r.value, unit: r.unit, date: lr.date, flag: r.flag }; });
  });

  // Lab trends (tests with multiple readings)
  const labTrends = {};
  labs.forEach(lr => {
    lr.results.forEach(r => {
      if(!labTrends[r.name]) labTrends[r.name] = [];
      labTrends[r.name].push({ value: r.value, date: lr.date });
    });
  });
  const trendSummaries = Object.entries(labTrends).filter(([k,v])=>v.length>=2).map(([name,readings])=>{
    const sorted = readings.sort((a,b)=>a.date.localeCompare(b.date));
    const first = sorted[0].value, last = sorted[sorted.length-1].value;
    const direction = last > first ? "increasing" : last < first ? "decreasing" : "stable";
    return `${name}: ${first} → ${last} (${direction} over ${sorted.length} readings)`;
  });

  // Recent symptom history
  const recentSymptoms = symptoms.slice(-5).map(s => `${s.date}: ${s.area} - ${s.symptoms.join(", ")} (severity ${s.severity}/10, duration: ${s.duration})`);

  // Health timeline events
  const recentTimeline = timeline.slice(-10).map(e => `${e.date}: [${e.type}] ${e.title} — ${e.notes||""}`);

  // AI memory (learned observations)
  const memoryStr = memory.slice(-20).map(m => `[${m.date}] ${m.insight}`).join("\n");

  let context = `COMPREHENSIVE PATIENT PROFILE:
Name: ${p.name||"Not provided"} | Age: ${p.age||"?"} | Sex: ${p.sex||"?"} | Weight: ${p.weight||"?"} lbs | Height: ${fmtHeight(p.height)}
Blood Type: ${p.bloodType||"Unknown"} | Diet: ${p.dietType||"Not specified"}
Known Conditions: ${p.conditions?.join(", ")||"None"}
Current Medications: ${meds.filter(m=>m.active!==false).length>0 ? meds.filter(m=>m.active!==false).map(m=>`${m.name}${m.dose?" "+m.dose:""}${m.frequency?" ("+m.frequency+")":""}`).join(", ") : (p.medications||"None reported")}
Recently Discontinued: ${meds.filter(m=>m.active===false).length>0 ? meds.filter(m=>m.active===false).map(m=>m.name).join(", ") : "None"}
Allergies: ${p.allergies||"None reported"}
Family History: ${p.familyHistory||"Not provided"}
Health Goals: ${p.goals?.join(", ")||"None"}

RECENT WELLNESS DATA (7-day averages):
Sleep: ${avgSleep.toFixed(1)} hrs/night | Water: ${avgWater.toFixed(0)} oz/day | Calories: ${avgCal>0?Math.round(avgCal):"not tracked"}/day
Exercise days: ${exerciseDays}/7 | Recent moods: ${recentMoods.join(", ")||"not tracked"}`;

  if (Object.keys(latestLabs).length > 0) {
    context += `\n\nLATEST LAB RESULTS:`;
    Object.entries(latestLabs).forEach(([name,data]) => {
      context += `\n  ${name}: ${data.value} ${data.unit} ${data.flag?`[${data.flag}]`:""} (${data.date})`;
    });
  }

  if (trendSummaries.length > 0) {
    context += `\n\nLAB TRENDS:\n${trendSummaries.join("\n")}`;
  }

  if (recentSymptoms.length > 0) {
    context += `\n\nSYMPTOM HISTORY (recent):\n${recentSymptoms.join("\n")}`;
  }

  if (recentTimeline.length > 0) {
    context += `\n\nHEALTH TIMELINE:\n${recentTimeline.join("\n")}`;
  }

  if (memoryStr) {
    context += `\n\nPRIOR AI OBSERVATIONS & LEARNED PATTERNS:\n${memoryStr}`;
  }

  return context;
}

export function extractMedicalTerms(text, profile) {
  const terms = [];
  // Extract drug names from user message and profile
  const allText = text + " " + (profile.medications || "");
  const drugPatterns = /\b(metformin|lisinopril|atorvastatin|amlodipine|omeprazole|losartan|simvastatin|levothyroxine|gabapentin|hydrochlorothiazide|sertraline|fluoxetine|escitalopram|duloxetine|bupropion|trazodone|alprazolam|lorazepam|clonazepam|prednisone|ibuprofen|acetaminophen|aspirin|amoxicillin|azithromycin|ciprofloxacin|doxycycline|insulin|ozempic|semaglutide|wegovy|mounjaro|tirzepatide|adderall|ritalin|concerta|xanax|ambien|zolpidem|warfarin|eliquis|apixaban|jardiance|empagliflozin|metoprolol|carvedilol|pantoprazole|famotidine|montelukast|albuterol|fluticasone)\b/gi;
  const drugs = [...new Set((allText.match(drugPatterns) || []).map(d => d.toLowerCase()))];

  // Extract condition/symptom terms from the message
  const conditionPatterns = /\b(diabetes|hypertension|blood pressure|cholesterol|thyroid|hypothyroid|hyperthyroid|asthma|arthritis|migraine|headache|anxiety|depression|insomnia|IBS|GERD|acid reflux|heart disease|stroke|cancer|tumor|infection|anemia|vitamin d deficiency|b12 deficiency|iron deficiency|kidney disease|liver disease|PCOS|endometriosis|fibromyalgia|lupus|rheumatoid|psoriasis|eczema|UTI|pneumonia|bronchitis|COVID|sleep apnea|ADHD|bipolar|neuropathy)\b/gi;
  const conditions = [...new Set((text.match(conditionPatterns) || []).map(c => c.toLowerCase()))];

  return { drugs, conditions, searchQuery: [...conditions, ...drugs].slice(0, 3).join(" ") || text.split(" ").slice(0, 5).join(" ") };
}
