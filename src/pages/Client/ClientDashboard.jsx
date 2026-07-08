import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart, Wallet, Building2, Activity, ChevronRight, Star, RefreshCw } from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { useAuthStore } from '../../store/authStore';
import { usePortfolio, useTransactions, useAmcs, useSchemes } from '../../api/useApi';
import { formatCurrency, formatPercent, formatDate, getStatusColor } from '../../utils/formatters';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PORTFOLIO_CHART = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  value: 80000 + i * 5500 + Math.sin(i * 0.8) * 8000,
}));

const CARD  = { background: '#121C33', border: '1px solid rgba(18,180,195,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };
const CHART = { background: '#121C33', border: '1px solid rgba(18,180,195,0.15)', borderRadius: 10, fontSize: 12, color: '#d9e4ef' };

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const { data: portfolio, loading: pLoading } = usePortfolio();
  const { data: transactions } = useTransactions('', 4);
  const { data: amcs } = useAmcs();
  const { data: schemes } = useSchemes();

  const totalInvested  = portfolio?.totalInvested  ?? 0;
  const currentValue   = portfolio?.currentValue   ?? 0;
  const totalGain      = portfolio?.totalGain      ?? 0;
  const totalGainPct   = portfolio?.totalGainPct   ?? 0;
  const dayChange      = portfolio?.dayChange      ?? 0;
  const dayChangePct   = portfolio?.dayChangePct   ?? 0;
  const holdings       = portfolio?.holdings       ?? [];
  const activeSips     = holdings.filter(h => h.sipStatus === 'Active').length;

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today    = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-3"
        style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#12B4C3' }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#12B4C3' }} />
            </span>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7E93AC', letterSpacing: '0.14em' }}>{today}</p>
          </div>
          <h1 className="page-title text-white">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <div style={{ height: '2px', width: '3rem', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem' }} />
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
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg,#0B667E,#3ECFDC)' }} />
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(18,180,195,0.08) 0%, transparent 70%)' }} />

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
                    <stop offset="5%"  stopColor="#12B4C3" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#12B4C3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#12B4C3" strokeWidth={2} fill="url(#portGrad)" dot={false} />
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
            <Link to="/client/portfolio" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#3ECFDC' }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {holdings.map((h, i) => (
              <motion.div key={h.schemeId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center justify-between rounded-xl transition-colors"
                style={{ padding: '1.1rem 1.4rem', background: 'rgba(18,180,195,0.04)', border: '1px solid rgba(18,180,195,0.08)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(18,180,195,0.25)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(18,180,195,0.08)'}>
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
            <Link to="/client/transactions" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#3ECFDC' }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-0">
            {(transactions ?? []).slice(0, 4).map((txn, i) => (
              <motion.div key={txn.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-start gap-4 last:pb-0"
                style={{ paddingBottom: '1.1rem', paddingTop: '1.1rem', borderBottom: i < 3 ? '1px solid rgba(18,180,195,0.06)' : 'none' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'rgba(18,180,195,0.1)' }}>
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
        className="rounded-2xl overflow-hidden relative" style={{ background: '#070C16', border: '1px solid rgba(18,180,195,0.15)' }}>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(18,180,195,0.5) 1px, transparent 1px), linear-gradient(90deg,rgba(18,180,195,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        <div className="relative p-8 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-center mb-5" style={{ color: '#3ECFDC' }}>Our AMC Partners</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {(amcs ?? []).slice(0, 4).map(amc => (
              <Link key={amc.id} to={`/client/schemes?amc=${amc.id}`}
                className="flex flex-col items-center gap-2 p-5 lg:p-6 rounded-xl transition-all group"
                style={{ background: 'rgba(18,180,195,0.06)', border: '1px solid rgba(18,180,195,0.12)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(18,180,195,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(18,180,195,0.12)'}>
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

      {/* Latest Schemes */}
      <div className="pt-2">
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#3ECFDC' }}>Our Latest Schemes</p>
          <div className="section-divider mx-auto mt-2" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {schemes === null
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-5 space-y-4" style={CARD}>
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                  <div className="skeleton h-9 w-full rounded" />
                </div>
              ))
            : (schemes ?? []).slice(0, 6).map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link to={`/client/scheme/${s.id}`}
                    className="flex flex-col h-full rounded-2xl card-hover group" style={{ ...CARD, padding: '1.35rem' }}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm leading-snug truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.name}</h3>
                        <p className="text-xs mt-1 truncate" style={{ color: '#7E93AC' }}>{s.amcName || s.category}</p>
                      </div>
                      <span className="badge badge-info flex-shrink-0">{s.category}</span>
                    </div>
                    <div className="flex items-end justify-between mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <div>
                        <p className="text-[0.62rem] uppercase tracking-wider mb-0.5" style={{ color: '#7E93AC' }}>NAV</p>
                        <p className="font-black text-white text-base leading-none">₹{s.nav}</p>
                        <p className={`text-xs font-semibold mt-1 ${s.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {s.dayChange >= 0 ? '+' : ''}{s.dayChangePct}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.62rem] uppercase tracking-wider mb-0.5" style={{ color: '#7E93AC' }}>1Y Return</p>
                        <p className="font-black text-base leading-none" style={{ color: s.returns1Y >= 12 ? '#34d399' : '#EAF1FA' }}>{s.returns1Y}%</p>
                        <div className="flex items-center gap-0.5 justify-end mt-1.5">
                          <Star size={11} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                          <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>{s.rating}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        <div className="text-center mt-7">
          <Link to="/client/schemes">
            <Button variant="secondary" size="sm" icon={ChevronRight} iconPosition="right">Browse all schemes</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
