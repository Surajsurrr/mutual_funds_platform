import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserCheck, ShieldAlert, Award, Ban, CheckCircle2, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/UI/DataTable';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { StatsCard } from '../../components/UI/StatsCard';
import { useAdminUsers } from '../../api/useApi';
import { writeClient } from '../../api/axiosClients';
import toast from 'react-hot-toast';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};




export default function AdminUsersPage() {
  const { data: apiUsers, refetch } = useAdminUsers();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const users = apiUsers ?? [];
  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase()) ||
                          u.id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const STATUS_CYCLE = { Active: 'Suspended', Suspended: 'Blocked', Blocked: 'Active', Flagged: 'Active' };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = STATUS_CYCLE[currentStatus] || 'Active';
    try {
      await writeClient.patch(`/admin/users/${id}/status`, { status: nextStatus });
      toast.success(`User status updated to ${nextStatus}`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = (id) => {
    toast('User deletion requires admin console access.', { icon: '⚠️' });
  };

  const columns = [
    { key:'id',        header:'User ID', accessor:'id', render: r => <span className="text-xs font-mono" style={{ color: '#7a94ab' }}>{r.id}</span> },
    { key:'name',      header:'User Name', accessor:'name', render: r => (
      <div>
        <p className="font-semibold text-white text-sm">{r.name}</p>
        <p className="text-[10px]" style={{ color: '#7a94ab' }}>{r.email}</p>
      </div>
    )},
    { key:'role',      header:'System Role', accessor:'role', render: r => {
      const variant = r.role === 'admin' ? 'danger' : r.role === 'amc' ? 'warning' : r.role === 'cb' ? 'info' : 'success';
      return <Badge variant={variant}>{r.role.toUpperCase()}</Badge>;
    }},
    { key:'status',    header:'Status',      accessor:'status', render: r => {
      const variant = r.status === 'Active' ? 'success' : r.status === 'Suspended' ? 'warning' : 'danger';
      return <Badge variant={variant}>{r.status}</Badge>;
    }},
    { key:'joined',    header:'Date Joined', accessor:'joined', render: r => <span className="text-xs text-slate-300">{r.joined}</span> },
    { key:'actions',   header:'Actions',     render: r => (
      <div className="flex gap-2">
        <button onClick={() => handleToggleStatus(r.id, r.status)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: r.status === 'Blocked' ? '#34d399' : '#f87171' }} title="Toggle Lock Status">
          <Ban size={14} />
        </button>
        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#f87171' }} title="Remove User">
          <Trash2 size={14} />
        </button>
      </div>
    )},
  ];

  const totalClients = users.filter(u => u.role === 'client').length;
  const totalCBs = users.filter(u => u.role === 'cb').length;
  const totalAMCs = users.filter(u => u.role === 'amc').length;

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.25rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f87171' }}>🛡 System</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>System Users</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #f87171 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Inspect credentials, lock compromised accounts, and audit permissions list</p>
      </motion.div>

      {/* Stats block */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" style={{ marginBottom: '2.5rem' }}>
        <StatsCard title="Total Accounts"    value={users.length.toString()} icon={Users}       accentColor="blue"    delay={0} />
        <StatsCard title="Retail Investors"  value={totalClients.toString()} icon={UserCheck}   accentColor="emerald" delay={0.1} />
        <StatsCard title="Corporate Banks"   value={totalCBs.toString()}     icon={Award}       accentColor="amber"   delay={0.15} />
        <StatsCard title="AMC Managers"      value={totalAMCs.toString()}    icon={ShieldAlert} accentColor="rose"    delay={0.2} />
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl" style={{ ...CARD, marginBottom: '2.25rem' }}>
        <div className="relative" style={{ marginBottom: '1.5rem' }}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#f87171' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users by Name, ID, or Email..."
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
          <span className="text-xs font-bold uppercase tracking-wider mr-2" style={{ color: '#7a94ab', fontSize: '0.7rem' }}>Filter Role:</span>
          {['All', 'client', 'cb', 'amc', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="flex-shrink-0 rounded-full transition-all border"
              style={roleFilter === r
                ? { background: 'linear-gradient(135deg,#c2410c,#f97316)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(249,115,22,0.25)', fontSize: '0.825rem', fontWeight: 700, padding: '0.55rem 1.25rem' }
                : { background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.825rem', fontWeight: 600, padding: '0.55rem 1.25rem' }}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid Wrapper */}
      <div className="rounded-2xl" style={CARD}>
        <DataTable columns={columns} data={filtered} searchable={false} pageSize={8} />
      </div>
    </div>
  );
}
