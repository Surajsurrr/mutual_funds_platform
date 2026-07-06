import React from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { Badge } from '../../components/UI/Badge';
import { MOCK_CB_STATS, MOCK_TRANSACTIONS } from '../../utils/mockData';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MONTHLY_VOL = ['Jan','Feb','Mar','Apr','May','Jun'].map((m,i) => ({ month: m, volume: +(12+i*3.2+Math.random()*5).toFixed(1) }));

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

const TOOLTIP = {
  background: '#111b30',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  fontSize: 12,
  color: '#d9e4ef'
};

export default function CBDashboard() {
  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.25rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>Corporate Banking</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>CB Dashboard</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Monitor client activity and transactions</p>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" style={{ marginBottom: '2.5rem' }}>
        <StatsCard title="Total Clients"    value={MOCK_CB_STATS.totalClients.toLocaleString('en-IN')} icon={Users}         accentColor="blue"    trend={4.2}  delay={0} />
        <StatsCard title="Active Today"     value={MOCK_CB_STATS.activeToday.toLocaleString('en-IN')}  icon={Activity}      accentColor="emerald" trend={12.5} delay={0.1} />
        <StatsCard title="Txn Volume"       value={MOCK_CB_STATS.transactionVolume}                    icon={TrendingUp}    accentColor="amber"   trend={8.1}  delay={0.15} />
        <StatsCard title="Flagged Accounts" value={MOCK_CB_STATS.flaggedAccounts}                      icon={AlertTriangle} accentColor="rose"               delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-10" style={{ marginBottom: '2.5rem' }}>
        {/* Monthly Volume Card */}
        <div className="rounded-2xl" style={CARD}>
          <h2 className="text-base font-bold text-white mb-5">Monthly Transaction Volume (₹ Cr)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_VOL}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP} labelStyle={{ color: '#7a94ab' }} />
                <Bar dataKey="volume" radius={[6,6,0,0]} fill="#12B4C3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Transactions Card */}
        <div className="rounded-2xl" style={CARD}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Live Transactions</h2>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </div>
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.slice(0,5).map(txn => (
              <div key={txn.id} className="flex items-center justify-between rounded-xl transition-all border"
                style={{ padding: '0.9rem 1.1rem', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(18,180,195,0.25)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                <div>
                  <p className="text-xs font-semibold text-white">{txn.schemeName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7a94ab' }}>{txn.id} • {formatDate(txn.date)}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-white mb-0.5">{formatCurrency(txn.amount)}</p>
                  <Badge variant={txn.status==='success'?'success':'danger'}>{txn.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged Accounts Card */}
      <div className="rounded-2xl"
        style={{
          background: 'rgba(239,68,68,0.02)',
          border: '1px solid rgba(239,68,68,0.15)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '2.25rem'
        }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle size={17} className="text-red-400" /> Flagged Accounts
          </h2>
          <button className="text-xs font-semibold flex items-center gap-1" style={{ color: '#12B4C3' }}>
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-3">
          {[
            { id:'USR4521', name:'Ramesh Kumar', reason:'Unusual transaction volume',   amount:'₹14.2L' },
            { id:'USR8832', name:'Priya Sharma',  reason:'Multiple failed transactions', amount:'₹2.8L'  },
          ].map(acc => (
            <div key={acc.id} className="flex items-center justify-between rounded-xl border"
              style={{ padding: '1rem 1.25rem', background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div>
                <p className="text-sm font-semibold text-white">{acc.name} <span className="text-xs" style={{ color: '#7a94ab' }}>({acc.id})</span></p>
                <p className="text-xs font-medium mt-0.5 text-red-400">{acc.reason}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm font-bold text-white">{acc.amount}</p>
                <button className="text-xs font-semibold mt-1 transition-colors hover:text-white" style={{ color: '#12B4C3' }}>Review →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
