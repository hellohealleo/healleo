import { useState, useRef } from "react";
import { MOODS } from "../lib/profile.js";
import { S } from "../styles/theme.js";
import { today } from "../lib/state.js";
import { getOrCreateLog } from "../lib/logs.js";

export function LogEntry({log,updateLog,selDate,setSelDate,waterGoal,state,update}){
  const [nlInput, setNlInput] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlResult, setNlResult] = useState(null);
  const [nlHistory, setNlHistory] = useState([]);
  const [showBackfill, setShowBackfill] = useState(false);
  const [backfillText, setBackfillText] = useState("");
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillResult, setBackfillResult] = useState(null);
  const [healthImporting, setHealthImporting] = useState(false);
  const [healthResult, setHealthResult] = useState(null);
  const healthFileRef = useRef(null);

  const parseNaturalLog = async () => {
    if (!nlInput.trim() || nlLoading) return;
    setNlLoading(true); setNlResult(null);
    const prompt = `The user wants to log health data using natural language. Parse their input and return ONLY a JSON object with the data to log.

Today's date: ${selDate}
Current log values: water=${log.water}oz, sleep=${log.sleep}hr, steps=${log.steps}, calories=${log.calories}, protein=${log.protein}g, carbs=${log.carbs}g, fat=${log.fat}g, mood=${log.mood} (0=terrible,1=poor,2=okay,3=good,4=great,-1=unset)

User input: "${nlInput}"

Return JSON with this structure:
{
  "entries": [
    {
      "date": "YYYY-MM-DD",
      "water": number or null (in ounces),
      "sleep": number or null (in hours),
      "steps": number or null,
      "calories": number or null,
      "protein": number or null (grams),
      "carbs": number or null (grams),
      "fat": number or null (grams),
      "mood": number or null (0-4 scale),
      "meals": ["string"] or null,
      "exercise": [{"type":"string","minutes":number}] or null,
      "supplements": ["string"] or null,
      "notes": "string" or null
    }
  ],
  "summary": "Brief human-readable summary of what was logged",
  "dates_affected": ["YYYY-MM-DD", ...]
}

RULES:
- If the user says "this week" or "the week of X", create entries for each day in that range
- If they say "averaged X", set the same value for each day
- If they mention a date range (Mon-Fri, 4/6-4/12), create individual entries
- Convert units: "8 glasses of water" ≈ 2L, "half gallon" ≈ 1.9L
- For mood words: great/excellent=4, good/fine=3, okay/alright=2, bad/rough=1, terrible/awful=0
- null means don't change that field
- Only include fields the user mentioned
- Today is ${new Date().toISOString().slice(0,10)}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:"You are a health data parser. Return ONLY valid JSON, no markdown fences or explanation.",messages:[{role:"user",content:prompt}]})
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("\n") || "";
      const jsonStr = text.replace(/```json?|```/g,"").trim();
      const parsed = JSON.parse(jsonStr);

      if (parsed.entries && parsed.entries.length > 0) {
        update(s => {
          parsed.entries.forEach(entry => {
            const idx = s.logs.findIndex(l => l.date === entry.date);
            const existing = idx >= 0 ? {...s.logs[idx]} : getOrCreateLog(s.logs, entry.date);

            if (entry.water !== null && entry.water !== undefined) existing.water = entry.water;
            if (entry.sleep !== null && entry.sleep !== undefined) existing.sleep = entry.sleep;
            if (entry.steps !== null && entry.steps !== undefined) existing.steps = entry.steps;
            if (entry.calories !== null && entry.calories !== undefined) existing.calories = entry.calories;
            if (entry.protein !== null && entry.protein !== undefined) existing.protein = entry.protein;
            if (entry.carbs !== null && entry.carbs !== undefined) existing.carbs = entry.carbs;
            if (entry.fat !== null && entry.fat !== undefined) existing.fat = entry.fat;
            if (entry.mood !== null && entry.mood !== undefined) existing.mood = entry.mood;
            if (entry.meals) existing.meals = [...existing.meals, ...entry.meals];
            if (entry.exercise) existing.exercise = [...existing.exercise, ...entry.exercise];
            if (entry.supplements) existing.supplements = [...new Set([...(existing.supplements||[]), ...entry.supplements])];
            if (entry.notes) existing.notes = existing.notes ? existing.notes + "\n" + entry.notes : entry.notes;

            if (idx >= 0) s.logs[idx] = existing; else s.logs.push(existing);
          });
        });

        setNlResult({ success: true, summary: parsed.summary, count: parsed.entries.length, dates: parsed.dates_affected || parsed.entries.map(e=>e.date) });
        setNlHistory(prev => [...prev, { input: nlInput, summary: parsed.summary, count: parsed.entries.length, time: new Date().toLocaleTimeString() }]);
      } else {
        setNlResult({ success: false, summary: "Couldn't parse that. Try something like: 'I drank 3L of water today' or 'averaged 7hrs sleep this week'" });
      }
    } catch(e) {
      setNlResult({ success: false, summary: "Failed to parse. Try being more specific, e.g.: 'slept 8 hours, drank 2.5L water, walked 8000 steps'" });
    }
    setNlInput("");
    setNlLoading(false);
  };

  // ─── BACKFILL ROUTINE HISTORY ───
  const backfillHistory = async () => {
    if (!backfillText.trim() || backfillLoading) return;
    setBackfillLoading(true); setBackfillResult(null);
    const prompt = `The user is describing their TYPICAL ROUTINES and HISTORIC HABITS so we can backfill their health log with realistic historical data. Parse their description and generate daily log entries going back in time.

Today's date: ${new Date().toISOString().slice(0,10)}
Existing log count: ${(state.logs||[]).length} days

User describes their routines:
"""
${backfillText}
"""

Generate a JSON response:
{
  "entries": [
    {
      "date": "YYYY-MM-DD",
      "water": number or null (ounces),
      "sleep": number or null (hours),
      "steps": number or null,
      "calories": number or null,
      "protein": number or null (grams),
      "carbs": number or null (grams),
      "fat": number or null (grams),
      "mood": number or null (0-4),
      "exercise": [{"type":"string","minutes":number}] or null,
      "supplements": ["string"] or null,
      "notes": null
    }
  ],
  "summary": "Brief description of what was generated",
  "dates_affected": ["YYYY-MM-DD", ...]
}

CRITICAL RULES:
- Generate entries for the PAST 30 DAYS by default (or whatever period they specify)
- Apply routines to correct days: "weekday yoga" = Mon-Fri only; "weekend runs" = Sat-Sun only
- Add NATURAL VARIATION: don't make every day identical. Vary sleep ±0.5hr, water ±0.3L, steps ±1000, etc.
- If they say "I usually drink about 2L water" generate values between 1.5-2.5L
- If they say "I walk 55 minutes daily" some days might be 50, some 60
- Weekend patterns may differ from weekday patterns
- If they mention meals like "I eat oatmeal for breakfast", include in meals array occasionally
- Skip dates that might already have data (but include them anyway, the app will merge)
- If they mention supplements, include them on the appropriate days
- Mood should generally be 2-4 with occasional variation
- Return up to 30 entries maximum`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,system:"You are a health data generator. Return ONLY valid JSON. Generate realistic daily entries with natural variation based on described routines.",messages:[{role:"user",content:prompt}]})
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("\n") || "";
      const jsonStr = text.replace(/```json?|```/g,"").trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.entries?.length) {
          let newCount = 0;
          update(s => {
            parsed.entries.forEach(entry => {
              const idx = s.logs.findIndex(l => l.date === entry.date);
              const existing = idx >= 0 ? {...s.logs[idx]} : getOrCreateLog(s.logs, entry.date);
              let changed = false;
              if (entry.water != null && !existing.water) { existing.water = entry.water; changed = true; }
              if (entry.sleep != null && !existing.sleep) { existing.sleep = entry.sleep; changed = true; }
              if (entry.steps != null && !existing.steps) { existing.steps = entry.steps; changed = true; }
              if (entry.calories != null && !existing.calories) { existing.calories = entry.calories; changed = true; }
              if (entry.protein != null && !existing.protein) { existing.protein = entry.protein; changed = true; }
              if (entry.carbs != null && !existing.carbs) { existing.carbs = entry.carbs; changed = true; }
              if (entry.fat != null && !existing.fat) { existing.fat = entry.fat; changed = true; }
              if (entry.mood != null && existing.mood < 0) { existing.mood = entry.mood; changed = true; }
              if (entry.exercise?.length && !existing.exercise?.length) { existing.exercise = entry.exercise; changed = true; }
              if (entry.supplements?.length && !existing.supplements?.length) { existing.supplements = entry.supplements; changed = true; }
              if (entry.meals?.length && !existing.meals?.length) { existing.meals = entry.meals; changed = true; }
              if (changed) {
                if (idx >= 0) s.logs[idx] = existing; else s.logs.push(existing);
                newCount++;
              }
            });
          });
          setBackfillResult({ success: true, summary: parsed.summary, count: newCount });
        }
      }
    } catch(e) { setBackfillResult({ success: false, summary: "Failed to generate history. Try describing your routines more simply." }); }
    setBackfillLoading(false);
  };

  // ─── APPLE HEALTH IMPORT ───
  const handleHealthImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHealthImporting(true); setHealthResult(null);
    try {
      const text = await file.text();
      // Parse Apple Health XML export
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");
      const records = xml.querySelectorAll("Record");
      const workouts = xml.querySelectorAll("Workout");
      const dailyData = {};

      const getDay = (dateStr) => dateStr?.slice(0, 10);
      const ensure = (date) => { if (!dailyData[date]) dailyData[date] = { water: 0, sleep: 0, steps: 0, calories: 0, exercise: [] }; };

      for (const r of records) {
        const type = r.getAttribute("type");
        const date = getDay(r.getAttribute("startDate"));
        const val = parseFloat(r.getAttribute("value")) || 0;
        if (!date) continue;
        ensure(date);

        if (type === "HKQuantityTypeIdentifierStepCount") dailyData[date].steps += Math.round(val);
        else if (type === "HKQuantityTypeIdentifierDietaryWater") dailyData[date].water += val / 1000; // ml to L
        else if (type === "HKQuantityTypeIdentifierDietaryEnergyConsumed") dailyData[date].calories += Math.round(val);
        else if (type === "HKQuantityTypeIdentifierDietaryProtein") dailyData[date].protein = (dailyData[date].protein || 0) + Math.round(val);
        else if (type === "HKQuantityTypeIdentifierDietaryCarbohydrates") dailyData[date].carbs = (dailyData[date].carbs || 0) + Math.round(val);
        else if (type === "HKQuantityTypeIdentifierDietaryFatTotal") dailyData[date].fat = (dailyData[date].fat || 0) + Math.round(val);
      }

      // Sleep analysis
      for (const r of records) {
        const type = r.getAttribute("type");
        if (type === "HKCategoryTypeIdentifierSleepAnalysis") {
          const val = r.getAttribute("value");
          if (val === "HKCategoryValueSleepAnalysisAsleepUnspecified" || val === "HKCategoryValueSleepAnalysisAsleepCore" || val === "HKCategoryValueSleepAnalysisAsleepDeep" || val === "HKCategoryValueSleepAnalysisAsleepREM" || val === "HKCategoryValueSleepAnalysisAsleep") {
            const start = new Date(r.getAttribute("startDate"));
            const end = new Date(r.getAttribute("endDate"));
            const hrs = (end - start) / 3600000;
            const date = getDay(r.getAttribute("endDate")); // attribute sleep to wake-up day
            ensure(date);
            dailyData[date].sleep += hrs;
          }
        }
      }

      // Workouts
      for (const w of workouts) {
        const date = getDay(w.getAttribute("startDate"));
        const dur = parseFloat(w.getAttribute("duration")) || 0;
        const type = w.getAttribute("workoutActivityType")?.replace("HKWorkoutActivityType", "") || "Other";
        if (date && dur > 0) { ensure(date); dailyData[date].exercise.push({ type, minutes: Math.round(dur) }); }
      }

      // Apply to state
      let imported = 0;
      const last90 = new Date(); last90.setDate(last90.getDate() - 90);
      const cutoff = last90.toISOString().slice(0, 10);

      update(s => {
        for (const [date, data] of Object.entries(dailyData)) {
          if (date < cutoff) continue; // only import last 90 days
          const idx = s.logs.findIndex(l => l.date === date);
          const existing = idx >= 0 ? {...s.logs[idx]} : getOrCreateLog(s.logs, date);
          let changed = false;
          if (data.steps > 0 && !existing.steps) { existing.steps = data.steps; changed = true; }
          if (data.water > 0 && !existing.water) { existing.water = Math.round(data.water * 10) / 10; changed = true; }
          if (data.sleep > 0 && !existing.sleep) { existing.sleep = Math.round(data.sleep * 10) / 10; changed = true; }
          if (data.calories > 0 && !existing.calories) { existing.calories = data.calories; changed = true; }
          if (data.protein > 0 && !existing.protein) { existing.protein = data.protein; changed = true; }
          if (data.carbs > 0 && !existing.carbs) { existing.carbs = data.carbs; changed = true; }
          if (data.fat > 0 && !existing.fat) { existing.fat = data.fat; changed = true; }
          if (data.exercise.length && !existing.exercise?.length) { existing.exercise = data.exercise; changed = true; }
          if (changed) { if (idx >= 0) s.logs[idx] = existing; else s.logs.push(existing); imported++; }
        }
      });

      setHealthResult({ success: true, summary: `Imported ${imported} days of data from Apple Health (steps, sleep, water, calories, workouts). Last 90 days processed.`, count: imported });
    } catch(err) {
      console.error("Health import error:", err);
      setHealthResult({ success: false, summary: "Failed to parse file. Make sure you exported from Apple Health (Settings → Health → Export All Health Data) and uploaded the export.xml file." });
    }
    setHealthImporting(false);
    if (healthFileRef.current) healthFileRef.current.value = "";
  };

  return <div className="fade-up">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <h2 style={S.h2}>✏️ Daily Log</h2>
      <input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)} style={{...S.input,width:"auto",fontSize:15}}/>
    </div>

    {/* Natural Language Input */}
    <div style={{...S.card,marginTop:14,padding:16,borderLeft:"3px solid var(--accent3)"}}>
      <h3 style={S.h3}>💬 Quick Log — just type it</h3>
      <p style={{fontSize:14,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>Describe what you want to log in plain English. Works for single days, date ranges, and weekly averages.</p>
      <div style={{display:"flex",gap:6,marginTop:10}}>
        <input value={nlInput} onChange={e=>setNlInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&parseNaturalLog()}
          placeholder="e.g. I averaged 2.5L water and 7hrs sleep this week..." disabled={nlLoading}
          style={{...S.input,flex:1}} />
        <button onClick={parseNaturalLog} disabled={nlLoading||!nlInput.trim()} style={{...S.primaryBtn,fontSize:15,padding:"8px 14px",opacity:nlLoading||!nlInput.trim()?0.5:1,whiteSpace:"nowrap"}}>
          {nlLoading?"Parsing...":"Log it"}
        </button>
      </div>

      {/* Example suggestions */}
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
        {["I drank 3L water today","Slept 6.5 hours last night","Walked 10,000 steps","Averaged 7hrs sleep the week of 4/6","Had a great mood all week","Ate 2200 calories, 150g protein","I do 30 min yoga every weekday","I take a daily walk of 55 minutes"].map(ex => (
          <button key={ex} onClick={()=>setNlInput(ex)} style={{fontSize:15,padding:"3px 8px",background:"var(--bg)",border:"1px solid var(--muted)",borderRadius:8,color:"var(--dim)",cursor:"pointer",fontFamily:"var(--body)"}}>{ex}</button>
        ))}
      </div>

      {/* Result feedback */}
      {nlResult && (
        <div style={{marginTop:10,padding:"8px 12px",borderRadius:8,fontSize:15,lineHeight:1.5,
          background:nlResult.success?"rgba(138,122,74,0.08)":"rgba(184,84,84,0.08)",
          color:nlResult.success?"var(--success)":"var(--danger)",
          border:`1px solid ${nlResult.success?"rgba(138,122,74,0.18)":"rgba(196,90,90,0.2)"}`
        }}>
          {nlResult.success && <span style={{fontWeight:600}}>✓ Logged! </span>}
          {nlResult.summary}
          {nlResult.dates && nlResult.dates.length > 1 && <div style={{fontSize:16,marginTop:4,color:"var(--dim)"}}>Updated {nlResult.dates.length} days: {nlResult.dates.join(", ")}</div>}
        </div>
      )}
    </div>

    {/* Recent NL logs */}
    {nlHistory.length > 0 && (
      <div style={{...S.card,marginTop:10,padding:12}}>
        <h3 style={{...S.h3,fontSize:14}}>📜 Recent quick logs</h3>
        <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:4}}>
          {nlHistory.slice(-3).reverse().map((h,i) => (
            <div key={i} style={{fontSize:14,color:"var(--dim)",padding:"4px 0",borderBottom:i<2?"1px solid var(--muted)":"none"}}>
              <span style={{color:"var(--text)",fontWeight:500}}>"{h.input}"</span>
              <span style={{marginLeft:6,color:"var(--success)"}}>✓ {h.summary}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ─── BACKFILL & IMPORT SECTION ─── */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
      <button onClick={()=>setShowBackfill(!showBackfill)} className="card" style={{...S.card,padding:"12px 8px",textAlign:"center",border:"none",cursor:"pointer"}}>
        <div style={{fontSize:20}}>📅</div>
        <div style={{fontSize:16,fontWeight:600,marginTop:3,color:"var(--accent)"}}>Backfill History</div>
        <div style={{fontSize:15,color:"var(--dim)",marginTop:1}}>Describe your routines</div>
      </button>
      <button onClick={()=>healthFileRef.current?.click()} className="card" style={{...S.card,padding:"12px 8px",textAlign:"center",border:"none",cursor:"pointer"}}>
        <div style={{fontSize:20}}>🍎</div>
        <div style={{fontSize:16,fontWeight:600,marginTop:3,color:"var(--accent)"}}>Apple Health</div>
        <div style={{fontSize:15,color:"var(--dim)",marginTop:1}}>Import export.xml</div>
      </button>
    </div>
    <input ref={healthFileRef} type="file" accept=".xml" style={{display:"none"}} onChange={handleHealthImport}/>

    {healthImporting&&<div style={{...S.card,marginTop:10,padding:14,textAlign:"center"}}><div style={{display:"flex",gap:4,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--accent)",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:8}}>Processing Apple Health data...</div></div>}
    {healthResult&&<div style={{marginTop:8,padding:"8px 12px",borderRadius:8,fontSize:15,lineHeight:1.5,background:healthResult.success?"rgba(138,122,74,0.08)":"rgba(184,84,84,0.08)",color:healthResult.success?"var(--success)":"var(--danger)",border:`1px solid ${healthResult.success?"rgba(138,122,74,0.18)":"rgba(196,90,90,0.2)"}`}}>{healthResult.success&&<span style={{fontWeight:600}}>✓ </span>}{healthResult.summary}</div>}

    {showBackfill&&<div style={{...S.card,marginTop:10,padding:16,borderLeft:"3px solid var(--accent2)"}}>
      <h3 style={S.h3}>📅 Backfill Your History</h3>
      <p style={{fontSize:14,color:"var(--dim)",marginTop:4,lineHeight:1.6}}>Describe your typical daily routines in plain English. The AI will generate 30 days of realistic historic data with natural day-to-day variation, so your doctor summaries and AI analysis have context from day one.</p>
      <textarea value={backfillText} onChange={e=>setBackfillText(e.target.value)} rows={5} placeholder={"Describe your typical routines, e.g.:\n\nI do 30 minutes of yoga every weekday morning. I take a daily walk of 55 minutes. I drink about 64 ounces of water a day. I usually sleep 7 hours on weeknights and 8 on weekends. I eat around 1800 calories, mostly Mediterranean diet. I take vitamin D, magnesium and fish oil daily. On weekends I do a 45 minute run."} style={{...S.input,marginTop:10,resize:"vertical",fontSize:15,lineHeight:1.5}}/>
      <button onClick={backfillHistory} disabled={backfillLoading||!backfillText.trim()} style={{...S.primaryBtn,width:"100%",marginTop:10,padding:14,opacity:backfillLoading?0.6:1}}>
        {backfillLoading?<><span style={{display:"inline-flex",gap:3,marginRight:8}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:"#fff",display:"inline-block",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</span>Generating 30 days of history...</>:"📅 Generate Historical Data"}
      </button>
      {backfillResult&&<div style={{marginTop:8,padding:"8px 12px",borderRadius:8,fontSize:15,lineHeight:1.5,background:backfillResult.success?"rgba(138,122,74,0.08)":"rgba(184,84,84,0.08)",color:backfillResult.success?"var(--success)":"var(--danger)",border:`1px solid ${backfillResult.success?"rgba(138,122,74,0.18)":"rgba(196,90,90,0.2)"}`}}>{backfillResult.success&&<span style={{fontWeight:600}}>✓ </span>}{backfillResult.summary}{backfillResult.count>0&&<span> ({backfillResult.count} days added)</span>}</div>}
      <div style={{fontSize:16,color:"var(--dim)",marginTop:8,lineHeight:1.5}}>💡 Only fills in days that don't already have data. Existing logs are preserved. You can run this multiple times to add different routine aspects.</div>
    </div>}

    {/* Divider */}
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0 6px"}}>
      <div style={{flex:1,height:1,background:"var(--muted)"}}/>
      <span style={{fontSize:16,color:"var(--dim)",fontFamily:"var(--mono)"}}>or log manually</span>
      <div style={{flex:1,height:1,background:"var(--muted)"}}/>
    </div>

    {/* Manual controls */}
    <div style={{...S.card,marginTop:8,padding:16}}>
      <h3 style={S.h3}>💧 Water ({log.water} oz / {waterGoal} oz)</h3>
      <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
        {[8,16,32].map(a=><button key={a} onClick={()=>updateLog(l=>l.water=Math.round(l.water+a))} style={S.smallBtn}>+{a}oz</button>)}
        <button onClick={()=>updateLog(l=>l.water=Math.max(0,Math.round(l.water-8)))} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)"}}>−8oz</button>
      </div>
    </div>
    <div style={{...S.card,marginTop:10,padding:16}}>
      <h3 style={S.h3}>😴 Sleep</h3>
      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>
        <input type="range" min="0" max="14" step="0.5" value={log.sleep} onChange={e=>updateLog(l=>l.sleep=parseFloat(e.target.value))} style={{flex:1}}/>
        <span style={{fontFamily:"var(--mono)",fontSize:16}}>{log.sleep}hr</span>
      </div>
    </div>
    <div style={{...S.card,marginTop:10,padding:16}}>
      <h3 style={S.h3}>👟 Steps</h3>
      <input type="number" value={log.steps||""} onChange={e=>updateLog(l=>l.steps=parseInt(e.target.value)||0)} placeholder="0" style={{...S.input,marginTop:8}}/>
    </div>
    <div style={{...S.card,marginTop:10,padding:16}}>
      <h3 style={S.h3}>🧠 Mood</h3>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        {MOODS.map((m,i)=><button key={i} onClick={()=>updateLog(l=>l.mood=i)} style={{fontSize:24,background:"none",border:"none",cursor:"pointer",opacity:log.mood===i?1:0.3,transform:log.mood===i?"scale(1.2)":"none",transition:"all 0.2s"}}>{m}</button>)}
      </div>
    </div>
    <div style={{...S.card,marginTop:10,padding:16}}>
      <h3 style={S.h3}>📝 Notes</h3>
      <textarea value={log.notes} onChange={e=>updateLog(l=>l.notes=e.target.value)} placeholder="How are you feeling?" rows={3} style={{...S.input,marginTop:8,resize:"vertical"}}/>
    </div>
  </div>;
}
