import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Play, Pause } from 'lucide-react';
import { DataTable } from '../../components/UI/DataTable';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { useAmcSchemes } from '../../api/useApi';
import { writeClient } from '../../api/axiosClients';
import { getRiskColor, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

const CATEGORIES = ['All', 'Large Cap', 'Mid Cap', 'Small Cap', 'Value', 'ELSS'];
const RISK_LEVELS = ['Low', 'Moderate', 'High', 'Very High'];

export default function AMCSchemesPage() {
  const { data: apiSchemes, refetch } = useAmcSchemes();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  
  // Form states
  const [name, setName] = useState('');
  const [cat, setCat] = useState('Large Cap');
  const [nav, setNav] = useState('');
  const [aum, setAum] = useState('');
  const [risk, setRisk] = useState('Moderate');

  const schemes = apiSchemes ?? [];
  const filtered = schemes.filter(s => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase());
    const mc = category === 'All' || s.category === category;
    return ms && mc;
  });

  const handleOpenAdd = () => {
    setEditingScheme(null);
    setName('');
    setCat('Large Cap');
    setNav('');
    setAum('');
    setRisk('Moderate');
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditingScheme(s);
    setName(s.name);
    setCat(s.category);
    setNav(s.nav);
    setAum(s.aum);
    setRisk(s.risk);
    setShowModal(true);
  };

  // Deep links from the dashboard: ?add=true opens the add modal, ?edit=<id> opens edit
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (searchParams.get('add') === 'true') {
      handleOpenAdd();
      setSearchParams({}, { replace: true });
    } else if (editId && apiSchemes) {
      const s = apiSchemes.find(x => x.id === editId);
      if (s) handleOpenEdit(s);
      setSearchParams({}, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiSchemes]);

  const handleSave = async () => {
    if (!name || !nav || !aum) {
      toast.error('Please fill out all fields');
      return;
    }
    try {
      if (editingScheme) {
        await writeClient.patch(`/amc/schemes/${editingScheme.id}`, {
          name, category: cat, nav: parseFloat(nav), aumCr: parseFloat(aum), risk
        });
        toast.success('Scheme updated!');
      } else {
        await writeClient.post('/amc/schemes', {
          name, category: cat, nav: parseFloat(nav), aumCr: parseFloat(aum), risk,
          minSip: 500, minLumpsum: 1000,
        });
        toast.success('Scheme created!');
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save scheme');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;
    try {
      await writeClient.delete(`/amc/schemes/${id}`);
      toast.success('Scheme deleted.');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete scheme');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const next = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await writeClient.patch(`/amc/schemes/${id}`, { status: next });
      toast.success(`Scheme ${next === 'Active' ? 'activated' : 'suspended'}`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const columns = [
    { key:'name',     header:'Scheme Name',  accessor:'name', render: r => (
      <div>
        <span className="font-semibold text-white text-sm">{r.name}</span>
        {r.status === 'suspended' && (
          <span className="text-[9px] font-black uppercase text-red-400 bg-red-400/10 border border-red-500/20 px-1.5 py-0.5 rounded ml-2">Suspended</span>
        )}
      </div>
    )},
    { key:'category', header:'Category',    accessor:'category', render: r => (
      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(18,180,195,0.1)', color: '#12B4C3' }}>
        {r.category}
      </span>
    )},
    { key:'nav',      header:'NAV',         accessor:'nav', render: r => <span className="font-bold text-white">₹{r.nav}</span> },
    { key:'returns',  header:'1Y Returns',  accessor:'returns1Y', render: r => <span className="font-bold text-emerald-400">{r.returns1Y}%</span> },
    { key:'aum',      header:'AUM (Cr)',    accessor:'aum', render: r => <span className="text-white">₹{r.aum} Cr</span> },
    { key:'risk',     header:'Risk',        accessor:'risk', render: r => <Badge variant={getRiskColor(r.risk).replace('badge-','')}>{r.risk}</Badge> },
    { key:'actions',  header:'Actions',     render: r => (
      <div className="flex gap-2">
        <button onClick={() => handleOpenEdit(r)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#12B4C3' }}>
          <Edit size={14} />
        </button>
        <button onClick={() => handleToggleStatus(r.id, r.status)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: r.status === 'Suspended' ? '#34d399' : '#fbbf24' }}>
          {r.status === 'suspended' ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#f87171' }}>
          <Trash2 size={14} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4"
        style={{ marginBottom: '2.25rem' }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>AMC Portal</p>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>AMC Schemes</h1>
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
          <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Configure and release mutual fund schemes under your AMC license</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>Add New Scheme</Button>
      </motion.div>

      {/* Filter panel */}
      <div className="rounded-2xl" style={{ ...CARD, marginBottom: '2.25rem' }}>
        <div className="relative" style={{ marginBottom: '1.5rem' }}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#12B4C3' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search schemes..."
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
          <span className="text-xs font-bold uppercase tracking-wider mr-2" style={{ color: '#7a94ab', fontSize: '0.7rem' }}>Category:</span>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className="flex-shrink-0 rounded-full transition-all border"
              style={category === c
                ? { background: 'linear-gradient(135deg,#0B667E,#12B4C3)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(18,180,195,0.25)', fontSize: '0.825rem', fontWeight: 700, padding: '0.55rem 1.25rem' }
                : { background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.825rem', fontWeight: 600, padding: '0.55rem 1.25rem' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid Wrapper */}
      <div className="rounded-2xl" style={CARD}>
        <DataTable columns={columns} data={filtered} searchable={false} pageSize={8} />
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingScheme ? 'Edit Scheme' : 'Add New Scheme'} size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Scheme</Button>
          </>
        }>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Scheme Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. HDFC Bluechip Fund"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                color: '#ffffff',
                padding: '0.75rem 1rem',
                outline: 'none',
                fontSize: '0.85rem',
                width: '100%',
              }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Category</label>
              <select value={cat} onChange={e => setCat(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  padding: '0.75rem 1rem',
                  outline: 'none',
                  fontSize: '0.85rem',
                  width: '100%',
                }}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c} style={{ background: '#202C44' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Risk Level</label>
              <select value={risk} onChange={e => setRisk(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  padding: '0.75rem 1rem',
                  outline: 'none',
                  fontSize: '0.85rem',
                  width: '100%',
                }}>
                {RISK_LEVELS.filter(r => r !== 'All').map(r => <option key={r} value={r} style={{ background: '#202C44' }}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">NAV (₹)</label>
              <input type="number" value={nav} onChange={e => setNav(e.target.value)} placeholder="e.g. 154.32"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  padding: '0.75rem 1rem',
                  outline: 'none',
                  fontSize: '0.85rem',
                  width: '100%',
                }} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">AUM (Cr)</label>
              <input type="number" value={aum} onChange={e => setAum(e.target.value)} placeholder="e.g. 18340"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  padding: '0.75rem 1rem',
                  outline: 'none',
                  fontSize: '0.85rem',
                  width: '100%',
                }} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
