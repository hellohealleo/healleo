// RenderMD — markdown→React for AI responses.
// Kept verbatim from the original single-file app.

export function RenderMD({text}) {
  if (!text) return null;
  const lines=text.split("\n"),elems=[];let listItems=[];
  const flush=()=>{if(listItems.length){elems.push(<ul key={`u${elems.length}`} style={{margin:"6px 0",paddingLeft:20}}>{listItems.map((l,j)=><li key={j} style={{marginBottom:4}}>{ri(l)}</li>)}</ul>);listItems=[];}};
  const ri=(s)=>{const p=[];const rx=/(\*\*(.+?)\*\*)|(\[Source:\s*(.+?)\])|(PMID:\s*(\d+))/g;let last=0,m;while((m=rx.exec(s))!==null){if(m.index>last)p.push(s.slice(last,m.index));
    if(m[1])p.push(<strong key={m.index}>{m[2]}</strong>);
    if(m[3]){
      const src=m[4];
      const isPubmed=src.match(/PubMed\s+PMID:?\s*(\d+)/i);
      const isFDA=/FDA/i.test(src);
      if(isPubmed){p.push(<a key={m.index} href={`https://pubmed.ncbi.nlm.nih.gov/${isPubmed[1]}/`} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",fontSize:16,fontFamily:"var(--mono)",background:"rgba(179,148,167,0.15)",color:"var(--accent3)",padding:"1px 6px",borderRadius:4,marginLeft:2,textDecoration:"none",cursor:"pointer"}}>📄 PubMed {isPubmed[1]}</a>);}
      else if(isFDA){p.push(<span key={m.index} style={{display:"inline-block",fontSize:16,fontFamily:"var(--mono)",background:"rgba(0,190,214,0.12)",color:"var(--accent4)",padding:"1px 6px",borderRadius:4,marginLeft:2}}>🏛️ {src}</span>);}
      else{p.push(<span key={m.index} style={{display:"inline-block",fontSize:16,fontFamily:"var(--mono)",background:"rgba(107,90,36,0.1)",color:"var(--accent)",padding:"1px 6px",borderRadius:4,marginLeft:2}}>{src}</span>);}
    }
    if(m[5]){p.push(<a key={m.index} href={`https://pubmed.ncbi.nlm.nih.gov/${m[6]}/`} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",fontSize:16,fontFamily:"var(--mono)",background:"rgba(179,148,167,0.15)",color:"var(--accent3)",padding:"1px 6px",borderRadius:4,textDecoration:"none",cursor:"pointer"}}>📄 PMID:{m[6]}</a>);}
    last=m.index+m[0].length;}if(last<s.length)p.push(s.slice(last));return p.length?p:s;};
  lines.forEach((line,i)=>{const t=line.trim();if(t.startsWith("### ")){flush();elems.push(<h4 key={i} style={{fontSize:14,fontWeight:600,margin:"14px 0 6px"}}>{ri(t.slice(4))}</h4>);}else if(t.startsWith("## ")){flush();elems.push(<h3 key={i} style={{fontSize:15,fontWeight:600,margin:"16px 0 6px"}}>{ri(t.slice(3))}</h3>);}else if(t.startsWith("# ")){flush();elems.push(<h3 key={i} style={{fontSize:16,fontWeight:700,margin:"16px 0 8px",fontFamily:"var(--display)"}}>{ri(t.slice(2))}</h3>);}else if(t.startsWith("- ")||t.startsWith("* ")){listItems.push(t.slice(2));}else if(/^\d+\.\s/.test(t)){listItems.push(t.replace(/^\d+\.\s/,""));}else if(t.startsWith("> ")){flush();elems.push(<blockquote key={i} style={{borderLeft:"3px solid var(--accent)",paddingLeft:12,margin:"8px 0",color:"var(--dim)",fontStyle:"italic",fontSize:16}}>{ri(t.slice(2))}</blockquote>);}else if(t.startsWith("⚠")||t.startsWith("🚨")){flush();elems.push(<div key={i} style={{background:"rgba(184,84,84,0.08)",border:"1px solid rgba(184,84,84,0.2)",borderRadius:8,padding:"10px 14px",margin:"8px 0",fontSize:16,fontWeight:600,color:"#8b3a3a"}}>{ri(t)}</div>);}else if(t===""){flush();}else{flush();elems.push(<p key={i} style={{margin:"6px 0",lineHeight:1.65}}>{ri(t)}</p>);}});flush();
  return <div style={{fontSize:16,color:"var(--text)"}}>{elems}</div>;
}
