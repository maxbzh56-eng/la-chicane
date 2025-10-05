
'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseBrowser';

export default function Page(){
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    (async()=>{
      const { data } = await supabase.auth.getUser();
      setUser(data.user); setLoading(false);
      supabase.auth.onAuthStateChange((_e, s)=> setUser(s?.user ?? null));
    })();
  },[]);
  if (loading) return <div className="p-4">Chargement…</div>;
  if (!user) return <AuthBlock/>;
  return <LeagueHome user={user}/>;
}

function AuthBlock(){
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  async function login(){
    const { error } = await supabase.auth.signInWithOtp({ email });
    if(error) return alert(error.message);
    setSent(true);
  }
  return (
    <div className="max-w-md mx-auto p-4 space-y-3">
      <h1 className="text-3xl font-bold">🏎️ La Chicane</h1>
      <p>Connecte-toi avec un <b>lien magique</b> :</p>
      <div className="flex gap-2">
        <input className="flex-1 border rounded px-3 py-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="px-3 py-2 rounded bg-black text-white" onClick={login}>Recevoir le lien</button>
      </div>
      {sent && <p className="text-sm text-emerald-700">Lien envoyé. Vérifie tes mails.</p>}
    </div>
  );
}

function LeagueHome({ user }:{ user:any }){
  const [leagues, setLeagues] = useState<any[]>([]);
  const [leagueName, setLeagueName] = useState('Ligue des potes');
  const [joinId, setJoinId] = useState('');
  const [current, setCurrent] = useState<any>(null);

  async function load(){
    const { data } = await supabase.from('league_members').select('league_id, leagues(*)').eq('user_id', user.id);
    setLeagues((data||[]).map((r:any)=>r.leagues));
  }
  useEffect(()=>{ load(); },[]);

  async function createLeague(){
    const { data, error } = await supabase.from('leagues').insert({ name: leagueName, owner_id: user.id }).select();
    if(error) return alert(error.message);
    const league = data![0];
    await supabase.from('league_members').insert({ league_id: league.id, user_id: user.id, role: 'owner' });
    await load();
  }
  async function joinLeague(){
    if(!joinId) return;
    await supabase.from('league_members').insert({ league_id: joinId, user_id: user.id, role: 'member' });
    setJoinId('');
    await load();
  }
  async function logout(){ await supabase.auth.signOut(); }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">🏎️ La Chicane</h1>
        <span className="text-sm text-slate-600 ml-2">Connecté : {user.email}</span>
        <button onClick={logout} className="ml-auto text-sm underline">Se déconnecter</button>
      </header>

      <section className="bg-white rounded-2xl shadow p-4">
        <h2 className="font-semibold mb-3">Mes ligues</h2>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <input className="border rounded px-3 py-2" value={leagueName} onChange={e=>setLeagueName(e.target.value)} />
          <button className="px-3 py-2 rounded bg-black text-white" onClick={createLeague}>Créer une ligue</button>
          <div className="ml-4 flex items-center gap-2">
            <input className="border rounded px-3 py-2" placeholder="ID de ligue pour rejoindre" value={joinId} onChange={e=>setJoinId(e.target.value)} />
            <button className="px-3 py-2 rounded bg-slate-200" onClick={joinLeague}>Rejoindre</button>
          </div>
        </div>
        <ul className="space-y-2">
          {leagues.map((l:any)=>(
            <li key={l.id} className="flex items-center gap-2">
              <button className="underline" onClick={()=>setCurrent(l)}>{l.name}</button>
              <span className="text-xs text-slate-600">ID: <code className="bg-slate-100 px-1">{l.id}</code></span>
            </li>
          ))}
        </ul>
      </section>

      {current && <LeaguePanel league={current} user={user}/>}
    </div>
  );
}

function LeaguePanel({ league, user }:{ league:any, user:any }){
  const [races, setRaces] = useState<any[]>([]);
  const [raceName, setRaceName] = useState('Grand Prix à venir');
  const [lockAt, setLockAt] = useState<string>('');
  const [sessionKey, setSessionKey] = useState<string>('');
  const [selectedRace, setSelectedRace] = useState<any>(null);

  async function loadRaces(){
    const { data } = await supabase.from('races').select('*').eq('league_id', league.id).order('created_at', { ascending: false });
    setRaces(data||[]);
  }
  useEffect(()=>{ loadRaces(); },[league.id]);

  async function createRace(){
    const { data, error } = await supabase.from('races').insert({
      league_id: league.id,
      name: raceName,
      lock_at: lockAt || null,
      session_key: sessionKey ? Number(sessionKey) : null
    }).select();
    if(error) return alert(error.message);
    setRaceName('Grand Prix à venir'); setLockAt(''); setSessionKey('');
    setRaces((prev)=>[data![0], ...prev]);
  }

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="font-semibold mb-3">🏁 Courses</h3>
        <div className="grid gap-2 mb-3">
          <input className="border rounded px-3 py-2" value={raceName} onChange={e=>setRaceName(e.target.value)} placeholder="Nom de la course"/>
          <input className="border rounded px-3 py-2" type="datetime-local" value={lockAt} onChange={e=>setLockAt(e.target.value)} placeholder="Verrouillage"/>
          <input className="border rounded px-3 py-2" value={sessionKey} onChange={e=>setSessionKey(e.target.value)} placeholder="session_key OpenF1 (optionnel)"/>
          <button className="px-3 py-2 rounded bg-black text-white" onClick={createRace}>Créer la course</button>
        </div>
        <ul className="space-y-2">
          {races.map((r:any)=>(
            <li key={r.id} className={`p-2 rounded-xl border ${selectedRace?.id===r.id?'border-slate-900':'border-slate-200'} flex items-center justify-between gap-2`}>
              <button className="text-left" onClick={()=>setSelectedRace(r)}>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-slate-600">Verrou: {r.lock_at ? new Date(r.lock_at).toLocaleString() : '—'} • session_key: {r.session_key ?? '—'}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="sm:col-span-2 bg-white rounded-2xl shadow p-4">
        {!selectedRace ? <div className="text-slate-600">Sélectionne une course.</div> : <RaceArea race={selectedRace} user={user}/>}
      </div>
    </div>
  );
}

function RaceArea({ race, user }:{ race:any, user:any }){
  const [prediction, setPrediction] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [allPreds, setAllPreds] = useState<any[]>([]);
  const [resultsMap, setResultsMap] = useState<Record<string,string>>({});
  const [autoBusy, setAutoBusy] = useState(false);

  const locked = useMemo(()=> race.lock_at ? new Date() >= new Date(race.lock_at) : false, [race.lock_at]);

  async function loadMembers(){
    const { data } = await supabase.from('league_members').select('user_id, role, users: user_id (email)').eq('league_id', race.league_id);
    setMembers(data||[]);
  }
  async function loadPreds(){
    const { data } = await supabase.from('predictions').select('*').eq('race_id', race.id);
    setAllPreds(data||[]);
  }
  useEffect(()=>{ loadMembers(); loadPreds(); },[race.id]);

  async function savePrediction(){
    if(!prediction) return;
    const { error } = await supabase.from('predictions').upsert({ race_id: race.id, user_id: user.id, driver: prediction });
    if(error) return alert(error.message);
    await loadPreds();
    setPrediction('');
  }

  async function setResultFor(uid:string, value:string){ setResultsMap(m=>({ ...m, [uid]: value })); }

  // Local ranking preview
  const DEFAULT_DNF = 21;
  const ranking = useMemo(()=>{
    const scores = members.map((m:any)=>{
      const val = resultsMap[m.user_id];
      let pts = 0;
      if(val==='DNF') pts = DEFAULT_DNF;
      else if(val && /^\\d+$/.test(val)) pts = parseInt(val,10);
      return { user_id: m.user_id, email: m.users?.email ?? m.user_id, pts };
    });
    return scores.sort((a,b)=>a.pts-b.pts);
  },[members, resultsMap]);

  async function autoFillFromOpenF1(){
    if(!race.session_key) return alert('Ajoute un session_key OpenF1 à la course.');
    setAutoBusy(true);
    try{
      const res = await fetch(`https://api.openf1.org/v1/session_result?session_key=${race.session_key}`);
      const data = await res.json();
      if(!Array.isArray(data) || data.length===0) { alert('Pas de résultats pour cette session'); return; }

      // Directory for matching
      let directory:any[] = [];
      if (race.meeting_key){
        const dr = await fetch(`https://api.openf1.org/v1/drivers?meeting_key=${race.meeting_key}`);
        directory = await dr.json();
      }
      const norm = (s:string)=> s?.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]+/g,'');
      const byNumber = new Map<number, any>(data.map((x:any)=>[x.driver_number,x]));
      const { data: preds } = await supabase.from('predictions').select('user_id, driver').eq('race_id', race.id);
      const next: Record<string,string> = {};
      (preds||[]).forEach((p:any)=>{
        const q = norm(p.driver);
        const candidate = directory.find((d:any)=>[d.full_name, d.broadcast_name, d.name_acronym, `${d.first_name} ${d.last_name}`].filter(Boolean).some((s:string)=>{const n=norm(s); return n===q || n.includes(q);}));
        if(!candidate) return;
        const rec = byNumber.get(candidate.driver_number);
        if(!rec) return;
        next[p.user_id] = rec.dnf ? 'DNF' : String(rec.position);
      });
      setResultsMap(next);
    }finally{ setAutoBusy(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-semibold">{race.name}</div>
          <div className="text-xs text-slate-600">{locked? 'Pronos verrouillés':'Pronos ouverts'} • session_key: {race.session_key ?? '—'}</div>
        </div>
        <button className="text-xs px-3 py-2 rounded bg-slate-200" onClick={autoFillFromOpenF1} disabled={autoBusy}>Auto (OpenF1)</button>
      </div>

      <div className="mb-4 p-3 border rounded-xl">
        <div className="font-medium mb-2">Mon pronostic</div>
        <div className="flex gap-2">
          <input className="border rounded px-3 py-2 flex-1" value={prediction} onChange={e=>setPrediction(e.target.value)} placeholder="Nom du pilote (ex: Max Verstappen)" disabled={locked}/>
          <button className="px-3 py-2 rounded bg-black text-white" onClick={savePrediction} disabled={locked}>Enregistrer</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2 pr-3">Joueur</th><th className="py-2 pr-3">Pronostic</th><th className="py-2 pr-3">Résultat (1..20 / DNF)</th></tr></thead>
          <tbody>
            {members.map((m:any)=>{
              const pred = allPreds.find((p:any)=>p.user_id===m.user_id);
              const val = resultsMap[m.user_id] ?? '';
              const canEdit = m.user_id === user.id;
              return (
                <tr key={m.user_id} className="border-b last:border-0">
                  <td className="py-2 pr-3">{m.users?.email ?? m.user_id}</td>
                  <td className="py-2 pr-3">{pred?.driver || <span style={{color:'#94a3b8'}}>—</span>}</td>
                  <td className="py-2 pr-3"><input className="w-32 border rounded px-2 py-1" value={val} onChange={e=>setResultFor(m.user_id, e.target.value.trim())} placeholder="ex: 1 ou DNF" disabled={!canEdit}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-1">Classement (course)</h4>
        <ol className="list-decimal pl-6">
          {ranking.map((r:any)=> (<li key={r.user_id}>{r.email} – <b>{r.pts}</b> pts</li>))}
        </ol>
        <p className="text-xs" style={{color:'#475569'}}>DNF = 21 points. Pour un classement général multi-courses persistant, ajoute le cron backend.</p>
      </div>
    </div>
  );
}
