import { useState, useEffect, useRef } from "react";
import { S } from "../styles/theme.js";
import { today } from "../lib/state.js";
import { RenderMD } from "./ui/RenderMD.jsx";
import { askMedicalAI } from "../lib/ai.js";

export function AskDoctor({state,update}) {
  const [input,setInput]=useState("");const [loading,setLoading]=useState(false);const chatEnd=useRef(null);
  const msgs=state.chatHistory||[];
  const STARTERS=["Walk me through my latest lab results — what should I actually worry about?","I keep getting these headaches. Given my history, what's going on?","Based on everything you know about me, what screenings am I overdue for?","Are any of my medications fighting each other?","How do my health trends look — am I heading in the right direction?","What's the one thing I should change right now to feel better?"];
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[msgs.length,loading]);

  const send=async(text)=>{const q=text||input.trim();if(!q||loading)return;setInput("");
    const newMsgs=[...msgs,{role:"user",content:q}];
    update(s=>{s.chatHistory=newMsgs;});setLoading(true);
    const apiMsgs=newMsgs.slice(-12).map(m=>({role:m.role,content:m.content}));
    const response=await askMedicalAI(apiMsgs,state);
    update(s=>{
      s.chatHistory=[...newMsgs,{role:"assistant",content:response.text}];
      if(response.learningNote){s.aiMemory=[...(s.aiMemory||[]),{date:today(),insight:response.learningNote}];}
    });setLoading(false);};

  const dataPoints = (state.labResults?.reduce((s,lr)=>s+lr.results.length,0)||0) + (state.symptomSessions?.length||0) + (state.healthTimeline?.length||0) + (state.logs?.length||0);

  return(<div className="fade-up">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h2 style={S.h2}>🩺 Dr. Healleo</h2><p style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Your data, {dataPoints} points deep</p></div>
      {msgs.length>0&&<button onClick={()=>update(s=>{s.chatHistory=[];})} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",fontSize:14}}>Clear</button>}
    </div>
    {dataPoints>0&&<div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
      {state.labResults?.length>0&&<span style={{fontSize:16,padding:"3px 8px",background:"rgba(138,122,74,0.1)",borderRadius:10,color:"var(--accent)"}}>🧪 {state.labResults.length} lab reports</span>}
      {state.symptomSessions?.length>0&&<span style={{fontSize:16,padding:"3px 8px",background:"rgba(196,122,98,0.1)",borderRadius:10,color:"var(--accent4)"}}>🔍 {state.symptomSessions.length} symptom checks</span>}
      {state.aiMemory?.length>0&&<span style={{fontSize:16,padding:"3px 8px",background:"rgba(122,155,181,0.1)",borderRadius:10,color:"var(--accent3)"}}>🧠 {state.aiMemory.length} learned insights</span>}
    </div>}
    <div style={{...S.card,marginTop:12,padding:0,minHeight:400,maxHeight:"62vh",display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,overflow:"auto",padding:16}}>
        {msgs.length===0&&!loading&&<div style={{textAlign:"center",padding:"24px 10px"}}><div style={{fontSize:40,marginBottom:10}}>🩺</div><p style={{fontFamily:"var(--display)",fontSize:16,fontWeight:500}}>Hey — I've been going through your chart.</p><p style={{fontSize:15,color:"var(--dim)",margin:"6px 0 16px",lineHeight:1.5}}>I have your labs, symptoms, meds, lifestyle data — the whole picture. Ask me anything. The more you share, the better I get at connecting the dots for you.</p>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>{STARTERS.map(s=><button key={s} onClick={()=>send(s)} style={{padding:"10px 14px",background:"var(--bg)",border:"1px solid var(--muted)",borderRadius:10,fontSize:15,color:"var(--text)",cursor:"pointer",textAlign:"left",fontFamily:"var(--body)"}} onMouseEnter={e=>e.target.style.borderColor="var(--accent)"} onMouseLeave={e=>e.target.style.borderColor="var(--muted)"}>💬 {s}</button>)}</div></div>}
        {msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:12}}><div style={{maxWidth:"88%",padding:"12px 16px",borderRadius:14,background:m.role==="user"?"var(--accent)":"var(--bg)",color:m.role==="user"?"#fff":"var(--text)",...(m.role==="user"?{borderBottomRightRadius:4}:{borderBottomLeftRadius:4})}}>{m.role==="user"?<p style={{fontSize:16,lineHeight:1.5}}>{m.content}</p>:<RenderMD text={m.content}/>}</div></div>)}
        {loading&&<div style={{padding:"12px 0"}}><div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--accent)",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</div><span style={{fontSize:15,color:"var(--dim)"}}>Searching PubMed, FDA & web...</span></div><div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>{["📄 PubMed","🏛️ OpenFDA","🔍 Web Search","🧠 AI Analysis"].map(s=><span key={s} style={{fontSize:15,padding:"2px 6px",background:"var(--bg)",borderRadius:6,color:"var(--dim)",animation:"pulse 2s ease infinite"}}>{s}</span>)}</div></div>}
        <div ref={chatEnd}/>
      </div>
      <div style={{padding:"10px 14px",borderTop:"1px solid var(--muted)",display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about your health, labs, symptoms..." disabled={loading} style={{...S.input,flex:1,border:"none",background:"transparent",padding:"8px 0"}}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{...S.primaryBtn,padding:"8px 16px",fontSize:16,opacity:loading||!input.trim()?0.5:1}}>Send</button>
      </div>
    </div>
    <div style={{marginTop:10,padding:"10px 12px",background:"rgba(196,167,98,0.08)",borderRadius:8,border:"1px solid rgba(196,167,98,0.15)"}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>{["📄 PubMed/MEDLINE","🏛️ OpenFDA Drug Labels","🔬 FDA Adverse Events","🔍 Real-time Web Search","🧠 AI Memory"].map(s=><span key={s} style={{fontSize:15,padding:"2px 6px",background:"var(--card)",borderRadius:6,color:"var(--dim)"}}>{s}</span>)}</div>
      <p style={{fontSize:16,color:"var(--dim)",lineHeight:1.5}}>⚠️ Powered by real-time PubMed research, FDA databases, and web search — not diagnoses. PMID links go directly to peer-reviewed papers. Verify with a provider.</p>
    </div>
  </div>);
}
