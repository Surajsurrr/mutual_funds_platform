import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Building2, TrendingUp, Activity, Settings, Check, X } from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { Button } from '../../components/UI/Button';
import { useAdminStats, useAdminAnalytics, useAdminPending, useAdminSystem } from '../../api/useApi';
import { writeClient } from '../../api/axiosClients';
import { formatNumber } from '../../utils/formatters';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

const GROWTH = Array.from({ length: 12 }, (_,i) => ({
  month: ['J','F','M','A','M','J','J','A','S','O','N','D'][i],
  users: Math.floor(200000 + i*9500 + Math.random()*5000),
  txns:  Math.floor(500000 + i*60000),
}));

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

const TOOLTIP = {
  background: '#111b30',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  fontSize: 12,
  color: '#d9e4ef'
};

const LABEL = { color: '#7a94ab' };

const PENDING_AMCS = [
  { id:'A43', name:'Sundaram Mutual Fund', applied:'2026-06-25', aum:'₹12,400 Cr' },
  { id:'A44', name:'Motilal Oswal AMC',    applied:'2026-06-28', aum:'₹8,900 Cr'  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats }    = useAdminStats();
  const { data: analytics } = useAdminAnalytics();
  const { data: pending, refetch: refetchPending } = useAdminPending();
  const { data: system }   = useAdminSystem();

  const growthData  = analytics?.growth    ?? [];
  const pendingAmcs = pending             ?? [];

  const handleApprove = async (id) => {
    try {
      await writeClient.post(`/admin/amcs/${id}/approve`);
      toast.success('AMC approved!');
      refetchPending();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await writeClient.post(`/admin/amcs/${id}/reject`);
      toast.success('AMC rejected.');
      refetchPending();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject');
    }
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.25rem' }}>

        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f87171' }}>🛡 System</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Admin Console</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #f87171 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>System-wide overview and management</p>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-6" style={{ marginBottom: '2.5rem' }}>
        {[
          { title:'Total Users',  value: formatNumber(stats?.totalUsers ?? 0),        color:'blue',    icon:Users },
          { title:'Active AMCs',  value: stats?.totalAMCs ?? 0,                       color:'emerald', icon:Building2 },
          { title:'Total AUM',    value: stats?.totalAUM ?? '—',                      color:'amber',   icon:TrendingUp },
          { title:'Transactions', value: formatNumber(stats?.totalTransactions ?? 0), color:'blue',    icon:Activity },
          { title:'Active Now',   value: formatNumber(stats?.activeUsers ?? 0),       color:'emerald', icon:Users },
          { title:'New Today',    value: stats?.newUsersToday ?? 0,                   color:'rose',    icon:Users },
        ].map((s,i) => <StatsCard key={s.title} {...s} delay={i*0.06} />)}
      </div>

      {/* Growth & Transactions Row */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-10" style={{ marginBottom: '2.5rem' }}>
        {/* User Growth Line Chart */}
        <div className="rounded-2xl" style={CARD}>
          <h2 className="text-base font-bold text-white mb-5">User Growth</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v=>[v.toLocaleString('en-IN'),'Users']} contentStyle={TOOLTIP} labelStyle={LABEL} />
                <Line type="monotone" dataKey="users" stroke="#12B4C3" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions Bar Chart */}
        <div className="rounded-2xl" style={CARD}>
          <h2 className="text-base font-bold text-white mb-5">Monthly Transactions</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7a94ab' }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v=>[v.toLocaleString('en-IN'),'Transactions']} contentStyle={TOOLTIP} labelStyle={LABEL} />
                <Bar dataKey="txns" radius={[4,4,0,0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending AMC Approvals Card */}
      <div className="rounded-2xl"
        style={{
          background: 'rgba(245,158,11,0.02)',
          border: '1px solid rgba(245,158,11,0.15)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '2.25rem',
          marginBottom: '2.5rem'
        }}>
        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <Building2 size={17} className="text-amber-400" />
          Pending AMC Approvals
          <span className="ml-1 px-2.5 py-0.5 text-xs font-bold rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
            {pendingAmcs.length}
          </span>
        </h2>
        <div className="space-y-3">
          {pendingAmcs.length === 0 && (
            <p className="text-sm" style={{ color: '#7a94ab' }}>No pending approvals</p>
          )}
          {pendingAmcs.map(amc => (
            <div key={amc.id} className="flex items-center justify-between rounded-xl border flex-wrap gap-4"
              style={{ padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.1)' }}>
              <div>
                <p className="font-semibold text-white text-sm">{amc.name}</p>
                <p className="text-xs mt-1" style={{ color: '#7a94ab' }}>Applied: {amc.applied} • AUM: {amc.aum}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="success" size="sm" icon={Check} onClick={() => handleApprove(amc.id)}>Approve</Button>
                <Button variant="danger"  size="sm" icon={X}     onClick={() => handleReject(amc.id)}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="rounded-2xl" style={CARD}>
        <h2 className="text-base font-bold text-white mb-5">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users,    label:'Manage Users',   color:'#12B4C3', bg:'rgba(18,180,195,0.1)', to:'/admin/users' },
            { icon: Building2,label:'Manage AMCs',    color:'#34d399', bg:'rgba(16,185,129,0.1)', to:'/admin/amcs' },
            { icon: Activity, label:'View Analytics', color:'#fbbf24', bg:'rgba(245,158,11,0.1)', to:'/admin/analytics' },
            { icon: Settings, label:'System Settings',color:'#f87171', bg:'rgba(239,68,68,0.1)',  to:'/admin/settings' },
          ].map(action => (
            <button key={action.label} onClick={() => navigate(action.to)}
              className="flex flex-col items-center gap-3 rounded-xl transition-all group cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem 1rem' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(18,180,195,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
              <div className="p-3 rounded-xl transition-transform group-hover:scale-110" style={{ background: action.bg }}>
                <action.icon size={20} style={{ color: action.color }} />
              </div>
              <span className="text-xs font-semibold text-center mt-1" style={{ color: '#b0c4d8' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
