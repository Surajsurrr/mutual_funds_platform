import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { MOCK_SCHEMES } from '../../utils/mockData';
import { getRiskColor } from '../../utils/formatters';

const CARD = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };

export default function AMCDashboard() {
  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#42b4ff' }}>AMC Portal</p>
          <h1 className="text-2xl font-black text-white">AMC Dashboard</h1>
          <div className="section-divider mt-2" />
          <p className="text-sm mt-3" style={{ color: '#7a94ab' }}>Manage your schemes and investor data</p>
        </div>
        <Button variant="primary" icon={Plus} id="add-scheme">Add New Scheme</Button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Schemes"    value="142"        icon={Building2}  accentColor="blue"    delay={0} />
        <StatsCard title="Total Investors"  value="18,420"     icon={Users}      accentColor="emerald" trend={6.2} delay={0.1} />
        <StatsCard title="Total AUM"        value="₹29,431 Cr" icon={TrendingUp} accentColor="amber"   trend={3.8} delay={0.15} />
        <StatsCard title="Avg Returns (1Y)" value="18.4%"      icon={BarChart3}  accentColor="blue"    delay={0.2} />
      </div>

      <div className="rounded-2xl p-6" style={CARD}>
        <h2 className="text-base font-bold text-white mb-4">Your Schemes</h2>
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(27,154,245,0.08)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Scheme Name</th><th>Category</th><th>NAV</th><th>1Y Returns</th><th>AUM (Cr)</th><th>Risk</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SCHEMES.slice(0,6).map((s,i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.07 }}>
                  <td className="font-semibold text-white text-sm">{s.name}</td>
                  <td><span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(27,154,245,0.1)', color: '#42b4ff' }}>{s.category}</span></td>
                  <td className="font-bold text-white">₹{s.nav}</td>
                  <td><span className="font-bold text-emerald-400">{s.returns1Y}%</span></td>
                  <td style={{ color: '#b0c4d8' }}>{s.aum}</td>
                  <td><Badge variant={getRiskColor(s.risk).replace('badge-','')}>{s.risk}</Badge></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded-lg transition-colors" style={{ color: '#42b4ff' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(27,154,245,0.1)'}
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
