import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { TrendingUp, Search, Phone, Menu, X, ChevronDown, Facebook, Twitter, Linkedin, Instagram, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* --- Nav links config ----------------------------------------------- */
const NAV_LINKS = [
  { label: 'Home',     href: '/' },
  { label: 'About Us', href: '#about' },
  { label: 'Services',  href: '#services', hasDropdown: true },
  { label: 'Blog',     href: '#blog' },
  { label: 'Contact',  href: '#contact' },
];

/* --- Header --------------------------------------------------------- */
const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header style={{
      background: '#1B2745',
      borderBottom: '1px solid rgba(11,102,126,0.12)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg,#0B667E,#12B4C3)',
              boxShadow: '0 0 18px rgba(11,102,126,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <TrendingUp size={20} color="#fff" />
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
              Fund<span style={{ color: '#12B4C3' }}>Flow</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="auth-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '3px',
                  padding: '0.4rem 0.85rem', borderRadius: '8px',
                  fontSize: '0.875rem', fontWeight: 500, color: '#b0c4d8',
                  textDecoration: 'none', transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color='#12B4C3'; e.currentTarget.style.background='rgba(11,102,126,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='#b0c4d8'; e.currentTarget.style.background='transparent'; }}>
                {link.label}
                {link.hasDropdown && <ChevronDown size={13} />}
              </a>
            ))}
          </nav>

          {/* Right: search + phone */}
          <div className="auth-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSearchOpen(s => !s)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#7a94ab', padding: '0.4rem', borderRadius: '8px',
                transition: 'color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color='#12B4C3'; e.currentTarget.style.background='rgba(11,102,126,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color='#7a94ab'; e.currentTarget.style.background='transparent'; }}>
              <Search size={18} />
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              background: 'rgba(11,102,126,0.1)', border: '1px solid rgba(11,102,126,0.2)',
              borderRadius: '50px', padding: '0.45rem 1rem',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#0B667E,#12B4C3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Phone size={13} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', color: '#7a94ab', lineHeight: 1 }}>Requesting A Call</p>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>(808) 555-0111</p>
              </div>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(o => !o)} className="auth-nav-mobile"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0c4d8', padding: '0.4rem' }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Search dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', paddingBottom: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#7a94ab' }} />
                <input placeholder="Search schemes, AMCs, funds..."
                  style={{
                    width: '100%', padding: '0.65rem 1rem 0.65rem 2.75rem',
                    background: '#202C44', border: '1.5px solid rgba(11,102,126,0.2)',
                    borderRadius: '10px', color: '#fff', fontSize: '0.875rem', outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor='#12B4C3'}
                  onBlur={e => e.target.style.borderColor='rgba(11,102,126,0.2)'} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(11,102,126,0.1)', paddingBottom: '1rem' }}>
              {NAV_LINKS.map(link => (
                <a key={link.label} href={link.href}
                  style={{ display: 'block', padding: '0.7rem 0.5rem', color: '#b0c4d8', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}
                  onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                <Phone size={14} style={{ color: '#12B4C3' }} />
                <span style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>(808) 555-0111</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

/* --- Footer --------------------------------------------------------- */
const Footer = () => (
  <footer style={{ background: '#1B2745', borderTop: '1px solid rgba(11,102,126,0.12)', marginTop: 'auto' }}>
    {/* Partner logos strip */}
    <div style={{ background: 'rgba(11,102,126,0.07)', borderBottom: '1px solid rgba(11,102,126,0.1)', padding: '1rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
          {['SBI Mutual Fund', 'HDFC Mutual Fund', 'ICICI Prudential', 'Axis Mutual Fund', 'Mirae Asset', 'Nippon India'].map(name => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: '#7a94ab', fontSize: '0.78rem', fontWeight: 600, opacity: 0.75,
            }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: 'rgba(11,102,126,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingUp size={12} color="#12B4C3" />
              </div>
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Main footer grid */}
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem 2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '2.5rem' }}>

        {/* Brand */}
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', marginBottom: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#0B667E,#12B4C3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>Fund<span style={{ color: '#12B4C3' }}>Flow</span></span>
          </Link>
          <p style={{ fontSize: '0.8rem', color: '#7a94ab', lineHeight: 1.7, maxWidth: '220px' }}>
            India's trusted mutual fund platform. 3,000+ schemes from 42 AMCs with real-time NAV tracking.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a key={i} href="#" style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(11,102,126,0.1)', border: '1px solid rgba(11,102,126,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#7a94ab', transition: 'all 0.2s', textDecoration: 'none',
              }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(11,102,126,0.2)'; e.currentTarget.style.color='#12B4C3'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(11,102,126,0.1)'; e.currentTarget.style.color='#7a94ab'; }}>
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#12B4C3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Quick Links</h4>
          {['About Us', 'Our Services', 'Fund Schemes', 'AMC Partners', 'SIP Calculator', 'Blog'].map(item => (
            <a key={item} href="#" style={{ display: 'block', fontSize: '0.82rem', color: '#7a94ab', textDecoration: 'none', marginBottom: '0.6rem', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color='#12B4C3'}
              onMouseLeave={e => e.currentTarget.style.color='#7a94ab'}>
              › {item}
            </a>
          ))}
        </div>

        {/* Services */}
        <div>
          <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#12B4C3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Services</h4>
          {['Mutual Funds', 'SIP Investment', 'Portfolio Analytics', 'NAV Tracking', 'Tax Planning', 'Goal Based Investing'].map(item => (
            <a key={item} href="#" style={{ display: 'block', fontSize: '0.82rem', color: '#7a94ab', textDecoration: 'none', marginBottom: '0.6rem', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color='#12B4C3'}
              onMouseLeave={e => e.currentTarget.style.color='#7a94ab'}>
              › {item}
            </a>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#12B4C3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Contact Us</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { Icon: Phone,  text: '(808) 555-0111',    sub: 'Mon-Sat, 9AM-6PM' },
              { Icon: Mail,   text: 'support@fundflow.in', sub: 'We reply in 24hrs' },
              { Icon: MapPin, text: 'Mumbai, Maharashtra', sub: 'India 400 001' },
            ].map(({ Icon, text, sub }) => (
              <div key={text} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(11,102,126,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={13} color="#12B4C3" />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#d9e4ef', fontWeight: 600 }}>{text}</p>
                  <p style={{ fontSize: '0.7rem', color: '#7a94ab' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div style={{ borderTop: '1px solid rgba(11,102,126,0.08)', padding: '1rem 1.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#7a94ab' }}>
          © 2025 FundFlow. All rights reserved. | SEBI Registered Investment Platform
        </p>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          {['Privacy Policy', 'Terms of Use', 'Disclaimer'].map(item => (
            <a key={item} href="#" style={{ fontSize: '0.73rem', color: '#7a94ab', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color='#12B4C3'}
              onMouseLeave={e => e.currentTarget.style.color='#7a94ab'}>
              {item}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {['🛡️ SEBI Registered', '🔒 256-bit SSL', '⭐ 4.9 Rating'].map(badge => (
            <span key={badge} style={{
              fontSize: '0.68rem', color: '#b0c4d8', fontWeight: 600,
              background: 'rgba(11,102,126,0.08)', border: '1px solid rgba(11,102,126,0.15)',
              padding: '0.2rem 0.6rem', borderRadius: '20px',
            }}>{badge}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

/* --- AuthLayout ----------------------------------------------------- */
export const AuthLayout = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const words = ['The Rewards', 'Your Wealth', 'Your Future', 'Your Dreams'];

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex(prev => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#1B2745' }}>

      {/* -- HEADER -- */}
      <Header />

      <main style={{ flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #1B2745 0%, #1a2e50 50%, #0e2a4a 100%)',
      }}>

        {/* Background stock chart image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/chart-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }} />

        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(18,180,195,0.6) 1px, transparent 1px), linear-gradient(90deg,rgba(18,180,195,0.6) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '420px', height: '420px', borderRadius: '50%', border: '1.5px solid rgba(11,102,126,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40px',  right: '80px',  width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(11,102,126,0.08)',   pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5rem', left: '-3rem', width: '220px', height: '220px', borderRadius: '50%', border: '1.5px solid rgba(11,102,126,0.1)',   pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '15%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(11,102,126,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* --- Content container --- */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '4.5rem 2rem 5rem' }}>

          {/* 1 - Eyebrow */}
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#12B4C3', marginBottom: '1rem', textAlign: 'center' }}>
            BE INVESTED
          </motion.p>

          {/* 2 - Heading */}
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.75rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15,
              marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Poppins, sans-serif' }}>
            <span>Invest With Confidence</span>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
              <span>Harvest</span>
              <span style={{ position: 'relative', display: 'inline-block', width: '300px', height: '1.2em', textAlign: 'left', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ y: 25, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -25, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ position: 'absolute', left: 0, top: 0, width: '100%', color: '#12B4C3' }}
                  >
                    {words[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>
          </motion.h1>

          {/* 3 - Subtext */}
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ fontSize: '1rem', color: '#b0c4d8', lineHeight: 1.75, maxWidth: '520px', margin: '0 auto 2.25rem', textAlign: 'center' }}>
            Access 3,000+ mutual fund schemes from 42 AMCs. Real-time NAV tracking, portfolio analytics, and SIP management.
          </motion.p>

          {/* 4 - CTA row */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.8rem 1.75rem', borderRadius: '50px',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              background: 'linear-gradient(135deg,#0B667E,#12B4C3)',
              boxShadow: '0 0 24px rgba(11,102,126,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(11,102,126,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 0 24px rgba(11,102,126,0.4)'; }}>
              <span>Get Started</span><span> →</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(11,102,126,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={16} color="#12B4C3" />
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: '#7a94ab' }}>Need help?</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>(808) 555-0111</p>
              </div>
            </div>
          </motion.div>

          {/* 5 - Stats row */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '2rem' }}>
            {[
              { label: 'Active Investors', value: '3L+' },
              { label: 'Total AUM',        value: '₹2.14L Cr' },
              { label: 'Fund Schemes',     value: '3,000+' },
              { label: 'AMC Partners',     value: '42' },
            ].map(stat => (
              <div key={stat.label} style={{
                borderRadius: '14px', padding: '1.1rem 1rem', textAlign: 'center',
                background: 'rgba(11,102,126,0.08)', border: '1px solid rgba(11,102,126,0.18)',
              }}>
                <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', fontFamily: 'Poppins, sans-serif' }}>{stat.value}</p>
                <p style={{ fontSize: '0.72rem', color: '#7a94ab', marginTop: '3px' }}>{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* 6 - Trust badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
            style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            {['🛡️ SEBI Registered', '🔒 256-bit SSL', '⭐ 4.9 App Rating'].map(badge => (
              <div key={badge} style={{
                padding: '0.35rem 0.875rem', borderRadius: '20px',
                background: 'rgba(11,102,126,0.1)', border: '1px solid rgba(11,102,126,0.22)',
              }}>
                <span style={{ fontSize: '0.75rem', color: '#d0e8f0', fontWeight: 500 }}>{badge}</span>
              </div>
            ))}
          </motion.div>

          {/* 7 - Sign In card */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.45 }}
            style={{
              width: '100%',
              maxWidth: '500px',
              margin: '0 auto',
              background: 'rgba(27, 43, 73, 0.45)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            }}>
            <Outlet />
          </motion.div>

        </div>
      </main>

      {/* -- FOOTER -- */}
      <Footer />

      {/* Responsive CSS */}
      <style>{`
        .auth-mobile-logo { display: none !important; }
        .auth-nav-desktop { display: flex !important; }
        .auth-nav-mobile  { display: none !important; }

        @media (max-width: 768px) {
          .auth-nav-desktop { display: none !important; }
          .auth-nav-mobile  { display: block !important; }
        }
        @media (max-width: 600px) {
          .auth-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

