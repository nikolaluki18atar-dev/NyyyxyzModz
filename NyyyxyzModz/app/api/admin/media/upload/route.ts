import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/auth';
import {db} from '@/lib/db';

const MAX_UPLOAD_SIZE=5*1024*1024;

export async function POST(req:Request){
  await requireAdmin();
  const f=await req.formData();
  const file=f.get('file');
  if(!(file instanceof File))return NextResponse.json({error:'File wajib'},{status:400});
  if(!file.type.startsWith('image/'))return NextResponse.json({error:'Hanya file gambar yang diterima'},{status:415});
  if(file.size>MAX_UPLOAD_SIZE)return NextResponse.json({error:'Ukuran file maksimal 5 MB'},{status:413});
  if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return NextResponse.json({error:'Supabase Storage belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.'},{status:503});
  const bucket=process.env.SUPABASE_STORAGE_BUCKET||'media';
  const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
  const path=`${Date.now()}-${safe}`;
  const bytes=await file.arrayBuffer();
  const response=await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':file.type,'x-upsert':'false'},body:bytes});
  if(!response.ok)return NextResponse.json({error:'Upload media gagal'},{status:502});
  const url=`${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  const media=await db.media.create({data:{name:file.name,url,type:'image'}});
  return NextResponse.json({ok:true,media});
}