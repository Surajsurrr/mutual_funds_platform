import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldAlert, Award, UserPlus, Search, Edit2, Ban, Eye } from 'lucide-react';
import { DataTable } from '../../components/UI/DataTable';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { StatsCard } from '../../components/UI/StatsCard';
import { Modal } from '../../components/UI/Modal';
import { useCbClients } from '../../api/useApi';
import { writeClient } from '../../api/axiosClients';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

const INPUT_STYLE = {
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  color: '#ffffff',
  padding: '0.7rem 0.9rem',
  outline: 'none',
  fontSize: '0.85rem',
  width: '100%',
  fontFamily: 'Inter, sans-serif',
};

const EMPTY_FORM = {
  name: '', email: '', password: '', phone: '', dob: '',
  pan: '', aadhaar: '', bankAccount: '', ifsc: '',
};

export default function CBClientsPage() {
  const { data: apiClients, refetch } = useCbClients();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Onboarding modal
  const [showOnboard, setShowOnboard] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [onboarding, setOnboarding] = useState(false);

  const setField = (key, transform) => e =>
    setForm(f => ({ ...f, [key]: transform ? transform(e.target.value) : e.target.value }));

  const fillSample = () => {
    const n = Math.floor(Math.random() * 9000) + 1000;
    setForm({
      name: `Demo Client ${n}`,
      email: `client${n}@example.com`,
      password: 'demo1234',
      phone: '9' + String(Math.floor(Math.random() * 1e9)).padStart(9, '0'),
      dob: '1992-06-15',
      pan: `ABCDE${n}F`,
      aadhaar: String(Math.floor(Math.random() * 9e11) + 1e11),
      bankAccount: String(Math.floor(Math.random() * 9e10) + 1e10),
      ifsc: `HDFC0${n}01`,
    });
  };

  const handleOnboard = async () => {
    const errs = [];
    if (form.name.trim().length < 2) errs.push('name (min 2 chars)');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.push('valid email');
    if (form.password.length < 8) errs.push('password (min 8 chars)');
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.push('10-digit phone starting with 6-9');
    if (!form.dob) errs.push('date of birth');
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan)) errs.push('PAN like ABCDE1234F');
    if (!/^\d{12}$/.test(form.aadhaar)) errs.push('12-digit Aadhaar');
    if (form.bankAccount.trim().length < 9) errs.push('bank account (min 9 digits)');
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc)) errs.push('IFSC like HDFC0001234');
    if (errs.length) { toast.error(`Check: ${errs.join(', ')}`); return; }

    setOnboarding(true);
    try {
      await writeClient.post('/auth/register', {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        bankAccount: form.bankAccount.trim(),
      });
      toast.success('Client onboarded! KYC verification is running in the background.');
      setShowOnboard(false);
      setForm(EMPTY_FORM);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to onboard client');
    } finally {
      setOnboarding(false);
    }
  };

  const clients = apiClients ?? [];
  const filtered = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.email.toLowerCase().includes(search.toLowerCase()) ||
                          c.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (id, currentStatus) => {
    let nextStatus = 'Active';
    if (currentStatus === 'Active') nextStatus = 'Suspended';
    else if (currentStatus === 'Suspended') nextStatus = 'Active';
    else if (currentStatus === 'Flagged') nextStatus = 'Active';

    try {
      await writeClient.patch(`/cb/clients/${id}/status`, { status: nextStatus });
      toast.success(`Client status updated to ${nextStatus}`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
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
        <button onClick={() => handleReviewClient(r)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#12B4C3' }} title="Review Account">
          <Eye size={14} />
        </button>
        <button onClick={() => handleToggleStatus(r.id, r.status)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: r.status === 'Suspended' ? '#34d399' : '#f87171' }} title={r.status === 'Suspended' ? 'Reactivate' : 'Suspend Account'}>
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
        <Button variant="primary" icon={UserPlus} onClick={() => setShowOnboard(true)} id="onboard-client">Onboard Client</Button>
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

      {/* Onboarding Modal */}
      <Modal isOpen={showOnboard} onClose={() => setShowOnboard(false)} title="Onboard New Client" size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowOnboard(false)} disabled={onboarding}>Cancel</Button>
            <Button variant="secondary" onClick={fillSample} disabled={onboarding} id="fill-sample">🎲 Fill Sample</Button>
            <Button variant="primary" onClick={handleOnboard} loading={onboarding} id="submit-onboard">Onboard Client</Button>
          </>
        }>
        <div className="space-y-4">
          <p className="text-xs leading-relaxed" style={{ color: '#7a94ab' }}>
            Registers the client instantly — KYC and penny-drop verification run asynchronously in the background.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'name',        label: 'Full Name',     placeholder: 'Priya Sharma' },
              { key: 'email',       label: 'Email',         placeholder: 'priya@example.com', type: 'email' },
              { key: 'phone',       label: 'Phone (10 digits)', placeholder: '9876543210' },
              { key: 'dob',         label: 'Date of Birth', type: 'date' },
              { key: 'pan',         label: 'PAN',           placeholder: 'ABCDE1234F', upper: true },
              { key: 'aadhaar',     label: 'Aadhaar (12 digits)', placeholder: '123412341234' },
              { key: 'bankAccount', label: 'Bank Account No.', placeholder: '50100123456789' },
              { key: 'ifsc',        label: 'IFSC',          placeholder: 'HDFC0001234', upper: true },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#7a94ab' }}>{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={form[f.key]}
                  onChange={setField(f.key, f.upper ? v => v.toUpperCase() : undefined)}
                  placeholder={f.placeholder}
                  style={INPUT_STYLE}
                  className="focus:border-[#12B4C3]"
                  id={`onboard-${f.key}`} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#7a94ab' }}>Login Password (min 8 chars)</label>
              <input type="text" value={form.password} onChange={setField('password')}
                placeholder="Set an initial password for the client"
                style={INPUT_STYLE} className="focus:border-[#12B4C3]" id="onboard-password" />
            </div>
          </div>
        </div>
      </Modal>

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
