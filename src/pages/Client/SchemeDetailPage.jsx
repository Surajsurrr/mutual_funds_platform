import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, TrendingUp } from 'lucide-react';
import { useScheme, useNavHistory } from '../../api/useApi';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { getRiskColor } from '../../utils/formatters';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PERIODS = ['1M','3M','6M','1Y','3Y','5Y'];
const CARD  = { background: '#121C33', border: '1px solid rgba(18,180,195,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };
const CHART = { background: '#121C33', border: '1px solid rgba(18,180,195,0.15)', borderRadius: 10, fontSize: 12, color: '#d9e4ef' };

export default function SchemeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('1Y');
  const PERIOD_DAYS = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '3Y': 365, '5Y': 365 };
  const { data: scheme, loading: schemeLoading } = useScheme(id);
  const { data: navHistory } = useNavHistory(id, PERIOD_DAYS[period] || 365);
  const chartData = navHistory ?? [];


  if (schemeLoading || !scheme) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400 text-sm">{schemeLoading ? 'Loading scheme...' : 'Scheme not found'}</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: '#7E93AC' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="h-1" style={{ background: 'linear-gradient(90deg,#0B667E,#3ECFDC)' }} />
        <div className="p-6 lg:p-7">
          {/* Identity + primary CTA */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                <h1 className="text-xl lg:text-2xl font-black text-white leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>{scheme.name}</h1>
                <Badge variant={getRiskColor(scheme.risk).replace('badge-','')}>{scheme.risk}</Badge>
                <span className="badge badge-info">{scheme.category}</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} style={i < scheme.rating ? { color: '#fbbf24', fill: '#fbbf24' } : { color: '#33507E', fill: '#33507E' }} />)}
                <span className="text-sm font-bold ml-1.5" style={{ color: '#fbbf24' }}>{scheme.rating}.0</span>
              </div>
            </div>
            {/* self-start prevents the flex row from stretching the pill button into a circle */}
            <div className="w-full lg:w-auto flex-shrink-0 self-stretch lg:self-start">
              <Button variant="primary" size="lg" fullWidth onClick={() => navigate(`/client/buy/${scheme.id}`)} icon={TrendingUp} id="invest-now-btn">Invest Now</Button>
            </div>
          </div>

          {/* Key stats strip — hairline dividers via gap-px over a lighter bg */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            {[
              { label: 'Current NAV', value: `₹${scheme.nav}`, sub: `${scheme.dayChange >= 0 ? '+' : ''}₹${scheme.dayChange} (${scheme.dayChangePct}%)`, up: scheme.dayChange >= 0 },
              { label: 'AUM', value: `₹${scheme.aum} Cr` },
              { label: 'Min SIP', value: `₹${scheme.minSIP}` },
              { label: 'Min Lumpsum', value: `₹${scheme.minLumpsum.toLocaleString('en-IN')}` },
            ].map(st => (
              <div key={st.label} className="p-4" style={{ background: '#121C33' }}>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#7E93AC' }}>{st.label}</p>
                <p className="text-lg font-black text-white leading-none">{st.value}</p>
                {st.sub && <p className={`text-xs font-semibold mt-1.5 ${st.up ? 'text-emerald-400' : 'text-red-400'}`}>{st.sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* NAV Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-6" style={CARD}>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-base font-bold text-white">NAV History</h2>
          <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1 rounded-lg text-xs font-semibold border transition-all"
                style={period === p
                  ? { background: 'linear-gradient(135deg,#0B667E,#12B4C3)', color: '#fff', borderColor: 'transparent' }
                  : { background: 'rgba(18,180,195,0.06)', color: '#b0c4d8', borderColor: 'rgba(18,180,195,0.15)' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#12B4C3" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#12B4C3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(18,180,195,0.07)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} domain={['auto','auto']} />
              <Tooltip formatter={v => [`₹${v}`, 'NAV']} contentStyle={CHART} labelStyle={{ color: '#7a94ab' }} />
              <Area type="monotone" dataKey="nav" stroke="#12B4C3" strokeWidth={2} fill="url(#navGrad)" dot={false} />
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
                <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(18,180,195,0.1)' }}>
                  <div className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${Math.min(r.val*2,100)}%`, background: 'linear-gradient(90deg,#0B667E,#3ECFDC)' }} />
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
              <div key={item.label} className="flex justify-between py-1" style={{ borderBottom: '1px solid rgba(18,180,195,0.06)' }}>
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
