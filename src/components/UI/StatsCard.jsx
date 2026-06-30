import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ACCENT = {
  blue:    { bg: 'rgba(27,154,245,0.12)',  icon: '#42b4ff', border: 'rgba(27,154,245,0.2)' },
  teal:    { bg: 'rgba(27,154,245,0.12)',  icon: '#42b4ff', border: 'rgba(27,154,245,0.2)' },
  emerald: { bg: 'rgba(16,185,129,0.12)',  icon: '#34d399', border: 'rgba(16,185,129,0.2)' },
  rose:    { bg: 'rgba(239,68,68,0.12)',   icon: '#f87171', border: 'rgba(239,68,68,0.2)'  },
  amber:   { bg: 'rgba(245,158,11,0.12)',  icon: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
};

export const StatsCard = ({ title, value, subtitle, icon: Icon, trend, trendLabel, accentColor = 'blue', delay = 0, className = '' }) => {
  const c = ACCENT[accentColor] || ACCENT.blue;
  const isPos = trend > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}
      className={`rounded-2xl p-6 ${className}`}
      style={{ background: '#0f2442', border: '1px solid rgba(27,154,245,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#7a94ab' }}>{title}</p>
          <p className="text-2xl font-black text-white mt-1">{value}</p>
          {subtitle && <p className="text-sm mt-1" style={{ color: '#7a94ab' }}>{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{isPos ? '+' : ''}{trend}% {trendLabel || 'vs last month'}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            <Icon size={22} style={{ color: c.icon }} />
          </div>
        )}
      </div>
    </motion.div>
  );
};
