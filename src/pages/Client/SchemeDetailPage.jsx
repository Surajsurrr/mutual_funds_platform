import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, TrendingUp } from 'lucide-react';
import { MOCK_SCHEMES, MOCK_NAV_HISTORY } from '../../utils/mockData';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { getRiskColor } from '../../utils/formatters';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PERIODS = ['1M','3M','6M','1Y','3Y','5Y'];
const CARD  = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };
const CHART = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.15)', borderRadius: 10, fontSize: 12, color: '#d9e4ef' };

export default function SchemeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('1Y');
  const scheme = MOCK_SCHEMES.find(s => s.id === id) || MOCK_SCHEMES[0];

  return (
    <div className="space-y-6 pb-8 max-w-5xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: '#7a94ab' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#0e7ee4,#42b4ff)' }} />
        <div className="p-6 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-xl font-black text-white">{scheme.name}</h1>
              <Badge variant={getRiskColor(scheme.risk).replace('badge-','')}>{scheme.risk}</Badge>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(27,154,245,0.1)', color: '#42b4ff' }}>{scheme.category}</span>
            </div>
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} style={i < scheme.rating ? { color: '#fbbf24', fill: '#fbbf24' } : { color: '#264470', fill: '#264470' }} />)}
              <span className="text-sm font-bold ml-1" style={{ color: '#fbbf24' }}>{scheme.rating}.0</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs" style={{ color: '#7a94ab' }}>Current NAV</p>
                <p className="text-2xl font-black text-white">₹{scheme.nav}</p>
                <p className={`text-xs font-semibold ${scheme.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {scheme.dayChange >= 0 ? '+' : ''}₹{scheme.dayChange} ({scheme.dayChangePct}%)
                </p>
              </div>
              <div><p className="text-xs" style={{ color: '#7a94ab' }}>AUM</p><p className="text-lg font-bold text-white">₹{scheme.aum} Cr</p></div>
              <div><p className="text-xs" style={{ color: '#7a94ab' }}>Min SIP</p><p className="text-lg font-bold text-white">₹{scheme.minSIP}</p></div>
              <div><p className="text-xs" style={{ color: '#7a94ab' }}>Min Lumpsum</p><p className="text-lg font-bold text-white">₹{scheme.minLumpsum.toLocaleString('en-IN')}</p></div>
            </div>
          </div>
          <Button variant="primary" size="lg" onClick={() => navigate(`/client/buy/${scheme.id}`)} icon={TrendingUp} id="invest-now-btn">Invest Now</Button>
        </div>
      </motion.div>

      {/* NAV Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-6" style={CARD}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">NAV History</h2>
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1 rounded-lg text-xs font-semibold border transition-all"
                style={period === p
                  ? { background: 'linear-gradient(135deg,#0e7ee4,#1b9af5)', color: '#fff', borderColor: 'transparent' }
                  : { background: 'rgba(27,154,245,0.06)', color: '#b0c4d8', borderColor: 'rgba(27,154,245,0.15)' }}>
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
                  <stop offset="5%"  stopColor="#1b9af5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1b9af5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,154,245,0.07)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} domain={['auto','auto']} />
              <Tooltip formatter={v => [`₹${v}`, 'NAV']} contentStyle={CHART} labelStyle={{ color: '#7a94ab' }} />
              <Area type="monotone" dataKey="nav" stroke="#1b9af5" strokeWidth={2} fill="url(#navGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl p-6" style={CARD}>
          <h2 className="text-base font-bold text-white mb-4">Returns vs Benchmark</h2>
          <div className="space-y-4">
            {[{ label:'1 Year',val:scheme.returns1Y,bench:14.2 },{ label:'3 Years',val:scheme.returns3Y,bench:18.5 },{ label:'5 Years',val:scheme.returns5Y,bench:16.8 }].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: '#7a94ab' }}>{r.label}</span>
                  <span className="font-bold text-emerald-400">{r.val}%</span>
                </div>
                <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(27,154,245,0.1)' }}>
                  <div className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${Math.min(r.val*2,100)}%`, background: 'linear-gradient(90deg,#0e7ee4,#42b4ff)' }} />
                  <div className="absolute top-0 h-full w-0.5 bg-amber-400" style={{ left: `${Math.min(r.bench*2,100)}%` }} />
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#7a94ab' }}>Benchmark: {r.bench}%</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="rounded-2xl p-6" style={CARD}>
          <h2 className="text-base font-bold text-white mb-4">Fund Details</h2>
          <div className="space-y-3">
            {[
              { label:'Fund Type',val:scheme.category },
              { label:'Risk Level',val:scheme.risk },
              { label:'Benchmark',val:'NIFTY 100 TRI' },
              { label:'Fund Manager',val:'Prashant Jain' },
              { label:'Inception',val:'14 Jan 2003' },
              { label:'Exit Load',val:'1% (within 1yr)' },
              { label:'Expense Ratio',val:'1.67%' },
            ].map(item => (
              <div key={item.label} className="flex justify-between py-1" style={{ borderBottom: '1px solid rgba(27,154,245,0.06)' }}>
                <span className="text-xs" style={{ color: '#7a94ab' }}>{item.label}</span>
                <span className="text-xs font-semibold text-white">{item.val}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
