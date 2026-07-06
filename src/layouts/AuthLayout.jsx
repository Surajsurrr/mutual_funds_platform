import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { TrendingUp, Search, Phone, Menu, X, ChevronDown, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Facebook = (props) => (
  <svg viewBox="0 0 24 24" width={props.size} height={props.size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = (props) => (
  <svg viewBox="0 0 24 24" width={props.size} height={props.size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Linkedin = (props) => (
  <svg viewBox="0 0 24 24" width={props.size} height={props.size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" width={props.size} height={props.size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

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
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '4.5rem 2rem 5rem' }}>

          {/* Hero Grid Section */}
          <div className="hero-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2.5rem',
            alignItems: 'center',
            marginBottom: '4rem',
          }}>
            {/* Left Column: Hero Text & Details */}
            <div className="hero-text-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {/* 1 - Eyebrow */}
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#12B4C3', marginBottom: '1rem' }}>
                BE INVESTED
              </motion.p>

              {/* 2 - Heading */}
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                style={{ fontSize: 'clamp(2.2rem, 5vw, 3.75rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15,
                  marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Poppins, sans-serif' }}>
                <span>Invest With Confidence</span>
                <span style={{ color: '#12B4C3' }}>Harvest the rewards</span>
              </motion.h1>

              {/* 3 - Subtext */}
              <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                style={{ fontSize: '1rem', color: '#b0c4d8', lineHeight: 1.75, maxWidth: '520px', margin: '0 auto 2.25rem' }}>
                Access 3,000+ mutual fund schemes from 42 AMCs. Real-time NAV tracking, portfolio analytics, and SIP management.
              </motion.p>

              {/* 4 - CTA row */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="hero-cta-row"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
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
                    <p style={{ fontSize: '0.7rem', color: '#7a94ab', textAlign: 'left' }}>Need help?</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', textAlign: 'left' }}>(808) 555-0111</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Arched Image Frame */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
              className="hero-image-col" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="hero-image-container" style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                {/* Decorative shapes */}
                <div style={{ position: 'absolute', top: '10%', right: '-15px', width: '60px', height: '60px', borderRadius: '0 60px 0 0', background: '#12B4C3', zIndex: 0 }} />
                <div style={{ position: 'absolute', bottom: '15%', left: '-20px', width: '70px', height: '70px', borderRadius: '0 0 0 70px', background: '#0B667E', zIndex: 2 }} />
                
                {/* Arched frame wrapper */}
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  height: '420px',
                  borderRadius: '210px 210px 30px 30px',
                  border: '4px solid rgba(255, 255, 255, 0.15)',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  background: '#1B2745',
                }}>
                  <img src="/stock-chart.png" alt="Stock Chart" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* 5 - Stats row */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="auth-stats-grid"
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
              maxWidth: '1040px',
              margin: '0 auto',
              background: 'rgba(21, 34, 63, 0.65)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(18, 180, 195, 0.15)',
              borderRadius: '28px',
              padding: '3rem 2.5rem',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)',
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

        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1.2fr 1.0fr !important;
            gap: 4rem !important;
          }
          .hero-text-col {
            align-items: flex-start !important;
            text-align: left !important;
          }
          .hero-text-col h1 {
            align-items: flex-start !important;
            text-align: left !important;
          }
          .hero-text-col p {
            text-align: left !important;
            margin-left: 0 !important;
          }
          .hero-cta-row {
            justify-content: flex-start !important;
          }
        }

        .auth-card-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        @media (min-width: 768px) {
          .auth-card-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 3.5rem !important;
          }
        }

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

