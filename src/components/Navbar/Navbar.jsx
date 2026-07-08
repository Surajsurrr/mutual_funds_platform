import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, LogOut, User, Settings, Menu, X, TrendingUp, Phone } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { readClient } from '../../api/axiosClients';
import { getRoleLabel } from '../../utils/formatters';

// Static fallback shown until live NAVs load
const NAV_TICKER_FALLBACK = [
  'HDFC Top 100 ▲ 928.45 (+0.25%)',
  'SBI Bluechip ▼ 72.18 (-0.47%)',
  'ICICI Value ▲ 378.91 (+1.12%)',
  'Mirae Asset ▲ 94.67 (+2.04%)',
  'Axis Small Cap ▼ 87.34 (-1.39%)',
  'Nippon India ▲ 156.20 (+0.89%)',
  'Kotak Flexi Cap ▲ 62.45 (+0.67%)',
  'DSP Midcap ▲ 113.20 (+1.34%)',
];

const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const dateLabel = (d) => {
  if (!d) return '';
  const day = String(d).slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  if (day === today) return 'today';
  const diff = Math.round((new Date(today) - new Date(day)) / 86400000);
  return diff === 1 ? 'yesterday' : `${diff} days ago`;
};

export const Navbar = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [ticker,      setTicker]      = useState(null);
  const [notifs,      setNotifs]      = useState(null); // null = not fetched yet

  const handleLogout = () => { logout(); navigate('/login'); };
  const roleLabel = getRoleLabel(user?.role);

  // Live NAV ticker from the schemes the platform actually serves
  useEffect(() => {
    let cancelled = false;
    readClient.get('/schemes')
      .then(({ data }) => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        setTicker(data.map(s => ({
          text: `${s.name.replace(/\s*Fund$/, '')} ${s.dayChange >= 0 ? '▲' : '▼'} ${s.nav} (${s.dayChange >= 0 ? '+' : ''}${s.dayChangePct}%)`,
          up: s.dayChange >= 0,
        })));
      })
      .catch(() => { /* keep fallback */ });
    return () => { cancelled = true; };
  }, []);

  const tickerItems = ticker ?? NAV_TICKER_FALLBACK.map(t => ({ text: t, up: t.includes('▲') }));

  // Role-aware notifications, fetched lazily when the bell is first opened
  const loadNotifications = async () => {
    try {
      const role = user?.role;
      if (role === 'client') {
        const { data } = await readClient.get('/transactions?limit=6');
        return (data ?? []).slice(0, 6).map(t => ({
          icon: t.status === 'failed' ? '⚠️' : t.type === 'REDEEM' ? '💸' : t.type === 'SIP' ? '🔄' : '✅',
          text: t.status === 'failed'
            ? `${t.type} of ${inr(t.amount)} in ${t.schemeName} failed`
            : t.type === 'REDEEM'
              ? `Redeemed ${inr(t.amount)} from ${t.schemeName}`
              : `${t.type === 'SIP' ? 'SIP' : 'Purchase'} of ${inr(t.amount)} in ${t.schemeName} settled`,
          time: dateLabel(t.date),
        }));
      }
      if (role === 'cb') {
        const { data } = await readClient.get('/cb/transactions');
        return (data ?? []).slice(0, 6).map(t => ({
          icon: t.status === 'failed' ? '⚠️' : t.status === 'flagged' ? '🚩' : '🏦',
          text: `${t.clientName}: ${t.type} of ${inr(t.amount)} in ${t.schemeName} (${t.status})`,
          time: dateLabel(t.date),
        }));
      }
      if (role === 'amc') {
        const { data } = await readClient.get('/amc/schemes');
        return [...(data ?? [])]
          .sort((a, b) => Math.abs(b.dayChangePct) - Math.abs(a.dayChangePct))
          .slice(0, 5)
          .map(s => ({
            icon: s.dayChange >= 0 ? '📈' : '📉',
            text: `NAV updated: ${s.name} ₹${s.nav} (${s.dayChange >= 0 ? '+' : ''}${s.dayChangePct}%)`,
            time: 'today',
          }));
      }
      if (role === 'admin') {
        const [dlq, pending] = await Promise.all([
          readClient.get('/admin/dlq'),
          readClient.get('/admin/amcs/pending'),
        ]);
        const items = [];
        const dead = dlq.data?.deadLetters?.length ?? 0;
        if (dead) items.push({ icon: '🧨', text: `${dead} order${dead > 1 ? 's' : ''} parked in the dead letter queue`, time: 'action needed' });
        if (dlq.data?.queueDepth > 0) items.push({ icon: '📬', text: `${dlq.data.queueDepth} order(s) waiting in the queue`, time: 'live' });
        for (const a of (pending.data ?? []).slice(0, 4)) {
          items.push({ icon: '🏢', text: `AMC approval pending: ${a.name} (${a.aum})`, time: dateLabel(a.applied) });
        }
        return items;
      }
      return [];
    } catch {
      return [];
    }
  };

  const handleBellClick = async () => {
    setProfileOpen(false);
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening) setNotifs(await loadNotifications());
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* Ticker strip — hidden on very small screens to prevent overflow */}
      <div className="hidden sm:block overflow-hidden py-1.5 px-4" style={{ background: '#080E1A', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex gap-10 animate-ticker whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="text-xs font-mono font-medium">
              <span style={{ color: item.up ? '#34d399' : '#f87171' }}>{item.text}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Navbar — dark navy bg */}
      <nav style={{ background: '#0E1526', borderBottom: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 2px 16px rgba(0,0,0,0.28)' }}
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
                onClick={handleBellClick}
                className="relative p-2 rounded-xl transition-colors"
                style={{ color: '#cbd5e1' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(18,180,195,0.1)'; e.currentTarget.style.color = '#12B4C3'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}>
                <Bell size={18} />
                {(notifs === null || notifs.length > 0) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse-teal"
                    style={{ background: '#12B4C3' }} />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 rounded-2xl overflow-hidden"
                    style={{ right: 0, width: 'min(320px, calc(100vw - 2rem)', background: '#121C33', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 48px -12px rgba(0,0,0,0.6)' }}>
                    <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <h3 className="font-bold text-sm" style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif' }}>Notifications</h3>
                    </div>
                    {notifs === null ? (
                      <div className="p-4 text-xs" style={{ color: '#a0aec0' }}>Loading…</div>
                    ) : notifs.length === 0 ? (
                      <div className="p-4 text-xs" style={{ color: '#a0aec0' }}>You're all caught up ✨</div>
                    ) : notifs.map((n, i) => (
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
                    style={{ background: '#121C33', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 48px -12px rgba(0,0,0,0.6)' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.25rem' }}>
                      <p className="font-semibold text-sm" style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif' }}>{user?.name}</p>
                      <p className="text-xs mt-1" style={{ color: '#a0aec0' }}>{user?.email}</p>
                    </div>
                    {[
                      { icon: User,     label: 'Profile',  to: '/profile' },
                      { icon: Settings, label: 'Settings', to: '/settings' },
                    ].map(item => (
                      <button key={item.label}
                        className="flex items-center gap-3 w-full text-sm transition-colors"
                        style={{ color: '#cbd5e1', padding: '0.75rem 1.25rem' }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(18,180,195,0.06)'; e.currentTarget.style.color='#12B4C3'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#cbd5e1'; }}
                        onClick={() => { setProfileOpen(false); navigate(item.to); }}>
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

