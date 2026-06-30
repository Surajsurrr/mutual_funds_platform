import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, ChevronRight } from 'lucide-react';
import { MOCK_AMC_LIST } from '../../utils/mockData';

const CATEGORIES = ['All','Large Cap','Equity','Diversified','Debt','Balanced','Index','Multi Cap','Growth','Value'];
const CARD = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.1)' };

export default function AMCListPage() {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');

  const filtered = MOCK_AMC_LIST.filter(a => {
    const ms = a.name.toLowerCase().includes(search.toLowerCase());
    const mc = category === 'All' || a.category === category;
    return ms && mc;
  });

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#42b4ff' }}>Browse Partners</p>
        <h1 className="text-2xl font-black text-white">AMC Companies</h1>
        <div className="section-divider mt-2" />
        <p className="text-sm mt-3" style={{ color: '#7a94ab' }}>Choose from {MOCK_AMC_LIST.length} trusted Asset Management Companies</p>
      </motion.div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7a94ab' }} />
        <input type="text" placeholder="Search AMC by name..." value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-10 w-full" id="amc-search" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border"
            style={category === cat
              ? { background: 'linear-gradient(135deg,#0e7ee4,#1b9af5)', color: '#fff', borderColor: 'transparent', boxShadow: '0 2px 12px rgba(27,154,245,0.3)' }
              : { background: 'rgba(27,154,245,0.06)', color: '#b0c4d8', borderColor: 'rgba(27,154,245,0.15)' }}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((amc, i) => (
          <motion.div key={amc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link to={`/client/schemes?amc=${amc.id}`}
              className="flex flex-col h-full rounded-2xl p-5 card-hover group" style={CARD}
              id={`amc-card-${amc.id}`}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl group-hover:scale-110 transition-transform">{amc.logo}</span>
                <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <Star size={10} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>{amc.rating}</span>
                </div>
              </div>
              <h3 className="font-bold text-white text-sm leading-snug mb-1">{amc.name}</h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full self-start mb-3" style={{ background: 'rgba(27,154,245,0.1)', color: '#42b4ff' }}>
                {amc.category}
              </span>
              <div className="mt-auto grid grid-cols-2 gap-2 pt-3" style={{ borderTop: '1px solid rgba(27,154,245,0.08)' }}>
                <div><p className="text-xs" style={{ color: '#7a94ab' }}>AUM</p><p className="text-sm font-bold text-white">₹{amc.aum} Cr</p></div>
                <div><p className="text-xs" style={{ color: '#7a94ab' }}>Funds</p><p className="text-sm font-bold text-white">{amc.fundCount}</p></div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: '#42b4ff' }}>
                View Schemes <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
