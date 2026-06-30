import React from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { Badge } from '../../components/UI/Badge';
import { MOCK_CB_STATS, MOCK_TRANSACTIONS } from '../../utils/mockData';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MONTHLY_VOL = ['Jan','Feb','Mar','Apr','May','Jun'].map((m,i) => ({ month: m, volume: +(12+i*3.2+Math.random()*5).toFixed(1) }));
const CARD = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };
const TOOLTIP = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.2)', borderRadius: 10, fontSize: 12, color: '#d9e4ef' };

export default function CBDashboard() {
  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#42b4ff' }}>Corporate Banking</p>
        <h1 className="text-2xl font-black text-white">CB Dashboard</h1>
        <div className="section-divider mt-2" />
        <p className="text-sm mt-3" style={{ color: '#7a94ab' }}>Monitor client activity and transactions</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Clients"    value={MOCK_CB_STATS.totalClients.toLocaleString('en-IN')} icon={Users}         accentColor="blue"    trend={4.2}  delay={0} />
        <StatsCard title="Active Today"     value={MOCK_CB_STATS.activeToday.toLocaleString('en-IN')}  icon={Activity}      accentColor="emerald" trend={12.5} delay={0.1} />
        <StatsCard title="Txn Volume"       value={MOCK_CB_STATS.transactionVolume}                    icon={TrendingUp}    accentColor="amber"   trend={8.1}  delay={0.15} />
        <StatsCard title="Flagged Accounts" value={MOCK_CB_STATS.flaggedAccounts}                      icon={AlertTriangle} accentColor="rose"               delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6" style={CARD}>
          <h2 className="text-base font-bold text-white mb-4">Monthly Transaction Volume (₹ Cr)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_VOL}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#1b9af5" />
                    <stop offset="100%" stopColor="#0e7ee4" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,154,245,0.07)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP} labelStyle={{ color: '#7a94ab' }} />
                <Bar dataKey="volume" radius={[6,6,0,0]} fill="url(#barGrad)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-6" style={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Live Transactions</h2>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </div>
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.slice(0,5).map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl transition-colors"
                style={{ background: 'rgba(27,154,245,0.04)', border: '1px solid rgba(27,154,245,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(27,154,245,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(27,154,245,0.06)'}>
                <div>
                  <p className="text-xs font-semibold text-white">{txn.schemeName}</p>
                  <p className="text-xs" style={{ color: '#7a94ab' }}>{txn.id} • {formatDate(txn.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatCurrency(txn.amount)}</p>
                  <Badge variant={txn.status==='success'?'success':'danger'}>{txn.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged Accounts */}
      <div className="rounded-2xl p-6" style={{ background: '#0f2442', border: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle size={17} className="text-red-400" /> Flagged Accounts
          </h2>
          <button className="text-xs font-semibold flex items-center gap-1" style={{ color: '#42b4ff' }}>
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-3">
          {[
            { id:'USR4521', name:'Ramesh Kumar', reason:'Unusual transaction volume',   amount:'₹14.2L' },
            { id:'USR8832', name:'Priya Sharma',  reason:'Multiple failed transactions', amount:'₹2.8L'  },
          ].map(acc => (
            <div key={acc.id} className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div>
                <p className="text-sm font-semibold text-white">{acc.name} <span className="text-xs" style={{ color: '#7a94ab' }}>({acc.id})</span></p>
                <p className="text-xs font-medium mt-0.5 text-red-400">{acc.reason}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{acc.amount}</p>
                <button className="text-xs font-semibold mt-1" style={{ color: '#42b4ff' }}>Review →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
