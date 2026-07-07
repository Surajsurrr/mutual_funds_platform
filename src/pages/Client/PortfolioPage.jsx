import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart as PieIcon, ShoppingCart } from 'lucide-react';
import { usePortfolio } from '../../api/useApi';
import { StatsCard } from '../../components/UI/StatsCard';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#1b9af5','#42b4ff','#fbbf24','#f87171','#8b5cf6'];

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

export default function PortfolioPage() {
  const { data: portfolio, loading } = usePortfolio();

  const totalInvested = portfolio?.totalInvested ?? 0;
  const currentValue  = portfolio?.currentValue  ?? 0;
  const totalGain     = portfolio?.totalGain     ?? 0;
  const totalGainPct  = portfolio?.totalGainPct  ?? 0;
  const dayChange     = portfolio?.dayChange     ?? 0;
  const dayChangePct  = portfolio?.dayChangePct  ?? 0;
  const holdings      = portfolio?.holdings      ?? [];

  const pieData = holdings.map(h => ({
    name: h.schemeName.split(' ').slice(0,2).join(' '),
    value: h.currentValue,
    pct: currentValue > 0 ? ((h.currentValue/currentValue)*100).toFixed(1) : '0.0',
  }));


  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.25rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>My Investments</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Portfolio</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" style={{ marginBottom: '2.5rem' }}>
        <StatsCard title="Current Value" value={formatCurrency(currentValue,true)} icon={TrendingUp}  accentColor="blue"    delay={0} />
        <StatsCard title="Invested"      value={formatCurrency(totalInvested,true)} icon={PieIcon}    accentColor="amber"   delay={0.1} />
        <StatsCard title="Total Gain"    value={formatCurrency(totalGain,true)} subtitle={formatPercent(totalGainPct)} icon={TrendingUp} accentColor="emerald" delay={0.15} />
        <StatsCard title="Today's P&L"
          value={`${dayChange>=0?'+':''}${formatCurrency(dayChange,true)}`} subtitle={formatPercent(dayChangePct)}
          icon={TrendingUp} accentColor={dayChange>=0?'emerald':'rose'} delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Allocation Pie Chart */}
        <div className="rounded-2xl" style={CARD}>
          <h2 className="text-base font-bold text-white mb-5">Allocation</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [formatCurrency(v),'Value']} contentStyle={TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5 mt-3">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i%PIE_COLORS.length] }} />
                  <span className="text-xs truncate max-w-[120px]" style={{ color: '#b0c4d8' }}>{d.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings List */}
        <div className="lg:col-span-2 rounded-2xl" style={CARD}>
          <h2 className="text-base font-bold text-white mb-5">Holdings</h2>
          <div className="space-y-4">
            {holdings.map((h, i) => (
              <motion.div key={h.schemeId} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i*0.08 }}
                className="rounded-xl transition-all border"
                style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(18,180,195,0.25)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-base truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{h.schemeName}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: '#7a94ab' }}>{h.amcName}</p>
                    <div className="flex gap-4 mt-3 text-xs font-semibold" style={{ color: '#7a94ab' }}>
                      <span>{h.units.toFixed(3)} units</span>
                      <span>Avg: ₹{h.avgNAV}</span>
                      <span>Cur: ₹{h.currentNAV}</span>
                    </div>
                    <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${Math.min((h.currentValue/currentValue)*100,100)}%`, background: PIE_COLORS[i%PIE_COLORS.length] }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-white text-base">{formatCurrency(h.currentValue)}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: '#7a94ab' }}>Invested: {formatCurrency(h.invested)}</p>
                    <p className={`text-sm font-black mt-2 ${h.gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {h.gain >= 0 ? '+' : ''}{formatCurrency(h.gain)}<br /><span className="text-xs font-semibold">({formatPercent(h.gainPct)})</span>
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Link to={`/client/buy/${h.schemeId}`}>
                    <button className="text-xs font-bold flex items-center gap-1.5 rounded-lg border transition-all"
                      style={{ color: '#12B4C3', borderColor: 'rgba(18,180,195,0.2)', padding: '0.45rem 0.95rem', fontSize: '0.75rem', fontWeight: 700 }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(18,180,195,0.1)'; e.currentTarget.style.borderColor='#12B4C3'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(18,180,195,0.2)'; }}>
                      <ShoppingCart size={12} /> Add More
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
