import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ShieldAlert, BadgePercent, ShieldCheck, Database, Save } from 'lucide-react';
import { Button } from '../../components/UI/Button';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState('FundFlow');
  const [supportEmail, setSupportEmail] = useState('support@fundflow.in');
  const [minLumpsum, setMinLumpsum] = useState('1000');
  const [minSIP, setMinSIP] = useState('500');
  const [commission, setCommission] = useState('0.15');
  const [requireKYC, setRequireKYC] = useState(true);
  const [fraudLimit, setFraudLimit] = useState('10.0'); // In lakhs

  const handleSave = () => {
    alert('System configurations saved successfully!');
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.5rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f87171' }}>🛡 System</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>System Settings</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #f87171 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Configure transaction thresholds, automated switch limits, and compliance status controls</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-10" style={{ marginBottom: '2.5rem' }}>
        {/* General Settings */}
        <div className="rounded-2xl space-y-4" style={CARD}>
          <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Settings size={18} className="text-[#f87171]" /> General Parameters
          </h2>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Platform Brand Name</label>
            <input type="text" value={platformName} onChange={e => setPlatformName(e.target.value)}
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
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">System Support Contact Email</label>
            <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)}
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

        {/* Transaction Limits */}
        <div className="rounded-2xl space-y-4" style={CARD}>
          <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Database size={18} className="text-emerald-400" /> Transaction Thresholds
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Min Lumpsum (₹)</label>
              <input type="number" value={minLumpsum} onChange={e => setMinLumpsum(e.target.value)}
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Min SIP Policy (₹)</label>
              <input type="number" value={minSIP} onChange={e => setMinSIP(e.target.value)}
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
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Base AMC Commission Surcharge (%)</label>
            <input type="number" step="0.01" value={commission} onChange={e => setCommission(e.target.value)}
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

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-10" style={{ marginBottom: '2.5rem' }}>
        {/* Compliance and Risk Limits */}
        <div className="rounded-2xl space-y-4" style={CARD}>
          <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-400" /> Compliance & Guardrails
          </h2>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Automated Fraud Limit Threshold (₹ Lakhs)</label>
            <input type="number" value={fraudLimit} onChange={e => setFraudLimit(e.target.value)}
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
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-semibold text-white">Require KYC Verification</p>
              <p className="text-xs text-slate-400 mt-0.5">Force investors to pass KYC before executing orders</p>
            </div>
            <input type="checkbox" checked={requireKYC} onChange={e => setRequireKYC(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-[#f87171] focus:ring-[#f87171]" />
          </div>
        </div>

        {/* Action Panel */}
        <div className="rounded-2xl flex flex-col justify-between" style={CARD}>
          <div>
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-400" /> System Integrity
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Saving these settings will commit changes directly to the configuration store. All future transactions, validations, and AMC audits will reference these updated thresholds immediately.
            </p>
          </div>
          <div className="mt-8 pt-4">
            <Button variant="primary" icon={Save} onClick={handleSave} style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)', boxShadow: '0 4px 16px rgba(239, 68, 68, 0.25)' }} fullWidth>
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
