import Section from './Section';

const STATS = [
  ['01', '100+', 'Members'],
  ['02', '25+', 'Projects'],
  ['03', '10+', 'Events'],
  ['04', '∞', 'Possibilities'],
];

export default function ClubSection() {
  return (
    <Section
      id="club"
      number="01"
      eyebrow="The Club / Live System"
      title={<>Build the future<br/><span className="gradient-text">of reality.</span></>}
      body="The AR/VR Club at Pragati University brings together students exploring augmented reality, virtual reality, immersive technology and spatial computing — through hands-on projects, workshops and a community built around building, not just discussing, the future."
    >
      <div className="club-interface" data-reveal>
        <div className="club-orbit-art" aria-hidden="true">
          <span className="orbit orbit-a" /><span className="orbit orbit-b" /><span className="orbit orbit-c" />
          <span className="orbit-core" /><span className="orbit-dot dot-a" /><span className="orbit-dot dot-b" />
          <span className="orbit-cross">+</span>
        </div>
        <div className="club-stat-grid">
          {STATS.map(([n, value, label]) => (
            <div className="club-stat" key={label}>
              <span>{n}</span><strong>{value}</strong><small>{label}</small>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
