import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — deep navy + blue Be Invest style */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 xl:w-2/5 relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(145deg, #060e1a 0%, #0b1f3a 45%, #0e2a4a 100%)' }}>
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(27,154,245,0.5) 1px, transparent 1px), linear-gradient(90deg,rgba(27,154,245,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
        {/* Decorative blue circles — Be Invest signature */}
        <div className="absolute top-24 right-12 w-80 h-80 rounded-full"
          style={{ border: '1.5px solid rgba(27,154,245,0.15)' }} />
        <div className="absolute top-40 right-28 w-48 h-48 rounded-full"
          style={{ border: '1px solid rgba(27,154,245,0.1)' }} />
        <div className="absolute bottom-32 left-6 w-40 h-40 rounded-full"
          style={{ border: '1.5px solid rgba(27,154,245,0.12)' }} />
        {/* Glow orb */}
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(27,154,245,0.12) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0e7ee4,#42b4ff)', boxShadow: '0 0 24px rgba(27,154,245,0.4)' }}>
              <TrendingUp size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Fund<span style={{ color: '#42b4ff' }}>Flow</span>
            </span>
          </Link>
        </div>

        {/* Hero Content */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="relative z-10 space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#42b4ff' }}>
              BE INVEST
            </p>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Invest With Confidence<br />
              <span style={{ color: '#42b4ff' }}>Harvest</span> The Rewards
            </h1>
            <p className="text-base leading-relaxed mt-4 max-w-sm" style={{ color: '#b0c4d8' }}>
              Access 3,000+ mutual fund schemes from 42 AMCs. Real-time NAV tracking, portfolio analytics, and SIP management.
            </p>
          </div>

          {/* "Get Started" style CTA row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-5 py-3 rounded-full text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#0e7ee4,#1b9af5)', boxShadow: '0 0 24px rgba(27,154,245,0.35)' }}>
              <span>Get Started</span>
              <span>→</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full" style={{ background: 'rgba(27,154,245,0.15)' }}>
                📞
              </div>
              <div>
                <p className="text-xs" style={{ color: '#7a94ab' }}>Need help?</p>
                <p className="text-sm font-bold text-white">(808) 555-0111</p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Active Investors', value: '3L+' },
              { label: 'Total AUM',        value: '₹2.14L Cr' },
              { label: 'Fund Schemes',     value: '3,000+' },
              { label: 'AMC Partners',     value: '42' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-4"
                style={{ background: 'rgba(27,154,245,0.08)', border: '1px solid rgba(27,154,245,0.15)' }}>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#7a94ab' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="relative z-10 flex items-center gap-3 flex-wrap">
          {['🛡 SEBI Registered', '🔒 256-bit SSL', '⭐ 4.9 App Rating'].map(badge => (
            <div key={badge} className="flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ background: 'rgba(27,154,245,0.1)', border: '1px solid rgba(27,154,245,0.2)' }}>
              <span className="text-xs text-white font-medium">{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right Panel — slightly lighter navy */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: '#0f2442' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0e7ee4,#42b4ff)' }}>
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-xl font-black text-white">Fund<span style={{ color: '#42b4ff' }}>Flow</span></span>
          </div>
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};
