import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../../utils/mockData';
import { DataTable } from '../../components/UI/DataTable';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/formatters';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

export default function TransactionHistoryPage() {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? MOCK_TRANSACTIONS : MOCK_TRANSACTIONS.filter(t => t.type === filter);
  const successTxns = MOCK_TRANSACTIONS.filter(t => t.status === 'success');

  const columns = [
    { key:'id',     header:'Txn ID',  accessor:'id',         render: r => <span className="text-xs font-mono" style={{ color: '#7a94ab' }}>{r.id}</span> },
    { key:'date',   header:'Date',    accessor:'date',       sortable: true, render: r => <span className="text-xs" style={{ color: '#b0c4d8' }}>{formatDate(r.date)}</span> },
    { key:'scheme', header:'Scheme',  accessor:'schemeName', render: r => <span className="text-sm font-semibold text-white">{r.schemeName}</span> },
    { key:'type',   header:'Type',    accessor:'type',       render: r => <Badge variant={r.type==='BUY'?'success':r.type==='SIP'?'info':'warning'}>{r.type}</Badge> },
    { key:'amount', header:'Amount',  accessor:'amount',     sortable: true, render: r => <span className="font-bold text-white">{formatCurrency(r.amount)}</span> },
    { key:'units',  header:'Units',   accessor:'units',      render: r => <span className="text-xs" style={{ color: '#b0c4d8' }}>{r.units}</span> },
    { key:'nav',    header:'NAV',     accessor:'nav',        render: r => <span className="text-xs" style={{ color: '#b0c4d8' }}>₹{r.nav}</span> },
    { key:'status', header:'Status',  accessor:'status',     render: r => <Badge variant={getStatusColor(r.status).replace('badge-','')}>{r.status}</Badge> },
  ];

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
        style={{ marginBottom: '2.25rem' }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>History</p>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Transactions</h1>
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        </div>
        <Button variant="secondary" icon={Download} size="md" id="export-txn">Export CSV</Button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8" style={{ marginBottom: '2.5rem' }}>
        {[
          { label:'Total Transactions', val: MOCK_TRANSACTIONS.length,   color: '#12B4C3' },
          { label:'Total Invested',     val: formatCurrency(successTxns.reduce((a,t)=>a+t.amount,0),true), color: '#fff' },
          { label:'Successful',         val: successTxns.length,         color: '#34d399' },
          { label:'Failed',             val: MOCK_TRANSACTIONS.filter(t=>t.status==='failed').length, color: '#f87171' },
        ].map(s => (
          <div key={s.label}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem',
              borderRadius: '16px',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400" style={{ fontSize: '0.7rem' }}>{s.label}</p>
            <p className="text-2xl font-black mt-2" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ marginBottom: '2rem' }}>
        {['All','BUY','SIP','REDEEM'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="flex-shrink-0 rounded-full transition-all border"
            style={filter === f
              ? { background: 'linear-gradient(135deg,#0B667E,#12B4C3)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(18,180,195,0.25)', fontSize: '0.825rem', fontWeight: 700, padding: '0.55rem 1.25rem' }
              : { background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.825rem', fontWeight: 600, padding: '0.55rem 1.25rem' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Data Table Card Wrapper */}
      <div className="rounded-2xl" style={CARD}>
        <DataTable columns={columns} data={filtered} searchable searchPlaceholder="Search transactions..." pageSize={8} />
      </div>
    </div>
  );
}
