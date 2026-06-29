import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, ChevronDown, LogOut, User, Settings, Menu, X,
  TrendingUp, Shield, Building2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../UI/Badge';
import { getRoleLabel, getRoleBadgeClass } from '../../utils/formatters';

const NAV_TICKER = [
  'HDFC Top 100 ▲ 928.45 (+0.25%)',
  'SBI Bluechip ▼ 72.18 (-0.47%)',
  'ICICI Value ▲ 378.91 (+1.12%)',
  'Mirae Asset ▲ 94.67 (+2.04%)',
  'Axis Small Cap ▼ 87.34 (-1.39%)',
  'Nippon India ▲ 156.20 (+0.89%)',
];

export const Navbar = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = getRoleBadgeClass(user?.role);
  const roleLabel = getRoleLabel(user?.role);

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* NAV Ticker Strip */}
      <div className="bg-navy-800 border-b border-blue-600/10 overflow-hidden">
        <div className="flex gap-8 animate-ticker whitespace-nowrap py-1 px-4">
          {[...NAV_TICKER, ...NAV_TICKER].map((item, i) => (
            <span key={i} className="text-xs text-slate-400 font-mono">
              {item.includes('▲') ? (
                <span className="text-emerald-400">{item}</span>
              ) : (
                <span className="text-rose-400">{item}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="glass border-b border-blue-600/10 px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-xl hover:bg-navy-700 text-slate-400 hover:text-white transition-colors lg:hidden"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-600/30">
                <TrendingUp size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold gradient-text hidden sm:block">FundFlow</span>
            </Link>
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                id="nav-notifications"
                onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                className="relative p-2 rounded-xl hover:bg-navy-700 text-slate-400 hover:text-white transition-colors"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 glass border border-blue-600/20 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-navy-700">
                      <h3 className="font-semibold text-sm text-white">Notifications</h3>
                    </div>
                    {[
                      { icon: '✅', text: 'SIP of ₹3,000 processed successfully', time: '2 min ago' },
                      { icon: '📊', text: 'HDFC Top 100 NAV updated: ₹928.45', time: '1 hr ago' },
                      { icon: '🎉', text: 'Portfolio crossed ₹1.5 Lakh milestone!', time: '3 hrs ago' },
                    ].map((n, i) => (
                      <div key={i} className="flex gap-3 p-4 hover:bg-navy-800 transition-colors border-b border-navy-800/50 last:border-0">
                        <span className="text-lg">{n.icon}</span>
                        <div>
                          <p className="text-xs text-slate-300 leading-relaxed">{n.text}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="nav-profile"
                onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-navy-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{roleLabel}</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 glass border border-blue-600/20 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-navy-700">
                      <p className="font-semibold text-sm text-white">{user?.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                      <Badge variant={roleColor.replace('badge-', '')} className="mt-2">{roleLabel}</Badge>
                    </div>
                    {[
                      { icon: User, label: 'Profile', to: `/${user?.role}/profile` },
                      { icon: Settings, label: 'Settings', to: `/${user?.role}/settings` },
                    ].map(item => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-navy-800 text-slate-300 hover:text-white text-sm transition-colors"
                      >
                        <item.icon size={15} />
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-navy-700">
                      <button
                        id="nav-logout"
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-rose-600/10 text-rose-400 hover:text-rose-300 text-sm transition-colors"
                      >
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
