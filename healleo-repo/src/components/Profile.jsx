import { useState } from "react";
import { DEFAULT_PROFILE, DEFAULT_STATE } from "../lib/state.js";
import { GOALS, CONDITIONS } from "../lib/profile.js";
import { S } from "../styles/theme.js";

export function Profile({state,update,onLogout,userEmail}){
  const [p,setP]=useState({...DEFAULT_PROFILE,...state.profile});
  const [changingPw,setChangingPw]=useState(false);
  const [oldPw,setOldPw]=useState("");
  const [newPw,setNewPw]=useState("");
  const [pwMsg,setPwMsg]=useState("");
  const [deleting,setDeleting]=useState(false);

  const changePassword = async () => {
    if (newPw.length < 8) { setPwMsg("Password must be at least 8 characters"); return; }
    setPwMsg("Changing password and re-encrypting data...");
    const result = await window.healleoAuth.changePassword(oldPw, newPw);
    if (result.error) { setPwMsg(result.error); return; }
    setPwMsg("✓ Password changed and data re-encrypted");
    setOldPw(""); setNewPw(""); setTimeout(() => { setChangingPw(false); setPwMsg(""); }, 2000);
  };

  const deleteAccount = async () => {
    await window.healleoData.deleteAll();
    await window.healleoAuth.logout();
    onLogout();
  };

  return <div className="fade-up"><h2 style={S.h2}>⚙ Settings</h2>
    <div style={{...S.card,marginTop:14,padding:16}}>
      <h3 style={S.h3}>👤 Account</h3>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
        <div><div style={{fontSize:16,fontWeight:500}}>{state.profile.name || "User"}</div><div style={{fontSize:14,color:"var(--dim)",fontFamily:"var(--mono)",marginTop:2}}>{userEmail}</div></div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setChangingPw(!changingPw)} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",fontSize:16}}>🔑 Password</button>
          <button onClick={onLogout} style={{...S.smallBtn,background:"var(--accent4)",fontSize:16}}>Logout</button>
        </div>
      </div>
      {changingPw && <div style={{marginTop:12,padding:12,background:"var(--bg)",borderRadius:8}}>
        <label style={S.label}>Current Password<input type="password" value={oldPw} onChange={e=>setOldPw(e.target.value)} style={S.input}/></label>
        <label style={{...S.label,marginTop:8}}>New Password (8+ chars)<input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} style={S.input}/></label>
        {pwMsg && <div style={{fontSize:14,marginTop:6,color:pwMsg.startsWith("✓")?"var(--success)":"var(--danger)"}}>{pwMsg}</div>}
        <button onClick={changePassword} style={{...S.primaryBtn,marginTop:8,fontSize:15}}>Update Password</button>
      </div>}
      <div style={{marginTop:10,padding:"8px 12px",background:"rgba(106,152,176,0.08)",borderRadius:8,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:14}}>☁️</span>
        <div><span style={{fontSize:13,color:"var(--accent3)",fontWeight:600}}>Cloud sync active</span><span style={{fontSize:12,color:"var(--dim)",marginLeft:6}}>Encrypted with AES-256-GCM · Data accessible from any device</span></div>
      </div>
    </div>

    <div style={{...S.card,marginTop:10,padding:16}}>
      <h3 style={S.h3}>📋 Profile</h3>
      <div style={{...S.formGrid,marginTop:10}}><label style={S.label}>Name<input style={S.input} value={p.name} onChange={e=>setP({...p,name:e.target.value})}/></label><label style={S.label}>Age<input style={S.input} type="number" value={p.age} onChange={e=>setP({...p,age:e.target.value})}/></label><label style={S.label}>Weight (lbs)<input style={S.input} type="number" value={p.weight} onChange={e=>setP({...p,weight:e.target.value})}/></label><label style={S.label}>Height (inches)<input style={S.input} type="number" value={p.height} onChange={e=>setP({...p,height:e.target.value})}/></label><label style={S.label}>Sex<select style={S.input} value={p.sex} onChange={e=>setP({...p,sex:e.target.value})}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label><label style={S.label}>Blood Type<select style={S.input} value={p.bloodType||""} onChange={e=>setP({...p,bloodType:e.target.value})}><option value="">Unknown</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b} value={b}>{b}</option>)}</select></label></div>
      <label style={{...S.label,marginTop:12}}>Medications<input style={S.input} value={p.medications} onChange={e=>setP({...p,medications:e.target.value})} placeholder="e.g. Metformin 500mg"/></label>
      <label style={{...S.label,marginTop:8}}>Allergies<input style={S.input} value={p.allergies} onChange={e=>setP({...p,allergies:e.target.value})} placeholder="e.g. Penicillin"/></label>
      <label style={{...S.label,marginTop:8}}>Family History<input style={S.input} value={p.familyHistory||""} onChange={e=>setP({...p,familyHistory:e.target.value})} placeholder="e.g. Father: heart disease"/></label>
      <h3 style={{...S.h3,marginTop:14}}>Goals</h3><div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:6}}>{GOALS.map(g=><button key={g} onClick={()=>setP({...p,goals:p.goals.includes(g)?p.goals.filter(x=>x!==g):[...p.goals,g]})} style={{...S.chip,...(p.goals.includes(g)?S.chipActive:{}),fontSize:14}}>{g}</button>)}</div>
      <h3 style={{...S.h3,marginTop:12}}>Conditions</h3><div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:6}}>{[...new Set([...CONDITIONS,...p.conditions.filter(c=>!CONDITIONS.includes(c))])].map(c=><button key={c} onClick={()=>setP({...p,conditions:p.conditions.includes(c)?p.conditions.filter(x=>x!==c):[...p.conditions,c]})} style={{...S.chip,...(p.conditions.includes(c)?S.chipActive:{}),fontSize:14}}>{c}</button>)}</div><div style={{display:"flex",gap:6,marginTop:8}}><input style={{...S.input,flex:1,fontSize:14}} placeholder="Add other condition..." onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){setP({...p,conditions:[...p.conditions,e.target.value.trim()]});e.target.value="";}}} /><button onClick={e=>{const inp=e.target.previousSibling;if(inp.value.trim()){setP({...p,conditions:[...p.conditions,inp.value.trim()]});inp.value="";}}} style={S.smallBtn}>Add</button></div>
      <div style={{display:"flex",gap:8,marginTop:16}}><button onClick={()=>update(s=>{s.profile=p;})} style={S.primaryBtn}>Save</button><button onClick={()=>{if(confirm("Reset ALL data including labs and AI memory?"))update(s=>Object.assign(s,DEFAULT_STATE));}} style={{...S.secondaryBtn,color:"var(--danger)",borderColor:"var(--danger)"}}>Reset Data</button></div>
    </div>
    {state.aiMemory?.length>0&&<div style={{...S.card,marginTop:10,padding:16}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={S.h3}>🧠 AI Memory ({state.aiMemory.length})</h3><button onClick={()=>{if(confirm("Clear AI memory?"))update(s=>{s.aiMemory=[];});}} style={{fontSize:16,color:"var(--danger)",background:"none",border:"none",cursor:"pointer"}}>Clear</button></div><p style={{fontSize:14,color:"var(--dim)",marginTop:4}}>Observations learned from your health data over time:</p><div style={{marginTop:8,maxHeight:200,overflow:"auto"}}>{state.aiMemory.map((m,i)=><div key={i} style={{padding:"6px 8px",fontSize:14,borderBottom:"1px solid var(--muted)",lineHeight:1.5}}><span style={{fontFamily:"var(--mono)",color:"var(--dim)",fontSize:15}}>{m.date}</span> {m.insight}</div>)}</div></div>}
    <div style={{...S.card,marginTop:10,padding:16,borderLeft:"3px solid var(--danger)"}}>
      <h3 style={{...S.h3,color:"var(--danger)"}}>⚠️ Danger Zone</h3>
      {!deleting ? <button onClick={()=>setDeleting(true)} style={{...S.secondaryBtn,color:"var(--danger)",borderColor:"var(--danger)",fontSize:14,marginTop:8}}>Delete Account Permanently</button>
      : <div style={{marginTop:8}}><p style={{fontSize:15,color:"var(--danger)",marginBottom:8}}>This will permanently delete your account and all health data. This cannot be undone.</p><div style={{display:"flex",gap:8}}><button onClick={deleteAccount} style={{...S.primaryBtn,background:"var(--danger)",fontSize:14}}>Yes, Delete Everything</button><button onClick={()=>setDeleting(false)} style={{...S.secondaryBtn,fontSize:14}}>Cancel</button></div></div>}
    </div>
  </div>;
}
