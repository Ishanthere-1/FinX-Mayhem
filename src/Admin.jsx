import {useEffect,useState} from 'react'
import {supabase} from './supabase'
import {NextCard,useData} from './Public'

const F=({l,err,...p})=><label>{l}<input {...p} value={p.value??''}/>{err&&<em>{err}</em>}</label>
const ok=async(q,done,t)=>{const {error}=await q;error?alert(error.message):done(t)}

export default function Admin(){
  const [u,setU]=useState(undefined)
  useEffect(()=>{supabase.auth.getSession().then(({data})=>setU(data.session));const {data}=supabase.auth.onAuthStateChange((_,s)=>setU(s));return()=>data.subscription.unsubscribe()},[])
  if(u===undefined)return null
  return u?<Panel/>:<Login/>
}

function Login(){
  const [e,setE]=useState(''),[p,setP]=useState(''),[m,setM]=useState('')
  const go=async()=>{const {error}=await supabase.auth.signInWithPassword({email:e,password:p});if(error)setM('Email or password is incorrect.')}
  return <main className="wrap admin narrow"><h1>Admin sign in</h1><F l="Email" type="email" value={e} onChange={x=>setE(x.target.value)}/><F l="Password" type="password" value={p} onChange={x=>setP(x.target.value)} err={m}/><button className="btn" onClick={go}>Sign in</button></main>
}

function Panel(){
  const [d,load]=useData(),[tab,setTab]=useState('sessions'),[msg,setMsg]=useState('')
  const done=async t=>{await load();setMsg(t);setTimeout(()=>setMsg(''),2500)}
  if(!d)return null
  return <main className="wrap admin"><div className="bar"><h1>FinX Mayhem admin</h1><button className="btn ghost" onClick={()=>supabase.auth.signOut()}>Sign out</button></div>
    <div className="tabs">{['sessions','site','team'].map(t=><button key={t} className={t===tab?'on':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
    {tab==='sessions'&&<Sessions d={d} done={done}/>}{tab==='site'&&<Site d={d} done={done}/>}{tab==='team'&&<div className="narrow">{d.team.map(m=><Member key={m.id} m={m} done={done}/>)}</div>}
    {msg&&<div className="toast" role="status">{msg}</div>}</main>
}

const blank={title:'',description:'',session_date:'',start_time:'',end_time:'',venue:'',status:'upcoming'}
function Sessions({d,done}){
  const [f,setF]=useState(blank),[tried,setT]=useState(false)
  const set=k=>e=>setF({...f,[k]:e.target.value})
  const save=async()=>{setT(true);if(!f.title||!f.session_date)return
    await ok(supabase.from('sessions').upsert({...f,start_time:f.start_time||null,end_time:f.end_time||null}),done,'Session saved');setF(blank);setT(false)}
  return <div className="split"><div>
    <h2>{f.id?'Edit session':'New session'}</h2>
    <F l="Title" value={f.title} onChange={set('title')} err={tried&&!f.title&&'Add a title.'}/>
    <F l="Date" type="date" value={f.session_date} onChange={set('session_date')} err={tried&&!f.session_date&&'Pick a date.'}/>
    <F l="Start time" type="time" value={f.start_time} onChange={set('start_time')}/><F l="End time" type="time" value={f.end_time} onChange={set('end_time')}/>
    <F l="Venue" value={f.venue} onChange={set('venue')}/>
    <label>Description<textarea rows="3" value={f.description||''} onChange={set('description')}/></label>
    <label>Status<select value={f.status} onChange={set('status')}><option>upcoming</option><option>cancelled</option><option>completed</option></select></label>
    <button className="btn" onClick={save}>Save session</button>{f.id&&<button className="btn ghost" onClick={()=>setF(blank)}>Cancel</button>}
    <h2 style={{marginTop:'2rem'}}>All sessions</h2>
    {d.sessions.map(s=><div className="row" key={s.id}><span>{s.session_date}: {s.title} ({s.status})</span><button onClick={()=>setF({...blank,...s})}>Edit</button><button onClick={()=>confirm('Delete this session?')&&ok(supabase.from('sessions').delete().eq('id',s.id),done,'Session deleted')}>Delete</button></div>)}
  </div><div><h2>Live preview</h2><NextCard s={f}/></div></div>
}

function Site({d,done}){
  const [f,setF]=useState({...d.settings,stats:{...d.settings.stats}})
  const set=k=>e=>setF({...f,[k]:e.target.value}),st=k=>e=>setF({...f,stats:{...f.stats,[k]:e.target.value}})
  return <div className="narrow">
    {[['tagline','Tagline'],['term_question',"This term's question"],['override_msg','Next-session override, e.g. Postponed (leave empty to show the real session)'],['join_url','Join form link'],['intake_date','Next intake date'],['email','Contact email'],['instagram','Instagram handle']].map(([k,l])=><F key={k} l={l} value={f[k]} onChange={set(k)}/>)}
    <label>About text (a blank line starts a new paragraph)<textarea rows="8" value={f.about||''} onChange={set('about')}/></label>
    {[['members','Members'],['meetings','Meetings a month'],['questions','Questions tackled']].map(([k,l])=><F key={k} l={l} value={f.stats[k]} onChange={st(k)}/>)}
    <button className="btn" onClick={()=>ok(supabase.from('settings').upsert({...f,id:1}),done,'Site details saved')}>Save site details</button></div>
}

function Member({m,done}){
  const [f,setF]=useState(m)
  const up=async e=>{const file=e.target.files[0];if(!file)return;const path=`${m.id}-${Date.now()}`
    const {error}=await supabase.storage.from('team').upload(path,file);if(error)return alert(error.message)
    setF({...f,photo_url:supabase.storage.from('team').getPublicUrl(path).data.publicUrl})}
  return <div className="row col"><F l="Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/><F l="Role" value={f.role} onChange={e=>setF({...f,role:e.target.value})}/>
    <label>Photo<input type="file" accept="image/*" onChange={up}/></label>
    <button className="btn" onClick={()=>ok(supabase.from('team').update({name:f.name,role:f.role,photo_url:f.photo_url}).eq('id',m.id),done,'Team member saved')}>Save {m.name}</button></div>
}
