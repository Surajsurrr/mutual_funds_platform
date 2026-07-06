import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, LineChart, PieChart,
  History, Users, FileText, BarChart3, Settings, Shield,
  TrendingUp, Briefcase, UserCheck, BookOpen, Activity,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const CLIENT_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',     to: '/client/dashboard' },
  { icon: Building2,       label: 'AMC Companies', to: '/client/amc' },
  { icon: LineChart,       label: 'Schemes',        to: '/client/schemes' },
  { icon: PieChart,        label: 'Portfolio',      to: '/client/portfolio' },
  { icon: History,         label: 'Transactions',   to: '/client/transactions' },
];
const CB_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    to: '/cb/dashboard' },
  { icon: Users,           label: 'Clients',      to: '/cb/clients' },
  { icon: Activity,        label: 'Transactions', to: '/cb/transactions' },
  { icon: FileText,        label: 'Reports',      to: '/cb/reports' },
];
const AMC_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/amc/dashboard' },
  { icon: BookOpen,        label: 'Schemes',   to: '/amc/schemes' },
  { icon: UserCheck,       label: 'Investors', to: '/amc/investors' },
];
const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',      to: '/admin/dashboard' },
  { icon: Users,           label: 'Users',          to: '/admin/users' },
  { icon: Building2,       label: 'AMC Management', to: '/admin/amcs' },
  { icon: BarChart3,       label: 'Analytics',      to: '/admin/analytics' },
  { icon: Settings,        label: 'Settings',       to: '/admin/settings' },
];
const NAV_MAP = { client: CLIENT_NAV, cb: CB_NAV, amc: AMC_NAV, admin: ADMIN_NAV };

const ROLE_META = {
  client: { label: 'Investor Portal',   icon: TrendingUp, color: '#12B4C3' },
  cb:     { label: 'Corporate Banking', icon: Briefcase,  color: '#fbbf24' },
  amc:    { label: 'AMC Portal',        icon: Building2,  color: '#34d399' },
  admin:  { label: 'Admin Console',     icon: Shield,     color: '#f87171' },
};

const SECTION_LABELS = {
  client: 'Portfolio Manager',
  cb:     'Corporate Banking',
  amc:    'AMC Operations',
  admin:  'Admin Console',
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const role     = user?.role || 'client';
  const navItems = NAV_MAP[role] || CLIENT_NAV;
  const meta     = ROLE_META[role] || ROLE_META.client;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: 'rgba(6,14,26,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose} />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={typeof window !== 'undefined' && window.innerWidth < 1024 ? { x: isOpen ? 0 : '-100%' } : { x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="app-sidebar-fixed"
      >
        {/* Role header */}
        <div style={{ padding: '1.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3.5">
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'rgba(18,180,195,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <meta.icon size={18} style={{ color: meta.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{meta.label}</p>
                {role === 'client' && (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                    KYC
                  </span>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>ID: {user?.id || 'USR001'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-5 py-8 space-y-2">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-3.5 mb-4">
            {SECTION_LABELS[role] || 'Menu'}
          </p>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
              {({ isActive }) => (
                <>
                  <item.icon size={18} style={{ color: isActive ? '#12B4C3' : '#7a94ab' }} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="rounded-xl text-center relative overflow-hidden"
            style={{
              padding: '1.25rem 1.4rem',
              background: 'rgba(18,180,195,0.04)',
              border: '1px solid rgba(18,180,195,0.12)',
            }}>
            <p className="text-xs font-extrabold" style={{ color: '#12B4C3', fontFamily: 'Poppins, sans-serif' }}>FundFlow v1.0.0</p>
            
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-semibold text-emerald-400/90 uppercase tracking-wider">Live Market Active</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
