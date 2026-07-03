import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

/* Icon badge uses teal gradient bg per design system */
const ACCENT = {
  blue:    { bg: 'linear-gradient(135deg,#0B667E,#12B4C3)', icon: '#ffffff', border: 'none' },
  teal:    { bg: 'linear-gradient(135deg,#0B667E,#12B4C3)', icon: '#ffffff', border: 'none' },
  emerald: { bg: 'rgba(16,185,129,0.12)',  icon: '#10b981', border: 'rgba(16,185,129,0.2)' },
  rose:    { bg: 'rgba(239,68,68,0.12)',   icon: '#ef4444', border: 'rgba(239,68,68,0.2)'  },
  amber:   { bg: 'rgba(245,158,11,0.12)',  icon: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
};

export const StatsCard = ({ title, value, subtitle, icon: Icon, trend, trendLabel, accentColor = 'blue', delay = 0, className = '' }) => {
  const c = ACCENT[accentColor] || ACCENT.blue;
  const isPos = trend > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}
      className={`rounded-2xl p-6 card card-hover ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="ds-eyebrow mb-2">{title}</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1B2745', lineHeight: 1.1, marginTop: '4px', fontFamily: 'Poppins, sans-serif' }}>{value}</p>
          {subtitle && <p className="text-sm mt-1 ds-body">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${isPos ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{isPos ? '+' : ''}{trend}% {trendLabel || 'vs last month'}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl" style={{ background: c.bg, boxShadow: '0 4px 12px rgba(11,102,126,0.25)' }}>
            <Icon size={22} style={{ color: c.icon }} />
          </div>
        )}
      </div>
    </motion.div>
  );
};
