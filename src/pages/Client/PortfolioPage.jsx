import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart as PieIcon, ShoppingCart } from 'lucide-react';
import { MOCK_PORTFOLIO } from '../../utils/mockData';
import { StatsCard } from '../../components/UI/StatsCard';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#1b9af5','#42b4ff','#fbbf24','#f87171','#8b5cf6'];
const CARD = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };
const TOOLTIP = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.2)', borderRadius: 10, fontSize: 12, color: '#d9e4ef' };

export default function PortfolioPage() {
  const { totalInvested, currentValue, totalGain, totalGainPct, dayChange, dayChangePct, holdings } = MOCK_PORTFOLIO;

  const pieData = holdings.map(h => ({
    name: h.schemeName.split(' ').slice(0,2).join(' '),
    value: h.currentValue,
    pct: ((h.currentValue/currentValue)*100).toFixed(1),
  }));

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#42b4ff' }}>My Investments</p>
        <h1 className="text-2xl font-black text-white">Portfolio</h1>
        <div className="section-divider mt-2" />
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <StatsCard title="Current Value" value={formatCurrency(currentValue,true)} icon={TrendingUp}  accentColor="blue"    delay={0} />
        <StatsCard title="Invested"      value={formatCurrency(totalInvested,true)} icon={PieIcon}    accentColor="amber"   delay={0.1} />
        <StatsCard title="Total Gain"    value={formatCurrency(totalGain,true)} subtitle={formatPercent(totalGainPct)} icon={TrendingUp} accentColor="emerald" delay={0.15} />
        <StatsCard title="Today's P&L"
          value={`${dayChange>=0?'+':''}${formatCurrency(dayChange,true)}`} subtitle={formatPercent(dayChangePct)}
          icon={TrendingUp} accentColor={dayChange>=0?'emerald':'rose'} delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Pie */}
        <div className="rounded-2xl p-8 lg:p-10" style={CARD}>
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

        {/* Holdings */}
        <div className="lg:col-span-2 rounded-2xl p-8 lg:p-10" style={CARD}>
          <h2 className="text-base font-bold text-white mb-5">Holdings</h2>
          <div className="space-y-4">
            {holdings.map((h, i) => (
              <motion.div key={h.schemeId} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i*0.08 }}
                className="rounded-xl transition-all"
                style={{ padding: '1.1rem 1.4rem', background: 'rgba(27,154,245,0.04)', border: '1px solid rgba(27,154,245,0.08)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(27,154,245,0.25)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(27,154,245,0.08)'}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-base truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{h.schemeName}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: '#7a94ab' }}>{h.amcName}</p>
                    <div className="flex gap-4 mt-2.5 text-xs font-semibold" style={{ color: '#7a94ab' }}>
                      <span>{h.units.toFixed(3)} units</span>
                      <span>Avg: ₹{h.avgNAV}</span>
                      <span>Cur: ₹{h.currentNAV}</span>
                    </div>
                    <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(27,154,245,0.1)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${Math.min((h.currentValue/currentValue)*100,100)}%`, background: PIE_COLORS[i%PIE_COLORS.length] }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-white text-base">{formatCurrency(h.currentValue)}</p>
                    <p className="text-xs font-semibold" style={{ color: '#7a94ab' }}>Invested: {formatCurrency(h.invested)}</p>
                    <p className={`text-sm font-black mt-1.5 ${h.gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {h.gain >= 0 ? '+' : ''}{formatCurrency(h.gain)}<br /><span className="text-xs">({formatPercent(h.gainPct)})</span>
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Link to={`/client/buy/${h.schemeId}`}>
                    <button className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors"
                      style={{ color: '#42b4ff', borderColor: 'rgba(66,180,255,0.2)' }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(66,180,255,0.1)'; e.currentTarget.style.borderColor='#42b4ff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(66,180,255,0.2)'; }}>
                      <ShoppingCart size={11} /> Add More
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
