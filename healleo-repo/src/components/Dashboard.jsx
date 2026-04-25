import { S } from "../styles/theme.js";
import { MOODS } from "../lib/profile.js";
import { generateTeamInsights } from "../lib/insights.js";
import { RingProgress } from "./ui/RingProgress.jsx";
import { Icon } from "./ui/Icon.jsx";

export function Dashboard({todayLog,weekLogs,weekDays,waterGoal,insights,profile,switchTab,labResults,aiMemory,state,update}){
  const w=parseFloat(profile.weight)||150;const cg=profile.goals.includes("Lose Weight")?Math.round(w*11):profile.goals.includes("Build Muscle")?Math.round(w*16):Math.round(w*14);const pg=profile.goals.includes("Build Muscle")?Math.round(w*0.82):Math.round(w*0.55);const top=insights[0];
  const recentFlags=(labResults||[]).slice(-1).flatMap(lr=>lr.results.filter(r=>r.flag&&r.flag!=="NORMAL"));
  const teamInsights = generateTeamInsights(state);
  const proColors = { doctor: "var(--accent3)", nutritionist: "var(--accent5)", trainer: "var(--accent4)", therapist: "var(--accent2)" };
  const proLabels = { doctor: "Dr. Healleo", nutritionist: "Nutritionist", trainer: "Trainer", therapist: "Therapist" };

  // Dismiss system: cards auto-expire after 7 days so they can resurface if still relevant
  const dismissed = state.dismissedCards || [];
  const DISMISS_DAYS = 7;
  const isCardDismissed = (key) => {
    const entry = dismissed.find(d => d.key === key);
    if (!entry) return false;
    const daysSince = (Date.now() - new Date(entry.at).getTime()) / 86400000;
    return daysSince < DISMISS_DAYS;
  };
  const dismissCard = (key, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    update(s => { s.dismissedCards = [...(s.dismissedCards || []).filter(d => d.key !== key), { key, at: new Date().toISOString() }]; });
  };
  const dismissAllTeam = (e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    update(s => {
      const now = new Date().toISOString();
      const keys = visibleTeamInsights.map(c => `team-${c.pro}-${c.title}`);
      s.dismissedCards = [...(s.dismissedCards || []).filter(d => !keys.includes(d.key)), ...keys.map(k => ({ key: k, at: now }))];
    });
  };

  const dismissBtn = (key) => (
    <button onClick={(e) => dismissCard(key, e)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dim)", fontSize: 14, padding: "2px 4px", flexShrink: 0, marginLeft: 4 }} title="Dismiss">✕</button>
  );

  // Filter dismissed cards
  const visibleTeamInsights = teamInsights.filter(c => !isCardDismissed(`team-${c.pro}-${c.title}`));
  const showLabFlags = recentFlags.length > 0 && !isCardDismissed("lab-flags");
  const showAiInsight = aiMemory?.length > 0 && !isCardDismissed(`ai-insight-${aiMemory.length}`);
  const showTopInsight = top && !isCardDismissed(`insight-${top.title}`);

  return(<div className="fade-up"><h2 style={S.h2}>Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}{profile.name?`, ${profile.name}`:""}</h2>

    {/* Team Insight Cards */}
    {visibleTeamInsights.length > 0 && (<div style={{marginTop:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <h3 style={S.h3}>Your team noticed</h3>
        <span style={{fontSize:12,padding:"2px 8px",background:"rgba(107,90,36,0.1)",borderRadius:10,color:"var(--accent)",fontFamily:"var(--mono)"}}>{visibleTeamInsights.length}</span>
        <button onClick={dismissAllTeam} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",fontSize:12,color:"var(--dim)",fontFamily:"var(--body)"}}>Dismiss all</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {visibleTeamInsights.map((card, i) => (
          <div key={i} className="card" style={{
            ...S.card, padding: "14px 16px", border: "none", textAlign: "left", width: "100%",
            borderLeft: `3px solid ${card.priority === "positive" ? "var(--success)" : card.priority === "high" ? "var(--danger)" : proColors[card.pro]}`,
            background: card.priority === "positive" ? "rgba(90,138,82,0.04)" : card.priority === "high" ? "rgba(184,84,84,0.04)" : "var(--card)"
          }}>
            <div style={{display:"flex",gap:10}}>
              <div style={{flexShrink:0,marginTop:2,cursor:"pointer"}} onClick={() => switchTab(card.action)}><Icon name={card.icon} size={36}/></div>
              <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={() => switchTab(card.action)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:15,fontWeight:600,color:"var(--text)"}}>{card.title}</span>
                  <span style={{fontSize:11,color:proColors[card.pro],fontWeight:600,flexShrink:0,marginLeft:8}}>{proLabels[card.pro]}</span>
                </div>
                <p style={{fontSize:13,color:"var(--dim)",marginTop:4,lineHeight:1.55}}>{card.text}</p>
                {card.crossAgent && <span style={{fontSize:11,color:"var(--dim)",marginTop:4,display:"inline-block"}}>🔗 Shared with {proLabels[card.crossAgent]}</span>}
              </div>
              {dismissBtn(`team-${card.pro}-${card.title}`)}
            </div>
          </div>
        ))}
      </div>
    </div>)}

    {/* Your Team */}
    <div style={{...S.card,marginTop:12,padding:14}}>
      <h3 style={S.h3}>Your Healleo Team</h3>
      <p style={{fontSize:13,color:"var(--dim)",marginTop:2}}>Personal professionals who know your complete health picture</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:10}}>
        {[["ask","doctor","Doctor","Medical"],["nutritionist","nutrition","Nutrition","Diet & Fuel"],["trainer","trainer","Trainer","Fitness"],["therapist","therapist","Therapist","Wellness"]].map(([t,icon,label,sub])=>
          <button key={t} onClick={()=>switchTab(t)} className="card" style={{...S.card,padding:"10px 4px",textAlign:"center",border:"none",cursor:"pointer",fontFamily:"var(--body)"}}>
            <div><Icon name={icon} size={52}/></div>
            <div style={{fontSize:13,fontWeight:600,marginTop:3,color:"var(--accent)"}}>{label}</div>
            <div style={{fontSize:11,color:"var(--dim)",marginTop:1}}>{sub}</div>
          </button>
        )}
      </div>
    </div>
    {showLabFlags&&<div style={{...S.card,marginTop:10,padding:12,borderLeft:"3px solid var(--danger)",background:"rgba(184,84,84,0.06)",display:"flex",alignItems:"flex-start",gap:8}}><div style={{flex:1,cursor:"pointer"}} onClick={()=>switchTab("labs")}><div style={{fontSize:15,fontWeight:600,color:"var(--danger)"}}>⚠️ {recentFlags.length} abnormal lab value{recentFlags.length>1?"s":""}</div><div style={{fontSize:14,color:"var(--dim)",marginTop:2}}>{recentFlags.map(f=>`${f.name}: ${f.value} [${f.flag}]`).join(" · ")}</div></div>{dismissBtn("lab-flags")}</div>}
    {showAiInsight&&<div style={{...S.card,marginTop:10,padding:12,borderLeft:"3px solid var(--accent3)",display:"flex",alignItems:"flex-start",gap:8}}><div style={{flex:1,cursor:"pointer"}} onClick={()=>switchTab("timeline")}><div style={{fontSize:15,color:"var(--dim)"}}><strong>🧠 Latest insight:</strong> {aiMemory[aiMemory.length-1].insight.slice(0,100)}...</div></div>{dismissBtn(`ai-insight-${aiMemory.length}`)}</div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:8,marginTop:10}}>{[{l:"Water",v:`${todayLog.water} oz`,max:waterGoal,cur:todayLog.water,c:"var(--accent3)",i:"💧"},{l:"Calories",v:todayLog.calories||"—",max:cg,cur:todayLog.calories,c:"var(--accent4)",i:"🔥"},{l:"Protein",v:todayLog.protein?`${todayLog.protein}g`:"—",max:pg,cur:todayLog.protein,c:"var(--accent)",i:"🥩"},{l:"Sleep",v:todayLog.sleep?`${todayLog.sleep}hr`:"—",max:8,cur:todayLog.sleep,c:"var(--accent2)",i:"😴"}].map((s,idx)=><div key={idx} className="card" style={{...S.card,textAlign:"center",padding:12}}><div style={{position:"relative",display:"inline-block"}}><RingProgress value={s.cur} max={s.max} color={s.c} size={44} stroke={4}/><span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:14}}>{s.i}</span></div><div style={{marginTop:4,fontFamily:"var(--display)",fontSize:15,fontWeight:500}}>{s.v}</div><div style={{fontSize:15,color:"var(--dim)"}}>{s.l}</div></div>)}</div>
    {showTopInsight&&<div style={{...S.card,marginTop:10,padding:12,borderLeft:`3px solid ${top.priority==="high"?"var(--danger)":top.priority==="success"?"var(--success)":"var(--accent2)"}`,display:"flex",alignItems:"flex-start",gap:8}}><div style={{flex:1,cursor:"pointer"}} onClick={()=>switchTab("log")}><div style={{display:"flex",gap:8}}><span style={{fontSize:18}}>{top.icon.length<=12?<Icon name={top.icon} size={36}/>:top.icon}</span><div><div style={{fontWeight:600,fontSize:15}}>{top.title}</div><div style={{fontSize:14,color:"var(--dim)",marginTop:2,lineHeight:1.5}}>{top.text}</div></div></div></div>{dismissBtn(`insight-${top.title}`)}</div>}
    <div style={{...S.card,marginTop:10,padding:14}}><h3 style={S.h3}>Mood</h3><div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>{weekLogs.map((l,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:18}}>{l.mood>=0?MOODS[l.mood]:"·"}</div><span style={{fontSize:15,color:"var(--dim)",fontFamily:"var(--mono)"}}>{weekDays[i]}</span></div>)}</div></div>
  </div>);
}
