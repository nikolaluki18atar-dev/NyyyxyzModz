import {db}from'@/lib/db';

export const dynamic='force-dynamic';

export async function GET(){
  const encoder=new TextEncoder();
  let closed=false;
  let interval:ReturnType<typeof setInterval>|undefined;
  let timeout:ReturnType<typeof setTimeout>|undefined;
  const close=()=>{if(closed)return;closed=true;if(interval)clearInterval(interval);if(timeout)clearTimeout(timeout)};
  const stream=new ReadableStream({
    async start(controller){
      const push=async()=>{
        if(closed)return;
        const rows=await db.activity.findMany({where:{demo:false},orderBy:{createdAt:'desc'},take:12}).catch(()=>[]);
        if(closed)return;
        try{controller.enqueue(encoder.encode(`data: ${JSON.stringify(rows)}\n\n`))}catch{close()}
      };
      await push();
      interval=setInterval(push,3000);
      timeout=setTimeout(()=>{close();try{controller.close()}catch{}},55000);
    },
    cancel(){close()}
  });
  return new Response(stream,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive'}});
}