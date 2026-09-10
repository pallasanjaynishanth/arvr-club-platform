import Section from './Section';

const PROJECTS = [
  ['01','Immersive Campus','Interactive spatial experience for exploring the university in AR.',['THREE.JS','REACT','WEBXR']],
  ['02','HoloNotes','Spatial note-taking prototype that pins ideas to real-world locations.',['R3F','WEBAR']],
  ['03','VR Lab Sim','Virtual physics lab for running experiments before entering the real one.',['UNITY','OPENXR']],
];

export default function ProjectsSection() {
  return (
    <Section id="projects" number="03" eyebrow="Projects / Prototypes" title="What we're building." body="A selection of projects built by club members, spanning augmented reality, virtual environments and spatial interfaces.">
      <div className="project-system" data-reveal>
        {PROJECTS.map(([n,title,desc,tech],i)=>(
          <article className="project-card" key={title}>
            <div className="project-visual" aria-hidden="true">
              <span className="pv-ring r1"/><span className="pv-ring r2"/><span className="pv-line l1"/><span className="pv-line l2"/><span className="pv-node"/>
              <em>0{i+1}</em>
            </div>
            <div className="project-info"><span className="project-index">{n} / PROJECT</span><h3>{title}</h3><p>{desc}</p><div className="project-tags">{tech.map(t=><span key={t}>{t}</span>)}</div></div>
            <span className="project-open">OPEN ↗</span>
          </article>
        ))}
      </div>
    </Section>
  );
}
