import { useState, useRef } from "react";
import { S } from "../styles/theme.js";
import { today } from "../lib/state.js";

export function HealthTimeline({state,update}) {
  const [adding,setAdding]=useState(false);
  const [newEvent,setNewEvent]=useState({date:today(),type:"visit",title:"",notes:""});
  const [pdfParsing,setPdfParsing]=useState(false);
  const pdfRef = useRef(null);
  const timeline = [...(state.healthTimeline||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const eventTypes = [{v:"visit",l:"🏥 Doctor Visit"},{v:"diagnosis",l:"📋 Diagnosis"},{v:"medication",l:"💊 Medication Change"},{v:"procedure",l:"🔧 Procedure"},{v:"vaccination",l:"💉 Vaccination"},{v:"lab",l:"🧪 Lab Results"},{v:"symptom",l:"🔍 Symptom Event"},{v:"lifestyle",l:"🌿 Lifestyle Change"},{v:"note",l:"📝 General Note"}];
  const typeColors = {visit:"var(--accent3)",diagnosis:"var(--accent4)",medication:"var(--accent2)",procedure:"var(--accent)",lab:"var(--accent3)",symptom:"var(--danger)",vaccination:"var(--success)",lifestyle:"var(--accent)",note:"var(--dim)"};

  const handleVisitPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfParsing(true);
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 2000,
          messages: [{ role: "user", content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            { type: "text", text: `Extract medical visit information from this document. Return ONLY a JSON object with these fields:
{
  "events": [{"date":"YYYY-MM-DD","type":"visit|diagnosis|medication|procedure|vaccination|lab|note","title":"short title","notes":"key details, findings, recommendations"}],
  "medications_mentioned": "comma-separated list or empty",
  "diagnoses_mentioned": "comma-separated list or empty",
  "follow_up": "any follow-up instructions"
}
Use today's date ${today()} if no date is found. Extract ALL distinct events (diagnoses, medications prescribed, procedures done, vaccinations given, etc.) as separate entries.` }
          ]}]
        })
      });
      const data = await response.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const jsonStr = text.replace(/```json?|```/g, "").trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.events?.length) {
          update(s => {
            for (const ev of parsed.events) {
              s.healthTimeline = [...(s.healthTimeline||[]), { date: ev.date || today(), type: ev.type || "visit", title: ev.title, notes: ev.notes + (parsed.follow_up ? `\n\nFollow-up: ${parsed.follow_up}` : "") }];
            }
          });
        }
      }
    } catch (err) { console.error("Visit PDF parse error:", err); }
    setPdfParsing(false);
    if (pdfRef.current) pdfRef.current.value = "";
  };

  const save = () => {
    if (!newEvent.title.trim()) return;
    update(s => { s.healthTimeline = [...(s.healthTimeline||[]), {...newEvent}]; });
    setNewEvent({date:today(),type:"visit",title:"",notes:""});
    setAdding(false);
  };

  return <div className="fade-up">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h2 style={S.h2}>📋 Health Timeline</h2><p style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Your complete medical history feeds the AI</p></div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>pdfRef.current?.click()} style={{...S.smallBtn,background:"var(--accent3)",color:"#fff"}}>📎 PDF</button>
        <button onClick={()=>setAdding(!adding)} style={S.smallBtn}>{adding?"Cancel":"+ Add"}</button>
      </div>
    </div>
    <input ref={pdfRef} type="file" accept=".pdf" style={{display:"none"}} onChange={handleVisitPdf}/>
    {pdfParsing&&<div style={{...S.card,marginTop:12,padding:16,textAlign:"center"}}><div style={{display:"flex",gap:4,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--accent3)",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:8}}>Extracting visit details from PDF...</div></div>}

    {adding&&<div style={{...S.card,marginTop:14,padding:18}}>
      <div style={{display:"flex",gap:8}}><label style={{...S.label,flex:1}}>Date<input type="date" value={newEvent.date} onChange={e=>setNewEvent({...newEvent,date:e.target.value})} style={S.input}/></label>
        <label style={{...S.label,flex:1}}>Type<select value={newEvent.type} onChange={e=>setNewEvent({...newEvent,type:e.target.value})} style={S.input}>{eventTypes.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}</select></label></div>
      <label style={{...S.label,marginTop:10}}>Title<input value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} placeholder="e.g. Annual physical with Dr. Smith" style={S.input}/></label>
      <label style={{...S.label,marginTop:10}}>Notes<textarea value={newEvent.notes} onChange={e=>setNewEvent({...newEvent,notes:e.target.value})} placeholder="Details, results, recommendations..." rows={3} style={{...S.input,resize:"vertical"}}/></label>
      <button onClick={save} style={{...S.primaryBtn,marginTop:12,width:"100%"}}>Save Event</button>
    </div>}

    {state.aiMemory?.length>0&&<div style={{...S.card,marginTop:14,padding:16,borderLeft:"3px solid var(--accent3)"}}>
      <h3 style={S.h3}>🧠 AI Memory ({state.aiMemory.length} observations)</h3>
      <p style={{fontSize:14,color:"var(--dim)",marginTop:4}}>Patterns and insights learned from your health data:</p>
      <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
        {state.aiMemory.slice(-5).reverse().map((m,i)=><div key={i} style={{padding:"8px 10px",background:"rgba(179,148,167,0.06)",borderRadius:6,fontSize:14,color:"var(--text)",lineHeight:1.5}}><span style={{fontFamily:"var(--mono)",color:"var(--dim)",fontSize:16}}>{m.date}</span> {m.insight}</div>)}
      </div>
      {state.aiMemory.length>5&&<div style={{fontSize:16,color:"var(--dim)",marginTop:6}}>+ {state.aiMemory.length-5} more observations</div>}
    </div>}

    <div style={{marginTop:14,position:"relative",paddingLeft:20}}>
      <div style={{position:"absolute",left:7,top:0,bottom:0,width:2,background:"var(--muted)"}}/>
      {timeline.map((e,i)=><div key={i} style={{marginBottom:14,position:"relative"}}>
        <div style={{position:"absolute",left:-16,top:6,width:10,height:10,borderRadius:"50%",background:typeColors[e.type]||"var(--dim)",border:"2px solid var(--card)"}}/>
        <div style={{...S.card,padding:12,marginLeft:4}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:15,fontWeight:600}}>{e.title}</span>
            <span style={{fontSize:16,fontFamily:"var(--mono)",color:"var(--dim)"}}>{e.date}</span>
          </div>
          <div style={{display:"flex",gap:6,marginTop:4}}>
            <span style={{fontSize:15,padding:"1px 6px",background:typeColors[e.type]||"var(--muted)",color:"#fff",borderRadius:4}}>{e.type}</span>
          </div>
          {e.notes&&<p style={{fontSize:14,color:"var(--dim)",marginTop:6,lineHeight:1.5}}>{e.notes}</p>}
          <button onClick={()=>update(s=>{s.healthTimeline=s.healthTimeline.filter(x=>x!==e);})} style={{fontSize:16,color:"var(--danger)",background:"none",border:"none",cursor:"pointer",marginTop:4}}>Remove</button>
        </div>
      </div>)}
      {timeline.length===0&&<div style={{textAlign:"center",padding:"30px",color:"var(--dim)"}}><p style={{fontSize:16}}>No events yet. Add doctor visits, diagnoses, and health events to build your medical history.</p></div>}
    </div>
  </div>;
}
