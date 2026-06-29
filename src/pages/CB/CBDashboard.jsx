import React from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { Badge } from '../../components/UI/Badge';
import { MOCK_CB_STATS, MOCK_TRANSACTIONS } from '../../utils/mockData';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MONTHLY_VOL = ['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => ({
  month: m,
  volume: 12 + i * 3.2 + Math.random() * 5,
}));

export default function CBDashboard() {
  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Corporate Banking Dashboard</h1>
        <p className="text-slate-400 mt-1">Monitor client activity and transactions</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Clients" value={MOCK_CB_STATS.totalClients.toLocaleString('en-IN')} icon={Users} accentColor="blue" trend={4.2} delay={0} />
        <StatsCard title="Active Today" value={MOCK_CB_STATS.activeToday.toLocaleString('en-IN')} icon={Activity} accentColor="emerald" trend={12.5} delay={0.1} />
        <StatsCard title="Txn Volume" value={MOCK_CB_STATS.transactionVolume} icon={TrendingUp} accentColor="amber" trend={8.1} delay={0.15} />
        <StatsCard title="Flagged Accounts" value={MOCK_CB_STATS.flaggedAccounts} icon={AlertTriangle} accentColor="rose" delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <div className="glass rounded-2xl p-6 border border-blue-600/10">
          <h2 className="text-lg font-bold text-white mb-4">Monthly Transaction Volume (₹ Cr)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_VOL}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f2040', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="volume" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Transactions */}
        <div className="glass rounded-2xl p-6 border border-blue-600/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Live Transactions</h2>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.slice(0, 5).map((txn, i) => (
              <div key={txn.id} className="flex items-center justify-between p-3 glass-light rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-white">{txn.schemeName}</p>
                  <p className="text-xs text-slate-400">{txn.id} • {formatDate(txn.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatCurrency(txn.amount)}</p>
                  <Badge variant={txn.status === 'success' ? 'success' : 'danger'}>{txn.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged Accounts */}
      <div className="glass rounded-2xl p-6 border border-rose-600/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-400" /> Flagged Accounts
          </h2>
          <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View all <ChevronRight size={12} /></button>
        </div>
        <div className="space-y-2">
          {[
            { id: 'USR4521', name: 'Ramesh Kumar', reason: 'Unusual transaction volume', amount: '₹14.2L' },
            { id: 'USR8832', name: 'Priya Sharma', reason: 'Multiple failed transactions', amount: '₹2.8L' },
          ].map(acc => (
            <div key={acc.id} className="flex items-center justify-between p-3 rounded-xl bg-rose-600/5 border border-rose-600/15">
              <div>
                <p className="text-sm font-semibold text-white">{acc.name} <span className="text-xs text-slate-500">({acc.id})</span></p>
                <p className="text-xs text-rose-400">{acc.reason}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{acc.amount}</p>
                <button className="text-xs text-blue-400 hover:underline">Review</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
