import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, TrendingUp, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { MOCK_AMC_LIST } from '../../utils/mockData';

const CATEGORIES = ['All', 'Large Cap', 'Equity', 'Diversified', 'Debt', 'Balanced', 'Index', 'Multi Cap', 'Growth', 'Value'];

export default function AMCListPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = MOCK_AMC_LIST.filter(amc => {
    const matchSearch = amc.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || amc.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">AMC Companies</h1>
        <p className="text-slate-400 mt-1">Choose from {MOCK_AMC_LIST.length} trusted Asset Management Companies</p>
      </motion.div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search AMC by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
            id="amc-search"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              category === cat
                ? 'gradient-primary text-white shadow-lg shadow-blue-600/20'
                : 'glass text-slate-400 hover:text-white border border-blue-600/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* AMC Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((amc, i) => (
          <motion.div
            key={amc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={`/client/schemes?amc=${amc.id}`}
              className="flex flex-col h-full glass rounded-2xl p-5 border border-blue-600/10 hover:border-blue-600/40 hover:shadow-lg hover:shadow-blue-600/10 transition-all group"
              id={`amc-card-${amc.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl group-hover:scale-110 transition-transform">{amc.logo}</span>
                <div className="flex items-center gap-1 bg-amber-600/10 rounded-full px-2 py-0.5">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-amber-400">{amc.rating}</span>
                </div>
              </div>

              <h3 className="font-bold text-white text-sm leading-snug mb-1">{amc.name}</h3>
              <span className="text-xs text-blue-400 font-medium mb-3">{amc.category}</span>

              <div className="mt-auto grid grid-cols-2 gap-2 pt-3 border-t border-navy-700">
                <div>
                  <p className="text-xs text-slate-500">AUM</p>
                  <p className="text-sm font-bold text-white">₹{amc.aum} Cr</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Funds</p>
                  <p className="text-sm font-bold text-white">{amc.fundCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-3 text-xs text-blue-400 font-semibold">
                View Schemes <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold">No AMCs found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}
