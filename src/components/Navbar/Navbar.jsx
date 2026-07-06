import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, LogOut, User, Settings, Menu, X, TrendingUp, Phone } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getRoleLabel } from '../../utils/formatters';

const NAV_TICKER = [
  'HDFC Top 100 ▲ 928.45 (+0.25%)',
  'SBI Bluechip ▼ 72.18 (-0.47%)',
  'ICICI Value ▲ 378.91 (+1.12%)',
  'Mirae Asset ▲ 94.67 (+2.04%)',
  'Axis Small Cap ▼ 87.34 (-1.39%)',
  'Nippon India ▲ 156.20 (+0.89%)',
  'Kotak Flexi Cap ▲ 62.45 (+0.67%)',
  'DSP Midcap ▲ 113.20 (+1.34%)',
];

export const Navbar = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const roleLabel = getRoleLabel(user?.role);

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* Ticker strip — dark navy */}
      <div className="overflow-hidden py-1.5 px-4" style={{ background: '#1B2745' }}>
        <div className="flex gap-10 animate-ticker whitespace-nowrap">
          {[...NAV_TICKER, ...NAV_TICKER].map((item, i) => (
            <span key={i} className="text-xs font-mono font-medium">
              {item.includes('▲')
                ? <span style={{ color: '#34d399' }}>{item}</span>
                : <span style={{ color: '#f87171' }}>{item}</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Main Navbar — dark navy bg */}
      <nav style={{ background: '#202C44', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
        className="px-4 lg:px-6 py-0">
        <div className="flex items-center justify-between h-16">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button onClick={onMenuToggle}
              className="p-2 rounded-lg lg:hidden transition-colors"
              style={{ color: '#cbd5e1' }}>
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#0B667E,#12B4C3)', boxShadow: '0 4px 12px rgba(11,102,126,0.3)' }}>
                <TrendingUp size={17} className="text-white" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', fontFamily: 'Poppins, sans-serif' }}>
                Fund<span style={{ color: '#12B4C3' }}>Flow</span>
              </span>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Phone CTA pill */}
            <div className="hidden lg:flex items-center gap-2.5 rounded-full mr-2"
              style={{
                background: 'linear-gradient(135deg,#0B667E,#12B4C3)',
                boxShadow: '0 4px 14px rgba(11,102,126,0.3)',
                padding: '0.5rem 1.25rem'
              }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20">
                <Phone size={13} className="text-white" />
              </div>
              <div>
                <p className="text-xs leading-none" style={{ color: 'rgba(255,255,255,0.7)' }}>Requesting A Call</p>
                <p className="text-sm font-bold text-white leading-tight">(629) 555-0129</p>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button id="nav-notifications"
                onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                className="relative p-2 rounded-xl transition-colors"
                style={{ color: '#cbd5e1' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(18,180,195,0.1)'; e.currentTarget.style.color = '#12B4C3'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}>
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse-teal"
                  style={{ background: '#12B4C3' }} />
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden"
                    style={{ background: '#202C44', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                    <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <h3 className="font-bold text-sm" style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif' }}>Notifications</h3>
                    </div>
                    {[
                      { icon: '✅', text: 'SIP of ₹3,000 processed successfully', time: '2 min ago' },
                      { icon: '📊', text: 'HDFC Top 100 NAV updated: ₹928.45',   time: '1 hr ago' },
                      { icon: '🎉', text: 'Portfolio crossed ₹1.5 Lakh!',         time: '3 hrs ago' },
                    ].map((n, i) => (
                      <div key={i} className="flex gap-3 p-4 transition-colors cursor-pointer"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(18,180,195,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <span className="text-lg">{n.icon}</span>
                        <div>
                          <p className="text-xs leading-relaxed" style={{ color: '#ffffff' }}>{n.text}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#a0aec0' }}>{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <button id="nav-profile"
                onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
                className="flex items-center gap-2 rounded-xl transition-colors"
                style={{ color: '#ffffff', padding: '0.45rem 1rem 0.45rem 0.625rem' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(18,180,195,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#0B667E,#12B4C3)', flexShrink: 0 }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold leading-none" style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif' }}>{user?.name || 'User'}</p>
                  <p className="text-xs leading-none mt-1" style={{ color: '#a0aec0' }}>{roleLabel}</p>
                </div>
                <ChevronDown size={14} style={{ color: '#a0aec0', flexShrink: 0 }}
                  className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden"
                    style={{ background: '#202C44', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.25rem' }}>
                      <p className="font-semibold text-sm" style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif' }}>{user?.name}</p>
                      <p className="text-xs mt-1" style={{ color: '#a0aec0' }}>{user?.email}</p>
                    </div>
                    {[
                      { icon: User,     label: 'Profile' },
                      { icon: Settings, label: 'Settings' },
                    ].map(item => (
                      <button key={item.label}
                        className="flex items-center gap-3 w-full text-sm transition-colors"
                        style={{ color: '#cbd5e1', padding: '0.75rem 1.25rem' }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(18,180,195,0.06)'; e.currentTarget.style.color='#12B4C3'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#cbd5e1'; }}
                        onClick={() => setProfileOpen(false)}>
                        <item.icon size={15} />
                        {item.label}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button id="nav-logout" onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-sm transition-colors"
                        style={{ color: '#ef4444', padding: '0.75rem 1.25rem' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

