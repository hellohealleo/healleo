import { useState, useRef } from "react";
import { S } from "../styles/theme.js";
import { today } from "../lib/state.js";
import { BODY_AREAS, SYMPTOM_MAP } from "../lib/symptoms.js";
import { RenderMD } from "./ui/RenderMD.jsx";
import { VoiceInput } from "./ui/VoiceInput.jsx";
import { askMedicalAI } from "../lib/ai.js";
import { buildPatientContext } from "../lib/patientContext.js";
import { Icon } from "./ui/Icon.jsx";

export function SymptomChecker({state,update}) {
  const [area,setArea]=useState(null);const [selected,setSelected]=useState([]);const [duration,setDuration]=useState("today");const [severity,setSeverity]=useState(5);const [notes,setNotes]=useState("");const [result,setResult]=useState(null);const [loading,setLoading]=useState(false);const [viewing,setViewing]=useState(null);
  const [customSymptom, setCustomSymptom] = useState("");

  // Photo capture state
  const [photoScanning, setPhotoScanning] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoResult, setPhotoResult] = useState(null);
  const photoRef = useRef(null);

  const sessions=state.symptomSessions||[];const toggle=s=>setSelected(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);

  const addCustom = () => {
    const s = customSymptom.trim();
    if (s && !selected.includes(s)) { setSelected(prev => [...prev, s]); }
    setCustomSymptom("");
  };

  const analyzePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoScanning(true); setPhotoResult(null);

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
      const mediaType = file.type || "image/jpeg";
      const patientCtx = buildPatientContext(state);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: `You are a physician's assistant reviewing a patient photo for symptom documentation. You are NOT diagnosing. You are observing and recommending next steps.

${patientCtx}

${area ? `Patient reports this is in the ${area} area.` : ""}
${selected.length > 0 ? `Associated symptoms: ${selected.join(", ")}` : ""}
${notes ? `Patient notes: ${notes}` : ""}
${severity ? `Severity: ${severity}/10` : ""}

Review this image and provide:

## What I Observe
Describe what you see objectively. Color, size, shape, texture, location, symmetry. Be specific but don't diagnose.

## Context From Your History
Reference any relevant medications (some cause skin reactions), conditions, or previous symptoms that could be related.

## Recommended Action
One of: "Monitor at home", "Schedule a doctor visit within 2 weeks", "See a doctor this week", or "Seek immediate care". Explain why.

## What to Tell Your Doctor
A concise summary the patient can show their doctor, including the relevant history from Healleo.

## Specialist
Which type of specialist to see if applicable (dermatologist, orthopedist, etc.)

Be direct. No hedging stacks. Use contractions. Talk like a knowledgeable friend. This is NOT a diagnosis.` }
          ]}]
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Photo analysis API error:", response.status, data);
        setPhotoResult(`API error (${response.status}): ${data.error?.message || data.message || "Unknown error"}. Check the browser console for details.`);
        setPhotoScanning(false);
        return;
      }
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      if (!text) {
        console.error("Photo analysis returned empty:", data);
        setPhotoResult("The AI returned an empty response. Try a clearer photo.");
        setPhotoScanning(false);
        return;
      }
      setPhotoResult(text);

      // Save to symptom sessions and timeline
      const session = {
        date: new Date().toISOString(),
        area: area || "Visual",
        symptoms: [...selected, "Photo uploaded"],
        duration, severity, notes: notes || "Visual symptom photo",
        result: text,
        hasPhoto: true,
      };
      update(s => {
        s.symptomSessions = [...(s.symptomSessions || []), session];
        s.healthTimeline = [...(s.healthTimeline || []), {
          date: today(), type: "symptom",
          title: `Visual symptom: ${area || "Photo"} ${selected.length > 0 ? "— " + selected.slice(0, 2).join(", ") : ""}`,
          notes: `Photo analyzed, severity ${severity}/10`,
        }];
        if (text.includes("🧠")) {
          const noteMatch = text.match(/🧠\s*(?:Learning Note:?)?\s*(.+)/);
          if (noteMatch) s.aiMemory = [...(s.aiMemory || []), { date: today(), insight: noteMatch[1].trim() }];
        }
      });
    } catch (err) {
      console.error("Photo analysis error:", err);
      setPhotoResult("Unable to analyze the photo: " + (err.message || "Network error") + ". Check the browser console for details.");
    }
    setPhotoScanning(false);
    if (photoRef.current) photoRef.current.value = "";
  };

  const analyze=async()=>{if(!selected.length)return;setLoading(true);
    const prompt=`Patient reports symptoms. Analyze using their FULL history including lab results and past symptoms.\nSYMPTOMS: ${selected.join(", ")} | AREA: ${area || "Not specified"} | DURATION: ${duration} | SEVERITY: ${severity}/10 | NOTES: ${notes||"None"}\n\nProvide:\n## 🔍 Symptom Analysis\n## 📋 Possible Conditions\n## 🏥 When to See a Doctor\n## 🏠 Self-Care\n## 👨‍⚕️ Specialist\nCite sources. Reference relevant lab values if applicable.`;
    const response=await askMedicalAI([{role:"user",content:prompt}],state);
    const session={date:new Date().toISOString(),area:area||"General",symptoms:selected,duration,severity,notes,result:response.text};
    update(s=>{s.symptomSessions=[...(s.symptomSessions||[]),session];s.healthTimeline=[...(s.healthTimeline||[]),{date:today(),type:"symptom",title:`Symptoms: ${selected.slice(0,3).join(", ")}`,notes:`${area||"General"}, severity ${severity}/10, ${duration}`}];if(response.learningNote)s.aiMemory=[...(s.aiMemory||[]),{date:today(),insight:response.learningNote}];});
    setResult(response.text);setLoading(false);};
  const reset=()=>{setArea(null);setSelected([]);setDuration("today");setSeverity(5);setNotes("");setResult(null);setCustomSymptom("");setPhotoResult(null);setPhotoPreview(null);};

  if(viewing)return <div className="fade-up"><button onClick={()=>setViewing(null)} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button><div style={S.card}><div style={{fontSize:14,color:"var(--dim)",fontFamily:"var(--mono)"}}>{new Date(viewing.date).toLocaleDateString()}</div><div style={{display:"flex",flexWrap:"wrap",gap:4,margin:"8px 0"}}>{viewing.symptoms.map(s=><span key={s} style={{...S.chip,...S.chipActive,fontSize:14,padding:"3px 8px"}}>{s}</span>)}</div><RenderMD text={viewing.result}/></div></div>;

  if(result)return <div className="fade-up"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={S.h2}><Icon name="search" size={18}/> Results</h2><button onClick={reset} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)"}}>New</button></div><div style={{display:"flex",flexWrap:"wrap",gap:4,margin:"10px 0"}}>{selected.map(s=><span key={s} style={{fontSize:14,padding:"3px 10px",background:"rgba(107,90,36,0.1)",borderRadius:12,color:"var(--accent)",fontFamily:"var(--mono)"}}>{s}</span>)}</div><div style={{...S.card,marginTop:8}}><RenderMD text={result}/></div></div>;

  if(photoResult)return <div className="fade-up">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={S.h2}><Icon name="camera" size={18}/> Visual Assessment</h2><button onClick={reset} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)"}}>New</button></div>
    {photoPreview && <img src={photoPreview} alt="Symptom photo" style={{width:"100%",maxHeight:240,objectFit:"cover",borderRadius:12,marginTop:10}}/>}
    <div style={{...S.card,marginTop:10}}><RenderMD text={photoResult}/></div>
    <div style={{marginTop:10,padding:"10px 14px",background:"rgba(184,84,84,0.06)",borderRadius:8,border:"1px solid rgba(184,84,84,0.12)"}}>
      <p style={{fontSize:12,color:"var(--danger)",lineHeight:1.5}}>This is NOT a diagnosis. Visual observations are for documentation and to help guide your conversation with a healthcare provider. Always consult a qualified medical professional for any health concerns.</p>
    </div>
  </div>;

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

  return (<div className="fade-up"><h2 style={S.h2}><Icon name="search" size={18}/> Symptom Checker</h2>

    {/* Photo capture */}
    <div style={{...S.card,marginTop:14,padding:16,borderLeft:"3px solid var(--accent3)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h3 style={S.h3}><Icon name="camera" size={16}/> Photo a Symptom</h3>
          <p style={{fontSize:13,color:"var(--dim)",marginTop:2}}>Rash, mole, swelling, injury — snap a photo for AI-assisted observation</p>
        </div>
        <button onClick={()=>photoRef.current?.click()} disabled={photoScanning} style={{...S.primaryBtn,fontSize:14,padding:"8px 14px",opacity:photoScanning?0.6:1}}>{photoScanning?"Analyzing...":"Capture"}</button>
      </div>
      <input ref={photoRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={analyzePhoto}/>
      {photoScanning && <div style={{marginTop:10,textAlign:"center"}}>
        <div style={{display:"flex",gap:4,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--accent3)",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</div>
        <div style={{fontSize:14,color:"var(--dim)",marginTop:6}}>Reviewing image with your health history...</div>
      </div>}
      {photoPreview && !photoScanning && !photoResult && <img src={photoPreview} alt="Preview" style={{width:"100%",maxHeight:160,objectFit:"cover",borderRadius:8,marginTop:10}}/>}
    </div>

    {/* Free-text symptom entry */}
    <div style={{...S.card,marginTop:10,padding:16}}>
      <h3 style={S.h3}><Icon name="edit" size={16}/> Describe your symptoms</h3>
      <p style={{fontSize:14,color:"var(--dim)",marginTop:4}}>Type any symptom in your own words, or pick from common options below</p>
      <div style={{display:"flex",gap:6,marginTop:8}}>
        <VoiceInput value={customSymptom} onChange={e=>setCustomSymptom(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addCustom();}}
          placeholder="e.g. sharp pain behind left eye, tingling in fingers..." style={{...S.input,flex:1}} />
        <button onClick={addCustom} disabled={!customSymptom.trim()} style={{...S.primaryBtn,fontSize:15,padding:"8px 14px",opacity:customSymptom.trim()?1:0.5}}>Add</button>
      </div>
    </div>

    {selectedBar}

    {/* Body area selector */}
    {!area ? <div style={{...S.card,marginTop:10,padding:20}}>
      <h3 style={S.h3}><Icon name="location" size={16}/> Body area <span style={{fontWeight:400,color:"var(--dim)"}}>(optional)</span></h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
        {BODY_AREAS.map(a=><button key={a} onClick={()=>setArea(a)} style={{padding:"12px 10px",background:"var(--bg)",border:"1.5px solid var(--muted)",borderRadius:10,fontSize:15,cursor:"pointer",textAlign:"left",fontFamily:"var(--body)"}}>{a}</button>)}
      </div>
    </div>
    : <div style={{...S.card,marginTop:10,padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><h3 style={S.h3}><Icon name="location" size={16}/> {area}</h3><button onClick={()=>setArea(null)} style={{fontSize:14,color:"var(--accent)",background:"none",border:"none",cursor:"pointer"}}>Change</button></div>
        <p style={{fontSize:14,color:"var(--dim)",margin:"6px 0 8px"}}>Common symptoms for this area:</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {(SYMPTOM_MAP[area]||[]).map(s=><button key={s} onClick={()=>toggle(s)} style={{...S.chip,...(selected.includes(s)?S.chipActive:{}),fontSize:14,padding:"5px 10px"}}>{selected.includes(s)?"✓ ":""}{s}</button>)}
        </div>
      </div>}

    {/* Duration / Severity / Notes / Analyze — shown when symptoms selected */}
    {selected.length>0&&<>
      <div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>Duration</h3><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>{["today","2-3 days","1 week","2+ weeks","1+ month","chronic"].map(d=><button key={d} onClick={()=>setDuration(d)} style={{...S.chip,...(duration===d?S.chipActive:{}),fontSize:15,padding:"5px 12px"}}>{d}</button>)}</div></div>
      <div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>Severity: {severity}/10</h3><input type="range" min="1" max="10" value={severity} onChange={e=>setSeverity(parseInt(e.target.value))} style={{width:"100%",marginTop:8}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:16,color:"var(--dim)"}}><span>Mild</span><span>Moderate</span><span>Severe</span></div></div>
      <div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}><Icon name="edit" size={16}/> Additional context</h3><VoiceInput multiline rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="When did it start? What makes it better or worse? Any triggers?" style={{...S.input,marginTop:8,resize:"vertical"}}/></div>
      <button onClick={analyze} disabled={loading} style={{...S.primaryBtn,width:"100%",marginTop:12,padding:14,opacity:loading?0.6:1}}>{loading?"Analyzing with your full history...":"Analyze Symptoms"}</button>
    </>}

    {sessions.length>0&&<div style={{...S.card,marginTop:20,padding:16}}><h3 style={S.h3}><Icon name="summary" size={16}/> Past Checks</h3><div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>{[...sessions].reverse().slice(0,5).map((sess,i)=><button key={i} onClick={()=>setViewing(sess)} style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:"var(--bg)",borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",fontFamily:"var(--body)",width:"100%"}}><div><div style={{fontSize:15,fontWeight:600}}>{sess.hasPhoto?"📸 ":""}{sess.area} — {sess.symptoms.slice(0,2).join(", ")}</div><div style={{fontSize:16,color:"var(--dim)",marginTop:2}}>{new Date(sess.date).toLocaleDateString()}</div></div><span style={{color:"var(--dim)"}}>→</span></button>)}</div></div>}
  </div>);
}
