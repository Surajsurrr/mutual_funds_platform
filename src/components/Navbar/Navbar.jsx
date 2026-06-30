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
      {/* NAV Ticker — dark navy strip */}
      <div className="overflow-hidden py-1.5 px-4" style={{ background: '#060e1a' }}>
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

      {/* Main Navbar — navy blue */}
      <nav style={{ background: '#0b1f3a', borderBottom: '1px solid rgba(27,154,245,0.12)' }}
        className="px-4 lg:px-6 py-0">
        <div className="flex items-center justify-between h-16">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button onClick={onMenuToggle}
              className="p-2 rounded-lg lg:hidden transition-colors"
              style={{ color: '#7a94ab' }}>
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#0e7ee4,#42b4ff)', boxShadow: '0 0 16px rgba(27,154,245,0.35)' }}>
                <TrendingUp size={17} className="text-white" />
              </div>
              <span className="text-xl font-black text-white">Fund<span style={{ color: '#42b4ff' }}>Flow</span></span>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Phone CTA — Be Invest style */}
            <div className="hidden lg:flex items-center gap-2.5 rounded-xl px-3 py-2 mr-2"
              style={{ border: '1px solid rgba(27,154,245,0.2)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#0e7ee4,#1b9af5)' }}>
                <Phone size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs leading-none" style={{ color: '#7a94ab' }}>Requesting A Call</p>
                <p className="text-sm font-bold text-white leading-tight">(629) 555-0129</p>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button id="nav-notifications"
                onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                className="relative p-2 rounded-xl transition-colors"
                style={{ color: '#7a94ab' }}>
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-400 rounded-full animate-pulse-blue" />
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden"
                    style={{ background: '#0f2442', border: '1px solid rgba(27,154,245,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    <div className="p-4" style={{ borderBottom: '1px solid rgba(27,154,245,0.1)' }}>
                      <h3 className="font-bold text-sm text-white">Notifications</h3>
                    </div>
                    {[
                      { icon: '✅', text: 'SIP of ₹3,000 processed successfully', time: '2 min ago' },
                      { icon: '📊', text: 'HDFC Top 100 NAV updated: ₹928.45',   time: '1 hr ago' },
                      { icon: '🎉', text: 'Portfolio crossed ₹1.5 Lakh!',         time: '3 hrs ago' },
                    ].map((n, i) => (
                      <div key={i} className="flex gap-3 p-4 transition-colors"
                        style={{ borderBottom: '1px solid rgba(27,154,245,0.06)' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(27,154,245,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <span className="text-lg">{n.icon}</span>
                        <div>
                          <p className="text-xs leading-relaxed" style={{ color: '#d9e4ef' }}>{n.text}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#7a94ab' }}>{n.time}</p>
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
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-colors"
                style={{ color: '#d9e4ef' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#0e7ee4,#42b4ff)' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none mt-0.5" style={{ color: '#7a94ab' }}>{roleLabel}</p>
                </div>
                <ChevronDown size={14} style={{ color: '#7a94ab' }}
                  className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden"
                    style={{ background: '#0f2442', border: '1px solid rgba(27,154,245,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    <div className="p-4" style={{ borderBottom: '1px solid rgba(27,154,245,0.1)' }}>
                      <p className="font-semibold text-sm text-white">{user?.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#7a94ab' }}>{user?.email}</p>
                    </div>
                    {[
                      { icon: User, label: 'Profile' },
                      { icon: Settings, label: 'Settings' },
                    ].map(item => (
                      <button key={item.label}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors"
                        style={{ color: '#b0c4d8' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(27,154,245,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        onClick={() => setProfileOpen(false)}>
                        <item.icon size={15} />
                        {item.label}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(27,154,245,0.1)' }}>
                      <button id="nav-logout" onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors"
                        style={{ color: '#f87171' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <LogOut size={15} /> Sign Out
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
