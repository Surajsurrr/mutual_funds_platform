import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../../utils/mockData';
import { DataTable } from '../../components/UI/DataTable';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/formatters';

const CARD = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };

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
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#42b4ff' }}>History</p>
          <h1 className="text-2xl font-black text-white">Transactions</h1>
          <div className="section-divider mt-2" />
        </div>
        <Button variant="secondary" icon={Download} size="sm" id="export-txn">Export CSV</Button>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Total Transactions', val: MOCK_TRANSACTIONS.length,   color: '#42b4ff' },
          { label:'Total Invested',     val: formatCurrency(successTxns.reduce((a,t)=>a+t.amount,0),true), color: '#fff' },
          { label:'Successful',         val: successTxns.length,         color: '#34d399' },
          { label:'Failed',             val: MOCK_TRANSACTIONS.filter(t=>t.status==='failed').length, color: '#f87171' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#0f2442', border: '1px solid rgba(27,154,245,0.08)' }}>
            <p className="text-xs" style={{ color: '#7a94ab' }}>{s.label}</p>
            <p className="text-xl font-black mt-1" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {['All','BUY','SIP','REDEEM'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold border transition-all"
            style={filter === f
              ? { background: 'linear-gradient(135deg,#0e7ee4,#1b9af5)', color: '#fff', borderColor: 'transparent' }
              : { background: 'rgba(27,154,245,0.06)', color: '#b0c4d8', borderColor: 'rgba(27,154,245,0.15)' }}>
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={CARD}>
        <DataTable columns={columns} data={filtered} searchable searchPlaceholder="Search transactions..." pageSize={8} />
      </div>
    </div>
  );
}
