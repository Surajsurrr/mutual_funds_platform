import React from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, ShieldAlert, BarChart3, TrendingUp, Landmark } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Badge } from '../../components/UI/Badge';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

const REPORTS = [
  {
    title: 'Monthly Audit Log',
    description: 'Download the complete record of transactional switches, buy orders, and unit redemptions across all corporate clients for general auditing.',
    icon: FileSpreadsheet,
    format: 'CSV / Excel',
    color: '#34d399',
    type: 'Financial'
  },
  {
    title: 'Risk & Compliance Report',
    description: 'Generate client risk distribution levels, flag limits, KYC discrepancies, and money laundering compliance threat assessments.',
    icon: ShieldAlert,
    format: 'PDF Document',
    color: '#ef4444',
    type: 'Security'
  },
  {
    title: 'AUM Distribution Summary',
    description: 'Review asset sizes by fund category (Large Cap, Mid Cap, Small Cap) to understand fund flows and client investment preferences.',
    icon: BarChart3,
    format: 'PDF / CSV',
    color: '#fbbf24',
    type: 'Analytics'
  },
  {
    title: 'Platform Revenue Report',
    description: 'Analyze fee commissions earned from AMC companies, switch commissions, and client management overheads.',
    icon: TrendingUp,
    format: 'Excel Sheet',
    color: '#42b4ff',
    type: 'Financial'
  }
];

export default function CBReportsPage() {
  const handleDownload = (title) => {
    alert(`Downloading ${title} in the background...`);
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.5rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>Corporate Banking</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>CB Reports</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Extract audit logs, risk evaluations, and asset size distributions for reporting</p>
      </motion.div>

      {/* Grid List */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
        {REPORTS.map((rep, idx) => (
          <motion.div key={rep.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="rounded-2xl transition-all border flex flex-col justify-between"
            style={CARD}
            onMouseEnter={e => e.currentTarget.style.borderColor='rgba(18,180,195,0.25)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <rep.icon size={20} style={{ color: rep.color }} />
                </div>
                <Badge variant={rep.type === 'Security' ? 'danger' : rep.type === 'Analytics' ? 'info' : 'success'}>
                  {rep.type}
                </Badge>
              </div>

              <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{rep.title}</h2>
              <p className="text-xs font-bold text-slate-400 mt-1">Export format: {rep.format}</p>
              
              <p className="text-sm leading-relaxed text-slate-300 mt-4" style={{ minHeight: '60px' }}>
                {rep.description}
              </p>
            </div>

            <div className="mt-8 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Button variant="secondary" icon={Download} onClick={() => handleDownload(rep.title)} fullWidth>
                Generate & Download
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
