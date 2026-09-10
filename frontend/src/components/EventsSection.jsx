import Section from './Section';

const EVENTS=[
 ['01','WORKSHOPS','Hands-on sessions covering AR/VR tools, engines and frameworks.','LEARN'],
 ['02','HACKATHONS','Build immersive prototypes in a weekend with your team.','BUILD'],
 ['03','AR/VR DEMOS','Live demonstrations of member projects and hardware.','EXPERIENCE'],
 ['04','TECH TALKS','Guest speakers and deep dives into spatial computing.','DISCOVER'],
 ['05','SHOWCASES','End-of-semester exhibitions of what the club has built.','SHARE'],
];

export default function EventsSection(){return <Section id="events" number="04" eyebrow="Events / Live Calendar" title="Where we build together."><div className="event-system" data-reveal>{EVENTS.map(([n,name,desc,label])=><article className="event-node" key={name}><div className="event-node-num">{n}</div><div className="event-node-dot"/><div><span>{label}</span><h3>{name}</h3><p>{desc}</p></div><b>↗</b></article>)}</div></Section>}
