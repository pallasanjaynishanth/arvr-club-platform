import Section from './Section';

const DOMAINS = [
  ['01','AR','Augmented Reality','Digital layers anchored to the physical world.'],
  ['02','VR','Virtual Reality','Immersive environments designed for presence.'],
  ['03','XR','Spatial Computing','Interfaces that understand space, motion and depth.'],
  ['04','3D','3D Development','Real-time worlds, simulation and interactive graphics.'],
  ['05','∞','Immersive Design','Experiences built around interaction and emotion.'],
];

export default function ARVRSection() {
  return (
    <Section id="arvr" number="02" eyebrow="AR / VR / XR" title="Explore immersive technology.">
      <div className="domain-system" data-reveal>
        {DOMAINS.map(([n, code, name, desc]) => (
          <article className="domain-card" key={name}>
            <div className="domain-card-top"><span>{n}</span><b>{code}</b></div>
            <div className="domain-scan" />
            <h3>{name}</h3><p>{desc}</p>
            <span className="domain-arrow">↗</span>
          </article>
        ))}
      </div>
    </Section>
  );
}
