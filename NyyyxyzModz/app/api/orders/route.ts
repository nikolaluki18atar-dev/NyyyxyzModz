import {rateLimit} from '@/lib/security';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {getSession} from '@/lib/auth';
import {db} from '@/lib/db';
import {Prisma} from '@prisma/client';

function inv(){return 'INV-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+Math.random().toString(36).slice(2,7).toUpperCase()}

type ProductWithVariants=Prisma.ProductGetPayload<{include:{variants:true}}>;
type OrderProduct={p:ProductWithVariants;v:ProductWithVariants['variants'][number];quantity:number};

async function reserveKeys(tx:Prisma.TransactionClient,variantId:string,orderItemId:string,quantity:number,reservedUntil:Date){
	let reserved=0;
	let attempts=0;
	while(reserved<quantity&&attempts<quantity*5){
		attempts++;
		const candidate=await tx.productKey.findFirst({where:{variantId,OR:[{status:'AVAILABLE'},{status:'RESERVED',reservedUntil:{lte:new Date()}}]},orderBy:{createdAt:'asc'}});
		if(!candidate)break;
		const claimed=await tx.productKey.updateMany({where:{id:candidate.id,OR:[{status:'AVAILABLE'},{status:'RESERVED',reservedUntil:{lte:new Date()}}]},data:{status:'RESERVED',orderItemId,reservedUntil}});
		if(claimed.count===1)reserved++;
	}
	if(reserved<quantity)throw new Error('stock');
}

export async function POST(req:Request){
	const forwardedFor=req.headers.get('x-forwarded-for')||'unknown';
	if(!rateLimit(`order:${forwardedFor}`,12,60000))return NextResponse.json({error:'Terlalu banyak order. Coba lagi sebentar.'},{status:429});
	const u=await getSession();
	if(!u||!u.active)return NextResponse.json({error:'Login diperlukan'},{status:401});
	try{
		const body=await req.json();
		const data=z.object({items:z.array(z.object({productSlug:z.string(),variantName:z.string(),quantity:z.number().int().min(1).max(20)})).min(1).max(20),whatsapp:z.string().min(8).max(20),voucherCode:z.string().trim().min(1).optional()}).parse(body);
		const result=await db.$transaction(async tx=>{
			let invoice=inv();
			while(await tx.order.findUnique({where:{invoice}}))invoice=inv();
			const products:OrderProduct[]=[];
			for(const item of data.items){
				const p=await tx.product.findUnique({where:{slug:item.productSlug},include:{variants:true}});
				const v=p?.variants.find(x=>x.name===item.variantName&&x.active);
				if(!p||!v||!p.active)throw new Error('product');
				products.push({p,v,quantity:item.quantity});
			}
			const subtotal=products.reduce((sum,item)=>sum+item.v.price*item.quantity,0);
			let discount=0;
			const voucher=data.voucherCode?await tx.voucher.findUnique({where:{code:data.voucherCode.toUpperCase()}}):null;
			if(data.voucherCode){
				const now=new Date();
				if(!voucher||!voucher.active||subtotal<voucher.minPurchase||(voucher.maxUses!==null&&voucher.usedCount>=voucher.maxUses)||(voucher.startsAt!==null&&now<voucher.startsAt)||(voucher.expiresAt!==null&&now>voucher.expiresAt))throw new Error('voucher');
				discount=voucher.type==='PERCENT'?Math.floor(subtotal*voucher.value/100):voucher.value;
				discount=Math.min(discount,subtotal);
			}
			const total=subtotal-discount;
			const expiresAt=new Date(Date.now()+30*60*1000);
			const o=await tx.order.create({data:{invoice,userId:u.id,productName:products.length===1?products[0].p.name:`${products[0].p.name} + ${products.length-1} item`,variantName:products.length===1?products[0].v.name:'Multiple items',total,whatsapp:data.whatsapp,voucherCode:data.voucherCode?.toUpperCase(),paymentStatus:'PENDING',orderStatus:'PENDING',deliveryStatus:'WAITING',expiresAt,note:discount?`Voucher ${data.voucherCode} - Diskon Rp ${discount}`:null,items:{create:products.map(item=>({productId:item.p.id,variantId:item.v.id,quantity:item.quantity,price:item.v.price}))}}});
			const items=await tx.orderItem.findMany({where:{orderId:o.id}});
			for(const item of items)await reserveKeys(tx,item.variantId,item.id,item.quantity,expiresAt);
			if(u.role==='RESELLER'){
				const debited=await tx.user.updateMany({where:{id:u.id,credit:{gte:total}},data:{credit:{decrement:total}}});
				if(debited.count===1){
					const fresh=await tx.user.findUniqueOrThrow({where:{id:u.id},select:{credit:true}});
					for(const item of items)await tx.productKey.updateMany({where:{orderItemId:item.id,status:'RESERVED'},data:{status:'SOLD',soldAt:new Date(),reservedUntil:null}});
					await tx.creditTransaction.create({data:{userId:u.id,amount:-total,balanceAfter:fresh.credit,type:'PURCHASE',note:`Order ${o.invoice}`}});
					if(voucher){
						const used=await tx.voucher.updateMany({where:{id:voucher.id,OR:[{maxUses:null},{maxUses:{gt:voucher.usedCount}}]},data:{usedCount:{increment:1}}});
						if(used.count!==1)throw new Error('voucher');
					}
					await tx.order.update({where:{id:o.id},data:{paymentStatus:'PAID',orderStatus:'SUCCESS',deliveryStatus:'DELIVERED'}});
					await tx.activity.create({data:{type:'RESELLER',message:`Order reseller ${o.invoice} dibayar dengan credit`,userId:u.id}});
					return {invoice:o.invoice,creditPaid:true};
				}
			}
			await tx.activity.create({data:{type:'ORDER',message:`Order baru ${invoice}`,userId:u.id}});
			return {invoice:o.invoice,creditPaid:false};
		},{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
		return NextResponse.json({ok:true,...result});
	}catch(error){
		const message=error instanceof Error?error.message:'';
		return NextResponse.json({error:message==='stock'?'Stok key tidak cukup':message==='voucher'?'Voucher tidak valid':message==='product'?'Produk/variant tidak ditemukan':'Gagal membuat order'},{status:400});
	}
}
