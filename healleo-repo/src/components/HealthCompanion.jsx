import { useState, useEffect, useRef } from "react";
import { AskDoctor } from "./AskDoctor.jsx";
import { Icon } from "./ui/Icon.jsx";
import { DEFAULT_PROFILE, DEFAULT_STATE, today } from "../lib/state.js";
import { Dashboard } from "./Dashboard.jsx";
import { DoctorFinder } from "./DoctorFinder.jsx";
import { InsuranceFinder } from "./InsuranceFinder.jsx";
import { DoctorSummary } from "./DoctorSummary.jsx";
const LOGO_PATH = "/assets/logo.svg?v=2";
import { HealthTimeline } from "./HealthTimeline.jsx";
import { LabResults } from "./LabResults.jsx";
import { LogEntry } from "./LogEntry.jsx";
import { Medications } from "./Medications.jsx";
import { Onboarding } from "./Onboarding.jsx";
import { ProfessionalChat } from "./ProfessionalChat.jsx";
import { Profile } from "./Profile.jsx";
import { S, globalCSS } from "../styles/theme.js";
import { loadData, saveData } from "../lib/storage.js";
import { Supplements } from "./Supplements.jsx";
import { SymptomChecker } from "./SymptomChecker.jsx";
import { computeStreak, getOrCreateLog, getWeekLogs } from "../lib/logs.js";
import { generateInsights } from "../lib/insights.js";
import { Nutrition } from "./Nutrition.jsx";
import { Exercise } from "./Exercise.jsx";

export function HealthCompanion({ onLogout, userEmail }) {
  const [state,setState]=useState(DEFAULT_STATE);
  const [loaded,setLoaded]=useState(false);
  const [tab,setTab]=useState("dashboard");
  const [selDate,setSelDate]=useState(today());
  const [animIn,setAnimIn]=useState(true);
  const [theme,setTheme]=useState(()=>localStorage.getItem("healleoTheme")||"light");

  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("healleoTheme",theme);},[theme]);

  const [dataLoaded, setDataLoaded] = useState(false);
  const [decryptError, setDecryptError] = useState(false);

  useEffect(()=>{loadData().then(d=>{
    if(d) {
      setState(s=>({...DEFAULT_STATE,...d,profile:{...DEFAULT_PROFILE,...d?.profile},labResults:d.labResults||[],healthTimeline:d.healthTimeline||[],aiMemory:d.aiMemory||[],savedDoctors:d.savedDoctors||[],medications:d.medications||[],sharedPlans:d.sharedPlans||[],dismissedCards:d.dismissedCards||[]}));
      setDataLoaded(true);
    } else {
      // Check if data exists but can't be decrypted
      window.healleoData?.hasData?.().then(has => {
        if (has) setDecryptError(true);
        else setDataLoaded(true);
      }).catch(() => setDataLoaded(true));
    }
    setLoaded(true);
  });},[]);

  // Save data — only if we successfully loaded (don't overwrite encrypted data we can't read)
  const saveTimer = useRef(null);
  useEffect(()=>{
    if(!loaded || !dataLoaded) return;
    if(saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveData(state), 2000);
    return () => { if(saveTimer.current) clearTimeout(saveTimer.current); };
  },[state,loaded]);

  const update=fn=>setState(prev=>{const n=JSON.parse(JSON.stringify(prev));fn(n);return n;});
  const updateLog=fn=>{update(s=>{const idx=s.logs.findIndex(l=>l.date===selDate);const log=idx>=0?{...s.logs[idx]}:getOrCreateLog(s.logs,selDate);fn(log);if(idx>=0)s.logs[idx]=log;else s.logs.push(log);});};

  const todayLog=getOrCreateLog(state.logs,selDate);
  const weekLogs=getWeekLogs(state.logs);
  const weekDays=weekLogs.map(l=>["Su","Mo","Tu","We","Th","Fr","Sa"][new Date(l.date+"T12:00:00").getDay()]);
  const switchTab=t=>{setAnimIn(false);setTimeout(()=>{setTab(t);setAnimIn(true);},120);};

  const [recoveryPw, setRecoveryPw] = useState("");
  const [recoveryMsg, setRecoveryMsg] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const tryRecoverData = async () => {
    if (!recoveryPw) return;
    setRecoveryLoading(true); setRecoveryMsg("");
    const ok = await window.healleoAuth.unlockWithPassword(recoveryPw);
    if (!ok) { setRecoveryMsg("Could not derive key"); setRecoveryLoading(false); return; }
    const d = await loadData();
    if (d) {
      setState(s => ({...DEFAULT_STATE,...d,profile:{...DEFAULT_PROFILE,...d?.profile},labResults:d.labResults||[],healthTimeline:d.healthTimeline||[],aiMemory:d.aiMemory||[],savedDoctors:d.savedDoctors||[],medications:d.medications||[],sharedPlans:d.sharedPlans||[],dismissedCards:d.dismissedCards||[]}));
      setDataLoaded(true); setDecryptError(false); setRecoveryPw("");
    } else {
      setRecoveryMsg("That password didn't work. Try another previous password.");
    }
    setRecoveryLoading(false);
  };

  const startFresh = () => { setDecryptError(false); setDataLoaded(true); };

  if(!loaded)return <div style={S.loading}><div style={S.spinner}/><p style={{color:"#8a9a7b",marginTop:16,fontFamily:"var(--body)"}}>Loading...</p></div>;

  if(decryptError) return <div style={{...S.app,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}><style>{globalCSS}</style><div style={{background:"var(--card)",borderRadius:20,padding:36,maxWidth:440,width:"100%",boxShadow:"var(--shadow-lg)"}}>
    <div style={{textAlign:"center",marginBottom:20}}>
      <div style={{fontSize:40,marginBottom:10}}><Icon name="settings" size={36}/></div>
      <h2 style={S.h2}>Data Recovery Needed</h2>
      <p style={{fontSize:14,color:"var(--dim)",marginTop:8,lineHeight:1.6}}>Your health data is encrypted with a previous password. Enter that password to recover your data.</p>
    </div>
    <label style={{...S.label,marginBottom:12}}>Previous Password<input type="password" value={recoveryPw} onChange={e=>setRecoveryPw(e.target.value)} placeholder="The password you used before resetting" style={S.input} onKeyDown={e=>e.key==="Enter"&&tryRecoverData()} autoFocus/></label>
    {recoveryMsg&&<div style={{padding:"8px 12px",background:"rgba(184,84,84,0.08)",borderRadius:8,marginBottom:12,fontSize:14,color:"#8b3a3a"}}>{recoveryMsg}</div>}
    <button onClick={tryRecoverData} disabled={recoveryLoading||!recoveryPw} style={{...S.primaryBtn,width:"100%",padding:"12px 18px",fontSize:16,opacity:recoveryLoading?0.6:1,marginBottom:10}}>{recoveryLoading?"Trying...":"Recover My Data"}</button>
    <button onClick={startFresh} style={{width:"100%",padding:"8px",background:"none",border:"none",color:"var(--dim)",cursor:"pointer",fontSize:13,fontFamily:"var(--body)"}}>I don't remember — start fresh</button>
    <div style={{marginTop:14,padding:"10px 14px",background:"var(--bg)",borderRadius:10}}>
      <p style={{fontSize:12,color:"var(--dim)",lineHeight:1.5}}>Your encrypted data is safe in the cloud. If you remember your old password later, you can recover it by logging out and logging back in.</p>
    </div>
  </div></div>;

  if(!state.onboarded)return <Onboarding state={state} update={update}/>;

  const insights=generateInsights(state.profile,todayLog,weekLogs);
  const weight=parseFloat(state.profile.weight)||150;
  const waterGoal=Math.round(weight*0.5);
  const streak=computeStreak(state.logs);
  const allTabs=[["dashboard",<><Icon name="home" size={16}/> Home</>],["ask",<><Icon name="doctor" size={16}/> Doctor</>],["nutritionist",<><Icon name="nutrition" size={16}/> Nutrition</>],["trainer",<><Icon name="trainer" size={16}/> Trainer</>],["therapist",<><Icon name="therapist" size={16}/> Therapist</>],["meds",<><Icon name="meds" size={16}/> Meds</>],["labs",<><Icon name="labs" size={16}/> Labs</>],["symptoms",<><Icon name="search" size={16}/> Symptoms</>],["summary",<><Icon name="summary" size={16}/> Summary</>],["timeline",<><Icon name="timeline" size={16}/> Timeline</>],["doctors",<><Icon name="doctors" size={16}/> Doctors</>],["insurance",<><Icon name="settings" size={16}/> Insurance</>],["log",<><Icon name="edit" size={16}/> Log</>],["supplements",<><Icon name="meds" size={16}/> Suppl.</>]];
  const TABS = state.profile.hasEmployerInsurance ? allTabs.filter(([k]) => k !== "insurance") : allTabs;

  return(
    <div style={S.app}><style>{globalCSS}</style>
      <header style={S.header}>
        <div style={{flex:"0 1 auto",minWidth:0}}><img src={LOGO_PATH} alt="Healleo" style={{height:48,objectFit:"contain",display:"block"}}/></div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          {state.aiMemory?.length>0&&<div style={{fontSize:16,color:"var(--accent3)",fontFamily:"var(--mono)"}}><Icon name="memory" size={16}/> {state.aiMemory.length}</div>}
          {streak>0&&<div style={S.streakBadge}><Icon name="fire" size={14}/> {streak}d</div>}
          <button onClick={()=>setTheme(t=>t==="dark"?"light":"dark")} title={theme==="dark"?"Light mode":"Dark mode"} style={{...S.iconBtn,background:"var(--muted)",color:"var(--text)"}}><Icon name={theme==="dark"?"sun":"moon"} size={16}/></button>
          <button onClick={()=>switchTab("profile")} style={{...S.iconBtn,background:tab==="profile"?"var(--accent)":"var(--muted)",color:tab==="profile"?"#fff":"var(--text)"}}><Icon name="settings" size={16}/></button>
        </div>
      </header>
      <nav style={S.nav}>{TABS.map(([k,l])=><button key={k} onClick={()=>switchTab(k)} style={{...S.tab,...(tab===k?S.tabActive:{})}}>{l}</button>)}</nav>
      <main style={{...S.content,opacity:animIn?1:0,transform:animIn?"none":"translateY(6px)",transition:"all 0.15s ease"}}>
        {tab==="dashboard"&&<Dashboard todayLog={todayLog} weekLogs={weekLogs} weekDays={weekDays} waterGoal={waterGoal} insights={insights} profile={state.profile} switchTab={switchTab} labResults={state.labResults} aiMemory={state.aiMemory} state={state} update={update}/>}
        {tab==="ask"&&<AskDoctor state={state} update={update}/>}
        {tab==="nutritionist"&&<ProfessionalChat role="nutritionist" state={state} update={update}/>}
        {tab==="trainer"&&<ProfessionalChat role="trainer" state={state} update={update}/>}
        {tab==="therapist"&&<ProfessionalChat role="therapist" state={state} update={update}/>}
        {tab==="meds"&&<Medications state={state} update={update}/>}
        {tab==="labs"&&<LabResults state={state} update={update}/>}
        {tab==="symptoms"&&<SymptomChecker state={state} update={update}/>}
        {tab==="summary"&&<DoctorSummary state={state}/>}
        {tab==="timeline"&&<HealthTimeline state={state} update={update}/>}
        {tab==="doctors"&&<DoctorFinder state={state} update={update}/>}
        {tab==="insurance"&&<InsuranceFinder state={state} update={update}/>}
        {tab==="log"&&<LogEntry log={todayLog} updateLog={updateLog} selDate={selDate} setSelDate={setSelDate} waterGoal={waterGoal} state={state} update={update}/>}
        {tab==="nutrition"&&<Nutrition log={todayLog} updateLog={updateLog} profile={state.profile} weekLogs={weekLogs} weekDays={weekDays}/>}
        {tab==="exercise"&&<Exercise log={todayLog} updateLog={updateLog} weekLogs={weekLogs} weekDays={weekDays}/>}
        {tab==="supplements"&&<Supplements log={todayLog} updateLog={updateLog} profile={state.profile}/>}
        {tab==="profile"&&<Profile state={state} update={update} onLogout={onLogout} userEmail={userEmail}/>}
      </main>
      <footer style={S.footer}><p>⚠️ Healleo provides health information only — not medical diagnoses. Always consult qualified healthcare professionals.</p></footer>
    </div>);
}
