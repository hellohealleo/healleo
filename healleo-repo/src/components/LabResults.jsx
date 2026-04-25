import { useState, useRef } from "react";
import { S } from "../styles/theme.js";
import { today } from "../lib/state.js";
import { LAB_CATEGORIES, LAB_RANGES, getLabFlag } from "../lib/labs.js";
import { RenderMD } from "./ui/RenderMD.jsx";
import { Icon } from "./ui/Icon.jsx";

export function LabResults({state,update}) {
  const [mode,setMode]=useState("view"); // view, add, upload, detail
  const [selCat,setSelCat]=useState(null);
  const [labDate,setLabDate]=useState(today());
  const [labName,setLabName]=useState("");
  const [entries,setEntries]=useState([]);
  const [uploadText,setUploadText]=useState("");
  const [parsing,setParsing]=useState(false);
  const [viewing,setViewing]=useState(null);
  const [aiAnalysis,setAiAnalysis]=useState(null);
  const [analyzing,setAnalyzing]=useState(false);
  const pdfInputRef = useRef(null);
  const labs = state.labResults || [];

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 2000,
          messages: [{ role: "user", content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            { type: "text", text: "Extract ALL lab test results from this PDF. Return ONLY a JSON array of objects with \"name\", \"value\", \"unit\" fields. Use standard medical test names. Include every numeric result you find. No other text." }
          ]}]
        })
      });
      const data = await response.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const match = text.replace(/```json?|```/g, "").trim().match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const withFlags = parsed.map(r => ({ ...r, value: String(r.value), flag: getLabFlag(r.name, r.value) }));
        setEntries(withFlags);
        setLabName(file.name.replace(/\.pdf$/i, ""));
        setMode("add");
      }
    } catch (err) { console.error("PDF parse error:", err); }
    setParsing(false);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const addEntry = (testName) => {
    if (!entries.find(e=>e.name===testName)) {
      const range = LAB_RANGES[testName];
      setEntries([...entries, { name: testName, value: "", unit: range?.unit || "" }]);
    }
  };

  const updateEntry = (idx, val) => {
    const updated = [...entries];
    updated[idx].value = val;
    const flag = getLabFlag(updated[idx].name, val);
    updated[idx].flag = flag;
    setEntries(updated);
  };

  const saveResults = () => {
    const valid = entries.filter(e => e.value !== "");
    if (valid.length === 0) return;
    const result = { date: labDate, id: Date.now().toString(), results: valid, name: labName || selCat?.name || "Lab Results" };
    update(s => {
      s.labResults = [...(s.labResults||[]), result];
      s.healthTimeline = [...(s.healthTimeline||[]), { date: labDate, type: "lab", title: `Lab: ${result.name}`, notes: `${valid.length} tests recorded. ${valid.filter(v=>v.flag&&v.flag!=="NORMAL").map(v=>`${v.name}: ${v.value} ${v.unit} [${v.flag}]`).join(", ")}` }];
    });
    setEntries([]); setSelCat(null); setLabName(""); setMode("view");
  };

  const parseUpload = async () => {
    if (!uploadText.trim()) return;
    setParsing(true);
    const response = await askMedicalAI([{ role: "user", content: `Extract lab test results from this text. Return ONLY a JSON array of objects with "name", "value", "unit" fields. Be precise with test names matching standard medical terminology. Text:\n\n${uploadText}` }], state, { labContext: "parsing uploaded lab results" });
    try {
      const jsonStr = response.text.replace(/```json?|```/g, "").trim();
      const match = jsonStr.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const withFlags = parsed.map(r => ({ ...r, flag: getLabFlag(r.name, r.value) }));
        setEntries(withFlags);
        setMode("add");
      }
    } catch(e) { /* parsing failed, show raw */ }
    setParsing(false);
  };

  const analyzeResults = async (labResult) => {
    setAnalyzing(true);
    const labContext = labResult.results.map(r => `${r.name}: ${r.value} ${r.unit} ${r.flag ? `[${r.flag}]` : ""}`).join("\n");
    const response = await askMedicalAI([{ role: "user", content: `Please analyze these lab results in detail. Identify any abnormalities, explain what they mean for this patient given their full history, suggest follow-up tests if needed, and provide actionable recommendations.\n\nLab Date: ${labResult.date}\n${labContext}` }], state, { labContext });
    setAiAnalysis(response.text);
    if (response.learningNote) {
      update(s => { s.aiMemory = [...(s.aiMemory||[]), { date: today(), insight: response.learningNote }]; });
    }
    setAnalyzing(false);
  };

  if (viewing) {
    const flagged = viewing.results.filter(r=>r.flag&&r.flag!=="NORMAL");
    return <div className="fade-up">
      <button onClick={()=>{setViewing(null);setAiAnalysis(null);}} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
      <h2 style={S.h2}>🧪 {viewing.name}</h2>
      <div style={{fontSize:15,color:"var(--dim)",marginTop:2,fontFamily:"var(--mono)"}}>{viewing.date}</div>
      {flagged.length>0&&<div style={{...S.card,marginTop:12,padding:14,borderLeft:"3px solid var(--danger)",background:"rgba(184,84,84,0.06)"}}><div style={{fontWeight:600,fontSize:16,color:"var(--danger)"}}>⚠️ {flagged.length} abnormal result{flagged.length>1?"s":""}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:4}}>{flagged.map(f=>`${f.name}: ${f.value} ${f.unit} [${f.flag}]`).join(" · ")}</div></div>}
      <div style={{...S.card,marginTop:12,padding:0}}>
        {viewing.results.map((r,i) => {
          const range = LAB_RANGES[r.name];
          const flagColor = r.flag==="HIGH"||r.flag==="CRITICAL HIGH"?"var(--danger)":r.flag==="LOW"||r.flag==="CRITICAL LOW"?"var(--accent3)":"var(--success)";
          return <div key={i} style={{padding:"12px 16px",borderBottom:i<viewing.results.length-1?"1px solid var(--muted)":"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:16,fontWeight:500}}>{r.name}</div>{range&&<div style={{fontSize:16,color:"var(--dim)"}}>Normal: {range.low}–{range.high < 900 ? range.high : "—"} {range.unit}</div>}</div>
            <div style={{textAlign:"right"}}><span style={{fontFamily:"var(--mono)",fontSize:14,fontWeight:600}}>{r.value}</span><span style={{fontSize:14,color:"var(--dim)",marginLeft:4}}>{r.unit}</span>{r.flag&&<div style={{fontSize:15,fontFamily:"var(--mono)",color:flagColor,fontWeight:600}}>{r.flag}</div>}</div>
          </div>;
        })}
      </div>
      <button onClick={()=>analyzeResults(viewing)} disabled={analyzing} style={{...S.primaryBtn,width:"100%",marginTop:12,padding:14,opacity:analyzing?0.6:1}}>{analyzing?"🧠 Analyzing with your full history...":<><Icon name="doctor" size={28}/> AI Analysis of These Results</>}</button>
      {aiAnalysis&&<div style={{...S.card,marginTop:12}}><RenderMD text={aiAnalysis}/></div>}
    </div>;
  }

  if (mode==="upload") {
    return <div className="fade-up">
      <button onClick={()=>setMode("view")} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
      <h2 style={S.h2}>📄 Upload Test Results</h2>
      <p style={{fontSize:15,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>Paste your lab report text below — or type/copy results from a PDF, photo, or patient portal. The AI will extract the values automatically.</p>
      <textarea value={uploadText} onChange={e=>setUploadText(e.target.value)} placeholder={"Paste lab results here, e.g.:\n\nGlucose, Fasting: 95 mg/dL\nHemoglobin A1c: 5.4%\nTSH: 2.1 mIU/L\nVitamin D: 28 ng/mL\nTotal Cholesterol: 210 mg/dL\nLDL: 130 mg/dL\nHDL: 55 mg/dL\n\nOr paste the entire lab report text..."} rows={12} style={{...S.input,marginTop:12,resize:"vertical",fontFamily:"var(--mono)",fontSize:15}}/>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={parseUpload} disabled={parsing||!uploadText.trim()} style={{...S.primaryBtn,flex:1,opacity:parsing?0.6:1}}>{parsing?"🔍 Parsing results...":"🧪 Extract Lab Values"}</button>
      </div>
      <div style={{...S.card,marginTop:16,padding:14,borderLeft:"3px solid var(--accent3)"}}>
        <h3 style={S.h3}>💡 Tips</h3>
        <p style={{fontSize:14,color:"var(--dim)",lineHeight:1.6,marginTop:4}}>Works best with structured text from patient portals (MyChart, LabCorp, Quest). You can also manually type values. The AI will match test names to standard references and flag abnormals.</p>
      </div>
    </div>;
  }

  if (mode==="add") {
    return <div className="fade-up">
      <button onClick={()=>{setMode("view");setEntries([]);setSelCat(null);}} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
      <h2 style={S.h2}>➕ Add Lab Results</h2>
      <div style={{display:"flex",gap:8,marginTop:12}}><label style={{...S.label,flex:1}}>Date<input type="date" value={labDate} onChange={e=>setLabDate(e.target.value)} style={S.input}/></label><label style={{...S.label,flex:1}}>Label<input value={labName} onChange={e=>setLabName(e.target.value)} placeholder="e.g. Annual Physical" style={S.input}/></label></div>

      {!selCat && entries.length===0 && <div style={{...S.card,marginTop:14,padding:16}}><h3 style={S.h3}>Select test category:</h3><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:10}}>
        {LAB_CATEGORIES.map(cat=><button key={cat.name} onClick={()=>setSelCat(cat)} style={{padding:"10px",background:"var(--bg)",border:"1.5px solid var(--muted)",borderRadius:8,fontSize:15,textAlign:"left",cursor:"pointer",fontFamily:"var(--body)"}}>{cat.name}</button>)}
      </div></div>}

      {selCat && <div style={{...S.card,marginTop:12,padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={S.h3}>{selCat.name}</h3><button onClick={()=>setSelCat(null)} style={{fontSize:14,color:"var(--accent)",background:"none",border:"none",cursor:"pointer"}}>Change</button></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>{selCat.tests.map(t=><button key={t} onClick={()=>addEntry(t)} style={{...S.chip,...(entries.find(e=>e.name===t)?S.chipActive:{}),fontSize:14,padding:"4px 10px"}}>{entries.find(e=>e.name===t)?"✓ ":""}{t}</button>)}</div>
      </div>}

      {entries.length>0&&<div style={{...S.card,marginTop:12,padding:16}}>
        <h3 style={S.h3}>Enter values ({entries.length} tests)</h3>
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
          {entries.map((e,i)=>{
            const range=LAB_RANGES[e.name];
            const flagColor=e.flag==="HIGH"||e.flag==="CRITICAL HIGH"?"var(--danger)":e.flag==="LOW"||e.flag==="CRITICAL LOW"?"var(--accent3)":e.flag==="NORMAL"?"var(--success)":"var(--dim)";
            return <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.name}</div>{range&&<div style={{fontSize:15,color:"var(--dim)"}}>Ref: {range.low}–{range.high<900?range.high:"—"} {range.unit}</div>}</div>
              <input type="number" value={e.value} onChange={ev=>updateEntry(i,ev.target.value)} placeholder="Value" style={{...S.input,width:80,textAlign:"right"}} step="any"/>
              <span style={{fontSize:16,color:"var(--dim)",minWidth:36}}>{e.unit}</span>
              {e.flag&&<span style={{fontSize:15,fontFamily:"var(--mono)",color:flagColor,fontWeight:600,minWidth:40}}>{e.flag}</span>}
              <button onClick={()=>setEntries(entries.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"var(--danger)",fontSize:16}}>✕</button>
            </div>;
          })}
        </div>
        <button onClick={saveResults} style={{...S.primaryBtn,width:"100%",marginTop:14}}>💾 Save Lab Results</button>
      </div>}
    </div>;
  }

  // VIEW MODE
  const sortedLabs = [...labs].sort((a,b)=>b.date.localeCompare(a.date));
  const flaggedCount = labs.reduce((s,lr)=>s+lr.results.filter(r=>r.flag&&r.flag!=="NORMAL").length, 0);

  return <div className="fade-up">
    <h2 style={S.h2}>🧪 Lab Results & Test Data</h2>
    <p style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Upload results to train your AI health concierge</p>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginTop:14}}>
      <button onClick={()=>setMode("add")} className="card" style={{...S.card,padding:"14px 8px",textAlign:"center",border:"none",cursor:"pointer"}}><div style={{fontSize:22}}>➕</div><div style={{fontSize:16,fontWeight:600,marginTop:4,color:"var(--accent)"}}>Manual</div></button>
      <button onClick={()=>setMode("upload")} className="card" style={{...S.card,padding:"14px 8px",textAlign:"center",border:"none",cursor:"pointer"}}><div style={{fontSize:22}}>📄</div><div style={{fontSize:16,fontWeight:600,marginTop:4,color:"var(--accent)"}}>Paste</div></button>
      <button onClick={()=>pdfInputRef.current?.click()} className="card" style={{...S.card,padding:"14px 8px",textAlign:"center",border:"none",cursor:"pointer"}}><div style={{fontSize:22}}>📎</div><div style={{fontSize:16,fontWeight:600,marginTop:4,color:"var(--accent)"}}>Upload PDF</div></button>
      <div className="card" style={{...S.card,padding:"14px 8px",textAlign:"center"}}><div style={{fontFamily:"var(--display)",fontSize:22,fontWeight:600,color:"var(--text)"}}>{labs.length}</div><div style={{fontSize:16,color:"var(--dim)",marginTop:2}}>Reports{flaggedCount>0&&<span style={{color:"var(--danger)"}}> · {flaggedCount} flags</span>}</div></div>
    </div>
    <input ref={pdfInputRef} type="file" accept=".pdf" style={{display:"none"}} onChange={handlePdfUpload}/>

    {parsing&&<div style={{...S.card,marginTop:12,padding:16,textAlign:"center"}}><div style={{display:"flex",gap:4,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--accent)",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:8}}>Extracting lab values from PDF...</div></div>}

    {labs.length>0&&<div style={{...S.card,marginTop:12,padding:14,borderLeft:"3px solid var(--accent3)",background:"rgba(179,148,167,0.04)"}}>
      <div style={{fontSize:15,color:"var(--dim)"}}>🧠 <strong>AI Learning:</strong> Your {labs.length} lab report{labs.length>1?"s":""} with {labs.reduce((s,lr)=>s+lr.results.length,0)} total test values are being used to personalize every AI response. The more data you add, the smarter your health concierge becomes.</div>
    </div>}

    <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
      {sortedLabs.map(lr=>{
        const flagged=lr.results.filter(r=>r.flag&&r.flag!=="NORMAL");
        return <button key={lr.id} onClick={()=>setViewing(lr)} className="card" style={{...S.card,padding:14,border:"none",cursor:"pointer",textAlign:"left",width:"100%"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:16,fontWeight:600}}>{lr.name}</div><div style={{fontSize:14,color:"var(--dim)",marginTop:2,fontFamily:"var(--mono)"}}>{lr.date} · {lr.results.length} tests</div></div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {flagged.length>0&&<span style={{fontSize:16,padding:"2px 8px",background:"rgba(184,84,84,0.08)",borderRadius:10,color:"var(--danger)",fontWeight:600}}>{flagged.length} flag{flagged.length>1?"s":""}</span>}
              <span style={{color:"var(--dim)"}}>→</span>
            </div>
          </div>
        </button>;
      })}
    </div>
    {labs.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:"var(--dim)"}}><div style={{fontSize:40,marginBottom:10}}>🧪</div><p style={{fontSize:16}}>No lab results yet. Add your first report to start building your health profile.</p></div>}
  </div>;
}
