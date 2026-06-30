import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, ShoppingCart } from 'lucide-react';
import { MOCK_SCHEMES } from '../../utils/mockData';
import { Badge } from '../../components/UI/Badge';
import { getRiskColor } from '../../utils/formatters';

const CATEGORIES   = ['All','Large Cap','Mid Cap','Small Cap','Value','ELSS'];
const RISK_LEVELS  = ['All','Low','Moderate','High','Very High'];
const SORT_OPTIONS = [{ value:'returns1Y',label:'1Y Returns'},{ value:'returns3Y',label:'3Y Returns'},{ value:'nav',label:'NAV'},{ value:'aum',label:'AUM'}];
const CARD = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.1)' };

export default function SchemeListPage() {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [risk, setRisk]         = useState('All');
  const [sortBy, setSortBy]     = useState('returns1Y');

  const filtered = MOCK_SCHEMES
    .filter(s => {
      const ms = s.name.toLowerCase().includes(search.toLowerCase());
      const mc = category === 'All' || s.category === category;
      const mr = risk === 'All'     || s.risk === risk;
      return ms && mc && mr;
    })
    .sort((a,b) => parseFloat(b[sortBy]) - parseFloat(a[sortBy]));

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#42b4ff' }}>Invest Now</p>
        <h1 className="text-2xl font-black text-white">Mutual Fund Schemes</h1>
        <div className="section-divider mt-2" />
        <p className="text-sm mt-3" style={{ color: '#7a94ab' }}>{MOCK_SCHEMES.length} schemes across all AMCs</p>
      </motion.div>

      {/* Filter Panel */}
      <div className="rounded-2xl p-5 space-y-4" style={CARD}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7a94ab' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search funds..." className="input-field pl-10 w-full" id="scheme-search" />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs self-center" style={{ color: '#7a94ab' }}>Category:</span>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
              style={category === c
                ? { background: 'linear-gradient(135deg,#0e7ee4,#1b9af5)', color: '#fff', borderColor: 'transparent' }
                : { background: 'rgba(27,154,245,0.06)', color: '#b0c4d8', borderColor: 'rgba(27,154,245,0.15)' }}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#7a94ab' }}>Risk:</span>
            <select value={risk} onChange={e => setRisk(e.target.value)} className="input-field py-1.5 text-xs">
              {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#7a94ab' }}>Sort by:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field py-1.5 text-xs">
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((scheme, i) => (
          <motion.div key={scheme.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/client/scheme/${scheme.id}`}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl p-5 card-hover group block" style={CARD}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="font-bold text-white text-sm">{scheme.name}</h3>
                  <Badge variant={getRiskColor(scheme.risk).replace('badge-','')}>{scheme.risk}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: '#7a94ab' }}>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(27,154,245,0.1)', color: '#42b4ff' }}>{scheme.category}</span>
                  <span>AUM: ₹{scheme.aum} Cr</span>
                  <span>Min SIP: ₹{scheme.minSIP}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
                <div className="text-center">
                  <p className="text-xs mb-0.5" style={{ color: '#7a94ab' }}>NAV</p>
                  <p className="font-bold text-white text-sm">₹{scheme.nav}</p>
                  <p className={`text-xs font-semibold ${scheme.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {scheme.dayChange >= 0 ? '+' : ''}{scheme.dayChangePct}%
                  </p>
                </div>
                {[{ label:'1Y',val:scheme.returns1Y },{ label:'3Y',val:scheme.returns3Y },{ label:'5Y',val:scheme.returns5Y }].map(r => (
                  <div key={r.label} className="text-center">
                    <p className="text-xs mb-0.5" style={{ color: '#7a94ab' }}>{r.label} Ret.</p>
                    <p className={`font-bold text-sm ${r.val >= 15 ? 'text-emerald-400' : r.val >= 10 ? 'text-amber-400' : 'text-white'}`}>{r.val}%</p>
                  </div>
                ))}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, si) => (
                    <Star key={si} size={11} style={si < scheme.rating ? { color: '#fbbf24', fill: '#fbbf24' } : { color: '#264470', fill: '#264470' }} />
                  ))}
                </div>
                <button
                  onClick={e => { e.preventDefault(); window.location.href = `/client/buy/${scheme.id}`; }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg,#0e7ee4,#1b9af5)', boxShadow: '0 2px 12px rgba(27,154,245,0.3)' }}>
                  <ShoppingCart size={12} /> Invest
                </button>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
