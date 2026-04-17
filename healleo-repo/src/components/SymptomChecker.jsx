import { useState } from "react";
import { S } from "../styles/theme.js";
import { today } from "../lib/state.js";
import { BODY_AREAS, SYMPTOM_MAP } from "../lib/symptoms.js";
import { RenderMD } from "./ui/RenderMD.jsx";

export function SymptomChecker({state,update}) {
  const [area,setArea]=useState(null);const [selected,setSelected]=useState([]);const [duration,setDuration]=useState("today");const [severity,setSeverity]=useState(5);const [notes,setNotes]=useState("");const [result,setResult]=useState(null);const [loading,setLoading]=useState(false);const [viewing,setViewing]=useState(null);
  const [customSymptom, setCustomSymptom] = useState("");
  const sessions=state.symptomSessions||[];const toggle=s=>setSelected(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);

  const addCustom = () => {
    const s = customSymptom.trim();
    if (s && !selected.includes(s)) { setSelected(prev => [...prev, s]); }
    setCustomSymptom("");
  };

  const analyze=async()=>{if(!selected.length)return;setLoading(true);
    const prompt=`Patient reports symptoms. Analyze using their FULL history including lab results and past symptoms.\nSYMPTOMS: ${selected.join(", ")} | AREA: ${area || "Not specified"} | DURATION: ${duration} | SEVERITY: ${severity}/10 | NOTES: ${notes||"None"}\n\nProvide:\n## 🔍 Symptom Analysis\n## 📋 Possible Conditions\n## 🏥 When to See a Doctor\n## 🏠 Self-Care\n## 👨‍⚕️ Specialist\nCite sources. Reference relevant lab values if applicable.`;
    const response=await askMedicalAI([{role:"user",content:prompt}],state);
    const session={date:new Date().toISOString(),area:area||"General",symptoms:selected,duration,severity,notes,result:response.text};
    update(s=>{s.symptomSessions=[...(s.symptomSessions||[]),session];s.healthTimeline=[...(s.healthTimeline||[]),{date:today(),type:"symptom",title:`Symptoms: ${selected.slice(0,3).join(", ")}`,notes:`${area||"General"}, severity ${severity}/10, ${duration}`}];if(response.learningNote)s.aiMemory=[...(s.aiMemory||[]),{date:today(),insight:response.learningNote}];});
    setResult(response.text);setLoading(false);};
  const reset=()=>{setArea(null);setSelected([]);setDuration("today");setSeverity(5);setNotes("");setResult(null);setCustomSymptom("");};

  if(viewing)return <div className="fade-up"><button onClick={()=>setViewing(null)} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button><div style={S.card}><div style={{fontSize:14,color:"var(--dim)",fontFamily:"var(--mono)"}}>{new Date(viewing.date).toLocaleDateString()}</div><div style={{display:"flex",flexWrap:"wrap",gap:4,margin:"8px 0"}}>{viewing.symptoms.map(s=><span key={s} style={{...S.chip,...S.chipActive,fontSize:14,padding:"3px 8px"}}>{s}</span>)}</div><RenderMD text={viewing.result}/></div></div>;
  if(result)return <div className="fade-up"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={S.h2}>🔍 Results</h2><button onClick={reset} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)"}}>New</button></div><div style={{display:"flex",flexWrap:"wrap",gap:4,margin:"10px 0"}}>{selected.map(s=><span key={s} style={{fontSize:14,padding:"3px 10px",background:"rgba(107,90,36,0.1)",borderRadius:12,color:"var(--accent)",fontFamily:"var(--mono)"}}>{s}</span>)}</div><div style={{...S.card,marginTop:8}}><RenderMD text={result}/></div></div>;

  // Selected symptoms bar (shown when any are selected, regardless of step)
  const selectedBar = selected.length > 0 && (
    <div style={{...S.card,marginTop:10,padding:12,borderLeft:"3px solid var(--accent)"}}>
      <div style={{fontSize:14,color:"var(--dim)",marginBottom:6}}>Selected symptoms ({selected.length}):</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
        {selected.map(s => (
          <span key={s} style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:14,padding:"3px 8px",background:"var(--accent)",color:"#fff",borderRadius:12}}>
            {s}
            <button onClick={()=>setSelected(selected.filter(x=>x!==s))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:14,padding:0,lineHeight:1}}>✕</button>
          </span>
        ))}
      </div>
    </div>
  );

  return (<div className="fade-up"><h2 style={S.h2}>🔍 Symptom Checker</h2>

    {/* Free-text symptom entry — always visible */}
    <div style={{...S.card,marginTop:14,padding:16}}>
      <h3 style={S.h3}>✏️ Describe your symptoms</h3>
      <p style={{fontSize:14,color:"var(--dim)",marginTop:4}}>Type any symptom in your own words, or pick from common options below</p>
      <div style={{display:"flex",gap:6,marginTop:8}}>
        <input value={customSymptom} onChange={e=>setCustomSymptom(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addCustom();}}
          placeholder="e.g. sharp pain behind left eye, tingling in fingers..." style={{...S.input,flex:1}} />
        <button onClick={addCustom} disabled={!customSymptom.trim()} style={{...S.primaryBtn,fontSize:15,padding:"8px 14px",opacity:customSymptom.trim()?1:0.5}}>Add</button>
      </div>
    </div>

    {selectedBar}

    {/* Body area selector */}
    {!area ? <div style={{...S.card,marginTop:10,padding:20}}>
      <h3 style={S.h3}>📍 Body area <span style={{fontWeight:400,color:"var(--dim)"}}>(optional — helps narrow results)</span></h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
        {BODY_AREAS.map(a=><button key={a} onClick={()=>setArea(a)} style={{padding:"12px 10px",background:"var(--bg)",border:"1.5px solid var(--muted)",borderRadius:10,fontSize:15,cursor:"pointer",textAlign:"left",fontFamily:"var(--body)"}}>{a}</button>)}
      </div>
    </div>
    : <div style={{...S.card,marginTop:10,padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><h3 style={S.h3}>📍 {area}</h3><button onClick={()=>setArea(null)} style={{fontSize:14,color:"var(--accent)",background:"none",border:"none",cursor:"pointer"}}>Change</button></div>
        <p style={{fontSize:14,color:"var(--dim)",margin:"6px 0 8px"}}>Common symptoms for this area:</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {(SYMPTOM_MAP[area]||[]).map(s=><button key={s} onClick={()=>toggle(s)} style={{...S.chip,...(selected.includes(s)?S.chipActive:{}),fontSize:14,padding:"5px 10px"}}>{selected.includes(s)?"✓ ":""}{s}</button>)}
        </div>
      </div>}

    {/* Duration / Severity / Notes / Analyze — shown when symptoms selected */}
    {selected.length>0&&<>
      <div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>⏱ Duration</h3><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>{["today","2-3 days","1 week","2+ weeks","1+ month","chronic"].map(d=><button key={d} onClick={()=>setDuration(d)} style={{...S.chip,...(duration===d?S.chipActive:{}),fontSize:15,padding:"5px 12px"}}>{d}</button>)}</div></div>
      <div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>📊 Severity: {severity}/10</h3><input type="range" min="1" max="10" value={severity} onChange={e=>setSeverity(parseInt(e.target.value))} style={{width:"100%",marginTop:8}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:16,color:"var(--dim)"}}><span>Mild</span><span>Moderate</span><span>Severe</span></div></div>
      <div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>📝 Additional context</h3><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="When did it start? What makes it better or worse? Any triggers?" rows={3} style={{...S.input,marginTop:8,resize:"vertical"}}/></div>
      <button onClick={analyze} disabled={loading} style={{...S.primaryBtn,width:"100%",marginTop:12,padding:14,opacity:loading?0.6:1}}>{loading?"Analyzing with your full history...":"🔍 Analyze Symptoms"}</button>
    </>}

    {sessions.length>0&&<div style={{...S.card,marginTop:20,padding:16}}><h3 style={S.h3}>📂 Past Checks</h3><div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>{[...sessions].reverse().slice(0,5).map((sess,i)=><button key={i} onClick={()=>setViewing(sess)} style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:"var(--bg)",borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",fontFamily:"var(--body)",width:"100%"}}><div><div style={{fontSize:15,fontWeight:600}}>{sess.area} — {sess.symptoms.slice(0,2).join(", ")}</div><div style={{fontSize:16,color:"var(--dim)",marginTop:2}}>{new Date(sess.date).toLocaleDateString()}</div></div><span style={{color:"var(--dim)"}}>→</span></button>)}</div></div>}
  </div>);
}
