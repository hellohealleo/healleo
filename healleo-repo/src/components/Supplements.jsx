import { useState, useRef } from "react";
import { SUPPLEMENT_DB } from "../lib/profile.js";
import { S } from "../styles/theme.js";

export function Supplements({log,updateLog,profile}){
  const taken=log.supplements||[];
  const [scanning,setScanning]=useState(false);
  const [scanResult,setScanResult]=useState(null);
  const camRef=useRef(null);

  const scanSupplement = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true); setScanResult(null);
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
      const mediaType = file.type || "image/jpeg";
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: `This is a photo of a supplement bottle/label. Extract the supplement information and return ONLY a JSON object:
{
  "name": "Primary supplement name (e.g. 'Vitamin D3')",
  "brand": "Brand name if visible",
  "dose": "Dosage per serving (e.g. '5000 IU', '500mg')",
  "servings_per_container": number or null,
  "ingredients": ["list of key active ingredients"],
  "directions": "Usage directions if visible",
  "warnings": "Any warnings if visible",
  "supplement_facts": [{"name":"ingredient","amount":"dose per serving"}]
}
Be precise with the supplement name — use the standard supplement name (e.g. "Vitamin D3" not "cholecalciferol" unless it's a specialty product).` }
          ]}]
        })
      });
      const data = await response.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const jsonStr = text.replace(/```json?|```/g, "").trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setScanResult(parsed);
        // Auto-add to today's log
        if (parsed.name && !taken.includes(parsed.name)) {
          updateLog(l => l.supplements = [...(l.supplements||[]), parsed.name]);
        }
      }
    } catch (err) { setScanResult({ error: "Couldn't read the label. Try a clearer photo with good lighting." }); }
    setScanning(false);
    if (camRef.current) camRef.current.value = "";
  };

  const rec=[...new Map(SUPPLEMENT_DB.filter(s=>{const g=profile.goals;return(g.includes("Build Muscle")&&["Creatine","Vitamin D3","Omega-3 Fish Oil","Magnesium Glycinate"].includes(s.name))||(g.includes("Better Sleep")&&["Magnesium Glycinate","Ashwagandha"].includes(s.name))||(g.includes("Improve Energy")&&["Vitamin B Complex","Iron","CoQ10","Vitamin D3"].includes(s.name))||(g.includes("Heart Health")&&["Omega-3 Fish Oil","CoQ10","Magnesium Glycinate"].includes(s.name))||(g.includes("Gut Health")&&["Probiotics","Collagen"].includes(s.name))||(g.includes("Longevity")&&["Omega-3 Fish Oil","Vitamin D3","CoQ10","Magnesium Glycinate"].includes(s.name));}).map(s=>[s.name,s])).values()];
  
  return <div className="fade-up"><h2 style={S.h2}>💊 Supplements</h2>

  {/* Camera scan */}
  <div style={{...S.card,marginTop:14,padding:16,borderLeft:"3px solid var(--accent2)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h3 style={S.h3}>📸 Scan Supplement Bottle</h3><p style={{fontSize:14,color:"var(--dim)",marginTop:2}}>Take a photo of the label to auto-log</p></div>
      <button onClick={()=>camRef.current?.click()} disabled={scanning} style={{...S.primaryBtn,fontSize:14,padding:"8px 14px",opacity:scanning?0.6:1}}>{scanning?"Scanning...":"📷 Scan"}</button>
    </div>
    <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={scanSupplement}/>
    {scanning&&<div style={{marginTop:10,textAlign:"center"}}><div style={{display:"flex",gap:4,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--accent2)",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</div><div style={{fontSize:14,color:"var(--dim)",marginTop:6}}>Reading supplement label...</div></div>}
    {scanResult&&!scanResult.error&&<div style={{marginTop:10,padding:12,background:"rgba(107,90,36,0.07)",borderRadius:8,border:"1px solid rgba(107,90,36,0.15)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontWeight:600,fontSize:16,color:"var(--success)"}}>✓ {scanResult.name}</span>{scanResult.brand&&<span style={{fontSize:16,color:"var(--dim)"}}>{scanResult.brand}</span>}</div>
      {scanResult.dose&&<div style={{fontSize:14,color:"var(--text)",marginTop:4}}>Dose: <strong>{scanResult.dose}</strong></div>}
      {scanResult.directions&&<div style={{fontSize:16,color:"var(--dim)",marginTop:4,lineHeight:1.4}}>📋 {scanResult.directions}</div>}
      {scanResult.supplement_facts?.length>0&&<div style={{marginTop:6}}><div style={{fontSize:16,fontWeight:600,color:"var(--dim)"}}>Active ingredients:</div>{scanResult.supplement_facts.slice(0,6).map((f,i)=><div key={i} style={{fontSize:16,color:"var(--dim)",marginTop:1}}>{f.name}: {f.amount}</div>)}</div>}
      {scanResult.warnings&&<div style={{fontSize:15,color:"var(--accent4)",marginTop:6}}>⚠️ {scanResult.warnings.slice(0,120)}</div>}
    </div>}
    {scanResult?.error&&<div style={{marginTop:8,fontSize:14,color:"var(--danger)"}}>{scanResult.error}</div>}
  </div>

  <div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>Today</h3><div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>{SUPPLEMENT_DB.map(s=><button key={s.name} onClick={()=>updateLog(l=>{if(l.supplements.includes(s.name))l.supplements=l.supplements.filter(x=>x!==s.name);else l.supplements=[...l.supplements,s.name];})} style={{...S.chip,...(taken.includes(s.name)?S.chipActive:{}),fontSize:14,padding:"5px 10px"}}>{taken.includes(s.name)?"✓ ":""}{s.name}</button>)}</div></div>{rec.length>0&&<div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>🎯 Recommended</h3><div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>{rec.map(s=><div key={s.name} style={{padding:"8px 10px",background:"var(--bg)",borderRadius:6}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:600,fontSize:15}}>{s.name}</span><span style={{fontFamily:"var(--mono)",fontSize:16,color:"var(--accent)"}}>{s.dose}</span></div><div style={{fontSize:16,color:"var(--dim)",marginTop:2}}>{s.benefit}</div></div>)}</div></div>}</div>;}
