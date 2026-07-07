import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Calculator } from 'lucide-react';
import { useScheme } from '../../api/useApi';
import { readClient, writeClient } from '../../api/axiosClients';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2rem',
};

export default function BuyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: scheme, loading: schemeLoading } = useScheme(id);

  const [mode,        setMode]        = useState('lumpsum');
  const [amount,      setAmount]      = useState('');
  const [sipDate,     setSipDate]     = useState('1');
  const [loading,     setLoading]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [clientRef,   setClientRef]   = useState('');
  const [orderStatus, setOrderStatus] = useState('PENDING');

  // Live order status over SSE: the server pushes the moment the worker
  // settles the order — no polling. Falls back to polling if the stream dies.
  useEffect(() => {
    if (!orderPlaced || !clientRef) return;
    let stopped = false;
    let timer;
    let es;

    const isFinal = (s) => s === 'SUCCESS' || s === 'DEAD' || s === 'FAILED';

    const poll = async () => {
      try {
        const res = await readClient.get(`/orders/${clientRef}`);
        if (stopped) return;
        const s = res.data?.status || 'PENDING';
        setOrderStatus(s);
        if (isFinal(s)) return;
      } catch { /* transient — keep polling */ }
      if (!stopped) timer = setTimeout(poll, 2000);
    };

    const token = localStorage.getItem('ff_token');
    if (typeof EventSource !== 'undefined' && token) {
      es = new EventSource(`/api/read/orders/${clientRef}/stream?access_token=${encodeURIComponent(token)}`);
      es.onmessage = (e) => {
        if (stopped) return;
        try {
          const order = JSON.parse(e.data);
          setOrderStatus(order.status || 'PENDING');
          if (isFinal(order.status)) es.close();
        } catch { /* ignore malformed frame */ }
      };
      es.onerror = () => {
        // CONNECTING = auto-reconnecting, leave it alone. CLOSED = gave up
        // (e.g. auth rejected) → fall back to the old polling loop.
        if (es.readyState === EventSource.CLOSED && !stopped) {
          timer = setTimeout(poll, 1500);
        }
      };
    } else {
      timer = setTimeout(poll, 1500);
    }

    return () => { stopped = true; clearTimeout(timer); es?.close(); };
  }, [orderPlaced, clientRef]);

  if (schemeLoading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400 text-sm">Loading scheme...</p></div>;
  if (!scheme) return <div className="flex items-center justify-center h-64"><p className="text-slate-400 text-sm">Scheme not found.</p></div>;

  const numAmount = parseFloat(amount) || 0;
  const units     = numAmount > 0 ? (numAmount / scheme.nav).toFixed(4) : 0;
  const minAmount = mode === 'sip' ? scheme.minSIP : scheme.minLumpsum;
  const isValid   = numAmount >= minAmount;

  const sipMonths = 36, r = 0.12 / 12;
  const sipFutureVal = numAmount > 0 ? numAmount * ((Math.pow(1+r,sipMonths)-1)/r)*(1+r) : 0;

  const handleOrder = async () => {
    setLoading(true);
    try {
      const ref = `REF-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
      await writeClient.post('/orders', {
        clientRef: ref,
        schemeId: scheme.id,
        type: mode === 'sip' ? 'SIP' : 'BUY',
        amount: numAmount,
        sipDate: mode === 'sip' ? parseInt(sipDate, 10) : undefined,
      });
      setClientRef(ref);
      setOrderStatus('PENDING');
      setShowConfirm(false);
      setOrderPlaced(true);
      toast.success('Order placed successfully!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to place order. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const statusDisplay =
    orderStatus === 'SUCCESS' ? '✅ Completed'
    : orderStatus === 'DEAD' || orderStatus === 'FAILED' ? '❌ Failed'
    : '⏳ Processing';

  if (orderPlaced) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(16,185,129,0.15)', border: '3px solid #34d399' }}>
        <CheckCircle size={48} className="text-emerald-400" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
        <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Order Placed! 🎉</h2>
        <p className="mt-2" style={{ color: '#b0c4d8' }}>Your investment of <span className="text-white font-bold">{formatCurrency(numAmount)}</span> in</p>
        <p className="font-bold text-lg mt-1" style={{ color: '#12B4C3' }}>{scheme.name}</p>
        <div className="rounded-2xl mt-6 text-left space-y-2.5 max-w-sm mx-auto" style={CARD}>
          {[['Units', units],['NAV',`₹${scheme.nav}`],['Type',mode==='sip'?'SIP':'One-time'],['Status',statusDisplay]].map(([l,v]) => (
            <p key={l} className="text-sm" style={{ color: '#b0c4d8' }}><span style={{ color: '#7a94ab' }}>{l}:</span> <span className="font-semibold text-white">{v}</span></p>
          ))}
        </div>
      </motion.div>
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        <Button variant="secondary" onClick={() => navigate('/client/portfolio')}>View Portfolio</Button>
        <Button variant="primary" onClick={() => { setOrderPlaced(false); setAmount(''); setClientRef(''); setOrderStatus('PENDING'); }}>Invest More</Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl pb-8">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold transition-colors hover:text-white" style={{ color: '#7a94ab', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.5rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>Invest Now</p>
        <h1 className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)' }}>Buy Fund</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
      </motion.div>

      {/* Fund Info Card */}
      <div className="rounded-2xl" style={{ ...CARD, padding: '1.75rem', marginBottom: '1.75rem' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-extrabold text-white text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{scheme.name}</p>
            <p className="text-xs mt-1" style={{ color: '#7a94ab' }}>{scheme.category} • {scheme.risk} Risk</p>
          </div>
          <div className="text-right">
            <p className="text-xl lg:text-2xl font-black text-white">₹{scheme.nav}</p>
            <p className={`text-xs font-semibold mt-0.5 ${scheme.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{scheme.dayChange >= 0 ? '+' : ''}{scheme.dayChangePct}% today</p>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="rounded-2xl p-1.5 flex gap-1.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.75rem' }}>
        {['lumpsum','sip'].map(m => (
          <button key={m} onClick={() => { setMode(m); setAmount(''); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-extrabold transition-all"
            style={mode === m
              ? { background: 'linear-gradient(135deg,#0B667E,#12B4C3)', color: '#fff', boxShadow: '0 4px 12px rgba(18,180,195,0.25)' }
              : { color: '#7a94ab' }}>
            {m === 'lumpsum' ? '💰 One-Time' : '🔄 Monthly SIP'}
          </button>
        ))}
      </div>

      {/* Input panel */}
      <div className="rounded-2xl space-y-5" style={CARD}>
        <div>
          <label className="text-sm font-bold text-slate-300 mb-2.5 block uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
            Amount{mode === 'sip' ? ' (per month)' : ''}
          </label>
          <div className="relative">
            <span className="absolute left-4.5 top-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: '#12B4C3' }}>₹</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder={`Min ₹${minAmount.toLocaleString('en-IN')}`}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                color: '#ffffff',
                padding: '0.875rem 1rem 0.875rem 2.5rem',
                outline: 'none',
                fontSize: '1.25rem',
                fontWeight: 800,
                width: '100%',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s',
              }}
              className="focus:border-[#12B4C3]"
              id="invest-amount" min={minAmount} />
          </div>
          {numAmount > 0 && numAmount < minAmount && (
            <p className="text-xs text-red-400 mt-2.5 flex items-center gap-1">
              <AlertCircle size={13} /> Min {mode==='sip'?'SIP':'lumpsum'} is ₹{minAmount.toLocaleString('en-IN')}
            </p>
          )}
        </div>

        {/* Quick select chips */}
        <div className="flex gap-2 flex-wrap pb-1">
          {[1000,5000,10000,25000,50000].map(val => (
            <button key={val} onClick={() => setAmount(String(val))}
              className="flex-shrink-0 transition-all border"
              style={amount === String(val)
                ? { background: 'rgba(18,180,195,0.15)', color: '#12B4C3', borderColor: '#12B4C3', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }
                : { background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.06)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600 }
              }>
              ₹{val.toLocaleString('en-IN')}
            </button>
          ))}
        </div>

        {isValid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="pt-4.5 space-y-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400" style={{ fontSize: '0.7rem' }}>Order Summary</p>
            {[{ label:'Amount',val:formatCurrency(numAmount) },{ label:'Approx. Units',val:`${units} units` },{ label:'NAV',val:`₹${scheme.nav}` },{ label:'Type',val:mode==='sip'?'SIP':'One-time' }].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className="text-xs font-semibold text-white">{item.val}</span>
              </div>
            ))}
          </motion.div>
        )}

        {mode === 'sip' && isValid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-4"
            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={14} className="text-emerald-400" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">SIP Calculator · 3 Years @ 12% p.a.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[{ label:'Invested',val:formatCurrency(numAmount*36) },{ label:'Est. Gain',val:formatCurrency(sipFutureVal-numAmount*36) },{ label:'Total',val:formatCurrency(sipFutureVal) }].map(s => (
                <div key={s.label}>
                  <p className="text-[10px] text-slate-400">{s.label}</p>
                  <p className="font-bold text-xs mt-0.5 text-white">{s.val}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Invest button */}
        <button
          disabled={!isValid}
          onClick={() => setShowConfirm(true)}
          id="place-order-btn"
          className="w-full rounded-2xl text-white flex items-center justify-center gap-2 font-bold transition-all"
          style={isValid
            ? {
                background: 'linear-gradient(135deg,#0B667E,#12B4C3)',
                boxShadow: '0 4px 16px rgba(18,180,195,0.3)',
                padding: '0.875rem',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }
            : {
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '0.875rem',
                fontSize: '0.95rem',
                cursor: 'not-allowed',
              }}
        >
          {mode === 'sip' ? '🔄 Start SIP' : '💰 Place Order'} — {numAmount > 0 ? formatCurrency(numAmount) : 'Enter amount'}
        </button>
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
          <div className="rounded-xl p-4 space-y-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="font-bold text-white">{scheme.name}</p>
            <p className="text-2xl font-black text-white">{formatCurrency(numAmount)}</p>
            <p className="text-xs" style={{ color: '#12B4C3' }}>{mode==='sip'?`Monthly SIP on ${sipDate}th`:'One-time investment'}</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#7a94ab' }}>
            ⚠️ Mutual fund investments are subject to market risks. Read all scheme related documents carefully.
          </p>
        </div>
      </Modal>
    </div>
  );
}
