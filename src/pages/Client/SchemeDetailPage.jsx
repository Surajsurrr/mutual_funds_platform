import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Shield, Info, TrendingUp } from 'lucide-react';
import { MOCK_SCHEMES, MOCK_NAV_HISTORY } from '../../utils/mockData';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { getRiskColor } from '../../utils/formatters';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const PERIODS = ['1M', '3M', '6M', '1Y', '3Y', '5Y'];

export default function SchemeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('1Y');
  const scheme = MOCK_SCHEMES.find(s => s.id === id) || MOCK_SCHEMES[0];

  return (
    <div className="space-y-6 pb-8 max-w-5xl">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Schemes
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-blue-600/20">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-xl font-black text-white">{scheme.name}</h1>
              <Badge variant={getRiskColor(scheme.risk).replace('badge-', '')}>{scheme.risk}</Badge>
              <span className="badge badge-info">{scheme.category}</span>
            </div>
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={14} className={i < scheme.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
              ))}
              <span className="text-sm text-amber-400 ml-1">{scheme.rating}.0</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400">Current NAV</p>
                <p className="text-lg font-black text-white">₹{scheme.nav}</p>
                <p className={`text-xs ${scheme.dayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {scheme.dayChange >= 0 ? '+' : ''}₹{scheme.dayChange} ({scheme.dayChangePct}%)
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">AUM</p>
                <p className="text-lg font-bold text-white">₹{scheme.aum} Cr</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Min SIP</p>
                <p className="text-lg font-bold text-white">₹{scheme.minSIP}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Min Lumpsum</p>
                <p className="text-lg font-bold text-white">₹{scheme.minLumpsum.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => navigate(`/client/buy/${scheme.id}`)}
            icon={TrendingUp}
            id="invest-now-btn"
          >
            Invest Now
          </Button>
        </div>
      </motion.div>

      {/* NAV Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 border border-blue-600/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">NAV History</h2>
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_NAV_HISTORY}>
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                formatter={(v) => [`₹${v}`, 'NAV']}
                contentStyle={{ background: '#0f2040', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="nav" stroke="#2563eb" strokeWidth={2} fill="url(#navGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Returns + Risk */}
      <div className="grid sm:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-blue-600/10">
          <h2 className="text-lg font-bold text-white mb-4">Returns</h2>
          <div className="space-y-3">
            {[
              { label: '1 Year', val: scheme.returns1Y, benchmark: 14.2 },
              { label: '3 Years', val: scheme.returns3Y, benchmark: 18.5 },
              { label: '5 Years', val: scheme.returns5Y, benchmark: 16.8 },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{r.label}</span>
                  <span className="text-emerald-400 font-bold">{r.val}%</span>
                </div>
                <div className="relative h-2 bg-navy-700 rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(r.val * 2, 100)}%` }} />
                  <div className="absolute top-0 h-full w-0.5 bg-amber-400" style={{ left: `${Math.min(r.benchmark * 2, 100)}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Benchmark: {r.benchmark}%</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-6 border border-blue-600/10">
          <h2 className="text-lg font-bold text-white mb-4">Fund Info</h2>
          <div className="space-y-3">
            {[
              { label: 'Fund Type', val: scheme.category },
              { label: 'Risk Level', val: scheme.risk },
              { label: 'Benchmark', val: 'NIFTY 100 TRI' },
              { label: 'Fund Manager', val: 'Prashant Jain' },
              { label: 'Inception Date', val: '14 Jan 2003' },
              { label: 'Exit Load', val: '1% (within 1 yr)' },
              { label: 'Expense Ratio', val: '1.67%' },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className="text-xs font-semibold text-white">{item.val}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
