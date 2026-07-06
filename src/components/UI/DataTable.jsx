import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Spinner, EmptyState } from './Badge';

export const DataTable = ({ columns, data = [], loading = false, emptyTitle = 'No data found',
  emptyDescription = '', searchable = false, searchPlaceholder = 'Search...', pageSize = 10, variant = 'dark', onRowClick }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter(row =>
      columns.some(col => String(col.accessor ? row[col.accessor] : '').toLowerCase().includes(search.toLowerCase()))
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey], bVal = b[sortKey];
      const cmp  = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize);

  const isDark = variant === 'dark';

  return (
    <div className="flex flex-col gap-4">
      {searchable && (
        <div className="relative max-w-sm" style={{ marginBottom: '0.5rem' }}>
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: isDark ? '#12B4C3' : '#7a94ab' }} />
          <input type="text" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            style={isDark ? {
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              color: '#ffffff',
              padding: '0.625rem 1rem 0.625rem 2.5rem',
              outline: 'none',
              fontSize: '0.85rem',
              width: '100%',
              fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.2s',
            } : {}}
            className={isDark ? 'focus:border-[#12B4C3]' : 'input-field pl-9 py-2 text-sm'} />
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(27,154,245,0.1)' }}>
        <div className="overflow-x-auto">
          <table className={`data-table ${isDark ? 'data-table-dark' : ''}`}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key} onClick={col.sortable ? () => handleSort(col.accessor || col.key) : undefined}
                    className={col.sortable ? 'cursor-pointer select-none' : ''}>
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && (
                        <span className="flex flex-col">
                          <ChevronUp  size={10} style={{ color: sortKey === (col.accessor || col.key) && sortDir === 'asc'  ? (isDark ? '#12B4C3' : '#1b9af5') : '#264470' }} />
                          <ChevronDown size={10} style={{ color: sortKey === (col.accessor || col.key) && sortDir === 'desc' ? (isDark ? '#12B4C3' : '#1b9af5') : '#264470' }} />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length} className="text-center py-16"><Spinner className="mx-auto" /></td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={columns.length}><EmptyState title={emptyTitle} description={emptyDescription} /></td></tr>
              ) : (
                paginated.map((row, i) => (
                  <tr key={row.id || i} onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={onRowClick ? 'cursor-pointer' : ''}>
                    {columns.map(col => (
                      <td key={col.key}>{col.render ? col.render(row) : row[col.accessor || col.key]}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm mt-2" style={{ color: '#7a94ab' }}>
          <span>
            Showing {Math.min((page-1)*pageSize+1, sorted.length)}–{Math.min(page*pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ color: '#b0c4d8' }}
              onMouseEnter={e => e.currentTarget.style.background=isDark?'rgba(255,255,255,0.03)':'rgba(27,154,245,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page <= 3 ? i+1 : page+i-2;
              if (pg < 1 || pg > totalPages) return null;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                  style={pg === page
                    ? { background: isDark ? 'linear-gradient(135deg,#0B667E,#12B4C3)' : 'linear-gradient(135deg,#0e7ee4,#1b9af5)', color: '#fff', boxShadow: isDark ? '0 4px 12px rgba(18,180,195,0.25)' : '' }
                    : { color: '#7a94ab' }}>
                  {pg}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ color: '#b0c4d8' }}
              onMouseEnter={e => e.currentTarget.style.background=isDark?'rgba(255,255,255,0.03)':'rgba(27,154,245,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
