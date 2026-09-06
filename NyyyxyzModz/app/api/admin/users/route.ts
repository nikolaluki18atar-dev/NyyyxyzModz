import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/auth';
import {db} from '@/lib/db';
import {logActivity} from '@/lib/admin';

const roles=['CUSTOMER','ADMIN','RESELLER'] as const;
type UserRole=typeof roles[number];

export async function POST(req:Request){
  const admin=await requireAdmin();
  const f=await req.formData();
  const id=String(f.get('id')||'');
  const email=String(f.get('email')||'').trim().toLowerCase();
  const action=String(f.get('action')||'');
  const user=id?await db.user.findUnique({where:{id}}):await db.user.findUnique({where:{email}});
  if(user&&user.id!==admin.id){
    if(action==='toggle')await db.user.update({where:{id:user.id},data:{active:!user.active}});
    else{
      const roleInput=String(f.get('role')||user.role);
      const role=(roles.includes(roleInput as UserRole)?roleInput:user.role) as UserRole;
      const creditInput=Number(f.get('credit')||user.credit);
      const delta=Number(f.get('delta')||0);
      const credit=Number.isFinite(creditInput)?Math.max(0,Math.floor(creditInput)):user.credit;
      const adjustment=Number.isFinite(delta)?Math.floor(delta):0;
      const nextCredit=Math.max(0,credit+adjustment);
      await db.$transaction(async tx=>{
        await tx.user.update({where:{id:user.id},data:{role,credit:nextCredit}});
        if(adjustment)await tx.creditTransaction.create({data:{userId:user.id,amount:nextCredit-credit,balanceAfter:nextCredit,type:'ADMIN_ADJUSTMENT',note:`Diubah oleh ${admin.email}`}});
      });
      if(adjustment)await logActivity('USER',`User ${user.email} diperbarui oleh admin`,admin.id);
    }
  }
  return NextResponse.redirect(new URL('/admin/users',req.url));
}