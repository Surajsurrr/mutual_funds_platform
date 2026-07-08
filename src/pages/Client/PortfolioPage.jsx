import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart as PieIcon, ShoppingCart, Banknote } from 'lucide-react';
import { usePortfolio } from '../../api/useApi';
import { readClient, writeClient } from '../../api/axiosClients';
import { StatsCard } from '../../components/UI/StatsCard';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#12B4C3','#3ECFDC','#fbbf24','#f87171','#8b5cf6'];

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

const TOOLTIP = {
  background: '#121C33',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  fontSize: 12,
  color: '#d9e4ef'
};

export default function PortfolioPage() {
  const { data: portfolio, loading, refetch } = usePortfolio();

  // Redeem flow: modal -> queued REDEEM order -> poll until it settles
  const [redeemHolding, setRedeemHolding] = useState(null);
  const [redeemAmount, setRedeemAmount]   = useState('');
  const [redeeming, setRedeeming]         = useState(false);
  const [pollRef, setPollRef]             = useState('');

  useEffect(() => {
    if (!pollRef) return;
    let stopped = false;
    let timer;
    const poll = async () => {
      try {
        const res = await readClient.get(`/orders/${pollRef}`);
        if (stopped) return;
        const s = res.data?.status;
        if (s === 'SUCCESS') {
          toast.success('Redemption completed — money is on its way to your bank!');
          setPollRef('');
          refetch();
          return;
        }
        if (s === 'DEAD' || s === 'FAILED') {
          toast.error(`Redemption failed: ${res.data?.error || 'bank transfer error'}`);
          setPollRef('');
          return;
        }
      } catch { /* transient — keep polling */ }
      if (!stopped) timer = setTimeout(poll, 2000);
    };
    timer = setTimeout(poll, 1500);
    return () => { stopped = true; clearTimeout(timer); };
  }, [pollRef, refetch]);

  const openRedeem = (h) => { setRedeemHolding(h); setRedeemAmount(''); };

  const handleRedeem = async () => {
    const amt = parseFloat(redeemAmount) || 0;
    if (amt <= 0) { toast.error('Enter an amount to redeem'); return; }
    if (amt > redeemHolding.currentValue + 0.01) {
      toast.error(`You can redeem up to ${formatCurrency(redeemHolding.currentValue)}`);
      return;
    }
    setRedeeming(true);
    try {
      const ref = `RED-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
      await writeClient.post('/orders', {
        clientRef: ref,
        schemeId: redeemHolding.schemeId,
        type: 'REDEEM',
        amount: amt,
      });
      setRedeemHolding(null);
      setPollRef(ref);
      toast.success('Redemption placed — processing at today\'s NAV...');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place redemption');
    } finally {
      setRedeeming(false);
    }
  };

  const totalInvested = portfolio?.totalInvested ?? 0;
  const currentValue  = portfolio?.currentValue  ?? 0;
  const totalGain     = portfolio?.totalGain     ?? 0;
  const totalGainPct  = portfolio?.totalGainPct  ?? 0;
  const dayChange     = portfolio?.dayChange     ?? 0;
  const dayChangePct  = portfolio?.dayChangePct  ?? 0;
  const holdings      = portfolio?.holdings      ?? [];

  const pieData = holdings.map(h => ({
    name: h.schemeName.split(' ').slice(0,2).join(' '),
    value: h.currentValue,
    pct: currentValue > 0 ? ((h.currentValue/currentValue)*100).toFixed(1) : '0.0',
  }));


  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.5rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>My Investments</p>
        <h1 className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)' }}>Portfolio</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8" style={{ marginBottom: '2rem' }}>
        <StatsCard title="Current Value" value={formatCurrency(currentValue,true)} icon={TrendingUp}  accentColor="blue"    delay={0} />
        <StatsCard title="Invested"      value={formatCurrency(totalInvested,true)} icon={PieIcon}    accentColor="amber"   delay={0.1} />
        <StatsCard title="Total Gain"    value={formatCurrency(totalGain,true)} subtitle={formatPercent(totalGainPct)} icon={TrendingUp} accentColor="emerald" delay={0.15} />
        <StatsCard title="Today's P&L"
          value={`${dayChange>=0?'+':''}${formatCurrency(dayChange,true)}`} subtitle={formatPercent(dayChangePct)}
          icon={TrendingUp} accentColor={dayChange>=0?'emerald':'rose'} delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 lg:gap-8">
        {/* Allocation Pie Chart */}
        <div className="rounded-2xl" style={{ ...CARD, padding: 'clamp(1.25rem, 4vw, 2.25rem)' }}>
          <h2 className="text-base font-bold text-white mb-5">Allocation</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [formatCurrency(v),'Value']} contentStyle={TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5 mt-3">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i%PIE_COLORS.length] }} />
                  <span className="text-xs truncate max-w-[120px]" style={{ color: '#b0c4d8' }}>{d.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings List */}
        <div className="lg:col-span-2 rounded-2xl" style={CARD}>
          <h2 className="text-base font-bold text-white mb-5">Holdings</h2>
          <div className="space-y-4">
            {holdings.map((h, i) => (
              <motion.div key={h.schemeId} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i*0.08 }}
                className="rounded-xl transition-all border"
                style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(18,180,195,0.25)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-base truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{h.schemeName}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: '#7a94ab' }}>{h.amcName}</p>
                    <div className="flex gap-4 mt-3 text-xs font-semibold" style={{ color: '#7a94ab' }}>
                      <span>{h.units.toFixed(3)} units</span>
                      <span>Avg: ₹{h.avgNAV}</span>
                      <span>Cur: ₹{h.currentNAV}</span>
                    </div>
                    <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${Math.min((h.currentValue/currentValue)*100,100)}%`, background: PIE_COLORS[i%PIE_COLORS.length] }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-white text-base">{formatCurrency(h.currentValue)}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: '#7a94ab' }}>Invested: {formatCurrency(h.invested)}</p>
                    <p className={`text-sm font-black mt-2 ${h.gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {h.gain >= 0 ? '+' : ''}{formatCurrency(h.gain)}<br /><span className="text-xs font-semibold">({formatPercent(h.gainPct)})</span>
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => openRedeem(h)} id={`redeem-${h.schemeId}`}
                    className="text-xs font-bold flex items-center gap-1.5 rounded-lg border transition-all"
                    style={{ color: '#fbbf24', borderColor: 'rgba(251,191,36,0.2)', padding: '0.45rem 0.95rem', fontSize: '0.75rem', fontWeight: 700 }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(251,191,36,0.1)'; e.currentTarget.style.borderColor='#fbbf24'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(251,191,36,0.2)'; }}>
                    <Banknote size={12} /> Redeem
                  </button>
                  <Link to={`/client/buy/${h.schemeId}`}>
                    <button className="text-xs font-bold flex items-center gap-1.5 rounded-lg border transition-all"
                      style={{ color: '#12B4C3', borderColor: 'rgba(18,180,195,0.2)', padding: '0.45rem 0.95rem', fontSize: '0.75rem', fontWeight: 700 }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(18,180,195,0.1)'; e.currentTarget.style.borderColor='#12B4C3'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(18,180,195,0.2)'; }}>
                      <ShoppingCart size={12} /> Add More
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Redeem Modal */}
      <Modal isOpen={!!redeemHolding} onClose={() => setRedeemHolding(null)} title="Redeem Units" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRedeemHolding(null)} disabled={redeeming}>Cancel</Button>
            <Button variant="primary" onClick={handleRedeem} loading={redeeming} id="confirm-redeem">Redeem</Button>
          </>
        }>
        {redeemHolding && (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-bold text-white">{redeemHolding.schemeName}</p>
              <p className="text-xs mt-1" style={{ color: '#7a94ab' }}>
                {redeemHolding.units.toFixed(3)} units held · current value <span className="text-white font-semibold">{formatCurrency(redeemHolding.currentValue)}</span>
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#7a94ab' }}>Amount to redeem (₹)</label>
              <input type="number" value={redeemAmount} onChange={e => setRedeemAmount(e.target.value)}
                placeholder={`Up to ${formatCurrency(redeemHolding.currentValue)}`}
                min="1" max={redeemHolding.currentValue}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', color: '#ffffff', padding: '0.75rem 1rem', outline: 'none',
                  fontSize: '1rem', fontWeight: 700, width: '100%', fontFamily: 'Inter, sans-serif',
                }}
                className="focus:border-[#12B4C3]" id="redeem-amount" />
              <div className="flex gap-2 mt-2.5">
                {[25, 50, 100].map(pct => (
                  <button key={pct} onClick={() => setRedeemAmount(((redeemHolding.currentValue * pct) / 100).toFixed(2))}
                    className="flex-1 rounded-lg border text-xs font-bold transition-all"
                    style={{ color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', padding: '0.45rem' }}>
                    {pct === 100 ? 'All' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#7a94ab' }}>
              Redemptions ride the same order queue — you'll get a confirmation the moment the payout settles.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
