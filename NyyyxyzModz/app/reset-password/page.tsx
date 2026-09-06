'use client';
import {Suspense,useState} from 'react';
import {useSearchParams,useRouter} from 'next/navigation';

function ResetForm(){
  const q=useSearchParams();
  const r=useRouter();
  const [password,setPassword]=useState('');
  const [msg,setMsg]=useState('');
  async function go(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const x=await fetch('/api/auth/reset-password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:q.get('token'),password})});
    const j=await x.json();
    if(x.ok)r.push('/login');
    else setMsg(j.error);
  }
  return <main className="container section"><form className="panel form" onSubmit={go}><div className="eyebrow">ACCOUNT</div><h1>Password Baru</h1><div className="field"><label>Password minimal 8 karakter</label><input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></div>{msg&&<p className="danger">{msg}</p>}<button className="btn primary">Simpan Password</button></form></main>;
}

export default function Reset(){return <Suspense fallback={<main className="container section"><div className="panel form">Memuat...</div></main>}><ResetForm/></Suspense>}