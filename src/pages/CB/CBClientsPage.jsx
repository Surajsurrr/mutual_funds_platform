import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldAlert, Award, UserPlus, Search, Edit2, Ban, Eye } from 'lucide-react';
import { DataTable } from '../../components/UI/DataTable';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { StatsCard } from '../../components/UI/StatsCard';
import { Modal } from '../../components/UI/Modal';
import { formatCurrency } from '../../utils/formatters';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

const MOCK_CB_CLIENTS = [
  { id: 'USR101', name: 'Ramesh Kumar', email: 'ramesh.kumar@gmail.com', holdings: 1420000, risk: 'High', status: 'Flagged', lastActive: '2026-07-06T15:24:00Z' },
  { id: 'USR102', name: 'Priya Sharma', email: 'priya.sharma@yahoo.com', holdings: 280000, risk: 'High', status: 'Flagged', lastActive: '2026-07-06T14:18:00Z' },
  { id: 'USR103', name: 'Suraj Kumar', email: 'client@fundflow.in', holdings: 149000, risk: 'Moderate', status: 'Active', lastActive: '2026-07-06T16:02:00Z' },
  { id: 'USR104', name: 'Amit Singh', email: 'amit.singh@gmail.com', holdings: 2450000, risk: 'Low', status: 'Active', lastActive: '2026-07-05T09:30:00Z' },
  { id: 'USR105', name: 'Vikram Aditya', email: 'aditya.v@outlook.com', holdings: 890000, risk: 'Moderate', status: 'Active', lastActive: '2026-07-04T18:12:00Z' },
  { id: 'USR106', name: 'Ananya Rao', email: 'ananya.rao@gmail.com', holdings: 540000, risk: 'Low', status: 'Active', lastActive: '2026-07-06T11:45:00Z' },
  { id: 'USR107', name: 'Sanjay Dutt', email: 'sanjay.d@hotmail.com', holdings: 12000, risk: 'High', status: 'Suspended', lastActive: '2026-06-28T10:00:00Z' }
];

export default function CBClientsPage() {
  const [clients, setClients] = useState(MOCK_CB_CLIENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const filtered = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.email.toLowerCase().includes(search.toLowerCase()) ||
                          c.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (id) => {
    setClients(prev => prev.map(c => {
      if (c.id === id) {
        let nextStatus = 'Active';
        if (c.status === 'Active') nextStatus = 'Suspended';
        else if (c.status === 'Suspended') nextStatus = 'Active';
        else if (c.status === 'Flagged') nextStatus = 'Active';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleReviewClient = (c) => {
    setSelectedClient(c);
    setShowModal(true);
  };

  const columns = [
    { key:'id',        header:'Client ID', accessor:'id', render: r => <span className="text-xs font-mono" style={{ color: '#7a94ab' }}>{r.id}</span> },
    { key:'name',      header:'Name',        accessor:'name', render: r => (
      <div>
        <p className="font-semibold text-white text-sm">{r.name}</p>
        <p className="text-[10px]" style={{ color: '#7a94ab' }}>{r.email}</p>
      </div>
    )},
    { key:'holdings',  header:'Holdings',    accessor:'holdings', sortable: true, render: r => <span className="font-bold text-white text-sm">{formatCurrency(r.holdings)}</span> },
    { key:'risk',      header:'Risk Profile', accessor:'risk', render: r => {
      const variant = r.risk === 'Low' ? 'success' : r.risk === 'Moderate' ? 'warning' : 'danger';
      return <Badge variant={variant}>{r.risk}</Badge>;
    }},
    { key:'status',    header:'Status',      accessor:'status', render: r => {
      const variant = r.status === 'Active' ? 'success' : r.status === 'Suspended' ? 'warning' : 'danger';
      return <Badge variant={variant}>{r.status}</Badge>;
    }},
    { key:'actions',   header:'Actions',     render: r => (
      <div className="flex gap-2">
        <button onClick={() => handleReviewClient(r)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#12B4C3' }} title="Review Portfolio">
          <Eye size={14} />
        </button>
        <button onClick={() => handleToggleStatus(r.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: r.status === 'Suspended' ? '#34d399' : '#f87171' }} title="Change Status">
          <Ban size={14} />
        </button>
      </div>
    )},
  ];

  const totalHoldings = clients.reduce((sum, item) => sum + item.holdings, 0);
  const flaggedCount = clients.filter(c => c.status === 'Flagged').length;

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4"
        style={{ marginBottom: '2.25rem' }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>Corporate Banking</p>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>CB Clients</h1>
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
          <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Inspect customer credit risks, profiles, and asset holdings distribution lists</p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => alert('Onboarding wizard triggered')}>Onboard Client</Button>
      </motion.div>

      {/* Stats block */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" style={{ marginBottom: '2.5rem' }}>
        <StatsCard title="Total Clients"    value={clients.length.toString()} icon={Users}       accentColor="blue"    delay={0} />
        <StatsCard title="Total Assets (AUM)" value={formatCurrency(totalHoldings)} icon={Award}      accentColor="emerald" delay={0.1} />
        <StatsCard title="Flagged Users"    value={flaggedCount.toString()}   icon={ShieldAlert} accentColor="rose"    delay={0.15} />
        <StatsCard title="Avg Asset Size"   value={formatCurrency(totalHoldings / clients.length)} icon={Award} accentColor="blue" delay={0.2} />
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl" style={{ ...CARD, marginBottom: '2.25rem' }}>
        <div className="relative" style={{ marginBottom: '1.5rem' }}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#12B4C3' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clients by Name, ID, or Email..."
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
          <span className="text-xs font-bold uppercase tracking-wider mr-2" style={{ color: '#7a94ab', fontSize: '0.7rem' }}>Status:</span>
          {['All', 'Active', 'Flagged', 'Suspended'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="flex-shrink-0 rounded-full transition-all border"
              style={statusFilter === s
                ? { background: 'linear-gradient(135deg,#0B667E,#12B4C3)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(18,180,195,0.25)', fontSize: '0.825rem', fontWeight: 700, padding: '0.55rem 1.25rem' }
                : { background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.825rem', fontWeight: 600, padding: '0.55rem 1.25rem' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid Wrapper */}
      <div className="rounded-2xl" style={CARD}>
        <DataTable columns={columns} data={filtered} searchable={false} pageSize={8} />
      </div>

      {/* Audit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Audit Client Holdings" size="md"
        footer={<Button variant="primary" onClick={() => setShowModal(false)}>Close Audit</Button>}>
        {selectedClient && (
          <div className="space-y-4">
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Client Profile</p>
              <p className="text-lg font-bold text-white mt-1">{selectedClient.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{selectedClient.email} • ID: {selectedClient.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Holding Balance</p>
                <p className="text-xl font-black text-white mt-1">{formatCurrency(selectedClient.holdings)}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Threat Assessment</p>
                <p className="text-xl font-black mt-1" style={{ color: selectedClient.risk === 'High' ? '#ef4444' : '#fbbf24' }}>{selectedClient.risk} Risk</p>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Audit Trail / Log Status</p>
              <p className="text-sm font-semibold text-white mt-2">Account is currently flagged for: {selectedClient.status === 'Flagged' ? 'High volume transaction alerts' : 'No warnings'}</p>
              <p className="text-xs text-slate-400 mt-1">Last activity recorded on: {new Date(selectedClient.lastActive).toLocaleString()}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
