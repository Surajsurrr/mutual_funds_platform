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
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 z-30 w-64 flex flex-col pt-[90px] lg:translate-x-0 lg:static lg:pt-0"
        style={{ background: '#202C44', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Role header */}
        <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(18,180,195,0.15)' }}>
              <meta.icon size={15} style={{ color: meta.color }} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: meta.color, fontFamily: 'Poppins, sans-serif' }}>{meta.label}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>ID: {user?.id || 'USR000'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}
              `}
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg,#0B667E,#12B4C3)', boxShadow: '0 2px 12px rgba(18,180,195,0.3)' }
                : {}}>
              {({ isActive }) => (
                <>
                  <item.icon size={16} style={{ color: isActive ? '#fff' : '#7a94ab' }} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="rounded-xl p-3 text-center"
            style={{ background: 'rgba(18,180,195,0.1)', border: '1px solid rgba(18,180,195,0.2)' }}>
            <p className="text-xs font-bold" style={{ color: '#12B4C3', fontFamily: 'Poppins, sans-serif' }}>FundFlow v1.0.0</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>SEBI Registered Platform</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
