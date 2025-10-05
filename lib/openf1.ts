const BASE = process.env.OPENF1_BASE || 'https://api.openf1.org/v1';
export async function getSessionResult(session_key:number){
  const r = await fetch(`${BASE}/session_result?session_key=${session_key}`);
  if(!r.ok) throw new Error('OpenF1 result');
  return r.json();
}
