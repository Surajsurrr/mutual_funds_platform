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

export const StatsCard = ({ title, value, subtitle, icon: Icon, trend, trendLabel, accentColor = 'blue', variant = 'dark', delay = 0, className = '' }) => {
  const c = ACCENT[accentColor] || ACCENT.blue;
  const isPos = trend > 0;
  const isDark = variant === 'dark';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}
      className={`rounded-2xl card-hover flex flex-col items-center text-center ${isDark ? 'card-dark text-white' : 'card text-slate-900'} ${className}`}
      style={{ width: '100%', padding: 'clamp(0.875rem, 3vw, 1.5rem)' }}>
      {Icon && (
        <div className="p-2.5 sm:p-3.5 rounded-xl mb-3 sm:mb-4" style={{ background: c.bg, boxShadow: '0 4px 12px rgba(11,102,126,0.25)' }}>
          <Icon size={20} style={{ color: c.icon }} />
        </div>
      )}
      <div className="w-full">
        <p className="ds-eyebrow mb-1.5" style={{ color: isDark ? '#7a94ab' : '#5F6B7A', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.07em' }}>{title}</p>
        <p style={{ fontSize: 'clamp(1.1rem, 4vw, 1.75rem)', fontWeight: 800, color: isDark ? '#ffffff' : '#1B2745', lineHeight: 1.1, fontFamily: 'Poppins, sans-serif' }}>{value}</p>
        {subtitle && <p className="text-xs mt-1.5" style={{ color: isDark ? '#cbd5e1' : '#5f6b7a' }}>{subtitle}</p>}
        {trend !== undefined && (
          <div className={`flex items-center justify-center gap-1 mt-2.5 text-xs font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{isPos ? '+' : ''}{trend}% {trendLabel || 'vs last month'}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
