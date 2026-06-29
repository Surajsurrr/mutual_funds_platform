import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, LineChart, ShoppingCart, PieChart,
  History, Users, FileText, BarChart3, Settings, Shield,
  TrendingUp, Briefcase, UserCheck, BookOpen, Activity,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const CLIENT_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/client/dashboard' },
  { icon: Building2, label: 'AMC Companies', to: '/client/amc' },
  { icon: LineChart, label: 'Schemes', to: '/client/schemes' },
  { icon: PieChart, label: 'Portfolio', to: '/client/portfolio' },
  { icon: History, label: 'Transactions', to: '/client/transactions' },
];

const CB_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/cb/dashboard' },
  { icon: Users, label: 'Clients', to: '/cb/clients' },
  { icon: Activity, label: 'Transactions', to: '/cb/transactions' },
  { icon: FileText, label: 'Reports', to: '/cb/reports' },
];

const AMC_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/amc/dashboard' },
  { icon: BookOpen, label: 'Schemes', to: '/amc/schemes' },
  { icon: UserCheck, label: 'Investors', to: '/amc/investors' },
];

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: Users, label: 'Users', to: '/admin/users' },
  { icon: Building2, label: 'AMC Management', to: '/admin/amcs' },
  { icon: BarChart3, label: 'Analytics', to: '/admin/analytics' },
  { icon: Settings, label: 'Settings', to: '/admin/settings' },
];

const NAV_MAP = {
  client: CLIENT_NAV,
  cb: CB_NAV,
  amc: AMC_NAV,
  admin: ADMIN_NAV,
};

const ROLE_META = {
  client: { label: 'Investor Portal', icon: TrendingUp, color: 'text-blue-400' },
  cb: { label: 'Corporate Banking', icon: Briefcase, color: 'text-amber-400' },
  amc: { label: 'AMC Portal', icon: Building2, color: 'text-emerald-400' },
  admin: { label: 'Admin Console', icon: Shield, color: 'text-rose-400' },
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const role = user?.role || 'client';
  const navItems = NAV_MAP[role] || CLIENT_NAV;
  const meta = ROLE_META[role] || ROLE_META.client;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-navy-950/70 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 z-30 w-64 glass border-r border-blue-600/10 flex flex-col pt-[88px] lg:translate-x-0 lg:static lg:pt-0"
      >
        {/* Role Label */}
        <div className="p-4 border-b border-blue-600/10">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg bg-navy-800`}>
              <meta.icon size={15} className={meta.color} />
            </div>
            <div>
              <p className={`text-xs font-bold ${meta.color}`}>{meta.label}</p>
              <p className="text-xs text-slate-500">ID: {user?.id || 'USR000'}</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-navy-700/60'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={16} className={isActive ? 'text-blue-400' : ''} />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Version */}
        <div className="p-4 border-t border-blue-600/10">
          <p className="text-xs text-slate-600 text-center">FundFlow v1.0.0 • 2026</p>
        </div>
      </motion.aside>
    </>
  );
};
