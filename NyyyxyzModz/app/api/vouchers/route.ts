import {NextResponse} from 'next/server';
import {z} from 'zod';
import {db} from '@/lib/db';

const voucherInput=z.object({code:z.string().trim().min(1).max(80),subtotal:z.number().finite().nonnegative().max(1_000_000_000)});

export async function POST(req:Request){
  try{
    const {code,subtotal}=voucherInput.parse(await req.json());
    const voucher=await db.voucher.findUnique({where:{code:code.toUpperCase()}});
    const now=new Date();
    if(!voucher||!voucher.active||subtotal<voucher.minPurchase||(voucher.maxUses!==null&&voucher.usedCount>=voucher.maxUses)||(voucher.startsAt!==null&&now<voucher.startsAt)||(voucher.expiresAt!==null&&now>voucher.expiresAt))return NextResponse.json({error:'Voucher tidak valid'},{status:400});
    const discount=Math.min(voucher.type==='PERCENT'?Math.floor(subtotal*voucher.value/100):voucher.value,subtotal);
    return NextResponse.json({ok:true,discount,total:subtotal-discount});
  }catch{return NextResponse.json({error:'Input voucher tidak valid'},{status:400})}
}