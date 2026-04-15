// Daily-log helpers. Extracted from App.jsx.

export function getOrCreateLog(logs,date){const e=logs.find(l=>l.date===date);return e||{date,water:0,calories:0,protein:0,carbs:0,fat:0,fiber:0,steps:0,sleep:0,mood:-1,exercise:[],supplements:[],meals:[],notes:""};}
export function getWeekLogs(logs){const w=[];const d=new Date();for(let i=6;i>=0;i--){const dd=new Date(d);dd.setDate(dd.getDate()-i);w.push(getOrCreateLog(logs,dd.toISOString().slice(0,10)));}return w;}
export function computeStreak(logs){let s=0;const sorted=[...logs].sort((a,b)=>b.date.localeCompare(a.date));const d=new Date();for(let i=0;i<60;i++){const ds=d.toISOString().slice(0,10);const l=sorted.find(x=>x.date===ds);if(l&&(l.water>0||l.calories>0||l.exercise.length>0))s++;else if(i>0)break;d.setDate(d.getDate()-1);}return s;}
