import {NextResponse} from 'next/server'; import {cookies} from 'next/headers'; import {db} from '@/lib/db';
export async function POST(){const c=await cookies();const token=c.get('session')?.value;if(token)await db.session.deleteMany({where:{token}}).catch(()=>{});const r=NextResponse.redirect(new URL('/login',process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'));r.cookies.delete('session');return r}
export async function GET(){return POST()}
