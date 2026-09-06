import {NextResponse}from'next/server';
import {requireAdmin}from'@/lib/auth';
import {db}from'@/lib/db';

export async function POST(req:Request){
  await requireAdmin();
  const f=await req.formData();
  const variantId=String(f.get('variantId')||'');
  const file=f.get('file');
  if(!variantId||!(file instanceof File))return NextResponse.json({error:'Variant/file wajib'},{status:400});
  const variant=await db.productVariant.findUnique({where:{id:variantId},select:{id:true}});
  if(!variant)return NextResponse.json({error:'Variant tidak ditemukan'},{status:404});
  const text=await file.text();
  const keys=[...new Set(text.split(/\r?\n/).flatMap(line=>line.split(',')).map(key=>key.trim()).filter(key=>key.length>0&&key.length<=500))];
  if(!keys.length)return NextResponse.json({error:'File tidak berisi key valid'},{status:400});
  const result=await db.productKey.createMany({data:keys.map(key=>({variantId,key,status:'AVAILABLE'})),skipDuplicates:true});
  return NextResponse.json({ok:true,added:result.count,total:keys.length});
}