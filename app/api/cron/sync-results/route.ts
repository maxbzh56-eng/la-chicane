import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getSessionResult } from '@/lib/openf1';

export const dynamic = 'force-dynamic';

export async function GET(){
  try{
    const db = supabaseServer();
    const { data: races, error } = await db
      .from('races')
      .select('id, session_key')
      .not('session_key','is', null);
    if(error) throw error;
    let updated = 0;
    for(const r of races||[]){
      if(!r.session_key) continue;
      const results = await getSessionResult(r.session_key);
      if(!Array.isArray(results) || results.length===0) continue;
      const rows = results.map((x:any)=>({
        session_key: r.session_key,
        driver_number: x.driver_number,
        position: x.position,
        dnf: !!x.dnf
      }));
      const { error: upErr } = await db.from('session_results').upsert(rows, { onConflict: 'session_key,driver_number' });
      if(upErr) throw upErr; updated++;
    }
    return NextResponse.json({ ok:true, updated });
  }catch(e:any){
    return NextResponse.json({ ok:false, error: e.message }, { status: 500 });
  }
}
