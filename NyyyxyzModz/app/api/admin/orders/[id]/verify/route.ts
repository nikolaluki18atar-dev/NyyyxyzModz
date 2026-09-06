import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/auth';
import {db} from '@/lib/db';
import {Prisma} from '@prisma/client';

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
  const admin=await requireAdmin();
  const {id}=await params;
  try{
    const order=await db.$transaction(async tx=>{
      const current=await tx.order.findUnique({where:{id},include:{items:true}});
      if(!current)throw new Error('notfound');
      if(current.paymentStatus==='PAID')return current;
      let firstKey:string|undefined;
      for(const item of current.items){
        let delivered=0;
        let attempts=0;
        while(delivered<item.quantity&&attempts<item.quantity*5){
          attempts++;
          const now=new Date();
          const candidate=await tx.productKey.findFirst({where:{variantId:item.variantId,OR:[{status:'AVAILABLE'},{status:'RESERVED',orderItemId:item.id,reservedUntil:{gt:now}}]},orderBy:{createdAt:'asc'}});
          if(!candidate)break;
          const claimed=await tx.productKey.updateMany({where:{id:candidate.id,OR:[{status:'AVAILABLE'},{status:'RESERVED',orderItemId:item.id,reservedUntil:{gt:now}}]},data:{status:'SOLD',soldAt:new Date(),reservedUntil:null,orderItemId:item.id}});
          if(claimed.count===1){
            if(!firstKey)firstKey=candidate.id;
            delivered++;
          }
        }
        if(delivered<item.quantity)throw new Error('stock');
      }
      if(current.voucherCode){
        const voucher=await tx.voucher.findUnique({where:{code:current.voucherCode}});
        if(!voucher||!voucher.active)throw new Error('voucher');
        const used=await tx.voucher.updateMany({where:{id:voucher.id,OR:[{maxUses:null},{maxUses:{gt:voucher.usedCount}}]},data:{usedCount:{increment:1}}});
        if(used.count!==1)throw new Error('voucher');
      }
      const updated=await tx.order.update({where:{id},data:{paymentStatus:'PAID',orderStatus:'SUCCESS',deliveryStatus:'DELIVERED',keyId:firstKey}});
      await tx.activity.create({data:{type:'PAYMENT',message:`Pembayaran ${current.invoice} diverifikasi oleh admin`,userId:admin.id}});
      return updated;
    },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
    return NextResponse.json({ok:true,invoice:order.invoice});
  }catch(error){
    const message=error instanceof Error?error.message:'';
    return NextResponse.json({error:message==='stock'?'Stok key tidak cukup':message==='voucher'?'Voucher sudah tidak tersedia':'Gagal verifikasi'},{status:400});
  }
}