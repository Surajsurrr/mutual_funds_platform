import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Table2, Search, ChevronLeft, ChevronRight, Columns3 } from 'lucide-react';
import { useAdminDbTables, useAdminDbRows } from '../../api/useApi';
import { Spinner } from '../../components/UI/Badge';

const CARD = { background: '#121C33', border: '1px solid rgba(18,180,195,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };

// Render a raw DB cell value for display.
const renderCell = (v) => {
  if (v === null || v === undefined)
    return <span className="italic" style={{ color: '#4b5f7a' }}>null</span>;
  if (typeof v === 'boolean')
    return <span style={{ color: v ? '#34d399' : '#f87171' }}>{String(v)}</span>;
  if (typeof v === 'object')
    return <span className="font-mono text-xs" style={{ color: '#B4C4D8' }}>{JSON.stringify(v)}</span>;
  const s = String(v);
  return s.length > 64 ? <span title={s}>{s.slice(0, 64)}…</span> : s;
};

export default function AdminDatabasePage() {
  const { data: tables, loading: tablesLoading } = useAdminDbTables();
  const [selected, setSelected]       = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);

  // Auto-select the first table once the list loads.
  useEffect(() => {
    if (!selected && tables && tables.length) setSelected(tables[0].name);
  }, [tables, selected]);

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const selectTable = (name) => {
    setSelected(name); setSearchInput(''); setSearch(''); setPage(1);
  };

  const { data, loading } = useAdminDbRows(selected, search, page, 50);
  const columns = data?.columns ?? [];
  const rows    = data?.rows ?? [];

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.25rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>Admin Console</p>
        <h1 className="page-title text-white">Database Explorer</h1>
        <div style={{ height: '2px', width: '3rem', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem' }} />
        <p className="text-sm mt-4" style={{ color: '#7E93AC' }}>Browse live tables and their real row data. Read-only.</p>
      </motion.div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr' }}>
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Table list */}
          <div className="rounded-2xl p-3 h-fit" style={CARD}>
            <p className="ds-eyebrow px-2 pt-2 pb-3">Tables{tables ? ` · ${tables.length}` : ''}</p>
            {tablesLoading ? (
              <div className="py-8 flex justify-center"><Spinner /></div>
            ) : (
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1">
                {(tables ?? []).map((t) => {
                  const active = selected === t.name;
                  return (
                    <button key={t.name} onClick={() => selectTable(t.name)}
                      className="flex items-center justify-between gap-3 rounded-xl flex-shrink-0 text-left transition-colors"
                      style={{
                        padding: '0.6rem 0.75rem',
                        background: active ? 'linear-gradient(135deg, rgba(18,180,195,0.16) 0%, rgba(11,102,126,0.05) 100%)' : 'transparent',
                        border: active ? '1px solid rgba(18,180,195,0.3)' : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                      <span className="flex items-center gap-2 min-w-0">
                        <Table2 size={14} style={{ color: active ? '#12B4C3' : '#7E93AC', flexShrink: 0 }} />
                        <span className="text-sm font-semibold truncate" style={{ color: active ? '#fff' : '#B4C4D8' }}>{t.name}</span>
                      </span>
                      <span className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#7E93AC' }}>{t.rowCount}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table viewer */}
          <div className="rounded-2xl overflow-hidden min-w-0" style={CARD}>
            <div className="flex items-center justify-between gap-3 flex-wrap p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Database size={16} style={{ color: '#12B4C3' }} /> {selected || '—'}
                </h2>
                <p className="text-xs mt-0.5 flex items-center gap-3" style={{ color: '#7E93AC' }}>
                  {data && <span>{data.total.toLocaleString('en-IN')} rows</span>}
                  {data && <span className="flex items-center gap-1"><Columns3 size={11} /> {columns.length} columns</span>}
                </p>
              </div>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#12B4C3' }} />
                <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search this table…"
                  className="input-field" style={{ paddingLeft: '2.25rem', minWidth: '240px', width: '100%' }} />
              </div>
            </div>

            <div className="data-table-wrapper">
              {loading && !data ? (
                <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
              ) : rows.length === 0 ? (
                <div className="py-20 text-center text-sm" style={{ color: '#7E93AC' }}>
                  No rows{search ? ` match “${search}”` : ' in this table'}.
                </div>
              ) : (
                <table className="data-table data-table-dark">
                  <thead>
                    <tr>
                      {columns.map((c) => (
                        <th key={c.name}>
                          <div className="flex flex-col gap-0.5">
                            <span>{c.name}</span>
                            <span className="text-[0.6rem] font-medium tracking-normal normal-case" style={{ color: '#4b5f7a' }}>{c.type}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        {columns.map((c) => (
                          <td key={c.name} className="whitespace-nowrap">{renderCell(r[c.name])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: '#7E93AC' }}>
                <span>Page {data.page} of {data.totalPages}</span>
                <div className="flex items-center gap-1">
                  <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    style={{ color: '#B4C4D8' }}
                    onMouseEnter={(e) => { if (page > 1) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    style={{ color: '#B4C4D8' }}
                    onMouseEnter={(e) => { if (page < data.totalPages) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
