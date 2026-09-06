const hits=new Map<string,{count:number;at:number}>();
export function rateLimit(key:string,limit=20,windowMs=60000){const now=Date.now(),x=hits.get(key);if(!x||now-x.at>windowMs){hits.set(key,{count:1,at:now});return true}x.count++;return x.count<=limit}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(!origin)return true;try{return new URL(origin).origin===new URL(req.url).origin}catch{return false}}
export function cronAuthorized(req:Request){const secret=process.env.CRON_SECRET;if(!secret)return process.env.NODE_ENV!=='production';return req.headers.get('authorization')===`Bearer ${secret}`}
