import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, PieChart, ArrowUpRight,
  Wallet, Building2, Activity, ChevronRight, Star
} from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { useAuthStore } from '../../store/authStore';
import { MOCK_PORTFOLIO, MOCK_TRANSACTIONS, MOCK_AMC_LIST } from '../../utils/mockData';
import { formatCurrency, formatPercent, formatDate, getStatusColor } from '../../utils/formatters';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const PORTFOLIO_CHART = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  value: 80000 + i * 5500 + Math.sin(i * 0.8) * 8000,
}));

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const { totalInvested, currentValue, totalGain, totalGainPct, dayChange, dayChangePct, holdings } = MOCK_PORTFOLIO;
  const isGainPositive = totalGain > 0;
  const isDayPositive = dayChange > 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white">
            Good evening, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's your investment overview</p>
        </div>
        <Link to="/client/amc">
          <Button variant="gradient" icon={Building2} id="explore-funds">
            Explore Funds
          </Button>
        </Link>
      </motion.div>

      {/* Portfolio Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 border border-blue-600/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-1">
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Total Portfolio Value</p>
              <p className="text-4xl font-black text-white">{formatCurrency(currentValue)}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-slate-400">
                  Invested: <span className="text-white font-semibold">{formatCurrency(totalInvested)}</span>
                </span>
                <div className={`flex items-center gap-1 text-sm font-bold ${isGainPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isGainPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{formatCurrency(totalGain)} ({formatPercent(totalGainPct)})</span>
                </div>
              </div>
              <div className={`text-xs font-medium mt-1 ${isDayPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                Today: {isDayPositive ? '+' : ''}{formatCurrency(dayChange)} ({formatPercent(dayChangePct)})
              </div>
            </div>

            {/* Area chart */}
            <div className="h-28 w-full lg:w-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PORTFOLIO_CHART}>
                  <defs>
                    <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fill="url(#portGrad)" dot={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [formatCurrency(v), 'Portfolio']}
                    contentStyle={{ background: '#0f2040', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Invested" value={formatCurrency(totalInvested, true)} icon={Wallet} accentColor="blue" delay={0.15} />
        <StatsCard title="Total Gain" value={formatCurrency(totalGain, true)} icon={TrendingUp} accentColor="emerald" trend={totalGainPct} trendLabel="overall" delay={0.2} />
        <StatsCard title="Holdings" value={holdings.length} subtitle="Active schemes" icon={PieChart} accentColor="amber" delay={0.25} />
        <StatsCard title="SIPs Active" value="2" subtitle="Monthly SIPs" icon={Activity} accentColor="blue" delay={0.3} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Holdings */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-blue-600/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">My Holdings</h2>
            <Link to="/client/portfolio" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {holdings.map((h, i) => (
              <motion.div
                key={h.schemeId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center justify-between p-3 rounded-xl glass-light hover:bg-navy-700/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{h.schemeName}</p>
                  <p className="text-xs text-slate-400">{h.amcName} • {h.units.toFixed(3)} units</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-white">{formatCurrency(h.currentValue)}</p>
                  <p className={`text-xs font-semibold ${h.gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {h.gain >= 0 ? '+' : ''}{formatCurrency(h.gain)} ({formatPercent(h.gainPct)})
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass rounded-2xl p-6 border border-blue-600/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recent</h2>
            <Link to="/client/transactions" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.slice(0, 4).map((txn, i) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-start gap-3 pb-3 border-b border-navy-700/50 last:border-0 last:pb-0"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${txn.type === 'BUY' ? 'bg-emerald-600/15' : 'bg-blue-600/15'}`}>
                  {txn.type === 'BUY' ? '💰' : '🔄'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{txn.schemeName}</p>
                  <p className="text-xs text-slate-500">{formatDate(txn.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">₹{txn.amount.toLocaleString('en-IN')}</p>
                  <Badge variant={getStatusColor(txn.status).replace('badge-', '')} className="mt-0.5">
                    {txn.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular AMCs */}
      <div className="glass rounded-2xl p-6 border border-blue-600/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Top AMC Companies</h2>
          <Link to="/client/amc" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Browse all <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MOCK_AMC_LIST.slice(0, 4).map((amc, i) => (
            <motion.div
              key={amc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.07 }}
            >
              <Link
                to={`/client/amc/${amc.id}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl glass-light hover:bg-navy-700/60 transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{amc.logo}</span>
                <p className="text-xs font-semibold text-white text-center leading-tight">{amc.name}</p>
                <div className="flex items-center gap-1">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-amber-400">{amc.rating}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
