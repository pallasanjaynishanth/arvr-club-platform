import { useMemo, useState } from 'react';
import './StudentPortal.css';

const events = [
  { title: 'XR Innovation Sprint', type: 'HACKATHON', date: '24 SEP', time: '10:00 AM', status: 'REGISTERED', color: 'cyan' },
  { title: 'Spatial UI Masterclass', type: 'WORKSHOP', date: '28 SEP', time: '02:30 PM', status: 'OPEN', color: 'violet' },
  { title: 'Campus VR Showcase', type: 'SHOWCASE', date: '04 OCT', time: '11:00 AM', status: 'OPEN', color: 'pink' },
];

const badges = [
  ['XR Explorer', 'First immersive experience', '◈'],
  ['Builder', '3 projects submitted', '◇'],
  ['Event Pulse', '5 events attended', '✦'],
  ['Team Player', 'Joined a project team', '△'],
];

export default function StudentPortal() {
  const [active, setActive] = useState('Overview');
  const [registered, setRegistered] = useState(events[0].title);
  const [notice, setNotice] = useState('');

  const greeting = useMemo(() => 'Good afternoon, Sanjay.', []);

  const register = (title) => {
    setRegistered(title);
    setNotice(`Registration saved for ${title}.`);
    window.setTimeout(() => setNotice(''), 2200);
  };

  return (
    <div className="student-portal">
      <div className="portal-noise" />
      <aside className="student-sidebar">
        <a className="student-brand" href="/">
          <span className="brand-orbit">✦</span>
          <span><b>PRAGATI</b><small>AR / VR CLUB</small></span>
        </a>
        <div className="profile-mini">
          <div className="avatar">SN</div>
          <div><strong>Sanjay Nishanth</strong><span>Student · Explorer</span></div>
        </div>
        <nav>
          {['Overview','Events','Attendance','Achievements','Leaderboard','Teams','Calendar','Certificates'].map((item, i) => (
            <button key={item} className={active === item ? 'active' : ''} onClick={() => setActive(item)}>
              <span>{['⌂','◉','◌','✦','↗','◇','□','▱'][i]}</span>{item}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => setNotice('Settings panel is ready for backend integration.')}>⚙ Settings</button>
          <a href="/">← Public website</a>
        </div>
      </aside>

      <main className="student-main">
        <header className="student-topbar">
          <div className="crumb">STUDENT PORTAL <span>/</span> {active.toUpperCase()}</div>
          <div className="top-actions"><button className="icon-btn" onClick={() => setNotice('You have 3 new notifications.')}>⌁<i /></button><button className="student-avatar">SN</button></div>
        </header>

        <section className="portal-hero">
          <div>
            <p className="eyebrow"><span /> PRAGATI UNIVERSITY · AR / VR CLUB</p>
            <h1>{greeting}<br /><em>Shape the next reality.</em></h1>
            <p className="hero-copy">Your personal command center for events, immersive projects, achievements and the community around them.</p>
          </div>
          <div className="portal-core">
            <div className="core-ring ring-a" /><div className="core-ring ring-b" /><div className="core-sphere"><span>XR</span></div>
            <div className="core-label">ACTIVE<br /><b>EXPLORER</b></div>
          </div>
        </section>

        <section className="stat-grid">
          {[
            ['840','CLUB POINTS','+120 this month','cyan'],
            ['92%','ATTENDANCE','Excellent standing','violet'],
            ['12','BADGES','4 unlocked recently','pink'],
            ['08','CERTIFICATES','Ready to view','gold'],
          ].map(([value,label,sub,color]) => <article className={`stat-card ${color}`} key={label}><span>{label}</span><strong>{value}</strong><small>{sub}</small><div className="spark">↗</div></article>)}
        </section>

        <div className="portal-grid">
          <section className="panel events-panel">
            <div className="panel-head"><div><span className="panel-kicker">NEXT EXPERIENCES</span><h2>Upcoming events</h2></div><button onClick={() => setActive('Events')}>VIEW ALL ↗</button></div>
            <div className="event-list">
              {events.map(event => <article className="event-row" key={event.title}>
                <div className={`event-date ${event.color}`}><b>{event.date.split(' ')[0]}</b><span>{event.date.split(' ')[1]}</span></div>
                <div className="event-info"><span>{event.type}</span><h3>{event.title}</h3><small>{event.time} · Innovation Lab</small></div>
                <button className={registered === event.title ? 'registered' : 'register'} onClick={() => register(event.title)}>{registered === event.title ? '✓ REGISTERED' : 'REGISTER'}</button>
              </article>)}
            </div>
          </section>

          <section className="panel progress-panel">
            <div className="panel-head"><div><span className="panel-kicker">YOUR PROGRESS</span><h2>Club journey</h2></div><span className="level">LVL 08</span></div>
            <div className="progress-orb"><div><b>840</b><span>POINTS</span></div></div>
            <div className="xp"><span>LEVEL 08</span><span>1,000 XP</span></div><div className="xp-bar"><i style={{width:'84%'}} /></div>
            <p className="muted">160 points until your next rank.</p>
            <div className="mini-achievements"><div><b>25+</b><span>Projects</span></div><div><b>10+</b><span>Events</span></div><div><b>∞</b><span>Possibilities</span></div></div>
          </section>

          <section className="panel attendance-panel">
            <div className="panel-head"><div><span className="panel-kicker">PRESENCE MATRIX</span><h2>Attendance</h2></div><strong className="attendance-value">92%</strong></div>
            <div className="heatmap">{Array.from({length: 56}, (_,i) => <i key={i} className={`h${(i*7)%5}`} />)}</div>
            <div className="heat-legend"><span>LESS</span><i/><i/><i/><i/><span>MORE</span></div>
            <div className="attendance-bottom"><span>38 attended</span><span>4 missed</span><span>42 total</span></div>
          </section>

          <section className="panel leaderboard-panel">
            <div className="panel-head"><div><span className="panel-kicker">COMMUNITY RANK</span><h2>Leaderboard</h2></div><button onClick={() => setActive('Leaderboard')}>THIS MONTH</button></div>
            {[['01','Aarav Mehta','1,240','AM'],['02','Priya Reddy','1,090','PR'],['03','Sanjay Nishanth','840','SN'],['04','Kiran Rao','790','KR']].map((p,i)=><div className={`rank-row ${p[1].startsWith('Sanjay')?'you':''}`} key={p[1]}><b>{p[0]}</b><span className="rank-avatar">{p[3]}</span><strong>{p[1]}</strong><em>{p[2]} XP</em>{i===0&&<span className="crown">✦</span>}</div>)}
          </section>
        </div>

        <section className="lower-grid">
          <section className="panel badges-panel"><div className="panel-head"><div><span className="panel-kicker">ACHIEVEMENTS</span><h2>Badge collection</h2></div><button onClick={() => setActive('Achievements')}>12 TOTAL ↗</button></div><div className="badge-grid">{badges.map(([name,desc,icon])=><div className="badge" key={name}><div>{icon}</div><strong>{name}</strong><span>{desc}</span></div>)}</div></section>
          <section className="panel calendar-panel"><div className="panel-head"><div><span className="panel-kicker">SEPTEMBER 2026</span><h2>My calendar</h2></div><button onClick={() => setActive('Calendar')}>OPEN ↗</button></div><div className="calendar-line"><b>24</b><div><span>THU · 10:00 AM</span><strong>XR Innovation Sprint</strong><small>Innovation Lab · Registered</small></div></div><div className="calendar-line"><b>28</b><div><span>MON · 02:30 PM</span><strong>Spatial UI Masterclass</strong><small>XR Studio · Open</small></div></div></section>
        </section>

        <footer className="student-footer"><span>© 2026 PRAGATI UNIVERSITY AR / VR CLUB</span><span>13.41° N · HYDERABAD · INDIA</span><span>REALITY REDEFINED ✦</span></footer>
      </main>
      {notice && <div className="toast">✦ {notice}</div>}
    </div>
  );
}
