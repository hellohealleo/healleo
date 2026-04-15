import { useState } from "react";
import { S } from "../styles/theme.js";
import { today } from "../lib/state.js";
import { fmtHeight } from "../lib/format.js";
import { RenderMD } from "./ui/RenderMD.jsx";

export function DoctorSummary({state}) {
  const [summary,setSummary]=useState(null);
  const [generating,setGenerating]=useState(false);
  const [dateRange,setDateRange]=useState("30"); // days

  const generateSummary = async () => {
    setGenerating(true);
    const days = parseInt(dateRange);
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-days);
    const cutoffStr = cutoff.toISOString().slice(0,10);
    const p = state.profile || {};
    const recentLogs = (state.logs||[]).filter(l=>l.date>=cutoffStr);
    const recentSymptoms = (state.symptomSessions||[]).filter(s=>(s.date||s.sessionDate||"")>=cutoffStr);
    const recentTimeline = (state.healthTimeline||[]).filter(t=>t.date>=cutoffStr);
    const allLabs = state.labResults||[];
    const flaggedLabs = allLabs.flatMap(lr => (lr.results||[]).filter(r=>r.flag&&r.flag!=="NORMAL").map(r=>({...r, reportDate:lr.date, reportName:lr.name})));

    // Compute averages
    const avgWater = recentLogs.length ? (recentLogs.reduce((s,l)=>s+(l.water||0),0)/recentLogs.length).toFixed(1) : "N/A";
    const avgSleep = recentLogs.length ? (recentLogs.reduce((s,l)=>s+(l.sleep||0),0)/recentLogs.length).toFixed(1) : "N/A";
    const avgCalories = recentLogs.length ? Math.round(recentLogs.reduce((s,l)=>s+(l.calories||0),0)/recentLogs.length) : "N/A";
    const avgSteps = recentLogs.length ? Math.round(recentLogs.reduce((s,l)=>s+(l.steps||0),0)/recentLogs.length) : "N/A";
    const moodDist = [0,0,0,0,0]; recentLogs.forEach(l=>{if(l.mood>=0&&l.mood<5)moodDist[l.mood]++;});
    const moodLabels=["Very Bad","Bad","Neutral","Good","Great"];
    const topMood = moodDist.indexOf(Math.max(...moodDist));

    // Supplements used
    const suppSet = new Set(); recentLogs.forEach(l=>(l.supplements||[]).forEach(s=>suppSet.add(s)));
    const supplements = [...suppSet];

    // Exercise
    const exercises = recentLogs.flatMap(l=>(l.exercise||[]));
    const exTypes = {}; exercises.forEach(e=>{exTypes[e.type]=(exTypes[e.type]||0)+e.minutes;});

    // Meals / nutrition
    const meals = recentLogs.flatMap(l=>(l.meals||[]).map(m=>({date:l.date,meal:m})));
    const avgProtein = recentLogs.length ? Math.round(recentLogs.reduce((s,l)=>s+(l.protein||0),0)/recentLogs.length) : "N/A";
    const avgCarbs = recentLogs.length ? Math.round(recentLogs.reduce((s,l)=>s+(l.carbs||0),0)/recentLogs.length) : "N/A";
    const avgFat = recentLogs.length ? Math.round(recentLogs.reduce((s,l)=>s+(l.fat||0),0)/recentLogs.length) : "N/A";

    const prompt = `Generate a PROFESSIONAL MEDICAL VISIT SUMMARY that a patient would bring to their doctor. Use formal medical language. Format it clearly with markdown headers.

PATIENT PROFILE:
Name: ${p.name||"[Not provided]"} | Age: ${p.age||"?"} | Sex: ${p.sex||"?"} | Weight: ${p.weight||"?"} lbs | Height: ${fmtHeight(p.height)}
Blood Type: ${p.bloodType||"Unknown"} | Diet: ${p.dietType||"Not specified"}
Current Medications: ${(state.medications||[]).filter(m=>m.active!==false).length>0 ? (state.medications||[]).filter(m=>m.active!==false).map(m=>`${m.name}${m.dose?" "+m.dose:""}${m.frequency?" ("+m.frequency+")":""}`).join(", ") : (p.medications||"None reported")}
Recently Discontinued: ${(state.medications||[]).filter(m=>m.active===false).length>0 ? (state.medications||[]).filter(m=>m.active===false).map(m=>m.name).join(", ") : "None"}
Known Allergies: ${p.allergies||"None reported"}
Medical Conditions: ${(p.conditions||[]).join(", ")||"None reported"}
Family History: ${p.familyHistory||"None reported"}

PERIOD COVERED: Last ${days} days (${cutoffStr} to ${today()})

DAILY WELLNESS AVERAGES (${recentLogs.length} days logged):
- Water intake: ${avgWater} oz/day
- Sleep: ${avgSleep} hrs/night
- Calories: ${avgCalories}/day | Protein: ${avgProtein}g | Carbs: ${avgCarbs}g | Fat: ${avgFat}g
- Steps: ${avgSteps}/day
- Predominant mood: ${moodLabels[topMood]} (${moodDist[topMood]}/${recentLogs.length} days)

CURRENT SUPPLEMENTS: ${supplements.length?supplements.join(", "):"None logged"}

EXERCISE (${days}-day period): ${Object.entries(exTypes).map(([t,m])=>`${t}: ${m} min total`).join(", ")||"None logged"}

SYMPTOM SESSIONS (${recentSymptoms.length} recorded):
${recentSymptoms.map(s=>`- [${s.date||s.sessionDate}] Area: ${s.bodyArea||"General"} | Symptoms: ${(s.symptoms||[]).join(", ")} | Severity: ${s.severity||"?"}/10 | Duration: ${s.duration||"?"} | Notes: ${s.notes||"None"}`).join("\n")||"None recorded"}

ABNORMAL LAB VALUES:
${flaggedLabs.map(f=>`- ${f.name}: ${f.value} ${f.unit} [${f.flag}] (from ${f.reportName}, ${f.reportDate})`).join("\n")||"None flagged"}

RECENT MEDICAL EVENTS:
${recentTimeline.map(e=>`- [${e.date}] ${e.type.toUpperCase()}: ${e.title}${e.notes?" — "+e.notes.slice(0,100):""}`).join("\n")||"None recorded"}

AI OBSERVATIONS (accumulated insights):
${(state.aiMemory||[]).slice(-10).map(m=>`- [${m.date}] ${m.insight}`).join("\n")||"None"}

HEALLEO TEAM NOTES:
${(state.nutritionChat||[]).length>0?`Nutritionist: ${(state.nutritionChat||[]).filter(m=>m.role==="assistant").length} consultations conducted`:"Nutritionist: No sessions yet"}
${(state.trainerChat||[]).length>0?`Trainer: ${(state.trainerChat||[]).filter(m=>m.role==="assistant").length} consultations conducted`:"Trainer: No sessions yet"}
${(state.therapistChat||[]).length>0?`Therapist: ${(state.therapistChat||[]).filter(m=>m.role==="assistant").length} consultations conducted`:"Therapist: No sessions yet"}

FORMAT THE SUMMARY AS:
# Patient Health Summary
## Patient Information (demographics, meds, allergies)
## Chief Concerns & Recent Symptoms (prioritized)
## Lifestyle & Wellness Data (with notable trends)
## Nutrition & Supplements
## Exercise & Physical Activity
## Mental & Emotional Wellbeing
## Lab Results Requiring Attention (flagged values with context)
## Recent Medical History (timeline events)
## AI-Generated Observations (patterns noticed across medical, nutrition, fitness, and emotional data)
## Suggested Discussion Points for This Visit

Be specific with dates, values, and references. Flag anything the doctor should investigate. This should be comprehensive enough that a doctor can quickly understand the patient's recent health status.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:3000, messages:[{role:"user",content:prompt}] })
      });
      const data = await res.json();
      const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      setSummary(text);
    } catch(e) { setSummary("Error generating summary. Please try again."); }
    setGenerating(false);
  };

  return <div className="fade-up">
    <h2 style={S.h2}>📋 Doctor Visit Summary</h2>
    <p style={{fontSize:15,color:"var(--dim)",marginTop:2,lineHeight:1.5}}>Generate a comprehensive health summary to bring to your next doctor's appointment. Includes symptoms, labs, medications, lifestyle data, and AI observations.</p>

    <div style={{...S.card,marginTop:14,padding:18}}>
      <label style={S.label}>Time period to cover
        <select value={dateRange} onChange={e=>setDateRange(e.target.value)} style={S.input}>
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="60">Last 60 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </label>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:14}}>
        <div style={{textAlign:"center",padding:10,background:"var(--bg)",borderRadius:8}}><div style={{fontFamily:"var(--display)",fontSize:18,fontWeight:600}}>{(state.symptomSessions||[]).length}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Symptoms</div></div>
        <div style={{textAlign:"center",padding:10,background:"var(--bg)",borderRadius:8}}><div style={{fontFamily:"var(--display)",fontSize:18,fontWeight:600}}>{(state.labResults||[]).length}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Lab Reports</div></div>
        <div style={{textAlign:"center",padding:10,background:"var(--bg)",borderRadius:8}}><div style={{fontFamily:"var(--display)",fontSize:18,fontWeight:600}}>{(state.logs||[]).length}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Days Logged</div></div>
      </div>

      <button onClick={generateSummary} disabled={generating} style={{...S.primaryBtn,width:"100%",marginTop:16,padding:16,opacity:generating?0.6:1}}>
        {generating ? <><span style={{display:"inline-flex",gap:3,marginRight:8}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:"#fff",display:"inline-block",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</span>Generating comprehensive summary...</> : "📋 Generate Doctor Visit Summary"}
      </button>
    </div>

    {summary && <div style={{marginTop:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <h3 style={S.h3}>Your Summary</h3>
        <button onClick={()=>{navigator.clipboard?.writeText(summary);}} style={{...S.smallBtn,fontSize:16}}>📋 Copy</button>
      </div>
      <div style={{...S.card,padding:20,background:"var(--card)",border:"1.5px solid var(--muted)"}}>
        <div style={{borderBottom:"2px solid var(--accent)",paddingBottom:12,marginBottom:16}}>
          <div style={{fontFamily:"var(--display)",fontSize:16,fontWeight:600,color:"var(--accent)"}}>Healleo Health Summary</div>
          <div style={{fontSize:14,color:"var(--dim)",marginTop:2}}>Generated {today()} · Patient: {state.profile?.name || "—"}</div>
          <div style={{fontSize:16,color:"var(--dim)",marginTop:1}}>This summary was generated by AI from self-reported data and should be verified by a healthcare provider.</div>
        </div>
        <RenderMD text={summary}/>
      </div>
      <div style={{...S.card,marginTop:10,padding:14,borderLeft:"3px solid var(--accent)"}}>
        <div style={{fontSize:14,color:"var(--dim)",lineHeight:1.6}}>💡 <strong>How to use:</strong> Copy this summary and print it, or show it on your phone during your doctor visit. It gives your provider a quick overview of your recent health data, symptoms, and trends so you can make the most of your appointment time.</div>
      </div>
    </div>}
  </div>;
}
