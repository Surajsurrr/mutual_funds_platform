import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, ChevronRight } from 'lucide-react';
import { MOCK_AMC_LIST } from '../../utils/mockData';

const CATEGORIES = ['All','Large Cap','Equity','Diversified','Debt','Balanced','Index','Multi Cap','Growth','Value'];

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2rem',
};

export default function AMCListPage() {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');

  const filtered = MOCK_AMC_LIST.filter(a => {
    const ms = a.name.toLowerCase().includes(search.toLowerCase());
    const mc = category === 'All' || a.category === category;
    return ms && mc;
  });

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.25rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>Browse Partners</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>AMC Companies</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Choose from {MOCK_AMC_LIST.length} trusted Asset Management Companies</p>
      </motion.div>

      {/* Search Input Container */}
      <div className="relative max-w-md" style={{ marginBottom: '1.75rem' }}>
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#12B4C3' }} />
        <input type="text" placeholder="Search AMC by name..." value={search} onChange={e => setSearch(e.target.value)}
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
          id="amc-search" />
      </div>

      {/* Categories Tabs Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1.5" style={{ marginBottom: '2.25rem' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className="flex-shrink-0 rounded-full transition-all border"
            style={category === cat
              ? { background: 'linear-gradient(135deg,#0B667E,#12B4C3)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(18,180,195,0.25)', fontSize: '0.825rem', fontWeight: 700, padding: '0.55rem 1.25rem' }
              : { background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.825rem', fontWeight: 600, padding: '0.55rem 1.25rem' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* AMC Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((amc, i) => (
          <motion.div
            key={amc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.025, translateY: -4 }}
            whileTap={{ scale: 0.975 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Link to={`/client/schemes?amc=${amc.id}`}
              className="flex flex-col h-full rounded-2xl card-hover group" style={CARD}
              id={`amc-card-${amc.id}`}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl lg:text-4xl group-hover:scale-110 transition-transform">{amc.logo}</span>
                <div className="flex items-center gap-1 rounded-full px-2.5 py-0.5" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <Star size={11} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>{amc.rating}</span>
                </div>
              </div>
              <h3 className="font-black text-white text-base lg:text-lg leading-snug mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>{amc.name}</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full self-start mb-3" style={{ background: 'rgba(18,180,195,0.1)', color: '#12B4C3' }}>
                {amc.category}
              </span>
              <div className="mt-auto grid grid-cols-2 gap-3 pt-4.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#7a94ab' }}>AUM</p>
                  <p className="text-base lg:text-lg font-black text-white mt-0.5">₹{amc.aum} Cr</p>
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#7a94ab' }}>Funds</p>
                  <p className="text-base lg:text-lg font-black text-white mt-0.5">{amc.fundCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4.5 text-xs font-bold" style={{ color: '#12B4C3' }}>
                View Schemes <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
