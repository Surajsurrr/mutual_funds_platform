import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Search, ShieldAlert, Award, FileText, CheckCircle2 } from 'lucide-react';
import { DataTable } from '../../components/UI/DataTable';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { StatsCard } from '../../components/UI/StatsCard';
import { MOCK_TRANSACTIONS } from '../../utils/mockData';
import { formatDate, formatCurrency } from '../../utils/formatters';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

// Add clientName to transactions mock structure
const ENRICHED_TXNS = MOCK_TRANSACTIONS.map((t, idx) => {
  const clients = ['Suraj Kumar', 'Amit Sharma', 'Neha Gupta', 'Ramesh Kumar', 'Priya Sharma', 'Karan Malhotra'];
  return {
    ...t,
    clientName: clients[idx % clients.length],
    status: idx === 4 ? 'failed' : idx === 0 ? 'flagged' : t.status
  };
});

export default function CBTransactionsPage() {
  const [txns, setTxns] = useState(ENRICHED_TXNS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = txns.filter(t => {
    const matchesSearch = t.schemeName.toLowerCase().includes(search.toLowerCase()) || 
                          t.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = filter === 'All' || t.type === filter || (filter === 'Flagged' && t.status === 'flagged');
    return matchesSearch && matchesType;
  });

  const handleVerify = (id) => {
    setTxns(prev => prev.map(t => t.id === id ? { ...t, status: 'success' } : t));
    alert(`Transaction ${id} verified and updated!`);
  };

  const handleToggleFlag = (id) => {
    setTxns(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'flagged' ? 'success' : 'flagged';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const columns = [
    { key:'id',         header:'Txn ID',  accessor:'id', render: r => <span className="text-xs font-mono text-slate-400">{r.id}</span> },
    { key:'date',       header:'Date',    accessor:'date', sortable: true, render: r => <span className="text-xs text-slate-300">{formatDate(r.date)}</span> },
    { key:'client',     header:'Client Name', accessor:'clientName', render: r => <span className="font-semibold text-white text-sm">{r.clientName}</span> },
    { key:'scheme',     header:'Scheme',  accessor:'schemeName', render: r => <span className="text-sm font-semibold text-slate-200">{r.schemeName}</span> },
    { key:'type',       header:'Type',    accessor:'type', render: r => <Badge variant={r.type==='BUY'?'success':r.type==='SIP'?'info':'warning'}>{r.type}</Badge> },
    { key:'amount',     header:'Amount',  accessor:'amount', sortable: true, render: r => <span className="font-bold text-white text-sm">{formatCurrency(r.amount)}</span> },
    { key:'status',     header:'Status',  accessor:'status', render: r => {
      const variant = r.status === 'success' ? 'success' : r.status === 'failed' ? 'danger' : 'warning';
      return <Badge variant={variant}>{r.status}</Badge>;
    }},
    { key:'actions',    header:'Actions', render: r => (
      <div className="flex gap-2">
        {r.status === 'flagged' ? (
          <>
            <button onClick={() => handleVerify(r.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#34d399' }} title="Verify Success">
              <CheckCircle2 size={14} />
            </button>
            <button onClick={() => handleToggleFlag(r.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#ef4444' }} title="Clear Flag">
              <ShieldAlert size={14} />
            </button>
          </>
        ) : (
          <button onClick={() => handleToggleFlag(r.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#7a94ab' }} title="Flag Transaction">
            <ShieldAlert size={14} />
          </button>
        )}
      </div>
    )},
  ];

  const totalVol = txns.filter(t => t.status === 'success').reduce((sum, item) => sum + item.amount, 0);
  const flaggedCount = txns.filter(t => t.status === 'flagged').length;

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4"
        style={{ marginBottom: '2.25rem' }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>Corporate Banking</p>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>CB Transactions</h1>
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
          <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Audit transaction histories, cancel fraudulent orders, and release held balances</p>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={() => alert('Transactions synced!')}>Sync Ledger</Button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" style={{ marginBottom: '2.5rem' }}>
        <StatsCard title="Total Audited"    value={txns.length.toString()} icon={FileText}       accentColor="blue"    delay={0} />
        <StatsCard title="Settled Volume"  value={formatCurrency(totalVol)} icon={Award}      accentColor="emerald" delay={0.1} />
        <StatsCard title="Flagged Swaps"    value={flaggedCount.toString()}  icon={ShieldAlert} accentColor="rose"    delay={0.15} />
        <StatsCard title="Success Rate"    value="96.4%"                    icon={CheckCircle2} accentColor="blue" delay={0.2} />
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl" style={{ ...CARD, marginBottom: '2.25rem' }}>
        <div className="relative" style={{ marginBottom: '1.5rem' }}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#12B4C3' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions by Client Name, ID, or Scheme name..."
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
          <span className="text-xs font-bold uppercase tracking-wider mr-2" style={{ color: '#7a94ab', fontSize: '0.7rem' }}>Filter:</span>
          {['All', 'BUY', 'SIP', 'REDEEM', 'Flagged'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="flex-shrink-0 rounded-full transition-all border"
              style={filter === f
                ? { background: 'linear-gradient(135deg,#0B667E,#12B4C3)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(18,180,195,0.25)', fontSize: '0.825rem', fontWeight: 700, padding: '0.55rem 1.25rem' }
                : { background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.825rem', fontWeight: 600, padding: '0.55rem 1.25rem' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Table Wrapper */}
      <div className="rounded-2xl" style={CARD}>
        <DataTable columns={columns} data={filtered} searchable={false} pageSize={8} />
      </div>
    </div>
  );
}
