import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../../utils/mockData';
import { DataTable } from '../../components/UI/DataTable';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/formatters';

const TYPE_COLORS = { BUY: 'success', SIP: 'info', REDEEM: 'danger' };

export default function TransactionHistoryPage() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All'
    ? MOCK_TRANSACTIONS
    : MOCK_TRANSACTIONS.filter(t => t.type === filter);

  const columns = [
    {
      key: 'id',
      header: 'Txn ID',
      accessor: 'id',
      render: (row) => <span className="text-xs font-mono text-slate-400">{row.id}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      accessor: 'date',
      sortable: true,
      render: (row) => <span className="text-xs">{formatDate(row.date)}</span>,
    },
    {
      key: 'scheme',
      header: 'Scheme',
      accessor: 'schemeName',
      render: (row) => <span className="text-sm font-semibold text-white">{row.schemeName}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      accessor: 'type',
      render: (row) => <Badge variant={TYPE_COLORS[row.type] || 'neutral'}>{row.type}</Badge>,
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: 'amount',
      sortable: true,
      render: (row) => <span className="font-bold text-white">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'units',
      header: 'Units',
      accessor: 'units',
      sortable: true,
      render: (row) => <span className="text-xs">{row.units}</span>,
    },
    {
      key: 'nav',
      header: 'NAV',
      accessor: 'nav',
      render: (row) => <span className="text-xs">₹{row.nav}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={getStatusColor(row.status).replace('badge-', '')}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Transaction History</h1>
          <p className="text-slate-400 mt-1">All your investment transactions</p>
        </div>
        <Button variant="secondary" icon={Download} size="sm" id="export-txn">
          Export CSV
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Transactions', val: MOCK_TRANSACTIONS.length, color: 'text-blue-400' },
          { label: 'Total Invested', val: formatCurrency(MOCK_TRANSACTIONS.filter(t => t.status === 'success').reduce((a, t) => a + t.amount, 0), true), color: 'text-white' },
          { label: 'Successful', val: MOCK_TRANSACTIONS.filter(t => t.status === 'success').length, color: 'text-emerald-400' },
          { label: 'Failed', val: MOCK_TRANSACTIONS.filter(t => t.status === 'failed').length, color: 'text-rose-400' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-4 border border-blue-600/10">
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className={`text-xl font-black mt-1 ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['All', 'BUY', 'SIP', 'REDEEM'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f ? 'gradient-primary text-white' : 'glass text-slate-400 hover:text-white border border-blue-600/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl p-6 border border-blue-600/10">
        <DataTable
          columns={columns}
          data={filtered}
          searchable
          searchPlaceholder="Search transactions..."
          pageSize={8}
        />
      </div>
    </div>
  );
}
