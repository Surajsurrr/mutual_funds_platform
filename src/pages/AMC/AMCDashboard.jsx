import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { MOCK_SCHEMES } from '../../utils/mockData';

export default function AMCDashboard() {
  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">AMC Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your schemes and view investor data</p>
        </div>
        <Button variant="gradient" icon={Plus} id="add-scheme">Add New Scheme</Button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Schemes" value="142" icon={Building2} accentColor="blue" delay={0} />
        <StatsCard title="Total Investors" value="18,420" icon={Users} accentColor="emerald" trend={6.2} delay={0.1} />
        <StatsCard title="Total AUM" value="₹29,431 Cr" icon={TrendingUp} accentColor="amber" trend={3.8} delay={0.15} />
        <StatsCard title="Avg Returns (1Y)" value="18.4%" icon={BarChart3} accentColor="blue" delay={0.2} />
      </div>

      {/* Scheme Table */}
      <div className="glass rounded-2xl p-6 border border-blue-600/10">
        <h2 className="text-lg font-bold text-white mb-4">Your Schemes</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
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
              {MOCK_SCHEMES.slice(0, 4).map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                  <td className="font-semibold text-white text-sm">{s.name}</td>
                  <td><span className="badge badge-info">{s.category}</span></td>
                  <td className="font-bold">₹{s.nav}</td>
                  <td className="text-emerald-400 font-bold">{s.returns1Y}%</td>
                  <td>{s.aum}</td>
                  <td>
                    <Badge variant={s.risk === 'Low' ? 'success' : s.risk === 'Moderate' ? 'warning' : 'danger'}>
                      {s.risk}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-blue-600/10 text-blue-400 transition-colors"><Edit size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-rose-600/10 text-rose-400 transition-colors"><Trash2 size={14} /></button>
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
