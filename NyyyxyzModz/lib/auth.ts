import { cookies } from 'next/headers';
import { db } from './db';
import crypto from 'crypto';
export async function getSession(){const token=(await cookies()).get('session')?.value;if(!token)return null;const s=await db.session.findUnique({where:{token},include:{user:true}}).catch(()=>null);if(!s)return null;if(s.expiresAt<new Date()){await db.session.delete({where:{id:s.id}}).catch(()=>{});return null}return s.user;}
export function newToken(){return crypto.randomBytes(32).toString('hex')}
export async function requireUser(){const u=await getSession();if(!u)throw new Error('UNAUTHORIZED');return u}
export async function requireAdmin(){const u=await requireUser();if(u.role!=='ADMIN')throw new Error('FORBIDDEN');return u}
