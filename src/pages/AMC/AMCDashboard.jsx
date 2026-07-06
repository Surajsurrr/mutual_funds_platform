import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { MOCK_SCHEMES } from '../../utils/mockData';
import { getRiskColor } from '../../utils/formatters';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

export default function AMCDashboard() {
  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4"
        style={{ marginBottom: '2.25rem' }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>AMC Portal</p>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>AMC Dashboard</h1>
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
          <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Manage your schemes and investor data</p>
        </div>
        <Button variant="primary" icon={Plus} id="add-scheme">Add New Scheme</Button>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" style={{ marginBottom: '2.5rem' }}>
        <StatsCard title="Total Schemes"    value="142"        icon={Building2}  accentColor="blue"    delay={0} />
        <StatsCard title="Total Investors"  value="18,420"     icon={Users}      accentColor="emerald" trend={6.2} delay={0.1} />
        <StatsCard title="Total AUM"        value="₹29,431 Cr" icon={TrendingUp} accentColor="amber"   trend={3.8} delay={0.15} />
        <StatsCard title="Avg Returns (1Y)" value="18.4%"      icon={BarChart3}  accentColor="blue"    delay={0.2} />
      </div>

      {/* Your Schemes Table Card */}
      <div className="rounded-2xl" style={CARD}>
        <h2 className="text-base font-bold text-white mb-5">Your Schemes</h2>
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="data-table data-table-dark">
            <thead>
              <tr>
                <th>Scheme Name</th>
                <th>Category</th>
                <th>NAV</th>
                <th>1Y Returns</th>
                <th>AUM (Cr)</th>
                <th>Risk</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SCHEMES.slice(0,6).map((s,i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.07 }}>
                  <td className="font-semibold text-white text-sm">{s.name}</td>
                  <td>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(18,180,195,0.1)', color: '#12B4C3' }}>
                      {s.category}
                    </span>
                  </td>
                  <td className="font-bold text-white">₹{s.nav}</td>
                  <td>
                    <span className="font-bold text-emerald-400">{s.returns1Y}%</span>
                  </td>
                  <td style={{ color: '#b0c4d8' }}>{s.aum}</td>
                  <td>
                    <Badge variant={getRiskColor(s.risk).replace('badge-','')}>{s.risk}</Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded-lg transition-colors" style={{ color: '#12B4C3' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(18,180,195,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <Edit size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg transition-colors" style={{ color: '#f87171' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
