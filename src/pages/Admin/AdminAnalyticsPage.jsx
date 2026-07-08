import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, Users, Star, ArrowUpRight } from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { formatNumber, formatCurrency } from '../../utils/formatters';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

const GROWTH = Array.from({ length: 12 }, (_,i) => ({
  month: ['J','F','M','A','M','J','J','A','S','O','N','D'][i],
  users: Math.floor(200000 + i*9500 + Math.random()*5000),
  txns:  Math.floor(500000 + i*60000),
  volume: Math.floor(150 + i*15 + Math.random()*10), // in Cr
}));

const ALLOCATIONS = [
  { category: 'Large Cap', value: 45 },
  { category: 'Mid Cap', value: 25 },
  { category: 'Small Cap', value: 18 },
  { category: 'Debt / Bond', value: 8 },
  { category: 'Hybrid', value: 4 }
];

const TOOLTIP = {
  background: '#121C33',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  fontSize: 12,
  color: '#d9e4ef'
};

const LABEL = { color: '#7a94ab' };

export default function AdminAnalyticsPage() {
  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.25rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f87171' }}>🛡 System</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>System Analytics</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #f87171 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Track overall client growth, trading activity, and category volume splits</p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" style={{ marginBottom: '2.5rem' }}>
        <StatsCard title="Total Volume" value="₹2,14,300 Cr" icon={TrendingUp} accentColor="emerald" delay={0} />
        <StatsCard title="All Transactions" value="84.2 Lakhs" icon={Activity} accentColor="blue" delay={0.1} />
        <StatsCard title="Client Base" value="3.12 Lakhs" icon={Users} accentColor="blue" delay={0.15} />
        <StatsCard title="Monthly growth" value="+4.8%" icon={ArrowUpRight} accentColor="emerald" delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-10" style={{ marginBottom: '2.5rem' }}>
        {/* User Base Growth Area Chart */}
        <div className="rounded-2xl" style={CARD}>
          <h2 className="text-base font-bold text-white mb-5">User Base Growth (Cumulative)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GROWTH}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#12B4C3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#12B4C3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={TOOLTIP} labelStyle={LABEL} />
                <Area type="monotone" dataKey="users" stroke="#12B4C3" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trade Volume Bar Chart */}
        <div className="rounded-2xl" style={CARD}>
          <h2 className="text-base font-bold text-white mb-5">Monthly Trade Volume (₹ Cr)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP} labelStyle={LABEL} />
                <Bar dataKey="volume" radius={[4,4,0,0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Asset Allocations Breakdown */}
      <div className="rounded-2xl" style={CARD}>
        <h2 className="text-base font-bold text-white mb-5">Platform Assets Class Distribution</h2>
        <div className="space-y-4.5">
          {ALLOCATIONS.map((alloc, idx) => {
            const colors = ['#12B4C3', '#10b981', '#fbbf24', '#8b5cf6', '#f87171'];
            return (
              <div key={alloc.category}>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5" style={{ color: '#cbd5e1' }}>
                  <span>{alloc.category}</span>
                  <span>{alloc.value}%</span>
                </div>
                <div className="h-2 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="h-full rounded-full" style={{ width: `${alloc.value}%`, background: colors[idx % colors.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
