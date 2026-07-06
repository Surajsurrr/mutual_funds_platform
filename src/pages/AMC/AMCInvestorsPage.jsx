import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Calendar, Search, ArrowUpRight } from 'lucide-react';
import { DataTable } from '../../components/UI/DataTable';
import { Badge } from '../../components/UI/Badge';
import { StatsCard } from '../../components/UI/StatsCard';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

const MOCK_AMC_INVESTORS = [
  { id: 'INV001', name: 'Suraj Kumar', email: 'client@fundflow.in', scheme: 'HDFC Top 100 Fund', units: 32.42, invested: 27561, value: 30097, gain: 2536, sip: 'Active' },
  { id: 'INV001', name: 'Suraj Kumar', email: 'client@fundflow.in', scheme: 'Mirae Asset Large Cap', units: 1224.80, invested: 68946, value: 115927, gain: 46981, sip: 'Active' },
  { id: 'INV002', name: 'Amit Sharma', email: 'amit.sharma@gmail.com', scheme: 'HDFC Mid-Cap Opportunities', units: 154.20, invested: 20000, value: 23800, gain: 3800, sip: 'Active' },
  { id: 'INV003', name: 'Rohan Verma', email: 'rohan.v@yahoo.com', scheme: 'HDFC Top 100 Fund', units: 10.75, invested: 9000, value: 9980, gain: 980, sip: 'None' },
  { id: 'INV004', name: 'Neha Gupta', email: 'neha.gupta@outlook.com', scheme: 'ICICI Pru Value Discovery', units: 92.18, invested: 28806, value: 34933, gain: 6127, sip: 'Active' },
  { id: 'INV005', name: 'Karan Malhotra', email: 'karan.m@gmail.com', scheme: 'SBI Bluechip Fund', units: 275.40, invested: 18000, value: 19850, gain: 1850, sip: 'Paused' },
  { id: 'INV006', name: 'Sneha Patil', email: 'sneha.patil@rediffmail.com', scheme: 'Mirae Asset Large Cap', units: 50.50, invested: 4500, value: 4780, gain: 280, sip: 'None' },
  { id: 'INV007', name: 'Vikram Singh', email: 'vikram.s@outlook.com', scheme: 'Axis Small Cap Fund', units: 220.15, invested: 15000, value: 19230, gain: 4230, sip: 'Active' }
];

export default function AMCInvestorsPage() {
  const [search, setSearch] = useState('');
  const [sipFilter, setSipFilter] = useState('All');

  const filtered = MOCK_AMC_INVESTORS.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || 
                          i.scheme.toLowerCase().includes(search.toLowerCase()) ||
                          i.id.toLowerCase().includes(search.toLowerCase());
    const matchesSip = sipFilter === 'All' || i.sip === sipFilter;
    return matchesSearch && matchesSip;
  });

  const totalAUM = MOCK_AMC_INVESTORS.reduce((sum, item) => sum + item.value, 0);
  const totalInvested = MOCK_AMC_INVESTORS.reduce((sum, item) => sum + item.invested, 0);
  const activeSips = MOCK_AMC_INVESTORS.filter(i => i.sip === 'Active').length;
  const uniqueInvestors = new Set(MOCK_AMC_INVESTORS.map(i => i.email)).size;

  const columns = [
    { key:'id',        header:'Investor ID', accessor:'id', render: r => <span className="text-xs font-mono" style={{ color: '#7a94ab' }}>{r.id}</span> },
    { key:'name',      header:'Name',        accessor:'name', render: r => (
      <div>
        <p className="font-semibold text-white text-sm">{r.name}</p>
        <p className="text-[10px]" style={{ color: '#7a94ab' }}>{r.email}</p>
      </div>
    )},
    { key:'scheme',    header:'Scheme Held', accessor:'scheme', render: r => <span className="text-sm font-semibold text-white">{r.scheme}</span> },
    { key:'value',     header:'Current Value', accessor:'value', sortable: true, render: r => (
      <div>
        <p className="font-bold text-white text-sm">{formatCurrency(r.value)}</p>
        <p className="text-[10px]" style={{ color: '#7a94ab' }}>Cost: {formatCurrency(r.invested)}</p>
      </div>
    )},
    { key:'gain',      header:'Gain/Loss',   accessor:'gain', sortable: true, render: r => {
      const gainPct = ((r.gain / r.invested) * 100).toFixed(1);
      return (
        <span className={`text-xs font-bold ${r.gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {r.gain >= 0 ? '+' : ''}{formatCurrency(r.gain)} ({gainPct}%)
        </span>
      );
    }},
    { key:'sip',       header:'SIP Status',  accessor:'sip', render: r => {
      const variant = r.sip === 'Active' ? 'success' : r.sip === 'Paused' ? 'warning' : 'info';
      return <Badge variant={variant}>{r.sip}</Badge>;
    }},
  ];

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.25rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>AMC Portal</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>AMC Investors</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Track portfolios, unit holding distributions, and active SIP policies of your investors</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" style={{ marginBottom: '2.5rem' }}>
        <StatsCard title="Total Investors"   value={uniqueInvestors.toString()} icon={Users}       accentColor="blue"    delay={0} />
        <StatsCard title="Total AUM Under AMC" value={formatCurrency(totalAUM)}   icon={TrendingUp}  accentColor="emerald" delay={0.1} />
        <StatsCard title="Total Invested"    value={formatCurrency(totalInvested)} icon={DollarSign}  accentColor="amber"   delay={0.15} />
        <StatsCard title="Active SIP Policies" value={activeSips.toString()}       icon={Calendar}    accentColor="blue"    delay={0.2} />
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl" style={{ ...CARD, marginBottom: '2.25rem' }}>
        <div className="relative" style={{ marginBottom: '1.5rem' }}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#12B4C3' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search investors by name, ID, or scheme name..."
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              color: '#ffffff',
              padding: '0.875rem 1rem 0.875rem 2.75rem',
              outline: 'none',
              fontSize: '0.875rem',
              width: '100%',
              fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.2s',
            }}
            className="focus:border-[#12B4C3]" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider mr-2" style={{ color: '#7a94ab', fontSize: '0.7rem' }}>SIP Status:</span>
          {['All', 'Active', 'Paused', 'None'].map(s => (
            <button key={s} onClick={() => setSipFilter(s)}
              className="flex-shrink-0 rounded-full transition-all border"
              style={sipFilter === s
                ? { background: 'linear-gradient(135deg,#0B667E,#12B4C3)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(18,180,195,0.25)', fontSize: '0.825rem', fontWeight: 700, padding: '0.55rem 1.25rem' }
                : { background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.825rem', fontWeight: 600, padding: '0.55rem 1.25rem' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid wrapper */}
      <div className="rounded-2xl" style={CARD}>
        <DataTable columns={columns} data={filtered} searchable={false} pageSize={8} />
      </div>
    </div>
  );
}
