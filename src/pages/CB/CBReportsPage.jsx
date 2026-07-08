import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, ShieldAlert, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Badge } from '../../components/UI/Badge';
import { readClient } from '../../api/axiosClients';
import toast from 'react-hot-toast';

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '2.25rem',
};

const REPORTS = [
  {
    key: 'audit',
    title: 'Monthly Audit Log',
    description: 'Download the complete record of transactional switches, buy orders, and unit redemptions across all corporate clients for general auditing.',
    icon: FileSpreadsheet,
    format: 'CSV / Excel',
    color: '#34d399',
    type: 'Financial'
  },
  {
    key: 'risk',
    title: 'Risk & Compliance Report',
    description: 'Generate client risk distribution levels, flag limits, KYC discrepancies, and money laundering compliance threat assessments.',
    icon: ShieldAlert,
    format: 'PDF Document',
    color: '#ef4444',
    type: 'Security'
  },
  {
    key: 'aum',
    title: 'AUM Distribution Summary',
    description: 'Review asset sizes by fund category (Large Cap, Mid Cap, Small Cap) to understand fund flows and client investment preferences.',
    icon: BarChart3,
    format: 'CSV / Excel',
    color: '#fbbf24',
    type: 'Analytics'
  },
  {
    key: 'revenue',
    title: 'Platform Revenue Report',
    description: 'Analyze fee commissions earned from AMC companies, switch commissions, and client management overheads.',
    icon: TrendingUp,
    format: 'CSV / Excel',
    color: '#3ECFDC',
    type: 'Financial'
  }
];

const today = () => new Date().toISOString().slice(0, 10);

const csvEscape = v => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

const downloadCsv = (filename, headers, rows) => {
  const csv = [headers, ...rows].map(r => r.map(csvEscape).join(',')).join('\r\n');
  // BOM so Excel opens the unicode (₹, names) correctly
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};

const inr = n => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export default function CBReportsPage() {
  const [generating, setGenerating] = useState(null);

  const generateAudit = async () => {
    const { data: txns } = await readClient.get('/cb/transactions');
    downloadCsv(`audit-log-${today()}.csv`,
      ['Txn ID', 'Date', 'Client', 'Scheme', 'Type', 'Amount (INR)', 'Units', 'NAV', 'Status'],
      txns.map(t => [t.id, t.date?.slice(0, 10), t.clientName, t.schemeName, t.type, t.amount, t.units, t.nav, t.status]));
    return `${txns.length} transactions exported`;
  };

  const generateAum = async () => {
    const { data: schemes } = await readClient.get('/schemes');
    const byCategory = {};
    for (const s of schemes) {
      const aum = parseFloat(String(s.aum).replace(/,/g, '')) || 0;
      const c = byCategory[s.category] ??= { count: 0, aum: 0, ret: 0 };
      c.count += 1; c.aum += aum; c.ret += s.returns1Y;
    }
    const rows = Object.entries(byCategory)
      .sort((a, b) => b[1].aum - a[1].aum)
      .map(([cat, c]) => [cat, c.count, c.aum.toFixed(0), (c.ret / c.count).toFixed(1) + '%']);
    rows.push([]);
    rows.push(['— Scheme detail —']);
    rows.push(['Scheme', 'Category', 'NAV', 'AUM (Cr)', '1Y Returns', 'Risk']);
    for (const s of [...schemes].sort((a, b) => a.category.localeCompare(b.category))) {
      rows.push([s.name, s.category, s.nav, s.aum, s.returns1Y + '%', s.risk]);
    }
    downloadCsv(`aum-distribution-${today()}.csv`,
      ['Category', 'Schemes', 'Total AUM (Cr)', 'Avg 1Y Returns'], rows);
    return `${schemes.length} schemes across ${Object.keys(byCategory).length} categories`;
  };

  const generateRevenue = async () => {
    const { data: txns } = await readClient.get('/cb/transactions');
    const byScheme = {};
    for (const t of txns) {
      const s = byScheme[t.schemeName] ??= { count: 0, volume: 0 };
      s.count += 1; s.volume += t.amount;
    }
    const rows = Object.entries(byScheme)
      .sort((a, b) => b[1].volume - a[1].volume)
      .map(([name, s]) => [name, s.count, s.volume.toFixed(2), (s.volume * 0.01).toFixed(2)]);
    const totalVol = txns.reduce((sum, t) => sum + t.amount, 0);
    rows.push(['TOTAL', txns.length, totalVol.toFixed(2), (totalVol * 0.01).toFixed(2)]);
    downloadCsv(`platform-revenue-${today()}.csv`,
      ['Scheme', 'Transactions', 'Gross Volume (INR)', 'Est. Commission @1% (INR)'], rows);
    return `commission computed on ${inr(totalVol)} volume`;
  };

  // Opens the print window synchronously (before any await) so the popup
  // isn't blocked, then streams the report into it and triggers print-to-PDF.
  const generateRisk = async (win) => {
    const { data: clients } = await readClient.get('/cb/clients');
    const riskCount = { Low: 0, Moderate: 0, High: 0 };
    for (const c of clients) riskCount[c.risk] = (riskCount[c.risk] || 0) + 1;
    const flagged = clients.filter(c => c.status === 'Flagged');
    const totalHoldings = clients.reduce((sum, c) => sum + c.holdings, 0);

    win.document.write(`<!doctype html><html><head><title>Risk &amp; Compliance Report — ${today()}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a2332; margin: 40px; }
        h1 { font-size: 22px; margin: 0; } .sub { color: #64748b; font-size: 12px; margin-top: 4px; }
        .tiles { display: flex; gap: 16px; margin: 24px 0; }
        .tile { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; flex: 1; }
        .tile b { font-size: 20px; display: block; } .tile span { font-size: 11px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
        th { text-align: left; background: #f1f5f9; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; }
        td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
        .flag { color: #dc2626; font-weight: 700; } .ok { color: #059669; }
        h2 { font-size: 15px; margin-top: 28px; }
      </style></head><body>
      <h1>FundFlow — Risk &amp; Compliance Report</h1>
      <p class="sub">Generated ${new Date().toLocaleString()} · Corporate Banking Desk · CONFIDENTIAL</p>
      <div class="tiles">
        <div class="tile"><b>${clients.length}</b><span>Total Clients</span></div>
        <div class="tile"><b>${flagged.length}</b><span>Flagged Accounts</span></div>
        <div class="tile"><b>${riskCount.High || 0}</b><span>High-Risk Profiles</span></div>
        <div class="tile"><b>${inr(totalHoldings)}</b><span>Total Holdings Under Watch</span></div>
      </div>
      <h2>Risk Distribution</h2>
      <table><tr><th>Risk Profile</th><th>Clients</th><th>Share</th></tr>
        ${Object.entries(riskCount).map(([r, n]) =>
          `<tr><td>${r}</td><td>${n}</td><td>${((n / clients.length) * 100).toFixed(1)}%</td></tr>`).join('')}
      </table>
      <h2>Client Register</h2>
      <table><tr><th>ID</th><th>Name</th><th>Email</th><th>Risk</th><th>Status</th><th>Holdings</th></tr>
        ${clients.map(c =>
          `<tr><td>${c.id}</td><td>${c.name}</td><td>${c.email}</td><td>${c.risk}</td>
           <td class="${c.status === 'Flagged' ? 'flag' : 'ok'}">${c.status}</td><td>${inr(c.holdings)}</td></tr>`).join('')}
      </table>
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
    return `${clients.length} clients assessed, ${flagged.length} flagged`;
  };

  const handleGenerate = async (rep) => {
    if (generating) return;
    // Popup must open inside the click gesture, before any async work
    const win = rep.key === 'risk' ? window.open('', '_blank') : null;
    if (rep.key === 'risk' && !win) { toast.error('Pop-up blocked — allow pop-ups to view the PDF report'); return; }
    setGenerating(rep.key);
    try {
      const detail = rep.key === 'audit' ? await generateAudit()
        : rep.key === 'aum' ? await generateAum()
        : rep.key === 'revenue' ? await generateRevenue()
        : await generateRisk(win);
      toast.success(`${rep.title} ready — ${detail}`);
    } catch (err) {
      win?.close();
      toast.error(err.response?.data?.error || `Failed to generate ${rep.title}`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.5rem' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#12B4C3' }}>Corporate Banking</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>CB Reports</h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #12B4C3 0%, transparent 100%)', marginTop: '0.75rem', opacity: 0.4 }} />
        <p className="text-sm mt-4.5" style={{ color: '#7a94ab' }}>Extract audit logs, risk evaluations, and asset size distributions for reporting</p>
      </motion.div>

      {/* Grid List */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
        {REPORTS.map((rep, idx) => (
          <motion.div key={rep.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="rounded-2xl transition-all border flex flex-col justify-between"
            style={CARD}
            onMouseEnter={e => e.currentTarget.style.borderColor='rgba(18,180,195,0.25)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <rep.icon size={20} style={{ color: rep.color }} />
                </div>
                <Badge variant={rep.type === 'Security' ? 'danger' : rep.type === 'Analytics' ? 'info' : 'success'}>
                  {rep.type}
                </Badge>
              </div>

              <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{rep.title}</h2>
              <p className="text-xs font-bold text-slate-400 mt-1">Export format: {rep.format}</p>

              <p className="text-sm leading-relaxed text-slate-300 mt-4" style={{ minHeight: '60px' }}>
                {rep.description}
              </p>
            </div>

            <div className="mt-8 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Button variant="secondary" icon={Download} onClick={() => handleGenerate(rep)}
                loading={generating === rep.key} fullWidth id={`report-${rep.key}`}>
                Generate & Download
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
