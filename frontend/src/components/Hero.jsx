import Scene from '../3d/Scene';

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-canvas-wrap" aria-hidden="true">
        <Scene />
      </div>

      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="hero-content">
        <div className="container">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="status-dot" />
              <span>Pragati University <b>·</b> AR / VR Club</span>
              <span className="eyebrow-line" />
              <span className="live-label">Immersive Lab</span>
            </div>

            <h1 className="hero-heading">
              Enter the
              <br />
              <span>immersive</span>
              <br />
              reality.
            </h1>

            <p className="hero-desc">
              We explore augmented reality, virtual reality and spatial
              computing — turning ideas into experiences you can see,
              interact with and remember.
            </p>

            <div className="btn-row">
              <a href="#club" className="btn btn-primary">
                Explore Club <span>↗</span>
              </a>
              <a href="#join" className="btn btn-secondary">
                Join Us
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-meta hero-meta-left">
        <span>AR</span><span>VR</span><span>XR</span><span>3D</span>
      </div>

      <div className="hero-meta hero-meta-right">
        <span>13.41° N</span>
        <span>UNIVERSITY / INDIA</span>
      </div>

      <a href="#club" className="scroll-indicator" aria-label="Scroll to explore">
        <span>Scroll to explore</span>
        <i className="scroll-line" />
        <span>↓</span>
      </a>
    </section>
  );
}
