import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart, Wallet, Building2, Activity, ChevronRight, Star, RefreshCw } from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { useAuthStore } from '../../store/authStore';
import { usePortfolio, useTransactions, useAmcs } from '../../api/useApi';
import { formatCurrency, formatPercent, formatDate, getStatusColor } from '../../utils/formatters';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PORTFOLIO_CHART = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  value: 80000 + i * 5500 + Math.sin(i * 0.8) * 8000,
}));

const CARD  = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };
const CHART = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.15)', borderRadius: 10, fontSize: 12, color: '#d9e4ef' };

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const { data: portfolio, loading: pLoading } = usePortfolio();
  const { data: transactions } = useTransactions('', 4);
  const { data: amcs } = useAmcs();

  const totalInvested  = portfolio?.totalInvested  ?? 0;
  const currentValue   = portfolio?.currentValue   ?? 0;
  const totalGain      = portfolio?.totalGain      ?? 0;
  const totalGainPct   = portfolio?.totalGainPct   ?? 0;
  const dayChange      = portfolio?.dayChange      ?? 0;
  const dayChangePct   = portfolio?.dayChangePct   ?? 0;
  const holdings       = portfolio?.holdings       ?? [];
  const activeSips     = holdings.filter(h => h.sipStatus === 'Active').length;


  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-3"
        style={{ marginBottom: '1.5rem' }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>BE INVESTED</p>
          <h1 className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)' }}>Good evening, {user?.name?.split(' ')[0]} 👋</h1>
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        </div>
        <Link to="/client/amc">
          <Button variant="primary" icon={Building2} id="explore-funds">Explore Funds</Button>
        </Link>
      </motion.div>

      {/* Portfolio Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl relative overflow-hidden"
        style={{ ...CARD, padding: 'clamp(1.25rem, 4vw, 2.25rem)', marginBottom: '2.25rem' }}>
        {/* Blue top accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg,#0e7ee4,#42b4ff)' }} />
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(27,154,245,0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7a94ab', letterSpacing: '0.08em' }}>Total Portfolio Value</p>
            <p className="font-black text-white" style={{ fontSize: 'clamp(1.75rem, 6vw, 2.25rem)' }}>{formatCurrency(currentValue)}</p>
            <div className="flex items-center gap-3 flex-wrap pt-1 text-sm">
              <div className="flex items-center gap-1.5">
                <span style={{ color: '#7a94ab', fontSize: '0.85rem' }}>Invested</span>
                <span className="text-white font-bold" style={{ fontSize: '0.9rem' }}>{formatCurrency(totalInvested)}</span>
              </div>
              <div className="w-1 h-3.5 rounded-full bg-slate-700/50" />
              <div className="flex items-center gap-1.5">
                <span style={{ color: '#7a94ab', fontSize: '0.85rem' }}>Total Gain</span>
                <div className={`flex items-center gap-1 font-bold ${totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontSize: '0.9rem' }}>
                  {totalGain >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {formatCurrency(totalGain)} ({formatPercent(totalGainPct)})
                </div>
              </div>
              <div className="w-1 h-3.5 rounded-full bg-slate-700/50 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <span style={{ color: '#7a94ab', fontSize: '0.85rem' }}>Today</span>
                <div className={`flex items-center gap-1 font-bold ${dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontSize: '0.9rem' }}>
                  {dayChange >= 0 ? '+' : ''}{formatCurrency(dayChange)} ({formatPercent(dayChangePct)})
                </div>
              </div>
            </div>
          </div>

          <div className="h-28 w-full lg:w-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PORTFOLIO_CHART}>
                <defs>
                  <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1b9af5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1b9af5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#1b9af5" strokeWidth={2} fill="url(#portGrad)" dot={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#7a94ab' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [formatCurrency(v), 'Portfolio']} contentStyle={CHART} labelStyle={{ color: '#7a94ab' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8" style={{ marginBottom: '2rem' }}>
        <StatsCard title="Invested"   value={formatCurrency(totalInvested, true)} icon={Wallet}    accentColor="blue"    delay={0.15} />
        <StatsCard title="Total Gain" value={formatCurrency(totalGain, true)}     icon={TrendingUp} accentColor="emerald" trend={totalGainPct} trendLabel="overall" delay={0.2} />
        <StatsCard title="Holdings"   value={holdings.length} subtitle="Active schemes" icon={PieChart}  accentColor="blue"  delay={0.25} />
        <StatsCard title="SIPs Active" value={activeSips}      subtitle="Monthly SIPs"    icon={Activity}  accentColor="amber" delay={0.3} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 lg:gap-8 lg:gap-10">
        {/* Holdings */}
        <div className="lg:col-span-2 rounded-2xl" style={{ ...CARD, padding: 'clamp(1.25rem, 4vw, 2.25rem)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">My Holdings</h2>
            <Link to="/client/portfolio" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#42b4ff' }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {holdings.map((h, i) => (
              <motion.div key={h.schemeId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center justify-between rounded-xl transition-colors"
                style={{ padding: '1.1rem 1.4rem', background: 'rgba(27,154,245,0.04)', border: '1px solid rgba(27,154,245,0.08)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(27,154,245,0.25)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(27,154,245,0.08)'}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{h.schemeName}</p>
                  <p className="text-xs" style={{ color: '#7a94ab' }}>{h.amcName} • {h.units.toFixed(3)} units</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-white">{formatCurrency(h.currentValue)}</p>
                  <p className={`text-xs font-semibold ${h.gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                     {h.gain >= 0 ? '+' : ''}{formatCurrency(h.gain)} ({formatPercent(h.gainPct)})
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Txns */}
        <div className="rounded-2xl" style={{ ...CARD, padding: '2.25rem' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Recent</h2>
            <Link to="/client/transactions" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#42b4ff' }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-0">
            {(transactions ?? []).slice(0, 4).map((txn, i) => (
              <motion.div key={txn.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-start gap-4 last:pb-0"
                style={{ paddingBottom: '1.1rem', paddingTop: '1.1rem', borderBottom: i < 3 ? '1px solid rgba(27,154,245,0.06)' : 'none' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'rgba(27,154,245,0.1)' }}>
                  {txn.type === 'BUY' ? '💰' : '🔄'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{txn.schemeName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7a94ab' }}>{formatDate(txn.date)}</p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-xs font-bold text-white">₹{txn.amount.toLocaleString('en-IN')}</p>
                  <Badge variant={getStatusColor(txn.status).replace('badge-', '')} className="mt-0.5">{txn.status}</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Partner AMC banner — dark navy with blue glow */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl overflow-hidden relative" style={{ background: '#060e1a', border: '1px solid rgba(27,154,245,0.15)' }}>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(27,154,245,0.5) 1px, transparent 1px), linear-gradient(90deg,rgba(27,154,245,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        <div className="relative p-8 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-center mb-5" style={{ color: '#42b4ff' }}>Our AMC Partners</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {(amcs ?? []).slice(0, 4).map(amc => (
              <Link key={amc.id} to={`/client/schemes?amc=${amc.id}`}
                className="flex flex-col items-center gap-2 p-5 lg:p-6 rounded-xl transition-all group"
                style={{ background: 'rgba(27,154,245,0.06)', border: '1px solid rgba(27,154,245,0.12)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(27,154,245,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(27,154,245,0.12)'}>
                <span className="text-3xl group-hover:scale-110 transition-transform">{amc.logo}</span>
                <p className="text-xs font-semibold text-white text-center">{amc.name}</p>
                <div className="flex items-center gap-1">
                  <Star size={10} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>{amc.rating}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Latest Schemes divider */}
      <div className="text-center pt-2">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#42b4ff' }}>Our Latest Schemes</p>
        <div className="section-divider mx-auto mt-2" />
      </div>
    </div>
  );
}
