import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Calculator } from 'lucide-react';
import { MOCK_SCHEMES } from '../../utils/mockData';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function BuyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const scheme = MOCK_SCHEMES.find(s => s.id === id) || MOCK_SCHEMES[0];

  const [mode, setMode] = useState('lumpsum'); // 'lumpsum' | 'sip'
  const [amount, setAmount] = useState('');
  const [sipDate, setSipDate] = useState('1');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const units = numAmount > 0 ? (numAmount / scheme.nav).toFixed(4) : 0;
  const minAmount = mode === 'sip' ? scheme.minSIP : scheme.minLumpsum;
  const isValid = numAmount >= minAmount;

  // SIP Calculator
  const sipMonths = 36;
  const expectedReturn = 0.12 / 12;
  const sipFutureVal = numAmount > 0
    ? numAmount * ((Math.pow(1 + expectedReturn, sipMonths) - 1) / expectedReturn) * (1 + expectedReturn)
    : 0;

  const handleOrder = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setShowConfirm(false);
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
          className="w-24 h-24 rounded-full bg-emerald-600/20 flex items-center justify-center glow-emerald"
        >
          <CheckCircle size={48} className="text-emerald-400" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
          <h2 className="text-3xl font-black text-white">Order Placed! 🎉</h2>
          <p className="text-slate-400 mt-2">Your investment of <span className="text-white font-bold">{formatCurrency(numAmount)}</span> in</p>
          <p className="text-blue-400 font-semibold">{scheme.name}</p>
          <p className="text-slate-400 mt-1">is being processed.</p>
          <div className="glass rounded-2xl p-4 mt-6 border border-emerald-600/20 text-left space-y-2 max-w-sm mx-auto">
            <p className="text-sm text-slate-300"><span className="text-slate-500">Units:</span> {units}</p>
            <p className="text-sm text-slate-300"><span className="text-slate-500">NAV:</span> ₹{scheme.nav}</p>
            <p className="text-sm text-slate-300"><span className="text-slate-500">Type:</span> {mode === 'sip' ? 'SIP' : 'One-time'}</p>
            <p className="text-sm text-slate-300"><span className="text-slate-500">Status:</span> <span className="text-amber-400">Processing</span></p>
          </div>
        </motion.div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate('/client/portfolio')}>View Portfolio</Button>
          <Button variant="gradient" onClick={() => { setOrderPlaced(false); setAmount(''); }}>Invest More</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Invest in Fund</h1>
        <p className="text-slate-400 mt-1">{scheme.name}</p>
      </motion.div>

      {/* Fund Info Card */}
      <div className="glass rounded-2xl p-5 border border-blue-600/15 flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-sm">{scheme.name}</p>
          <p className="text-xs text-slate-400">{scheme.category} • {scheme.risk} Risk</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-white">₹{scheme.nav}</p>
          <p className={`text-xs ${scheme.dayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {scheme.dayChangePct}% today
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="glass rounded-2xl p-1.5 flex border border-blue-600/10">
        {['lumpsum', 'sip'].map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setAmount(''); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === m ? 'gradient-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            {m === 'lumpsum' ? '💰 One-Time' : '🔄 Monthly SIP'}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div className="glass rounded-2xl p-6 border border-blue-600/10 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Investment Amount {mode === 'sip' ? '(per month)' : ''}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`Min ₹${minAmount.toLocaleString('en-IN')}`}
              className="input-field pl-10 text-xl font-bold"
              id="invest-amount"
              min={minAmount}
            />
          </div>
          {numAmount > 0 && numAmount < minAmount && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> Minimum {mode === 'sip' ? 'SIP' : 'lumpsum'} is ₹{minAmount.toLocaleString('en-IN')}
            </p>
          )}
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2 flex-wrap">
          {[1000, 5000, 10000, 25000, 50000].map(val => (
            <button key={val} onClick={() => setAmount(String(val))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${amount === String(val) ? 'bg-blue-600 text-white' : 'glass-light text-slate-400 hover:text-white'}`}>
              ₹{val.toLocaleString('en-IN')}
            </button>
          ))}
        </div>

        {/* Order Summary */}
        {isValid && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-navy-700 pt-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Summary</p>
            {[
              { label: 'Amount', val: formatCurrency(numAmount) },
              { label: 'Approx. Units', val: `${units} units` },
              { label: 'NAV', val: `₹${scheme.nav}` },
              { label: 'Type', val: mode === 'sip' ? 'Systematic Investment Plan' : 'One-time Investment' },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-xs font-semibold text-white">{item.val}</span>
              </div>
            ))}
            {mode === 'sip' && (
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">SIP Date</span>
                <select value={sipDate} onChange={e => setSipDate(e.target.value)} className="text-xs font-semibold text-blue-400 bg-transparent">
                  {[1, 5, 10, 15, 20, 25].map(d => <option key={d} value={d}>{d}th every month</option>)}
                </select>
              </div>
            )}
          </motion.div>
        )}

        {/* SIP Calculator */}
        {mode === 'sip' && isValid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-emerald-600/10 rounded-xl p-4 border border-emerald-600/20">
            <div className="flex items-center gap-2 mb-2">
              <Calculator size={14} className="text-emerald-400" />
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">SIP Calculator (3 Years @ 12% p.a.)</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-slate-400">Invested</p>
                <p className="font-bold text-white text-sm">{formatCurrency(numAmount * 36)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Est. Gain</p>
                <p className="font-bold text-emerald-400 text-sm">{formatCurrency(sipFutureVal - numAmount * 36)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Value</p>
                <p className="font-bold text-white text-sm">{formatCurrency(sipFutureVal)}</p>
              </div>
            </div>
          </motion.div>
        )}

        <Button
          variant="gradient"
          size="lg"
          fullWidth
          disabled={!isValid}
          onClick={() => setShowConfirm(true)}
          id="place-order-btn"
        >
          {mode === 'sip' ? '🔄 Start SIP' : '💰 Place Order'} — {numAmount > 0 ? formatCurrency(numAmount) : 'Enter amount'}
        </Button>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Investment"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={loading}>Cancel</Button>
            <Button variant="gradient" onClick={handleOrder} loading={loading} id="confirm-order">Confirm</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-slate-300 text-sm">You are about to invest:</p>
          <div className="glass-light rounded-xl p-4 space-y-2">
            <p className="font-bold text-white">{scheme.name}</p>
            <p className="text-2xl font-black text-blue-400">{formatCurrency(numAmount)}</p>
            <p className="text-xs text-slate-400">{mode === 'sip' ? `Monthly SIP on ${sipDate}th` : 'One-time investment'}</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            ⚠️ Mutual fund investments are subject to market risks. Please read all scheme related documents carefully.
          </p>
        </div>
      </Modal>
    </div>
  );
}
