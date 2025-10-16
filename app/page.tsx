'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseBrowser';

export default function Page(){
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
      supabase.auth.onAuthStateChange((_e, s)=> setUser(s?.user ?? null));
    })();
  },[]);

  if (loading) return <LoadingScreen/>;
  if (!user) return <AuthBlock/>;
  return <LeagueHome user={user}/>;
}

function LoadingScreen(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-red-900">
      <div className="text-center space-y-4 animate-fade-in">
        <div className="inline-flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse delay-75"></div>
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse delay-150"></div>
        </div>
        <p className="text-white font-medium">Chargement...</p>
      </div>
    </div>
  );
}

function AuthBlock(){
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function login(){
    if(!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if(error) return alert(error.message);
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600 mb-4">
              <span className="text-2xl">🏎️</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">La Chicane</h1>
            <p className="text-white/70">Pronostics F1 entre amis</p>
          </div>

          {!sent ? (
            <div className="space-y-4">
              <p className="text-white/90 text-center">Connectez-vous avec un lien magique</p>
              <div className="space-y-3">
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  onKeyPress={e=>e.key==='Enter'&&login()}
                />
                <button
                  className="w-full px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={login}
                  disabled={loading || !email}
                >
                  {loading ? 'Envoi...' : 'Recevoir le lien'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-500">
                <span className="text-xl">✅</span>
              </div>
              <h2 className="text-xl font-semibold text-white">Lien envoyé!</h2>
              <p className="text-white/70">Vérifiez votre boîte mail et cliquez sur le lien pour vous connecter.</p>
              <button
                onClick={()=>{setSent(false); setEmail('');}}
                className="text-white/60 hover:text-white underline text-sm transition-colors"
              >
                Utiliser un autre email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LeagueHome({ user }:{ user:any }){
  const [leagues, setLeagues] = useState<any[]>([]);
  const [leagueName, setLeagueName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [current, setCurrent] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  async function load(){
    const { data } = await supabase.from('league_members').select('league_id, leagues(*)').eq('user_id', user.id);
    setLeagues((data||[]).map((r:any)=>r.leagues));
  }

  useEffect(()=>{ load(); },[]);

  async function createLeague(){
    if(!leagueName) return;
    const { data, error } = await supabase.from('leagues').insert({ name: leagueName, owner_id: user.id }).select();
    if(error) return alert(error.message);
    const league = data![0];
    await supabase.from('league_members').insert({ league_id: league.id, user_id: user.id, role: 'owner' });
    await load();
    setLeagueName('');
    setShowCreateModal(false);
  }

  async function joinLeague(){
    if(!joinId) return;
    await supabase.from('league_members').insert({ league_id: joinId, user_id: user.id, role: 'member' });
    setJoinId('');
    setShowJoinModal(false);
    await load();
  }

  async function logout(){
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-600">
                <span className="text-base">🏎️</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">La Chicane</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 hidden sm:block">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {user.email}
                </span>
              </span>
              <button
                onClick={logout}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Mes ligues</h2>
                <div className="flex gap-2">
                  <button
                    onClick={()=>setShowCreateModal(true)}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                    title="Créer une ligue"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={()=>setShowJoinModal(true)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Rejoindre une ligue"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>
                </div>
              </div>

              {leagues.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-slate-600 mb-4">Aucune ligue pour le moment</p>
                  <div className="space-y-2">
                    <button
                      onClick={()=>setShowCreateModal(true)}
                      className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                    >
                      Créer ma première ligue
                    </button>
                    <button
                      onClick={()=>setShowJoinModal(true)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
                    >
                      Rejoindre une ligue
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {leagues.map((l:any)=>(
                    <button
                      key={l.id}
                      onClick={()=>setCurrent(l)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        current?.id === l.id
                          ? 'border-red-600 bg-red-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-semibold text-slate-900">{l.name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded">{l.id}</code>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {current ? (
              <LeaguePanel league={current} user={user}/>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Sélectionnez une ligue</h3>
                <p className="text-slate-600">Choisissez une ligue dans la liste pour voir les courses et pronostics</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showCreateModal && (
        <Modal onClose={()=>setShowCreateModal(false)}>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Créer une nouvelle ligue</h3>
          <input
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            placeholder="Nom de la ligue (ex: Ligue des Champions)"
            value={leagueName}
            onChange={e=>setLeagueName(e.target.value)}
            onKeyPress={e=>e.key==='Enter'&&createLeague()}
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={createLeague}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              Créer la ligue
            </button>
            <button
              onClick={()=>setShowCreateModal(false)}
              className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </Modal>
      )}

      {showJoinModal && (
        <Modal onClose={()=>setShowJoinModal(false)}>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Rejoindre une ligue</h3>
          <p className="text-slate-600 mb-4">Entrez l'identifiant de la ligue que vous souhaitez rejoindre</p>
          <input
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            placeholder="ID de la ligue"
            value={joinId}
            onChange={e=>setJoinId(e.target.value)}
            onKeyPress={e=>e.key==='Enter'&&joinLeague()}
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={joinLeague}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              Rejoindre
            </button>
            <button
              onClick={()=>setShowJoinModal(false)}
              className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LeaguePanel({ league, user }:{ league:any, user:any }){
  const [races, setRaces] = useState<any[]>([]);
  const [raceName, setRaceName] = useState('');
  const [lockAt, setLockAt] = useState<string>('');
  const [sessionKey, setSessionKey] = useState<string>('');
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [showCreateRace, setShowCreateRace] = useState(false);

  async function loadRaces(){
    const { data } = await supabase.from('races').select('*').eq('league_id', league.id).order('created_at', { ascending: false });
    setRaces(data||[]);
  }

  useEffect(()=>{
    loadRaces();
    setSelectedRace(null);
  },[league.id]);

  async function createRace(){
    if(!raceName) return;
    const { data, error } = await supabase.from('races').insert({
      league_id: league.id,
      name: raceName,
      lock_at: lockAt || null,
      session_key: sessionKey ? Number(sessionKey) : null
    }).select();
    if(error) return alert(error.message);
    setRaceName('');
    setLockAt('');
    setSessionKey('');
    setShowCreateRace(false);
    setRaces((prev)=>[data![0], ...prev]);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{league.name}</h3>
            <p className="text-sm text-slate-600 mt-1">Gérez vos courses et pronostics</p>
          </div>
          <button
            onClick={()=>setShowCreateRace(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle course
          </button>
        </div>

        {races.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
              <span className="text-xl">🏁</span>
            </div>
            <p className="text-slate-600">Aucune course créée pour cette ligue</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {races.map((r:any)=>{
              const isLocked = r.lock_at ? new Date() >= new Date(r.lock_at) : false;
              return (
                <button
                  key={r.id}
                  onClick={()=>setSelectedRace(r)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedRace?.id === r.id
                      ? 'border-red-600 bg-red-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg">🏎️</span>
                    {isLocked && (
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-600">
                        Verrouillé
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-slate-900 mb-1">{r.name}</div>
                  <div className="text-xs text-slate-500">
                    {r.lock_at ? (
                      <span>Verrouillage: {new Date(r.lock_at).toLocaleDateString()}</span>
                    ) : (
                      <span>Pas de verrouillage</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedRace && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-slide-up">
          <RaceArea race={selectedRace} user={user}/>
        </div>
      )}

      {showCreateRace && (
        <Modal onClose={()=>setShowCreateRace(false)}>
          <h3 className="text-xl font-bold text-slate-900 mb-6">Créer une nouvelle course</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nom de la course</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="ex: Grand Prix de Monaco"
                value={raceName}
                onChange={e=>setRaceName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date de verrouillage (optionnel)</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                type="datetime-local"
                value={lockAt}
                onChange={e=>setLockAt(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Session Key OpenF1 (optionnel)</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="ex: 9158"
                value={sessionKey}
                onChange={e=>setSessionKey(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={createRace}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              Créer la course
            </button>
            <button
              onClick={()=>setShowCreateRace(false)}
              className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function RaceArea({ race, user }:{ race:any, user:any }){
  const [prediction, setPrediction] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [allPreds, setAllPreds] = useState<any[]>([]);
  const [resultsMap, setResultsMap] = useState<Record<string,string>>({});
  const [autoBusy, setAutoBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<'predictions'|'results'>('predictions');

  const locked = useMemo(()=> race.lock_at ? new Date() >= new Date(race.lock_at) : false, [race.lock_at]);

  async function loadMembers(){
    const { data } = await supabase.from('league_members').select('user_id, role, users: user_id (email)').eq('league_id', race.league_id);
    setMembers(data||[]);
  }

  async function loadPreds(){
    const { data } = await supabase.from('predictions').select('*').eq('race_id', race.id);
    setAllPreds(data||[]);
  }

  useEffect(()=>{
    loadMembers();
    loadPreds();
  },[race.id]);

  async function savePrediction(){
    if(!prediction) return;
    const { error } = await supabase.from('predictions').upsert({ race_id: race.id, user_id: user.id, driver: prediction });
    if(error) return alert(error.message);
    await loadPreds();
    setPrediction('');
  }

  async function setResultFor(uid:string, value:string){
    setResultsMap(m=>({ ...m, [uid]: value }));
  }

  const DEFAULT_DNF = 21;
  const ranking = useMemo(()=>{
    const scores = members.map((m:any)=>{
      const val = resultsMap[m.user_id];
      let pts = 0;
      if(val==='DNF') pts = DEFAULT_DNF;
      else if(val && /^\d+$/.test(val)) pts = parseInt(val,10);
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
      if(!Array.isArray(data) || data.length===0) {
        alert('Pas de résultats pour cette session');
        return;
      }

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
        const candidate = directory.find((d:any)=>[d.full_name, d.broadcast_name, d.name_acronym, `${d.first_name} ${d.last_name}`]
          .filter(Boolean)
          .some((s:string)=>{
            const n=norm(s);
            return n===q || n.includes(q);
          }));
        if(!candidate) return;
        const rec = byNumber.get(candidate.driver_number);
        if(!rec) return;
        next[p.user_id] = rec.dnf ? 'DNF' : String(rec.position);
      });

      setResultsMap(next);
    }finally{
      setAutoBusy(false);
    }
  }

  const myPrediction = allPreds.find((p:any)=>p.user_id===user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{race.name}</h3>
          <div className="flex items-center gap-4 mt-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              locked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${locked ? 'bg-red-600' : 'bg-green-600'}`}></span>
              {locked ? 'Pronostics verrouillés' : 'Pronostics ouverts'}
            </span>
            {race.session_key && (
              <span className="text-xs text-slate-600">
                Session: {race.session_key}
              </span>
            )}
          </div>
        </div>
        {race.session_key && (
          <button
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            onClick={autoFillFromOpenF1}
            disabled={autoBusy}
          >
            {autoBusy ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                Chargement...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Auto-remplir (OpenF1)
              </>
            )}
          </button>
        )}
      </div>

      {!locked && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-6 border border-red-200">
          <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-lg">🎯</span>
            Mon pronostic
          </h4>
          {myPrediction ? (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
              <div>
                <p className="text-sm text-slate-600">Votre choix:</p>
                <p className="font-bold text-lg text-slate-900">{myPrediction.driver}</p>
              </div>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={prediction}
                onChange={e=>setPrediction(e.target.value)}
                placeholder="Nom du pilote (ex: Max Verstappen)"
                disabled={locked}
              />
              <button
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50"
                onClick={savePrediction}
                disabled={locked || !prediction}
              >
                Valider
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={()=>setActiveTab('predictions')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'predictions'
                ? 'text-red-600 border-red-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            Pronostics
          </button>
          <button
            onClick={()=>setActiveTab('results')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'results'
                ? 'text-red-600 border-red-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            Résultats & Classement
          </button>
        </div>
      </div>

      {activeTab === 'predictions' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((m:any)=>{
            const pred = allPreds.find((p:any)=>p.user_id===m.user_id);
            const isMe = m.user_id === user.id;
            return (
              <div
                key={m.user_id}
                className={`p-4 rounded-xl border-2 ${
                  isMe ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    {m.users?.email?.split('@')[0] ?? 'Joueur'}
                  </span>
                  {isMe && (
                    <span className="px-2 py-1 rounded-full bg-red-600 text-white text-xs">
                      Vous
                    </span>
                  )}
                </div>
                {pred ? (
                  <p className="font-bold text-slate-900">{pred.driver}</p>
                ) : (
                  <p className="text-slate-400 italic">Pas de pronostic</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Joueur</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Pronostic</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Résultat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m:any)=>{
                  const pred = allPreds.find((p:any)=>p.user_id===m.user_id);
                  const val = resultsMap[m.user_id] ?? '';
                  const canEdit = m.user_id === user.id;
                  return (
                    <tr key={m.user_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900">
                          {m.users?.email?.split('@')[0] ?? 'Joueur'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {pred?.driver || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-slate-50"
                          value={val}
                          onChange={e=>setResultFor(m.user_id, e.target.value.trim())}
                          placeholder="1-20 / DNF"
                          disabled={!canEdit}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-lg">🏆</span>
              Classement de la course
            </h4>
            <div className="space-y-2">
              {ranking.map((r:any, idx:number)=>{
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
                return (
                  <div
                    key={r.user_id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      idx < 3 ? 'bg-white border border-yellow-300' : 'bg-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-600 w-8">
                        {medal || `${idx + 1}.`}
                      </span>
                      <span className="font-medium text-slate-900">
                        {r.email?.split('@')[0] ?? 'Joueur'}
                      </span>
                    </div>
                    <span className="font-bold text-lg text-slate-900">
                      {r.pts} pts
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-600 mt-4">
              Note: DNF = 21 points. Pour un classement général persistant, configurez le backend.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({ children, onClose }:{ children:React.ReactNode, onClose:()=>void }){
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        ></div>
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-up">
          {children}
        </div>
      </div>
    </div>
  );
}