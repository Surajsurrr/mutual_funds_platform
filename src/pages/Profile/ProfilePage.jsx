import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, CreditCard, ShieldCheck, Clock, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { writeClient } from '../../api/axiosClients';
import { Button } from '../../components/UI/Button';
import { getRoleLabel } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2rem',
};

const INPUT_STYLE = {
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '14px',
  color: '#ffffff',
  padding: '0.875rem 1rem',
  outline: 'none',
  fontSize: '0.875rem',
  width: '100%',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s',
};

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName]   = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const kycVerified = user?.kycStatus === 'verified';

  const handleSave = async () => {
    if (name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
    if (phone.replace(/\D/g, '').length < 10) { toast.error('Enter a valid phone number'); return; }
    setSaving(true);
    try {
      const res = await writeClient.patch('/profile', { name: name.trim(), phone: phone.trim() });
      updateUser({ name: res.data.name, phone: res.data.phone });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const details = [
    { icon: Mail,        label: 'Email',        value: user?.email || '—' },
    { icon: CreditCard,  label: 'PAN',          value: user?.pan || '—' },
    { icon: ShieldCheck, label: 'KYC Status',   value: kycVerified ? 'Verified' : (user?.kycStatus || 'Pending'), accent: kycVerified ? '#34d399' : '#fbbf24' },
    { icon: Clock,       label: 'Member Since', value: user?.joinedAt || '—' },
  ];

  return (
    <div className="pb-8 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.25rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>Account</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>My Profile</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>View and update your account information</p>
      </motion.div>

      {/* Identity card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl flex items-center gap-5 flex-wrap" style={{ ...CARD, marginBottom: '1.75rem' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
          style={{ background: 'linear-gradient(135deg,#0B667E,#12B4C3)', boxShadow: '0 4px 16px rgba(18,180,195,0.3)', flexShrink: 0 }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{user?.name}</h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block mt-1.5"
            style={{ background: 'rgba(18,180,195,0.12)', color: '#12B4C3', border: '1px solid rgba(18,180,195,0.2)' }}>
            {getRoleLabel(user?.role)}
          </span>
        </div>
      </motion.div>

      {/* Account details */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="rounded-2xl" style={{ ...CARD, marginBottom: '1.75rem' }}>
        <h2 className="text-base font-bold text-white mb-5">Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {details.map(d => (
            <div key={d.label} className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(18,180,195,0.1)', border: '1px solid rgba(18,180,195,0.15)' }}>
                <d.icon size={16} style={{ color: '#12B4C3' }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold" style={{ color: '#7a94ab' }}>{d.label}</p>
                <p className="text-sm font-bold truncate mt-0.5" style={{ color: d.accent || '#ffffff' }}>{d.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Edit form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        className="rounded-2xl space-y-5" style={CARD}>
        <h2 className="text-base font-bold text-white">Edit Profile</h2>
        <div>
          <label className="text-xs font-bold text-slate-300 mb-2 block uppercase tracking-wider">Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            style={INPUT_STYLE} className="focus:border-[#12B4C3]" id="profile-name" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-300 mb-2 block uppercase tracking-wider">Phone</label>
          <div className="relative">
            <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#12B4C3' }} />
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              style={{ ...INPUT_STYLE, paddingLeft: '2.75rem' }} className="focus:border-[#12B4C3]" id="profile-phone" />
          </div>
        </div>
        <Button variant="primary" icon={Save} onClick={handleSave} loading={saving} id="profile-save">
          Save Changes
        </Button>
      </motion.div>
    </div>
  );
}
