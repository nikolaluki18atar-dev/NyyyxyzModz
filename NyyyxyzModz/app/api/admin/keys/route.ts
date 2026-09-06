import {NextResponse}from'next/server';
import {requireAdmin}from'@/lib/auth';
import {db}from'@/lib/db';

export async function POST(req:Request){
  await requireAdmin();
  const f=await req.formData();
  const variantId=String(f.get('variantId')||'');
  const keys=[...new Set(String(f.get('keys')||'').split(/\r?\n/).map(key=>key.trim()).filter(key=>key.length>0&&key.length<=500))];
  if(!variantId||!keys.length)return NextResponse.redirect(new URL('/admin/keys',req.url));
  const variant=await db.productVariant.findUnique({where:{id:variantId},select:{id:true}});
  if(variant)await db.productKey.createMany({data:keys.map(key=>({variantId,key,status:'AVAILABLE'})),skipDuplicates:true});
  return NextResponse.redirect(new URL('/admin/keys',req.url));
}