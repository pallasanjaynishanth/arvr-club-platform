import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Section
 * Shared shell for every scroll section: an oversized section number,
 * an eyebrow label, a title, and a body slot for children. Handles a
 * single, restrained GSAP reveal (fade + slide-up) as the section enters
 * the viewport - not a different animation per element.
 */
export default function Section({ id, number, eyebrow, title, body, children }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const targets = el.querySelectorAll('[data-reveal]');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            start: 'top 75%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id={id} className="section" ref={sectionRef}>
      <div className="container">
        <div className="section-head">
          <span className="section-number" data-reveal>
            {number}
          </span>
          <div className="section-label-col">
            <p className="section-eyebrow" data-reveal>
              {eyebrow}
            </p>
            <h2 className="section-title" data-reveal>
              {title}
            </h2>
          </div>
        </div>

        {body && (
          <p className="section-body" data-reveal style={{ marginBottom: 56 }}>
            {body}
          </p>
        )}

        <div data-reveal>{children}</div>
      </div>
    </section>
  );
}
