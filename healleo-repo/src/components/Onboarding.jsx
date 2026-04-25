import { useState } from "react";
import { DEFAULT_PROFILE } from "../lib/state.js";
import { GOALS, CONDITIONS } from "../lib/profile.js";
import { S, globalCSS } from "../styles/theme.js";
import { Icon } from "./ui/Icon.jsx";
const LOGO_PATH = "/assets/logo.svg?v=2";

export function Onboarding({state,update}){const[step,setStep]=useState(0);const[p,setP]=useState({...DEFAULT_PROFILE,...state.profile});const next=()=>setStep(s=>s+1);const finish=()=>update(s=>{s.profile=p;s.onboarded=true;});
  const name = p.name?.split(" ")[0] || "there";
  const hasConditions = p.conditions?.length > 0 && !p.conditions.includes("None");
  const goalStr = p.goals?.length > 0 ? p.goals.join(", ").toLowerCase() : null;

  return(<div style={{...S.app,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}><style>{globalCSS}</style><div style={{background:"var(--card)",borderRadius:20,padding:36,maxWidth:520,width:"100%",boxShadow:"var(--shadow-lg)"}}>
    <div style={{display:"flex",gap:5,marginBottom:24}}>{[0,1,2,3,4,5].map(i=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?"var(--accent)":"var(--muted)",transition:"background 0.3s"}}/>)}</div>

    {/* STEP 0: The Pitch */}
    {step===0&&<div className="fade-up" style={{textAlign:"center",padding:"20px 0"}}>
      <img src={LOGO_PATH} alt="Healleo" style={{height:132,objectFit:"contain",marginBottom:16}}/>
      <p style={{fontSize:17,color:"var(--text)",maxWidth:420,margin:"0 auto",lineHeight:1.7,fontFamily:"var(--display)",fontWeight:400}}>
        Imagine having a doctor, nutritionist, personal trainer, and therapist — all working together, all knowing your full story.
      </p>
      <p style={{fontSize:14,color:"var(--dim)",maxWidth:400,margin:"14px auto 0",lineHeight:1.6}}>
        That's Healleo. A personal health team powered by AI that learns about you over time, connects the dots between your body and mind, and looks out for you — even when you're not asking.
      </p>
      <button onClick={next} style={{...S.primaryBtn,marginTop:28,padding:"12px 32px",fontSize:16}}>Meet Your Team →</button>
    </div>}

    {/* STEP 1: Meet Your Team */}
    {step===1&&<div className="fade-up">
      <h2 style={S.h2}>Your Team</h2>
      <p style={{fontSize:14,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>Four professionals. One shared picture of your health. They'll learn more about you with every interaction.</p>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>
        {[
          {icon:"doctor",title:"Dr. Healleo",sub:"Your Doctor",desc:"Analyzes your labs, symptoms, and medications. Cites real PubMed research and FDA data. Connects dots a 15-minute office visit can't.",color:"var(--accent3)"},
          {icon:"nutrition",title:"Healleo Nutrition",sub:"Your Nutritionist",desc:"Builds meal plans from your actual body data — not generic advice. Knows how your meds and conditions affect what you should eat.",color:"var(--accent5)"},
          {icon:"trainer",title:"Healleo Fitness",sub:"Your Trainer",desc:"Designs workouts that respect your conditions and limitations. Checks your sleep before adding volume. Builds programs you'll actually stick with.",color:"var(--accent4)"},
          {icon:"therapist",title:"Healleo Wellness",sub:"Your Therapist",desc:"Watches your mood patterns and connects them to everything else — sleep, diagnosis, medications. A safe space that understands the full picture.",color:"var(--accent2)"},
        ].map((pro,i) => (
          <div key={i} style={{display:"flex",gap:12,padding:"14px 16px",background:"var(--bg)",borderRadius:12,borderLeft:`3px solid ${pro.color}`}}>
            <div style={{flexShrink:0,marginTop:2}}><Icon name={pro.icon} size={32}/></div>
            <div>
              <div style={{fontSize:15,fontWeight:600}}>{pro.title}</div>
              <div style={{fontSize:12,color:pro.color,fontWeight:600,marginTop:1}}>{pro.sub}</div>
              <div style={{fontSize:13,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>{pro.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <p style={{fontSize:13,color:"var(--dim)",marginTop:14,textAlign:"center",lineHeight:1.5}}>They share what they learn — so your trainer knows about your meds, your nutritionist knows about your labs, and your therapist knows about all of it.</p>
      <button onClick={next} style={{...S.primaryBtn,marginTop:16,width:"100%",padding:"12px"}}>Let's Get Started →</button>
    </div>}

    {/* STEP 2: About You */}
    {step===2&&<div className="fade-up"><h2 style={S.h2}>About You</h2><p style={{fontSize:13,color:"var(--dim)",marginTop:2,marginBottom:14}}>This helps your team personalize everything — calorie targets, exercise intensity, risk factors.</p><div style={S.formGrid}><label style={S.label}>Name<input style={S.input} value={p.name} onChange={e=>setP({...p,name:e.target.value})} placeholder="Your name"/></label><label style={S.label}>Age<input style={S.input} type="number" value={p.age} onChange={e=>setP({...p,age:e.target.value})} placeholder="30"/></label><label style={S.label}>Weight (lbs)<input style={S.input} type="number" value={p.weight} onChange={e=>setP({...p,weight:e.target.value})} placeholder="150"/></label><label style={S.label}>Height (inches)<input style={S.input} type="number" value={p.height} onChange={e=>setP({...p,height:e.target.value})} placeholder="70"/></label><label style={S.label}>Sex<select style={S.input} value={p.sex} onChange={e=>setP({...p,sex:e.target.value})}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label><label style={S.label}>Blood Type<select style={S.input} value={p.bloodType||""} onChange={e=>setP({...p,bloodType:e.target.value})}><option value="">Unknown</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b} value={b}>{b}</option>)}</select></label></div><button onClick={next} style={{...S.primaryBtn,marginTop:20}}>Continue →</button></div>}

    {/* STEP 3: Medical Background */}
    {step===3&&<div className="fade-up"><h2 style={S.h2}>Medical Background</h2><p style={{fontSize:13,color:"var(--dim)",marginTop:2,marginBottom:14}}>Your doctor checks interactions. Your nutritionist adjusts for depletions. Your trainer modifies for limitations. Nothing is siloed.</p><label style={{...S.label,marginBottom:12}}>Medications<input style={S.input} value={p.medications} onChange={e=>setP({...p,medications:e.target.value})} placeholder="e.g. Metformin 500mg, Lisinopril 10mg"/></label><label style={{...S.label,marginBottom:12}}>Allergies<input style={S.input} value={p.allergies} onChange={e=>setP({...p,allergies:e.target.value})} placeholder="e.g. Penicillin, Shellfish"/></label><label style={{...S.label,marginBottom:8}}>Family History<input style={S.input} value={p.familyHistory||""} onChange={e=>setP({...p,familyHistory:e.target.value})} placeholder="e.g. Father: heart disease, Mother: diabetes"/></label><label style={S.label}>Conditions</label><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>{[...new Set([...CONDITIONS,...p.conditions.filter(c=>!CONDITIONS.includes(c))])].map(c=><button key={c} onClick={()=>setP({...p,conditions:p.conditions.includes(c)?p.conditions.filter(x=>x!==c):[...p.conditions,c]})} style={{...S.chip,...(p.conditions.includes(c)?S.chipActive:{})}}>{c}</button>)}</div><div style={{display:"flex",gap:6,marginTop:8}}><input style={{...S.input,flex:1}} placeholder="Add other condition..." onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){setP({...p,conditions:[...p.conditions,e.target.value.trim()]});e.target.value="";}}} /><button onClick={e=>{const inp=e.target.previousSibling;if(inp.value.trim()){setP({...p,conditions:[...p.conditions,inp.value.trim()]});inp.value="";}}} style={S.smallBtn}>Add</button></div><button onClick={next} style={{...S.primaryBtn,marginTop:20}}>Continue →</button></div>}

    {/* STEP 4: Health Goals */}
    {step===4&&<div className="fade-up"><h2 style={S.h2}>What Are You Working Toward?</h2><p style={{fontSize:13,color:"var(--dim)",marginTop:2,marginBottom:14}}>Your goals shape everything — meal plans, workout intensity, what your team watches for.</p><div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>{GOALS.map(g=><button key={g} onClick={()=>setP({...p,goals:p.goals.includes(g)?p.goals.filter(x=>x!==g):[...p.goals,g]})} style={{...S.chip,...(p.goals.includes(g)?S.chipActive:{})}}>{g}</button>)}</div><button onClick={next} style={{...S.primaryBtn,marginTop:24}}>Continue →</button></div>}

    {/* STEP 5: Your Team Is Ready */}
    {step===5&&<div className="fade-up" style={{padding:"10px 0"}}>
      <h2 style={{...S.h2,textAlign:"center"}}>Your team is ready{p.name ? `, ${p.name.split(" ")[0]}` : ""}.</h2>
      <p style={{fontSize:14,color:"var(--dim)",textAlign:"center",margin:"8px auto 20px",maxWidth:400,lineHeight:1.6}}>Here's what they're already thinking based on what you shared:</p>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{padding:"12px 14px",background:"var(--bg)",borderRadius:10,borderLeft:"3px solid var(--accent3)"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><Icon name="doctor" size={20}/><span style={{fontWeight:600,fontSize:14}}>Dr. Healleo</span></div>
          <p style={{fontSize:13,color:"var(--dim)",lineHeight:1.5,fontStyle:"italic"}}>{
            hasConditions ? `I see ${p.conditions.filter(c=>c!=="None").join(" and ")} in your profile. I'll want to see your latest labs to get a baseline — upload them anytime and I'll flag what matters.`
            : p.medications ? `You've got medications listed — I'll check for interactions and keep an eye on how they connect to your labs and symptoms over time.`
            : `No conditions or meds on file — great starting point. Upload labs when you have them and I'll start building your baseline.`
          }</p>
        </div>

        <div style={{padding:"12px 14px",background:"var(--bg)",borderRadius:10,borderLeft:"3px solid var(--accent5)"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><Icon name="nutrition" size={20}/><span style={{fontWeight:600,fontSize:14}}>Nutritionist</span></div>
          <p style={{fontSize:13,color:"var(--dim)",lineHeight:1.5,fontStyle:"italic"}}>{
            goalStr?.includes("lose weight") ? `Weight loss goal noted. I'll build around a sustainable deficit — no crash diets. Log a few days of meals and I'll have real numbers to work with.`
            : goalStr?.includes("build muscle") ? `Muscle building — nice. At ${p.weight||"your"} lbs, you'll want around ${Math.round((parseFloat(p.weight)||150)*0.82)}g protein daily. Let's make sure you're actually hitting that.`
            : `I'll need a few days of food logs to give you anything real. Generic advice is easy — personalized nutrition takes data. Start logging and I'll start connecting dots.`
          }</p>
        </div>

        <div style={{padding:"12px 14px",background:"var(--bg)",borderRadius:10,borderLeft:"3px solid var(--accent4)"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><Icon name="trainer" size={20}/><span style={{fontWeight:600,fontSize:14}}>Trainer</span></div>
          <p style={{fontSize:13,color:"var(--dim)",lineHeight:1.5,fontStyle:"italic"}}>{
            hasConditions ? `I see ${p.conditions.filter(c=>c!=="None")[0]} — I'll factor that into everything I build for you. No exercises that work against your body. Tell me what equipment you have access to and I'll create your first program.`
            : goalStr?.includes("better sleep") ? `Better sleep is a goal — exercise timing matters more than people think. I'll build routines that help with that, not hurt it. Let's start with what you're currently doing.`
            : `I don't have exercise history yet, so I'll start conservative. Log a few sessions — even walks count — and I'll get a feel for your level. Then we build from there.`
          }</p>
        </div>

        <div style={{padding:"12px 14px",background:"var(--bg)",borderRadius:10,borderLeft:"3px solid var(--accent2)"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><Icon name="therapist" size={20}/><span style={{fontWeight:600,fontSize:14}}>Therapist</span></div>
          <p style={{fontSize:13,color:"var(--dim)",lineHeight:1.5,fontStyle:"italic"}}>{
            goalStr?.includes("reduce stress") ? `Stress reduction is on your list — that tells me a lot. I'll be watching your mood and sleep patterns. When you're ready to dig into what's driving the stress, I'm here. No rush.`
            : hasConditions ? `Managing ${p.conditions.filter(c=>c!=="None")[0]} isn't just physical — it's emotional too. I'll keep an eye on how your mood tracks with everything else. Whenever you want to talk, I'm here.`
            : `I'll be quietly watching your mood patterns in the background. If I notice something shifting, I'll check in. In the meantime, I'm always one tap away.`
          }</p>
        </div>
      </div>

      <div style={{textAlign:"center",marginTop:20}}>
        <p style={{fontSize:12,color:"var(--dim)",marginBottom:14}}>The more you log, the smarter your team gets. Every lab result, every meal, every mood check — it all connects.</p>
        <button onClick={finish} style={{...S.primaryBtn,padding:"14px 40px",fontSize:16}}>Let's Go →</button>
      </div>
    </div>}

  </div></div>);
}
