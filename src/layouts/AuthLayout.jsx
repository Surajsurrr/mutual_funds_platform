import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 xl:w-2/5 relative overflow-hidden p-12"
        style={{
          background: 'linear-gradient(135deg, #050d1a 0%, #0f2040 50%, #0A1628 100%)'
        }}
      >
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(37,99,235,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-emerald-600/8 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-600/40">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">FundFlow</span>
          </Link>
        </div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 space-y-6"
        >
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
            Invest in your<br />
            <span className="gradient-text">financial future</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Access 3,000+ mutual fund schemes from 42 AMCs. Real-time NAV tracking, portfolio analytics, and SIP management — all in one place.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Active Investors', value: '3L+' },
              { label: 'Total AUM', value: '₹2.14L Cr' },
              { label: 'Fund Schemes', value: '3,000+' },
              { label: 'AMC Partners', value: '42' },
            ].map(stat => (
              <div key={stat.label} className="glass rounded-xl p-4">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 flex items-center gap-4"
        >
          <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
            <Shield size={12} className="text-emerald-400" />
            <span className="text-xs text-slate-300">SEBI Registered</span>
          </div>
          <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
            <span className="text-xs text-slate-300">🔒 256-bit SSL Encrypted</span>
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">FundFlow</span>
          </div>

          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};
