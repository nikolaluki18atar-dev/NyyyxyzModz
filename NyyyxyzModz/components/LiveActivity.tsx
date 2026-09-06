'use client';
import {useEffect,useState}from'react';

type ActivityRow={id:string;message:string;createdAt:string};

export default function LiveActivity(){
  const [rows,setRows]=useState<ActivityRow[]>([]);
  useEffect(()=>{
    let es:EventSource|undefined;
    let fallbackTimer:ReturnType<typeof setInterval>|undefined;
    const fallback=()=>fetch('/api/activity').then(r=>r.json()).then(setRows).catch(()=>{});
    const startFallback=()=>{fallback();if(!fallbackTimer)fallbackTimer=setInterval(fallback,30000)};
    try{
      es=new EventSource('/api/activity/stream');
      es.onmessage=e=>{try{setRows(JSON.parse(e.data) as ActivityRow[])}catch{}};
      es.onerror=()=>{es?.close();es=undefined;startFallback()};
    }catch{startFallback()}
    return()=>{es?.close();if(fallbackTimer)clearInterval(fallbackTimer)};
  },[]);
  return <div className="panel"><div className="row"><h2>Live Activity</h2><span className="tag">REALTIME</span></div>{rows.length?rows.slice(0,6).map(x=><div className="activity" key={x.id}><span className="dot"/><div><b>{x.message}</b><div className="muted small">{new Date(x.createdAt).toLocaleString('id-ID')}</div></div></div>):<p className="muted">Belum ada aktivitas publik.</p>}</div>
}