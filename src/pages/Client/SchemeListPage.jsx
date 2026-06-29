import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Star, Filter, ShoppingCart } from 'lucide-react';
import { MOCK_SCHEMES } from '../../utils/mockData';
import { Badge } from '../../components/UI/Badge';
import { getRiskColor } from '../../utils/formatters';

const CATEGORIES = ['All', 'Large Cap', 'Mid Cap', 'Small Cap', 'Value', 'ELSS'];
const RISK_LEVELS = ['All', 'Low', 'Moderate', 'High', 'Very High'];
const SORT_OPTIONS = [
  { value: 'returns1Y', label: '1Y Returns' },
  { value: 'returns3Y', label: '3Y Returns' },
  { value: 'nav', label: 'NAV' },
  { value: 'aum', label: 'AUM' },
];

export default function SchemeListPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [risk, setRisk] = useState('All');
  const [sortBy, setSortBy] = useState('returns1Y');

  const filtered = MOCK_SCHEMES
    .filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || s.category === category;
      const matchRisk = risk === 'All' || s.risk === risk;
      return matchSearch && matchCat && matchRisk;
    })
    .sort((a, b) => parseFloat(b[sortBy]) - parseFloat(a[sortBy]));

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Mutual Fund Schemes</h1>
        <p className="text-slate-400 mt-1">{MOCK_SCHEMES.length} schemes across all AMCs</p>
      </motion.div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 border border-blue-600/10 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search funds..."
            className="input-field pl-10 w-full"
            id="scheme-search"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${category === c ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Risk:</span>
            <select value={risk} onChange={e => setRisk(e.target.value)} className="input-field py-1 text-xs">
              {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort by:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field py-1 text-xs">
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Scheme Cards */}
      <div className="space-y-3">
        {filtered.map((scheme, i) => (
          <motion.div
            key={scheme.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={`/client/scheme/${scheme.id}`}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 glass rounded-2xl p-5 border border-blue-600/10 hover:border-blue-600/30 hover:shadow-md hover:shadow-blue-600/10 transition-all group"
              id={`scheme-${scheme.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-white text-sm">{scheme.name}</h3>
                  <Badge variant={getRiskColor(scheme.risk).replace('badge-', '')}>{scheme.risk}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="badge badge-info">{scheme.category}</span>
                  <span>AUM: ₹{scheme.aum} Cr</span>
                  <span>Min SIP: ₹{scheme.minSIP}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-0.5">NAV</p>
                  <p className="font-bold text-white text-sm">₹{scheme.nav}</p>
                  <p className={`text-xs font-semibold ${scheme.dayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {scheme.dayChange >= 0 ? '+' : ''}{scheme.dayChangePct}%
                  </p>
                </div>
                {[
                  { label: '1Y', val: scheme.returns1Y },
                  { label: '3Y', val: scheme.returns3Y },
                  { label: '5Y', val: scheme.returns5Y },
                ].map(r => (
                  <div key={r.label} className="text-center">
                    <p className="text-xs text-slate-500 mb-0.5">{r.label} Returns</p>
                    <p className={`font-bold text-sm ${r.val >= 15 ? 'text-emerald-400' : r.val >= 10 ? 'text-amber-400' : 'text-slate-300'}`}>
                      {r.val}%
                    </p>
                  </div>
                ))}

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }, (_, si) => (
                    <Star key={si} size={10} className={si < scheme.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                  ))}
                </div>

                <button
                  onClick={(e) => { e.preventDefault(); window.location.href = `/client/buy/${scheme.id}`; }}
                  className="px-4 py-2 gradient-primary rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  id={`invest-${scheme.id}`}
                >
                  <ShoppingCart size={12} /> Invest
                </button>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold">No schemes match your criteria</p>
        </div>
      )}
    </div>
  );
}
