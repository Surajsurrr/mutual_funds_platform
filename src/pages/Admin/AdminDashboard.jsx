import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, TrendingUp, Activity, Shield, Settings, Check, X } from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { MOCK_ADMIN_STATS, MOCK_AMC_LIST } from '../../utils/mockData';
import { formatNumber } from '../../utils/formatters';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

const GROWTH_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: ['J','F','M','A','M','J','J','A','S','O','N','D'][i],
  users: Math.floor(200000 + i * 9500 + Math.random() * 5000),
  txns: Math.floor(500000 + i * 60000),
}));

const PENDING_AMCS = [
  { id: 'A43', name: 'Sundaram Mutual Fund', applied: '2026-06-25', aum: '₹12,400 Cr' },
  { id: 'A44', name: 'Motilal Oswal AMC', applied: '2026-06-28', aum: '₹8,900 Cr' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} className="text-rose-400" />
          <h1 className="text-2xl font-black text-white">Admin Console</h1>
        </div>
        <p className="text-slate-400">System overview and management</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: 'Total Users', value: formatNumber(MOCK_ADMIN_STATS.totalUsers), color: 'blue', icon: Users },
          { title: 'Active AMCs', value: MOCK_ADMIN_STATS.totalAMCs, color: 'emerald', icon: Building2 },
          { title: 'Total AUM', value: MOCK_ADMIN_STATS.totalAUM, color: 'amber', icon: TrendingUp },
          { title: 'Transactions', value: formatNumber(MOCK_ADMIN_STATS.totalTransactions), color: 'blue', icon: Activity },
          { title: 'Active Now', value: formatNumber(MOCK_ADMIN_STATS.activeUsers), color: 'emerald', icon: Users },
          { title: 'New Today', value: MOCK_ADMIN_STATS.newUsersToday, color: 'rose', icon: Users },
        ].map((s, i) => (
          <StatsCard key={s.title} title={s.title} value={s.value} icon={s.icon} accentColor={s.color} delay={i * 0.06} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-blue-600/10">
          <h2 className="text-lg font-bold text-white mb-4">User Growth</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [v.toLocaleString('en-IN'), 'Users']}
                  contentStyle={{ background: '#0f2040', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-blue-600/10">
          <h2 className="text-lg font-bold text-white mb-4">Monthly Transactions</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [v.toLocaleString('en-IN'), 'Transactions']}
                  contentStyle={{ background: '#0f2040', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="txns" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending AMC Approvals */}
      <div className="glass rounded-2xl p-6 border border-amber-600/15">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-amber-400" />
          Pending AMC Approvals
        </h2>
        <div className="space-y-3">
          {PENDING_AMCS.map(amc => (
            <div key={amc.id} className="flex items-center justify-between p-4 glass-light rounded-xl">
              <div>
                <p className="font-semibold text-white">{amc.name}</p>
                <p className="text-xs text-slate-400">Applied: {amc.applied} • AUM: {amc.aum}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="success" size="sm" icon={Check}>Approve</Button>
                <Button variant="danger" size="sm" icon={X}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-6 border border-blue-600/10">
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Users, label: 'Manage Users', to: '/admin/users', color: 'text-blue-400' },
            { icon: Building2, label: 'Manage AMCs', to: '/admin/amcs', color: 'text-emerald-400' },
            { icon: Activity, label: 'View Analytics', to: '/admin/analytics', color: 'text-amber-400' },
            { icon: Settings, label: 'System Settings', to: '/admin/settings', color: 'text-rose-400' },
          ].map(action => (
            <button key={action.label}
              className="flex flex-col items-center gap-3 p-5 glass-light rounded-xl hover:bg-navy-700/60 transition-all group">
              <action.icon size={24} className={`${action.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-semibold text-slate-300">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
