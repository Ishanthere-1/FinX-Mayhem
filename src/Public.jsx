import {useEffect,useState} from 'react'
import {supabase} from './supabase'

export const stamp=s=>new Date(`${s.session_date}T${s.start_time||'00:00'}`)
export const day=d=>d?new Date(d+'T00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}):''
export const tm=t=>t?new Date('1970-01-01T'+t).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}):''

export function useData(){
  const [d,setD]=useState(null)
  const load=async()=>{
    const [a,b,c]=await Promise.all([supabase.from('settings').select().eq('id',1).maybeSingle(),supabase.from('sessions').select().order('session_date'),supabase.from('team').select().order('sort')])
    setD({settings:a.data||{stats:{}},sessions:b.data||[],team:c.data||[]})
  }
  useEffect(()=>{load()},[])
  return [d,load]
}

export function NextCard({s,override}){
  const [now,setNow]=useState(Date.now())
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[])
  const head=<p className="muted">Next session</p>
  if(override)return <aside className="card">{head}<h3>{override}</h3></aside>
  if(!s||!s.title)return <aside className="card">{head}<h3>To be announced</h3><p className="muted">Check back soon for the date and venue.</p></aside>
  const ms=Math.max(0,stamp(s)-now||0)
  const u=[['days',ms/864e5],['hrs',ms/36e5%24],['min',ms/6e4%60],['sec',ms/1e3%60]]
  return <aside className="card">{head}<h3>{s.title}</h3>
    <dl><dt>Date</dt><dd>{day(s.session_date)}</dd><dt>Time</dt><dd>{tm(s.start_time)}{s.end_time&&` to ${tm(s.end_time)}`}</dd><dt>Venue</dt><dd>{s.venue}</dd></dl>
    {s.description&&<p>{s.description}</p>}
    <div className="count">{u.map(([l,v])=><div key={l}><b>{String(Math.floor(v)).padStart(2,'0')}</b><span>{l}</span></div>)}</div></aside>
}

const steps=[['Pick a question','We vote on one money question we all want answered this term.'],['Split up and dig in','Small groups take a piece each: articles, videos, or asking a teacher.'],['Talk it through','We meet and discuss what everyone found, including the confusing parts.'],['Share it','Each group gives a short presentation so everyone leaves knowing more.']]

const Row=({x})=><div className="srow rv"><div><b>{day(x.session_date)}</b><br/><span className="muted">{tm(x.start_time)}</span></div><div><h3>{x.title}</h3><p className="muted">{x.venue}</p></div>{x.status!=='upcoming'&&<span className="tag">{x.status}</span>}</div>

export default function Public(){
  const [d]=useData()
  useEffect(()=>{if(!d)return;const o=new IntersectionObserver(e=>e.forEach(x=>x.isIntersecting&&x.target.classList.add('in')),{threshold:.15});document.querySelectorAll('.rv').forEach(n=>o.observe(n));return()=>o.disconnect()},[d])
  if(!d)return <p className="muted pad">Loading…</p>
  const {settings:s,sessions,team}=d,today=new Date().toLocaleDateString('sv')
  const up=sessions.filter(x=>x.status!=='completed'&&x.session_date>=today),past=sessions.filter(x=>!up.includes(x)).reverse()
  const next=up.find(x=>x.status==='upcoming'),st=s.stats||{}
  return <>
    <header className="nav"><a href="#top" className="brand"><img src="/logo.png" alt="" onError={e=>e.target.remove()}/><span>FinX Mayhem</span></a><nav>{['about','sessions','team','join'].map(x=><a key={x} href={'#'+x}>{x}</a>)}</nav></header>
    <main id="top">
      <section className="hero wrap">
        <svg viewBox="0 0 800 200" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="#B8913F" strokeWidth="2" points="0,170 90,150 170,160 260,110 340,125 430,70 520,90 610,40 700,55 800,15"/></svg>
        <div><h1>{s.tagline}</h1><p className="lead muted">FinX Mayhem is a student-run finance club for Grades 10 to 12. Every term we pick one real money question, research it in groups, and present what we find.</p>
          {s.term_question&&<p className="tq"><strong>This term's question</strong><br/>{s.term_question}</p>}
          <a className="btn" href="#join">Join the club</a></div>
        <div><NextCard s={next} override={s.override_msg}/></div>
      </section>
      <div className="ticker"><span>Free to join</span><span>Grades 10 to 12</span><span>2 meetings a month</span><span>Est. 2026</span></div>
      <section id="about"><div className="wrap cols"><div><p className="n">01 About</p><h2>Nobody here is an expert. That is the point.</h2></div>
        <div>{(s.about||'').split('\n\n').map((p,i)=><p key={i}>{p}</p>)}
          <div className="stats">{[['members','Members'],['meetings','Meetings a month'],['questions','Questions tackled']].map(([k,l])=><div key={k}><b>{st[k]}</b><span className="muted">{l}</span></div>)}</div></div></div></section>
      <section className="dark"><div className="wrap"><p className="n g">02 How it works</p><h2>What happens each term</h2>
        <ol className="steps">{steps.map(([t,x])=><li className="rv" key={t}><div><h3>{t}</h3><p>{x}</p></div></li>)}</ol></div></section>
      <section id="sessions"><div className="wrap"><p className="n">03 Sessions</p><h2>Upcoming sessions</h2>
        {up.length?up.map(x=><Row key={x.id} x={x}/>):<p className="muted">No sessions scheduled yet.</p>}
        {past.length>0&&<details><summary>Past sessions</summary>{past.map(x=><Row key={x.id} x={x}/>)}</details>}</div></section>
      <section id="team"><div className="wrap"><p className="n">04 Team</p><h2>Run by students, for students</h2>
        <div className="team">{team.map(m=><div className="mem rv" key={m.id}>{m.photo_url?<img className="av" src={m.photo_url} alt={m.name}/>:<div className="av" aria-hidden="true">{m.name[0]}</div>}<h3>{m.name}</h3><p className="muted">{m.role}</p></div>)}</div></div></section>
      <section id="join" className="dark"><div className="wrap cols"><div><p className="n g">05 Join</p><h2>Want in? It takes two minutes.</h2><p>Free to join and open to Grades 10 to 12. Next intake: {s.intake_date}.</p></div>
        <div>{s.join_url&&<p><a className="btn gold" href={s.join_url} target="_blank" rel="noreferrer">Join the club</a></p>}
          <p><a href={'mailto:'+s.email}>{s.email}</a></p>{s.instagram&&<p><a href={`https://instagram.com/${s.instagram.replace('@','')}`}>{s.instagram}</a></p>}</div></div></section>
    </main>
    <footer className="wrap muted foot">© 2026 FinX Mayhem, a student club.</footer>
  </>
}
