import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Percent, Landmark, Check, X, ShieldAlert, Ban } from 'lucide-react';
import { DataTable } from '../../components/UI/DataTable';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { StatsCard } from '../../components/UI/StatsCard';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

const MOCK_AMCS_LIST = [
  { id: 'AMC001', name: 'HDFC Mutual Fund', email: 'support@hdfcmf.com', aum: 29431, commission: 0.15, status: 'Active' },
  { id: 'AMC002', name: 'Mirae Asset Mutual Fund', email: 'partners@miraeasset.com', aum: 38920, commission: 0.18, status: 'Active' },
  { id: 'AMC003', name: 'ICICI Prudential Mutual Fund', email: 'support@iciciprumf.com', aum: 35670, commission: 0.15, status: 'Active' },
  { id: 'AMC004', name: 'SBI Mutual Fund', email: 'sbimf@sbimf.com', aum: 44120, commission: 0.12, status: 'Active' },
  { id: 'AMC005', name: 'Axis Mutual Fund', email: 'axis@axismf.com', aum: 18340, commission: 0.20, status: 'Suspended' }
];

export default function AdminAMCsPage() {
  const [amcs, setAmcs] = useState(MOCK_AMCS_LIST);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pending Approvals Mock
  const [pendingList, setPendingList] = useState([
    { id:'A43', name:'Sundaram Mutual Fund', applied:'2026-06-25', aum:'₹12,400 Cr' },
    { id:'A44', name:'Motilal Oswal AMC',    applied:'2026-06-28', aum:'₹8,900 Cr'  },
  ]);

  const handleApprove = (p) => {
    const newAmc = {
      id: `AMC-${Date.now()}`,
      name: p.name,
      email: `support@${p.name.toLowerCase().replace(/ /g, '')}.com`,
      aum: parseInt(p.aum.replace(/[^0-9]/g, '')) || 5000,
      commission: 0.15,
      status: 'Active'
    };
    setAmcs(prev => [newAmc, ...prev]);
    setPendingList(prev => prev.filter(item => item.id !== p.id));
    alert(`${p.name} license has been approved!`);
  };

  const handleReject = (id, name) => {
    setPendingList(prev => prev.filter(item => item.id !== id));
    alert(`${name} license request rejected.`);
  };

  const handleToggleStatus = (id) => {
    setAmcs(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return a;
    }));
  };

  const filtered = amcs.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                          a.email.toLowerCase().includes(search.toLowerCase()) ||
                          a.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key:'id',         header:'AMC ID', accessor:'id', render: r => <span className="text-xs font-mono" style={{ color: '#7a94ab' }}>{r.id}</span> },
    { key:'name',       header:'AMC Name', accessor:'name', render: r => <span className="font-semibold text-white text-sm">{r.name}</span> },
    { key:'email',      header:'Contact Email', accessor:'email', render: r => <span className="text-xs text-slate-300">{r.email}</span> },
    { key:'aum',        header:'AUM Managed', accessor:'aum', sortable: true, render: r => <span className="font-bold text-white">₹{r.aum.toLocaleString()} Cr</span> },
    { key:'commission', header:'Commission Fee', accessor:'commission', render: r => <span className="font-semibold text-emerald-400">{r.commission}%</span> },
    { key:'status',     header:'Status',      accessor:'status', render: r => {
      const variant = r.status === 'Active' ? 'success' : 'danger';
      return <Badge variant={variant}>{r.status}</Badge>;
    }},
    { key:'actions',    header:'Actions',     render: r => (
      <div className="flex gap-2">
        <button onClick={() => handleToggleStatus(r.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: r.status === 'Active' ? '#f87171' : '#34d399' }} title="Toggle Status">
          <Ban size={14} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.25rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f87171' }}>🛡 System</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>AMC Management</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #f87171 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Approve mutual fund house license applications and audit fee schedules</p>
      </motion.div>

      {/* Pending approvals section */}
      {pendingList.length > 0 && (
        <div className="rounded-2xl"
          style={{
            background: 'rgba(245,158,11,0.02)',
            border: '1px solid rgba(245,158,11,0.15)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '2.25rem',
            marginBottom: '2.5rem'
          }}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <Building2 size={17} className="text-amber-400" />
            Pending AMC Approvals
            <span className="ml-1 px-2.5 py-0.5 text-xs font-bold rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
              {pendingList.length}
            </span>
          </h2>
          <div className="space-y-3">
            {pendingList.map(amc => (
              <div key={amc.id} className="flex items-center justify-between rounded-xl border flex-wrap gap-4"
                style={{ padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.1)' }}>
                <div>
                  <p className="font-semibold text-white text-sm">{amc.name}</p>
                  <p className="text-xs mt-1" style={{ color: '#7a94ab' }}>Applied: {amc.applied} • AUM: {amc.aum}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="success" size="sm" icon={Check} onClick={() => handleApprove(amc)}>Approve</Button>
                  <Button variant="danger"  size="sm" icon={X} onClick={() => handleReject(amc.id, amc.name)}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="rounded-2xl" style={{ ...CARD, marginBottom: '2.25rem' }}>
        <div className="relative" style={{ marginBottom: '1.5rem' }}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#f87171' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search AMC companies by Name, ID, or Email..."
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
            className="focus:border-[#f87171]" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider mr-2" style={{ color: '#7a94ab', fontSize: '0.7rem' }}>Filter License:</span>
          {['All', 'Active', 'Suspended'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="flex-shrink-0 rounded-full transition-all border"
              style={statusFilter === s
                ? { background: 'linear-gradient(135deg,#c2410c,#f97316)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(249,115,22,0.25)', fontSize: '0.825rem', fontWeight: 700, padding: '0.55rem 1.25rem' }
                : { background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.825rem', fontWeight: 600, padding: '0.55rem 1.25rem' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* AMCs Table Wrapper */}
      <div className="rounded-2xl" style={CARD}>
        <DataTable columns={columns} data={filtered} searchable={false} pageSize={8} />
      </div>
    </div>
  );
}
