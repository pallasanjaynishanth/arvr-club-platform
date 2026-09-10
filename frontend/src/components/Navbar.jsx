import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';

const LINKS = [
  { num: '01', label: 'Club', href: '#club' },
  { num: '02', label: 'AR/VR', href: '#arvr' },
  { num: '03', label: 'Projects', href: '#projects' },
  { num: '04', label: 'Events', href: '#events' },
  { num: '05', label: 'Join', href: '#join' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <>
      <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container navbar-inner">
          <a href="#top" className="navbar-brand" aria-label="Pragati University AR/VR Club home">
            <img src={logo} alt="AR/VR Club official logo" className="navbar-logo" />
            <span className="navbar-brand-text">
              <span className="line-1">Pragati University</span>
              <span className="line-2">AR / VR CLUB</span>
            </span>
          </a>

          <nav className="navbar-links" aria-label="Primary">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                <span className="num">{link.num}</span>
                {link.label}
              </a>
            ))}
          </nav>

          <a href="#join" className="btn btn-secondary navbar-cta">
            Join Us
          </a>

          <button
            className={`navbar-toggle${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={handleLinkClick}>
              <span className="num">{link.num}</span>
              {link.label}
            </a>
          ))}
          <a href="#join" className="btn btn-primary" onClick={handleLinkClick}>
            Join the Club
          </a>
        </div>
      )}
    </>
  );
}
