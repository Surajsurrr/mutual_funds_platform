import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, TrendingUp, Activity, Settings, Check, X } from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { Button } from '../../components/UI/Button';
import { MOCK_ADMIN_STATS } from '../../utils/mockData';
import { formatNumber } from '../../utils/formatters';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

const GROWTH = Array.from({ length: 12 }, (_,i) => ({
  month: ['J','F','M','A','M','J','J','A','S','O','N','D'][i],
  users: Math.floor(200000 + i*9500 + Math.random()*5000),
  txns:  Math.floor(500000 + i*60000),
}));

const CARD    = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };
const TOOLTIP = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.2)', borderRadius: 10, fontSize: 12, color: '#d9e4ef' };
const LABEL   = { color: '#7a94ab' };

const PENDING_AMCS = [
  { id:'A43', name:'Sundaram Mutual Fund', applied:'2026-06-25', aum:'₹12,400 Cr' },
  { id:'A44', name:'Motilal Oswal AMC',    applied:'2026-06-28', aum:'₹8,900 Cr'  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f87171' }}>🛡 System</p>
        <h1 className="text-2xl font-black text-white">Admin Console</h1>
        <div className="section-divider mt-2" style={{ background: 'linear-gradient(90deg,#dc2626,#f87171)' }} />
        <p className="text-sm mt-3" style={{ color: '#7a94ab' }}>System-wide overview and management</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title:'Total Users',  value:formatNumber(MOCK_ADMIN_STATS.totalUsers),        color:'blue',    icon:Users },
          { title:'Active AMCs',  value:MOCK_ADMIN_STATS.totalAMCs,                       color:'emerald', icon:Building2 },
          { title:'Total AUM',    value:MOCK_ADMIN_STATS.totalAUM,                        color:'amber',   icon:TrendingUp },
          { title:'Transactions', value:formatNumber(MOCK_ADMIN_STATS.totalTransactions), color:'blue',    icon:Activity },
          { title:'Active Now',   value:formatNumber(MOCK_ADMIN_STATS.activeUsers),       color:'emerald', icon:Users },
          { title:'New Today',    value:MOCK_ADMIN_STATS.newUsersToday,                   color:'rose',    icon:Users },
        ].map((s,i) => <StatsCard key={s.title} {...s} delay={i*0.06} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6" style={CARD}>
          <h2 className="text-base font-bold text-white mb-4">User Growth</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,154,245,0.07)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v=>[v.toLocaleString('en-IN'),'Users']} contentStyle={TOOLTIP} labelStyle={LABEL} />
                <Line type="monotone" dataKey="users" stroke="#1b9af5" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-6" style={CARD}>
          <h2 className="text-base font-bold text-white mb-4">Monthly Transactions</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GROWTH}>
                <defs>
                  <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,154,245,0.07)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v=>[v.toLocaleString('en-IN'),'Transactions']} contentStyle={TOOLTIP} labelStyle={LABEL} />
                <Bar dataKey="txns" radius={[4,4,0,0]} fill="url(#barG)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="rounded-2xl p-6" style={{ background: '#0f2442', border: '1px solid rgba(245,158,11,0.2)' }}>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Building2 size={17} className="text-amber-400" />
          Pending AMC Approvals
          <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
            {PENDING_AMCS.length}
          </span>
        </h2>
        <div className="space-y-3">
          {PENDING_AMCS.map(amc => (
            <div key={amc.id} className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div>
                <p className="font-semibold text-white text-sm">{amc.name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#7a94ab' }}>Applied: {amc.applied} • AUM: {amc.aum}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="success" size="sm" icon={Check}>Approve</Button>
                <Button variant="danger"  size="sm" icon={X}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl p-6" style={CARD}>
        <h2 className="text-base font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Users,    label:'Manage Users',   color:'#42b4ff', bg:'rgba(27,154,245,0.1)' },
            { icon: Building2,label:'Manage AMCs',    color:'#34d399', bg:'rgba(16,185,129,0.1)' },
            { icon: Activity, label:'View Analytics', color:'#fbbf24', bg:'rgba(245,158,11,0.1)' },
            { icon: Settings, label:'System Settings',color:'#f87171', bg:'rgba(239,68,68,0.1)'  },
          ].map(action => (
            <button key={action.label} className="flex flex-col items-center gap-3 p-5 rounded-xl transition-all group"
              style={{ background: 'rgba(27,154,245,0.04)', border: '1px solid rgba(27,154,245,0.08)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(27,154,245,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(27,154,245,0.08)'}>
              <div className="p-3 rounded-xl transition-transform group-hover:scale-110" style={{ background: action.bg }}>
                <action.icon size={20} style={{ color: action.color }} />
              </div>
              <span className="text-xs font-semibold text-center" style={{ color: '#b0c4d8' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
