import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Mail, Smartphone, TrendingUp, Moon, Globe, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/UI/Button';
import toast from 'react-hot-toast';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2rem',
};

const PREFS_KEY = 'ff_prefs';

const DEFAULT_PREFS = {
  emailNotifs: true,
  smsAlerts: false,
  orderUpdates: true,
  navAlerts: true,
  darkMode: true,
  language: 'English',
};

const loadPrefs = () => {
  try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; }
  catch { return DEFAULT_PREFS; }
};

const Toggle = ({ on, onChange, id }) => (
  <button id={id} onClick={onChange} role="switch" aria-checked={on}
    className="relative flex-shrink-0 transition-colors"
    style={{
      width: '42px', height: '24px', borderRadius: '999px',
      background: on ? 'linear-gradient(135deg,#0B667E,#12B4C3)' : 'rgba(255,255,255,0.1)',
      border: '1px solid ' + (on ? 'transparent' : 'rgba(255,255,255,0.15)'),
    }}>
    <span className="absolute top-1/2 -translate-y-1/2 transition-all rounded-full"
      style={{
        width: '18px', height: '18px', background: '#ffffff',
        left: on ? '21px' : '3px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
  </button>
);

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [prefs, setPrefs] = useState(loadPrefs);

  const setPref = (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  const toggle = key => () => setPref(key, !prefs[key]);

  const notifRows = [
    { key: 'emailNotifs',  icon: Mail,       label: 'Email Notifications', desc: 'Order confirmations and monthly statements' },
    { key: 'smsAlerts',    icon: Smartphone, label: 'SMS Alerts',          desc: 'Transaction alerts on your phone' },
    { key: 'orderUpdates', icon: Bell,       label: 'Order Updates',       desc: 'Real-time status when orders settle' },
    { key: 'navAlerts',    icon: TrendingUp, label: 'NAV Alerts',          desc: 'Daily NAV changes for funds you hold' },
  ];

  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/login'); };

  return (
    <div className="pb-8 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.25rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>Account</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Settings</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Manage notifications and app preferences</p>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl" style={{ ...CARD, marginBottom: '1.75rem' }}>
        <h2 className="text-base font-bold text-white mb-5">Notifications</h2>
        <div className="space-y-5">
          {notifRows.map(row => (
            <div key={row.key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(18,180,195,0.1)', border: '1px solid rgba(18,180,195,0.15)' }}>
                  <row.icon size={16} style={{ color: '#12B4C3' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{row.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7a94ab' }}>{row.desc}</p>
                </div>
              </div>
              <Toggle id={`toggle-${row.key}`} on={prefs[row.key]} onChange={toggle(row.key)} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="rounded-2xl" style={{ ...CARD, marginBottom: '1.75rem' }}>
        <h2 className="text-base font-bold text-white mb-5">Preferences</h2>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(18,180,195,0.1)', border: '1px solid rgba(18,180,195,0.15)' }}>
                <Moon size={16} style={{ color: '#12B4C3' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Dark Mode</p>
                <p className="text-xs mt-0.5" style={{ color: '#7a94ab' }}>FundFlow looks best in the dark</p>
              </div>
            </div>
            <Toggle id="toggle-darkMode" on={prefs.darkMode}
              onChange={() => toast('Light mode is coming soon — enjoying the dark for now 🌙', { icon: '✨' })} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(18,180,195,0.1)', border: '1px solid rgba(18,180,195,0.15)' }}>
                <Globe size={16} style={{ color: '#12B4C3' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Language</p>
                <p className="text-xs mt-0.5" style={{ color: '#7a94ab' }}>Display language for the app</p>
              </div>
            </div>
            <select value={prefs.language} onChange={e => setPref('language', e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', color: '#ffffff', padding: '0.45rem 0.75rem',
                outline: 'none', fontSize: '0.825rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}>
              {['English', 'हिन्दी', 'தமிழ்', 'తెలుగు'].map(l => (
                <option key={l} value={l} style={{ background: '#202C44', color: '#fff' }}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Session */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        className="rounded-2xl flex items-center justify-between gap-4 flex-wrap" style={CARD}>
        <div>
          <h2 className="text-base font-bold text-white">Session</h2>
          <p className="text-xs mt-1" style={{ color: '#7a94ab' }}>Sign out of your account on this device</p>
        </div>
        <Button variant="danger" icon={LogOut} onClick={handleLogout} id="settings-logout">Sign Out</Button>
      </motion.div>
    </div>
  );
}
