import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart as PieIcon, ShoppingCart } from 'lucide-react';
import { MOCK_PORTFOLIO } from '../../utils/mockData';
import { StatsCard } from '../../components/UI/StatsCard';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#f43f5e', '#a78bfa'];

export default function PortfolioPage() {
  const { totalInvested, currentValue, totalGain, totalGainPct, dayChange, dayChangePct, holdings } = MOCK_PORTFOLIO;

  const pieData = holdings.map(h => ({
    name: h.schemeName.split(' ').slice(0, 2).join(' '),
    value: h.currentValue,
    pct: ((h.currentValue / currentValue) * 100).toFixed(1),
  }));

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">My Portfolio</h1>
        <p className="text-slate-400 mt-1">All your mutual fund investments in one place</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Current Value" value={formatCurrency(currentValue, true)} icon={TrendingUp} accentColor="blue" delay={0} />
        <StatsCard title="Invested" value={formatCurrency(totalInvested, true)} icon={PieIcon} accentColor="amber" delay={0.1} />
        <StatsCard title="Total Gain" value={formatCurrency(totalGain, true)} subtitle={formatPercent(totalGainPct)} icon={TrendingUp} accentColor="emerald" delay={0.15} />
        <StatsCard title="Today's P&L" value={`${dayChange >= 0 ? '+' : ''}${formatCurrency(dayChange, true)}`} subtitle={formatPercent(dayChangePct)} icon={TrendingUp} accentColor={dayChange >= 0 ? 'emerald' : 'rose'} delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Allocation Chart */}
        <div className="glass rounded-2xl p-6 border border-blue-600/10">
          <h2 className="text-lg font-bold text-white mb-4">Allocation</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  formatter={(v) => [formatCurrency(v), 'Value']}
                  contentStyle={{ background: '#0f2040', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs text-slate-300 truncate max-w-[120px]">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-white">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-blue-600/10">
          <h2 className="text-lg font-bold text-white mb-4">Holdings</h2>
          <div className="space-y-3">
            {holdings.map((h, i) => (
              <motion.div
                key={h.schemeId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="glass-light rounded-xl p-4 border border-blue-600/08 hover:border-blue-600/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{h.schemeName}</p>
                    <p className="text-xs text-slate-400">{h.amcName}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-400">
                      <span>{h.units.toFixed(3)} units</span>
                      <span>Avg NAV: ₹{h.avgNAV}</span>
                      <span>Cur NAV: ₹{h.currentNAV}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min((h.currentValue / currentValue) * 100, 100)}%`,
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-white">{formatCurrency(h.currentValue)}</p>
                    <p className="text-xs text-slate-400">Invested: {formatCurrency(h.invested)}</p>
                    <p className={`text-sm font-bold mt-1 ${h.gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.gain >= 0 ? '+' : ''}{formatCurrency(h.gain)}<br />
                      <span className="text-xs">({formatPercent(h.gainPct)})</span>
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Link to={`/client/buy/${h.schemeId}`}>
                    <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold">
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
