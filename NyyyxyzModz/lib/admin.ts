import { db } from '@/lib/db';
export async function settingsMap(){const rows=await db.siteSetting.findMany();return Object.fromEntries(rows.map(x=>[x.key,x.value]));}
export async function logActivity(type:string,message:string,userId?:string,demo=false){try{await db.activity.create({data:{type,message,userId,demo}})}catch{}}
export async function recordCredit(userId:string,amount:number,type:string,note?:string,tx:any=db){const u=await tx.user.update({where:{id:userId},data:{credit:{increment:amount}}});await tx.creditTransaction.create({data:{userId,amount,balanceAfter:u.credit,type,note}});return u;}
