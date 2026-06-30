import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Calculator } from 'lucide-react';
import { MOCK_SCHEMES } from '../../utils/mockData';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CARD = { background: '#0f2442', border: '1px solid rgba(27,154,245,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };

export default function BuyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const scheme = MOCK_SCHEMES.find(s => s.id === id) || MOCK_SCHEMES[0];

  const [mode,        setMode]        = useState('lumpsum');
  const [amount,      setAmount]      = useState('');
  const [sipDate,     setSipDate]     = useState('1');
  const [loading,     setLoading]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const units     = numAmount > 0 ? (numAmount / scheme.nav).toFixed(4) : 0;
  const minAmount = mode === 'sip' ? scheme.minSIP : scheme.minLumpsum;
  const isValid   = numAmount >= minAmount;

  const sipMonths = 36, r = 0.12 / 12;
  const sipFutureVal = numAmount > 0 ? numAmount * ((Math.pow(1+r,sipMonths)-1)/r)*(1+r) : 0;

  const handleOrder = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false); setShowConfirm(false); setOrderPlaced(true);
  };

  if (orderPlaced) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(16,185,129,0.15)', border: '3px solid #34d399' }}>
        <CheckCircle size={48} className="text-emerald-400" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
        <h2 className="text-3xl font-black text-white">Order Placed! 🎉</h2>
        <p className="mt-2" style={{ color: '#b0c4d8' }}>Your investment of <span className="text-white font-bold">{formatCurrency(numAmount)}</span> in</p>
        <p className="font-bold text-lg mt-1" style={{ color: '#42b4ff' }}>{scheme.name}</p>
        <div className="rounded-2xl p-5 mt-6 text-left space-y-2 max-w-sm mx-auto" style={CARD}>
          {[['Units', units],['NAV',`₹${scheme.nav}`],['Type',mode==='sip'?'SIP':'One-time'],['Status','⏳ Processing']].map(([l,v]) => (
            <p key={l} className="text-sm" style={{ color: '#b0c4d8' }}><span style={{ color: '#7a94ab' }}>{l}:</span> <span className="font-semibold text-white">{v}</span></p>
          ))}
        </div>
      </motion.div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate('/client/portfolio')}>View Portfolio</Button>
        <Button variant="primary" onClick={() => { setOrderPlaced(false); setAmount(''); }}>Invest More</Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium" style={{ color: '#7a94ab' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#42b4ff' }}>Invest Now</p>
        <h1 className="text-2xl font-black text-white">Buy Fund</h1>
        <div className="section-divider mt-2" />
      </motion.div>

      {/* Fund Info */}
      <div className="rounded-2xl p-5 flex items-center justify-between" style={CARD}>
        <div>
          <p className="font-bold text-white text-sm">{scheme.name}</p>
          <p className="text-xs" style={{ color: '#7a94ab' }}>{scheme.category} • {scheme.risk} Risk</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-white">₹{scheme.nav}</p>
          <p className={`text-xs font-semibold ${scheme.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{scheme.dayChangePct}% today</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="rounded-2xl p-1.5 flex gap-1.5" style={{ background: '#162d50', border: '1px solid rgba(27,154,245,0.12)' }}>
        {['lumpsum','sip'].map(m => (
          <button key={m} onClick={() => { setMode(m); setAmount(''); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={mode === m
              ? { background: 'linear-gradient(135deg,#0e7ee4,#1b9af5)', color: '#fff', boxShadow: '0 2px 12px rgba(27,154,245,0.3)' }
              : { color: '#7a94ab' }}>
            {m === 'lumpsum' ? '💰 One-Time' : '🔄 Monthly SIP'}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-6 space-y-5" style={CARD}>
        <div>
          <label className="text-sm font-semibold text-white mb-2 block">
            Amount{mode === 'sip' ? ' (per month)' : ''}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: '#7a94ab' }}>₹</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder={`Min ₹${minAmount.toLocaleString('en-IN')}`}
              className="input-field pl-10 text-xl font-bold" id="invest-amount" min={minAmount} />
          </div>
          {numAmount > 0 && numAmount < minAmount && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> Min {mode==='sip'?'SIP':'lumpsum'} is ₹{minAmount.toLocaleString('en-IN')}
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {[1000,5000,10000,25000,50000].map(val => (
            <button key={val} onClick={() => setAmount(String(val))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
              style={amount === String(val)
                ? { background: 'rgba(27,154,245,0.15)', color: '#42b4ff', borderColor: '#1b9af5' }
                : { background: 'rgba(27,154,245,0.06)', color: '#b0c4d8', borderColor: 'rgba(27,154,245,0.15)' }}>
              ₹{val.toLocaleString('en-IN')}
            </button>
          ))}
        </div>

        {isValid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="pt-4 space-y-2" style={{ borderTop: '1px solid rgba(27,154,245,0.08)' }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7a94ab' }}>Order Summary</p>
            {[{ label:'Amount',val:formatCurrency(numAmount) },{ label:'Approx. Units',val:`${units} units` },{ label:'NAV',val:`₹${scheme.nav}` },{ label:'Type',val:mode==='sip'?'SIP':'One-time' }].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-xs" style={{ color: '#7a94ab' }}>{item.label}</span>
                <span className="text-xs font-semibold text-white">{item.val}</span>
              </div>
            ))}
          </motion.div>
        )}

        {mode === 'sip' && isValid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-4"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={14} className="text-emerald-400" />
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">SIP Calculator · 3 Years @ 12% p.a.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[{ label:'Invested',val:formatCurrency(numAmount*36) },{ label:'Est. Gain',val:formatCurrency(sipFutureVal-numAmount*36) },{ label:'Total',val:formatCurrency(sipFutureVal) }].map(s => (
                <div key={s.label}>
                  <p className="text-xs" style={{ color: '#7a94ab' }}>{s.label}</p>
                  <p className="font-bold text-sm mt-0.5 text-white">{s.val}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <Button variant="primary" size="lg" fullWidth disabled={!isValid} onClick={() => setShowConfirm(true)} id="place-order-btn">
          {mode === 'sip' ? '🔄 Start SIP' : '💰 Place Order'} — {numAmount > 0 ? formatCurrency(numAmount) : 'Enter amount'}
        </Button>
      </div>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Investment" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleOrder} loading={loading} id="confirm-order">Confirm</Button>
          </>
        }>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#b0c4d8' }}>You are about to invest:</p>
          <div className="rounded-xl p-4 space-y-1" style={{ background: '#162d50', border: '1px solid rgba(27,154,245,0.15)' }}>
            <p className="font-bold text-white">{scheme.name}</p>
            <p className="text-2xl font-black" style={{ color: '#42b4ff' }}>{formatCurrency(numAmount)}</p>
            <p className="text-xs" style={{ color: '#7a94ab' }}>{mode==='sip'?`Monthly SIP on ${sipDate}th`:'One-time investment'}</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#7a94ab' }}>
            ⚠️ Mutual fund investments are subject to market risks. Read all scheme related documents carefully.
          </p>
        </div>
      </Modal>
    </div>
  );
}
