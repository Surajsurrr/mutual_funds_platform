import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  accentColor = 'blue',
  delay = 0,
  className = '',
}) => {
  const colorMap = {
    blue: { text: 'text-blue-400', bg: 'bg-blue-600/10', border: 'border-blue-600/20' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-600/10', border: 'border-emerald-600/20' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-600/10', border: 'border-rose-600/20' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-600/10', border: 'border-amber-600/20' },
  };
  const colors = colorMap[accentColor] || colorMap.blue;
  const isPositive = trend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass rounded-2xl p-6 border ${colors.border} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{isPositive ? '+' : ''}{trend}% {trendLabel || 'vs last month'}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colors.bg}`}>
            <Icon size={22} className={colors.text} />
          </div>
        )}
      </div>
    </motion.div>
  );
};
