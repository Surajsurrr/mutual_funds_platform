import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, ShoppingCart } from 'lucide-react';
import { useSchemes } from '../../api/useApi';
import { Badge } from '../../components/UI/Badge';
import { getRiskColor } from '../../utils/formatters';

const CATEGORIES   = ['All','Large Cap','Mid Cap','Small Cap','Value','ELSS'];
const RISK_LEVELS  = ['All','Low','Moderate','High','Very High'];
const SORT_OPTIONS = [{ value:'returns1Y',label:'1Y Returns'},{ value:'returns3Y',label:'3Y Returns'},{ value:'nav',label:'NAV'},{ value:'aum',label:'AUM'}];

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2rem',
};

const SELECT_STYLE = {
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '10px',
  color: '#ffffff',
  padding: '0.45rem 1.75rem 0.45rem 0.75rem',
  outline: 'none',
  fontSize: '0.825rem',
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2312B4C3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.5rem center',
  backgroundSize: '1rem',
  minWidth: '120px',
};

export default function SchemeListPage() {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [risk, setRisk]         = useState('All');
  const [sortBy, setSortBy]     = useState('returns1Y');

  const { data: rawSchemes, loading } = useSchemes({
    amcId: new URLSearchParams(window.location.search).get('amc') || '',
    category: category !== 'All' ? category : '',
    search: search,
  });

  const allSchemes = rawSchemes ?? [];
  const filtered = allSchemes
    .filter(s => {
      const mr = risk === 'All' || s.risk === risk;
      return mr;
    })
    .sort((a, b) => {
      if (sortBy === 'aum') {
        const na = parseFloat((a.aum || '0').toString().replace(/,/g, ''));
        const nb = parseFloat((b.aum || '0').toString().replace(/,/g, ''));
        return nb - na;
      }
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    });

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.25rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>Invest Now</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Mutual Fund Schemes</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>{filtered.length} schemes across all AMCs</p>
      </motion.div>

      {/* Filter Panel Container */}
      <div className="rounded-2xl" style={{ ...CARD, marginBottom: '2.25rem' }}>
        {/* Search */}
        <div className="relative" style={{ marginBottom: '1.5rem' }}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#12B4C3' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search funds..."
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              color: '#ffffff',
              padding: '0.875rem 1rem 0.875rem 2.75rem',
              outline: 'none',
              fontSize: '0.875rem',
              width: '100%',
              fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.2s',
            }}
            className="focus:border-[#12B4C3]"
            id="scheme-search" />
        </div>

        {/* Categories pills filter */}
        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: '1.5rem' }}>
          <span className="text-xs font-bold uppercase tracking-wider mr-2" style={{ color: '#7a94ab', fontSize: '0.7rem' }}>Category:</span>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className="flex-shrink-0 rounded-full transition-all border"
              style={category === c
                ? { background: 'linear-gradient(135deg,#0B667E,#12B4C3)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(18,180,195,0.25)', fontSize: '0.825rem', fontWeight: 700, padding: '0.55rem 1.25rem' }
                : { background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.825rem', fontWeight: 600, padding: '0.55rem 1.25rem' }}>
              {c}
            </button>
          ))}
        </div>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7a94ab', fontSize: '0.7rem' }}>Risk:</span>
            <select value={risk} onChange={e => setRisk(e.target.value)} style={SELECT_STYLE}>
              {RISK_LEVELS.map(r => <option key={r} value={r} style={{ background: '#202C44', color: '#fff' }}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7a94ab', fontSize: '0.7rem' }}>Sort by:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={SELECT_STYLE}>
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value} style={{ background: '#202C44', color: '#fff' }}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Column Headers (hidden on mobile, visible on desktop) */}
      <div className="hidden md:flex items-center gap-4 px-7 py-3 text-xs font-bold uppercase tracking-wider text-slate-400"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' }}>
        <div className="flex-1">Scheme / Fund Name</div>
        <div className="flex items-center gap-6 sm:gap-8 text-center" style={{ width: '480px' }}>
          <div className="w-16">NAV</div>
          <div className="w-14">1Y Ret</div>
          <div className="w-14">3Y Ret</div>
          <div className="w-14">5Y Ret</div>
          <div className="w-20">Rating</div>
          <div className="w-24"></div> {/* Action Spacer */}
        </div>
      </div>

      {/* Schemes List Grid */}
      <div className="space-y-4">
        {filtered.map((scheme, i) => {
          const riskStyles = {
            'Very High': { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.22)' },
            'High': { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.22)' },
            'Moderate': { background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.22)' },
            'Low': { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.22)' }
          };
          const rStyle = riskStyles[scheme.risk] || riskStyles.Moderate;

          return (
            <motion.div key={scheme.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/client/scheme/${scheme.id}`}
                className="flex flex-col md:flex-row items-start md:items-center gap-4 rounded-2xl card-hover group block"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  padding: '1.75rem',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(18,180,195,0.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                    <h3 className="font-extrabold text-white text-base leading-snug" style={{ fontSize: '1.05rem', fontFamily: 'Poppins, sans-serif' }}>{scheme.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md" style={rStyle}>
                      {scheme.risk}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: '#7a94ab' }}>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(18,180,195,0.12)', color: '#12B4C3', border: '1px solid rgba(18,180,195,0.2)' }}>{scheme.category}</span>
                    <span>AUM: <span className="text-white font-medium">₹{scheme.aum} Cr</span></span>
                    <span>•</span>
                    <span>Min SIP: <span className="text-white font-medium">₹{scheme.minSIP}</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-8 flex-wrap w-full md:w-[480px] justify-between md:justify-start">
                  <div className="text-center md:w-16 flex-shrink-0">
                    <p className="text-xs mb-0.5 md:hidden" style={{ color: '#7a94ab' }}>NAV</p>
                    <p className="font-black text-white text-base">₹{scheme.nav}</p>
                    <p className={`text-xs font-semibold ${scheme.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {scheme.dayChange >= 0 ? '+' : ''}{scheme.dayChangePct}%
                    </p>
                  </div>
                  {[{ label:'1Y',val:scheme.returns1Y },{ label:'3Y',val:scheme.returns3Y },{ label:'5Y',val:scheme.returns5Y }].map(r => (
                    <div key={r.label} className="text-center md:w-14 flex-shrink-0">
                      <p className="text-xs mb-0.5 md:hidden" style={{ color: '#7a94ab' }}>{r.label} Ret.</p>
                      <p className={`font-black text-base ${r.val >= 15 ? 'text-emerald-400' : r.val >= 10 ? 'text-amber-400' : 'text-white'}`}>{r.val}%</p>
                    </div>
                  ))}
                  <div className="flex items-center gap-0.5 md:w-20 md:justify-center flex-shrink-0">
                    {Array.from({ length: 5 }, (_, si) => (
                      <Star key={si} size={13} style={si < scheme.rating ? { color: '#fbbf24', fill: '#fbbf24' } : { color: '#264470', fill: '#264470' }} />
                    ))}
                  </div>
                  <div className="md:w-24 flex justify-end flex-shrink-0">
                    <button
                      onClick={e => { e.preventDefault(); window.location.href = `/client/buy/${scheme.id}`; }}
                      className="rounded-xl text-white flex items-center justify-center gap-1.5 transition-all"
                      style={{
                        background: 'linear-gradient(135deg,#0B667E,#12B4C3)',
                        boxShadow: '0 4px 12px rgba(18,180,195,0.25)',
                        padding: '0.6rem 1.1rem',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                      <ShoppingCart size={12} /> Invest
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
