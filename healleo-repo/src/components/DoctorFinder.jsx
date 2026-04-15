import { useState } from "react";
import { S } from "../styles/theme.js";
import { DOCTOR_SPECIALTIES } from "../lib/symptoms.js";

export function DoctorFinder({state,update}) {
  const profile = state.profile;
  const savedDoctors = state.savedDoctors || [];
  const [view, setView] = useState("main"); // main, search, results, detail, mychart, add
  const [specialty, setSpecialty] = useState("");
  const [distance, setDistance] = useState(25);
  const [location, setLocation] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [myChartText, setMyChartText] = useState("");
  const [importing, setImporting] = useState(false);
  const [manualDoc, setManualDoc] = useState({ name:"", specialty:"", phone:"", address:"", npi:"", portal:"", fax:"", email:"", notes:"", network:"", accepting:true });
  const [geoStatus, setGeoStatus] = useState("");

  const DISTANCES = [{v:5,l:"5 mi"},{v:25,l:"25 mi"},{v:50,l:"50 mi"},{v:100,l:"100 mi"},{v:200,l:"200 mi"},{v:500,l:"500 mi"},{v:0,l:"Nationwide"}];

  const rec = [];
  if (profile.conditions?.includes("Diabetes")||profile.conditions?.includes("Thyroid")) rec.push("Endocrinology");
  if (profile.conditions?.includes("High Blood Pressure")||profile.conditions?.includes("High Cholesterol")) rec.push("Cardiology");
  if (profile.conditions?.includes("Anxiety")||profile.conditions?.includes("Insomnia")) rec.push("Psychiatry");
  if (profile.conditions?.includes("IBS")) rec.push("Gastroenterology");
  if (profile.conditions?.includes("Asthma")) rec.push("Pulmonology");
  if (profile.conditions?.includes("Arthritis")) rec.push("Rheumatology");

  const getLocation = () => {
    setGeoStatus("locating");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocation(`${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`); setGeoStatus("found"); },
        () => setGeoStatus("denied"),
        { timeout: 10000 }
      );
    } else setGeoStatus("unavailable");
  };

  const searchDoctors = async () => {
    if (!specialty && !location) return;
    setSearching(true); setResults([]);

    try {
      // Build NPPES API query
      const params = new URLSearchParams({ version: "2.1", limit: "50" });
      if (specialty) {
        // Clean up specialty for NPPES taxonomy_description matching
        let taxTerm = specialty.replace(/\s*\/\s*.*/,"").replace(/\s*\(.*/,"").trim(); // "Primary Care / Family Medicine" → "Primary Care"
        if (taxTerm === "Primary Care") taxTerm = "Family Medicine";
        if (taxTerm === "Urgent Care") taxTerm = "Emergency Medicine";
        params.set("taxonomy_description", taxTerm + "*"); // wildcard for partial match
      }
      
      // Parse location — could be zip, city+state, or "city, state"
      const loc = location.trim();
      const zipMatch = loc.match(/^\d{5}(-\d{4})?$/);
      const cityStateMatch = loc.match(/^(.+?),?\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)$/i);
      
      if (zipMatch) {
        params.set("postal_code", loc.slice(0,5) + "*"); // wildcard for zip+4
      } else if (cityStateMatch) {
        params.set("city", cityStateMatch[1].trim());
        params.set("state", cityStateMatch[2].toUpperCase());
      } else if (loc.length === 2) {
        params.set("state", loc.toUpperCase());
      } else {
        params.set("city", loc);
      }

      const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?${params}`);
      const data = await res.json();
      
      if (data.results?.length) {
        const parsed = data.results.map(r => {
          const addr = r.addresses?.find(a => a.address_purpose === "LOCATION") || r.addresses?.[0] || {};
          const taxonomy = r.taxonomies?.find(t => t.primary) || r.taxonomies?.[0] || {};
          const isOrg = r.enumeration_type === "NPI-2";
          const name = isOrg 
            ? r.basic?.organization_name || "Unknown"
            : `${r.basic?.credential ? "" : "Dr. "}${r.basic?.first_name || ""} ${r.basic?.last_name || ""}${r.basic?.credential ? ", " + r.basic.credential : ""}`.trim();
          
          return {
            name,
            specialty: taxonomy.desc || specialty || "",
            address: [addr.address_1, addr.address_2, `${addr.city || ""}, ${addr.state || ""} ${addr.postal_code?.slice(0,5) || ""}`].filter(Boolean).join(", "),
            phone: addr.telephone_number ? addr.telephone_number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") : "",
            fax: addr.fax_number ? addr.fax_number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") : "",
            npi: r.number || "",
            accepting_new: true,
            state: addr.state || "",
            city: addr.city || "",
            zip: addr.postal_code?.slice(0,5) || "",
            source: "npi_registry",
            license_state: taxonomy.state || "",
            taxonomy_code: taxonomy.code || "",
          };
        }).filter(d => d.name && d.name !== "Dr. ");

        // If zip-based search, sort by zip proximity
        if (zipMatch) {
          const searchZip = parseInt(loc.slice(0,3));
          parsed.sort((a,b) => Math.abs(parseInt((a.zip||"00000").slice(0,3)) - searchZip) - Math.abs(parseInt((b.zip||"00000").slice(0,3)) - searchZip));
        }

        setResults(parsed);
      } else {
        // Fallback: try broader search without city
        if (cityStateMatch) {
          const params2 = new URLSearchParams({ version: "2.1", limit: "20" });
          if (specialty) {
            let taxTerm2 = specialty.replace(/\s*\/\s*.*/,"").replace(/\s*\(.*/,"").trim();
            if (taxTerm2 === "Primary Care") taxTerm2 = "Family Medicine";
            if (taxTerm2 === "Urgent Care") taxTerm2 = "Emergency Medicine";
            params2.set("taxonomy_description", taxTerm2 + "*");
          }
          params2.set("state", cityStateMatch[2].toUpperCase());
          const res2 = await fetch(`https://npiregistry.cms.hhs.gov/api/?${params2}`);
          const data2 = await res2.json();
          if (data2.results?.length) {
            const parsed2 = data2.results.map(r => {
              const addr = r.addresses?.find(a => a.address_purpose === "LOCATION") || r.addresses?.[0] || {};
              const taxonomy = r.taxonomies?.find(t => t.primary) || r.taxonomies?.[0] || {};
              const isOrg = r.enumeration_type === "NPI-2";
              const name = isOrg 
                ? r.basic?.organization_name || "Unknown"
                : `${r.basic?.credential ? "" : "Dr. "}${r.basic?.first_name || ""} ${r.basic?.last_name || ""}${r.basic?.credential ? ", " + r.basic.credential : ""}`.trim();
              return { name, specialty: taxonomy.desc || specialty || "", address: [addr.address_1, addr.address_2, `${addr.city||""}, ${addr.state||""} ${addr.postal_code?.slice(0,5)||""}`].filter(Boolean).join(", "), phone: addr.telephone_number ? addr.telephone_number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") : "", npi: r.number || "", accepting_new: true, source: "npi_registry" };
            }).filter(d => d.name && d.name !== "Dr. ");
            setResults(parsed2);
          }
        }
      }
    } catch(e) { console.error("NPI search error:", e); setResults([]); }
    setSearching(false);
    setView("results");
  };

  const saveDoctor = (doc) => {
    const docToSave = { ...doc, id: Date.now().toString(), savedAt: new Date().toISOString(), source: doc.source || "search" };
    update(s => { s.savedDoctors = [...(s.savedDoctors||[]), docToSave]; });
  };

  const removeDoctor = (id) => {
    update(s => { s.savedDoctors = s.savedDoctors.filter(d => d.id !== id); });
  };

  const isSaved = (doc) => savedDoctors.some(d => d.name === doc.name && d.specialty === doc.specialty);

  const importMyChart = async () => {
    if (!myChartText.trim()) return;
    setImporting(true);
    const prompt = `Extract doctor/provider information from this MyChart patient portal data. Return ONLY a JSON array of doctor objects with fields: name, specialty, phone, address, fax, email, npi, portal_url, hospital_affiliation, notes.

MyChart data:
${myChartText}

Extract all providers/doctors found. If data is missing for a field, use empty string.`;

    const response = await askMedicalAI([{role:"user",content:prompt}], state, { skipRAG: true });
    try {
      const jsonStr = response.text.replace(/```json?|```/g,"").trim();
      const match = jsonStr.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        parsed.forEach(doc => {
          const docToSave = { ...doc, id: Date.now().toString() + Math.random().toString(36).slice(2,6), savedAt: new Date().toISOString(), source: "mychart", accepting: true, rating: 0 };
          update(s => { s.savedDoctors = [...(s.savedDoctors||[]), docToSave]; });
        });
        setMyChartText("");
        setView("main");
      }
    } catch(e) {}
    setImporting(false);
  };

  const saveManual = () => {
    if (!manualDoc.name.trim()) return;
    saveDoctor({ ...manualDoc, source: "manual", rating: 0, distance_miles: 0 });
    setManualDoc({ name:"",specialty:"",phone:"",address:"",npi:"",portal:"",fax:"",email:"",notes:"",network:"",accepting:true });
    setView("main");
  };

  // ─── DETAIL VIEW ───
  if (selectedDoc) {
    const doc = selectedDoc;
    const saved = isSaved(doc);
    return (
      <div className="fade-up">
        <button onClick={() => setSelectedDoc(null)} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
        <div style={{...S.card,padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <h2 style={{...S.h2,fontSize:18}}>{doc.name}</h2>
              <div style={{fontSize:15,color:"var(--accent)",fontWeight:600,marginTop:4}}>{doc.specialty}</div>
            </div>
            {doc.rating > 0 && <div style={{display:"flex",alignItems:"center",gap:4,background:"var(--bg)",padding:"4px 10px",borderRadius:12}}>
              <span style={{color:"var(--accent2)"}}>★</span>
              <span style={{fontFamily:"var(--mono)",fontSize:16,fontWeight:600}}>{doc.rating}</span>
            </div>}
          </div>

          <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:10}}>
            {doc.address && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>📍</span><span>{doc.address}</span></div>}
            {doc.phone && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>📞</span><a href={`tel:${doc.phone.replace(/\D/g,"")}`} style={{color:"var(--accent)"}}>{doc.phone}</a></div>}
            {doc.fax && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>📠</span><span>{doc.fax}</span></div>}
            {doc.email && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>✉️</span><a href={`mailto:${doc.email}`} style={{color:"var(--accent)"}}>{doc.email}</a></div>}
            {doc.npi && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>🆔</span><span style={{fontFamily:"var(--mono)"}}>NPI: {doc.npi}</span></div>}
            {doc.portal_url && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>🌐</span><span>Patient Portal: {doc.portal_url}</span></div>}
            {doc.distance_miles > 0 && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>🚗</span><span>{doc.distance_miles} miles away</span></div>}
          </div>

          {(doc.education || doc.hospital_affiliation || doc.years_experience) && <div style={{marginTop:16,padding:12,background:"var(--bg)",borderRadius:8}}>
            {doc.education && <div style={{fontSize:15,marginBottom:4}}><strong>Education:</strong> {doc.education}</div>}
            {doc.hospital_affiliation && <div style={{fontSize:15,marginBottom:4}}><strong>Hospital:</strong> {doc.hospital_affiliation}</div>}
            {doc.years_experience && <div style={{fontSize:15}}><strong>Experience:</strong> {doc.years_experience} years</div>}
          </div>}

          {doc.languages && doc.languages.length > 0 && <div style={{marginTop:10}}><span style={{fontSize:14,color:"var(--dim)"}}>Languages:</span> <span style={{fontSize:15}}>{doc.languages.join(", ")}</span></div>}
          {doc.insurance && doc.insurance.length > 0 && <div style={{marginTop:6}}><span style={{fontSize:14,color:"var(--dim)"}}>Insurance:</span><div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>{doc.insurance.map((ins,i)=><span key={i} style={{fontSize:16,padding:"2px 8px",background:"var(--bg)",borderRadius:8,color:"var(--dim)"}}>{ins}</span>)}</div></div>}
          {doc.accepting !== undefined && <div style={{marginTop:8,fontSize:15,color:doc.accepting?"var(--success)":"var(--danger)"}}>{doc.accepting ? "✓ Accepting new patients" : "✕ Not accepting new patients"}</div>}
          {doc.notes && <div style={{marginTop:10,padding:10,background:"var(--bg)",borderRadius:8,fontSize:15,color:"var(--dim)"}}><strong>Notes:</strong> {doc.notes}</div>}
          {doc.source && <div style={{marginTop:8,fontSize:16,color:"var(--dim)",fontFamily:"var(--mono)"}}>Source: {doc.source === "mychart" ? "MyChart Import" : doc.source === "manual" ? "Manual Entry" : "Search"}</div>}

          <div style={{display:"flex",gap:8,marginTop:16}}>
            {!saved && <button onClick={()=>{saveDoctor(doc);setSelectedDoc({...doc});}} style={{...S.primaryBtn,flex:1,fontSize:15}}>💾 Save to My Doctors</button>}
            {saved && <div style={{...S.primaryBtn,flex:1,fontSize:15,opacity:0.6,textAlign:"center",cursor:"default"}}>✓ Saved</div>}
            {doc.phone && <a href={`tel:${doc.phone.replace(/\D/g,"")}`} style={{...S.secondaryBtn,textDecoration:"none",textAlign:"center",flex:1,fontSize:15}}>📞 Call</a>}
          </div>
        </div>
      </div>
    );
  }

  // ─── SEARCH RESULTS ───
  if (view === "results") {
    return (
      <div className="fade-up">
        <button onClick={() => setView("search")} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← New Search</button>
        <h2 style={S.h2}>🔍 {results.length} Doctor{results.length !== 1 ? "s" : ""} Found</h2>
        <div style={{fontSize:14,color:"var(--dim)",marginTop:2}}>{specialty || "All specialties"} · {location || "All locations"} · Source: CMS NPI Registry</div>

        {results.length === 0 && <div style={{...S.card,marginTop:16,textAlign:"center",padding:30}}><div style={{fontSize:36,marginBottom:8}}>🔍</div><p style={{fontSize:16,color:"var(--dim)"}}>No providers found. Try a broader search — use just the state abbreviation (e.g. "WA") or a wider specialty term. ZIP codes work best for local results.</p></div>}

        <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
          {results.map((doc, i) => (
            <button key={i} onClick={() => setSelectedDoc(doc)} className="card" style={{...S.card,padding:14,border:"none",cursor:"pointer",textAlign:"left",width:"100%"}}>
              <div style={{display:"flex",gap:10}}>
                <div style={{width:42,height:42,borderRadius:10,background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                  {DOCTOR_SPECIALTIES.find(s=>doc.specialty?.toLowerCase().includes(s.name.split(" ")[0].toLowerCase()))?.icon || "👨‍⚕️"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:600,fontSize:16,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{doc.name}</div>
                    {doc.rating > 0 && <span style={{fontSize:14,color:"var(--accent2)",flexShrink:0}}>★ {doc.rating}</span>}
                  </div>
                  <div style={{fontSize:14,color:"var(--accent)",marginTop:2}}>{doc.specialty}</div>
                  <div style={{fontSize:16,color:"var(--dim)",marginTop:3}}>{doc.address?.split(",").slice(0,2).join(",")}</div>
                  <div style={{display:"flex",gap:8,marginTop:4,alignItems:"center"}}>
                    {doc.npi && <span style={{fontSize:15,color:"var(--dim)",fontFamily:"var(--mono)"}}>NPI: {doc.npi}</span>}
                    {doc.phone && <span style={{fontSize:15,color:"var(--accent3)"}}>{doc.phone}</span>}
                    {isSaved(doc) && <span style={{fontSize:15,color:"var(--accent3)"}}>★ Saved</span>}
                  </div>
                </div>
                <span style={{color:"var(--dim)",alignSelf:"center"}}>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── SEARCH FORM ───
  if (view === "search") {
    return (
      <div className="fade-up">
        <button onClick={() => setView("main")} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
        <h2 style={S.h2}>🔍 Find a Doctor</h2>

        <div style={{...S.card,marginTop:14,padding:18}}>
          <h3 style={S.h3}>Specialty</h3>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
            {DOCTOR_SPECIALTIES.map(s => (
              <button key={s.name} onClick={() => setSpecialty(s.name)} style={{...S.chip,...(specialty === s.name ? S.chipActive : {}),fontSize:14,padding:"5px 10px"}}>{s.icon} {s.name.split(" / ")[0]}</button>
            ))}
          </div>
          <input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Or type any specialty..." style={{...S.input,marginTop:8}} />
        </div>

        <div style={{...S.card,marginTop:10,padding:18}}>
          <h3 style={S.h3}>📍 Location</h3>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="ZIP code, City ST, or state (e.g. 98199, Seattle WA)" style={{...S.input,marginTop:8}} />
          <div style={{fontSize:16,color:"var(--dim)",marginTop:6,lineHeight:1.4}}>Searches the CMS NPI Registry — all licensed US healthcare providers. Use ZIP code for best results, or City + State abbreviation (e.g. "Seattle, WA").</div>
        </div>

        {rec.length > 0 && <div style={{...S.card,marginTop:10,padding:14,borderLeft:"3px solid var(--accent)"}}>
          <div style={{fontSize:14,color:"var(--dim)"}}>🎯 <strong>Recommended for you:</strong></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:6}}>
            {rec.map(r => <button key={r} onClick={() => setSpecialty(r)} style={{...S.chip,...(specialty===r?S.chipActive:{}),fontSize:14,padding:"4px 10px"}}>{r}</button>)}
          </div>
        </div>}

        <button onClick={searchDoctors} disabled={searching || (!specialty && !location)} style={{...S.primaryBtn,width:"100%",marginTop:14,padding:14,opacity:searching?0.6:1}}>
          {searching ? "🔍 Searching NPI Registry..." : "🔍 Search Providers"}
        </button>
      </div>
    );
  }

  // ─── MYCHART IMPORT ───
  if (view === "mychart") {
    return (
      <div className="fade-up">
        <button onClick={() => setView("main")} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
        <h2 style={S.h2}>🏥 Import from MyChart</h2>
        <p style={{fontSize:15,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>Copy your doctor/provider information from your MyChart patient portal and paste it below. The AI will extract and save all provider details.</p>

        <div style={{...S.card,marginTop:14,padding:16}}>
          <h3 style={S.h3}>📋 How to export from MyChart</h3>
          <div style={{marginTop:8,fontSize:15,color:"var(--dim)",lineHeight:1.7}}>
            <div>1. Log in to your <strong>MyChart</strong> account</div>
            <div>2. Go to <strong>My Providers</strong> or <strong>Care Team</strong></div>
            <div>3. Select each provider to see their details</div>
            <div>4. Copy all the text (name, specialty, phone, address, NPI, etc.)</div>
            <div>5. Paste everything into the box below</div>
          </div>
        </div>

        <textarea value={myChartText} onChange={e => setMyChartText(e.target.value)} placeholder={"Paste your MyChart provider information here...\n\nExample:\nDr. Sarah Johnson, MD\nInternal Medicine\nNPI: 1234567890\nPhone: (555) 123-4567\nFax: (555) 123-4568\n123 Medical Center Dr, Suite 200\nSeattle, WA 98101\nAccepting New Patients: Yes\n\nYou can paste multiple providers at once."} rows={10} style={{...S.input,marginTop:12,resize:"vertical",fontFamily:"var(--mono)",fontSize:14}} />

        <button onClick={importMyChart} disabled={importing || !myChartText.trim()} style={{...S.primaryBtn,width:"100%",marginTop:12,padding:14,opacity:importing?0.6:1}}>
          {importing ? "🔄 Importing providers..." : "📥 Import Providers"}
        </button>

        <div style={{...S.card,marginTop:12,padding:14,borderLeft:"3px solid var(--accent3)"}}>
          <h3 style={{...S.h3,fontSize:15}}>💡 Also supported</h3>
          <p style={{fontSize:14,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>You can also paste provider info from <strong>Epic MyChart</strong>, <strong>Cerner</strong>, <strong>Athenahealth</strong>, discharge summaries, referral letters, or any text containing doctor information.</p>
        </div>
      </div>
    );
  }

  // ─── MANUAL ADD ───
  if (view === "add") {
    return (
      <div className="fade-up">
        <button onClick={() => setView("main")} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
        <h2 style={S.h2}>➕ Add Doctor Manually</h2>
        <div style={{...S.card,marginTop:14,padding:18}}>
          <div style={S.formGrid}>
            <label style={S.label}>Doctor Name *<input style={S.input} value={manualDoc.name} onChange={e => setManualDoc({...manualDoc,name:e.target.value})} placeholder="Dr. Jane Smith"/></label>
            <label style={S.label}>Specialty<input style={S.input} value={manualDoc.specialty} onChange={e => setManualDoc({...manualDoc,specialty:e.target.value})} placeholder="Cardiology"/></label>
            <label style={S.label}>Phone<input style={S.input} value={manualDoc.phone} onChange={e => setManualDoc({...manualDoc,phone:e.target.value})} placeholder="(555) 123-4567"/></label>
            <label style={S.label}>Fax<input style={S.input} value={manualDoc.fax} onChange={e => setManualDoc({...manualDoc,fax:e.target.value})} placeholder="(555) 123-4568"/></label>
          </div>
          <label style={{...S.label,marginTop:10}}>Address<input style={S.input} value={manualDoc.address} onChange={e => setManualDoc({...manualDoc,address:e.target.value})} placeholder="123 Medical Center Dr, Seattle, WA 98101"/></label>
          <label style={{...S.label,marginTop:8}}>Email<input style={S.input} value={manualDoc.email} onChange={e => setManualDoc({...manualDoc,email:e.target.value})} placeholder="dr.smith@clinic.com"/></label>
          <div style={{...S.formGrid,marginTop:8}}>
            <label style={S.label}>NPI Number<input style={S.input} value={manualDoc.npi} onChange={e => setManualDoc({...manualDoc,npi:e.target.value})} placeholder="1234567890"/></label>
            <label style={S.label}>Insurance Network<input style={S.input} value={manualDoc.network} onChange={e => setManualDoc({...manualDoc,network:e.target.value})} placeholder="Blue Cross"/></label>
          </div>
          <label style={{...S.label,marginTop:8}}>Patient Portal URL<input style={S.input} value={manualDoc.portal} onChange={e => setManualDoc({...manualDoc,portal:e.target.value})} placeholder="https://mychart.clinic.com"/></label>
          <label style={{...S.label,marginTop:8}}>Notes<textarea value={manualDoc.notes} onChange={e => setManualDoc({...manualDoc,notes:e.target.value})} placeholder="Preferred times, referral info, etc." rows={2} style={{...S.input,resize:"vertical"}}/></label>
          <label style={{...S.label,marginTop:8,flexDirection:"row",alignItems:"center",gap:8}}>
            <input type="checkbox" checked={manualDoc.accepting} onChange={e => setManualDoc({...manualDoc,accepting:e.target.checked})} style={{width:16,height:16}} />
            <span>Accepting new patients</span>
          </label>
          <button onClick={saveManual} disabled={!manualDoc.name.trim()} style={{...S.primaryBtn,width:"100%",marginTop:14}}>💾 Save Doctor</button>
        </div>
      </div>
    );
  }

  // ─── MAIN VIEW ───
  const myChartDocs = savedDoctors.filter(d => d.source === "mychart");
  const searchDocs = savedDoctors.filter(d => d.source === "search");
  const manualDocs = savedDoctors.filter(d => d.source === "manual");

  return (
    <div className="fade-up">
      <h2 style={S.h2}>👨‍⚕️ My Doctors</h2>
      <p style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Find, save, and manage your healthcare providers</p>

      {/* Action buttons */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
        <button onClick={() => setView("search")} className="card" style={{...S.card,padding:"16px 10px",textAlign:"center",border:"none",cursor:"pointer"}}>
          <div style={{fontSize:24}}>🔍</div>
          <div style={{fontSize:14,fontWeight:600,color:"var(--accent)",marginTop:4}}>Find Doctor</div>
          <div style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Search by specialty & distance</div>
        </button>
        <button onClick={() => setView("mychart")} className="card" style={{...S.card,padding:"16px 10px",textAlign:"center",border:"none",cursor:"pointer"}}>
          <div style={{fontSize:24}}>🏥</div>
          <div style={{fontSize:14,fontWeight:600,color:"var(--accent)",marginTop:4}}>MyChart Import</div>
          <div style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Import from patient portal</div>
        </button>
      </div>
      <button onClick={() => setView("add")} style={{...S.secondaryBtn,width:"100%",marginTop:8,fontSize:15}}>➕ Add Doctor Manually</button>

      {/* Saved Doctors */}
      {savedDoctors.length > 0 ? (
        <div style={{marginTop:20}}>
          {myChartDocs.length > 0 && <>
            <h3 style={{...S.h3,marginBottom:8}}>🏥 From MyChart ({myChartDocs.length})</h3>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {myChartDocs.map(doc => (
                <button key={doc.id} onClick={() => setSelectedDoc(doc)} className="card" style={{...S.card,padding:12,border:"none",cursor:"pointer",textAlign:"left",width:"100%"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:16,fontWeight:600}}>{doc.name}</div><div style={{fontSize:14,color:"var(--accent)",marginTop:2}}>{doc.specialty}</div>{doc.phone&&<div style={{fontSize:16,color:"var(--dim)",marginTop:2}}>{doc.phone}</div>}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{fontSize:15,padding:"2px 6px",background:"rgba(122,155,181,0.1)",borderRadius:6,color:"var(--accent3)"}}>MyChart</span>
                      <button onClick={(e) => {e.stopPropagation();removeDoctor(doc.id);}} style={{background:"none",border:"none",cursor:"pointer",color:"var(--danger)",fontSize:15}}>✕</button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>}

          {[...searchDocs,...manualDocs].length > 0 && <>
            <h3 style={{...S.h3,marginBottom:8}}>📋 Saved Doctors ({searchDocs.length + manualDocs.length})</h3>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {[...searchDocs,...manualDocs].map(doc => (
                <button key={doc.id} onClick={() => setSelectedDoc(doc)} className="card" style={{...S.card,padding:12,border:"none",cursor:"pointer",textAlign:"left",width:"100%"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:16,fontWeight:600}}>{doc.name}</div><div style={{fontSize:14,color:"var(--accent)",marginTop:2}}>{doc.specialty}</div>{doc.address&&<div style={{fontSize:16,color:"var(--dim)",marginTop:2}}>{doc.address.split(",").slice(0,2).join(",")}</div>}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      {doc.rating>0&&<span style={{fontSize:14,color:"var(--accent2)"}}>★ {doc.rating}</span>}
                      <button onClick={(e) => {e.stopPropagation();removeDoctor(doc.id);}} style={{background:"none",border:"none",cursor:"pointer",color:"var(--danger)",fontSize:15}}>✕</button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>}
        </div>
      ) : (
        <div style={{textAlign:"center",padding:"30px 20px",marginTop:16,color:"var(--dim)"}}>
          <div style={{fontSize:40,marginBottom:10}}>👨‍⚕️</div>
          <p style={{fontSize:16}}>No doctors saved yet. Search for providers, import from MyChart, or add manually.</p>
        </div>
      )}

      {/* Specialty Guide */}
      <div style={{...S.card,marginTop:16,padding:16}}>
        <h3 style={S.h3}>📖 Specialty Guide</h3>
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
          {DOCTOR_SPECIALTIES.map(doc => (
            <div key={doc.name} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderBottom:"1px solid var(--muted)"}}>
              <span style={{fontSize:18,width:28}}>{doc.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600}}>{doc.name}</div><div style={{fontSize:16,color:"var(--dim)"}}>{doc.when}</div></div>
              <button onClick={() => {setSpecialty(doc.name);setView("search");}} style={{fontSize:16,color:"var(--accent)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Search →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency */}
      <div style={{...S.card,marginTop:12,padding:16}}>
        <h3 style={S.h3}>🆘 Emergency</h3>
        <div style={{marginTop:8,fontSize:16,lineHeight:2}}>
          <div><strong>Emergency:</strong> <a href="tel:911" style={{color:"var(--danger)",fontFamily:"var(--mono)"}}>911</a></div>
          <div><strong>Poison:</strong> <a href="tel:18002221222" style={{color:"var(--accent)",fontFamily:"var(--mono)"}}>1-800-222-1222</a></div>
          <div><strong>Crisis:</strong> <a href="tel:988" style={{color:"var(--accent)",fontFamily:"var(--mono)"}}>988</a></div>
        </div>
      </div>
    </div>
  );
}
