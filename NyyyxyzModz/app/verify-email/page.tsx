'use client';
import {Suspense,useEffect,useState} from 'react';
import {useSearchParams,useRouter} from 'next/navigation';

function VerifyStatus(){
  const q=useSearchParams();
  const r=useRouter();
  const [msg,setMsg]=useState('Memverifikasi...');
  useEffect(()=>{
    fetch('/api/auth/verify-email',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:q.get('token')})}).then(x=>x.json()).then(j=>{setMsg(j.ok?'Email berhasil diverifikasi.':'Token tidak valid/expired.');if(j.ok)setTimeout(()=>r.push('/account'),1200)}).catch(()=>setMsg('Gagal memverifikasi.'));
  },[q,r]);
  return <main className="container section"><div className="panel form"><div className="eyebrow">EMAIL</div><h1>{msg}</h1></div></main>;
}

export default function Verify(){return <Suspense fallback={<main className="container section"><div className="panel form">Memverifikasi...</div></main>}><VerifyStatus/></Suspense>}