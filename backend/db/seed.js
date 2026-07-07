import bcrypt from 'bcryptjs';

// Idempotent seed — mirrors the shapes the frontend was mocked with.
// Demo accounts (all password `demo123`): client@ / cb@ / amc@ / admin@fundflow.in

const AMCS = [
  ['AMC001', 'HDFC Mutual Fund',    'support@hdfcmf.com',      '🏦', 'Large Cap',   4.8, 0.15, 542300, 142, 'Active', '2025-01-10'],
  ['AMC002', 'SBI Mutual Fund',     'sbimf@sbimf.com',         '🏛️', 'Diversified', 4.7, 0.12, 891200, 189, 'Active', '2025-01-12'],
  ['AMC003', 'ICICI Prudential',    'support@iciciprumf.com',  '💎', 'Multi Cap',   4.6, 0.15, 623400, 167, 'Active', '2025-02-01'],
  ['AMC004', 'Axis Mutual Fund',    'axis@axismf.com',         '⚡', 'Growth',      4.5, 0.20, 287600,  98, 'Active', '2025-02-15'],
  ['AMC005', 'Mirae Asset',         'partners@miraeasset.com', '🌏', 'Equity',      4.9, 0.18, 154200,  72, 'Active', '2025-03-01'],
  ['AMC006', 'Kotak Mahindra',      'mf@kotak.com',            '🔷', 'Balanced',    4.4, 0.14, 312800, 115, 'Active', '2025-03-20'],
  ['AMC007', 'Nippon India',        'care@nipponindiamf.com',  '🎯', 'Index',       4.5, 0.10, 378900, 134, 'Active', '2025-04-02'],
  ['AMC008', 'DSP Mutual Fund',     'service@dspim.com',       '📈', 'Debt',        4.3, 0.16, 123400,  67, 'Active', '2025-04-18'],
  ['AMC043', 'Sundaram Mutual Fund','hello@sundarammf.com',    '🌞', 'Diversified', 4.1, 0.17,  12400,  28, 'Pending','2026-06-25'],
];

const SCHEMES = [
  ['SCH001', 'AMC001', 'HDFC Top 100 Fund',          'Large Cap', 928.45,  2.34,  0.25, 18.4, 22.1, 19.8, 'Moderate',  500,  5000, 29431, 5],
  ['SCH002', 'AMC001', 'HDFC Mid-Cap Opportunities', 'Mid Cap',   154.32,  1.12,  0.73, 28.6, 31.4, 24.2, 'High',      500,  5000, 12890, 4],
  ['SCH003', 'AMC002', 'SBI Bluechip Fund',          'Large Cap',  72.18, -0.34, -0.47, 15.2, 18.9, 17.3, 'Low',       500,  5000, 44120, 5],
  ['SCH004', 'AMC003', 'ICICI Pru Value Discovery',  'Value',     378.91,  4.21,  1.12, 32.1, 29.8, 26.4, 'Moderate', 1000,  5000, 35670, 5],
  ['SCH005', 'AMC005', 'Mirae Asset Large Cap',      'Large Cap',  94.67,  1.89,  2.04, 19.8, 24.3, 21.7, 'Low',      1000,  5000, 38920, 5],
  ['SCH006', 'AMC004', 'Axis Small Cap Fund',        'Small Cap',  87.34, -1.23, -1.39, 42.3, 35.6, 28.9, 'Very High', 500,  5000, 18340, 4],
];

// [id, name, email, role, kyc, status, risk, amcId, joined, pan]
const USERS = [
  ['USR001', 'Suraj Kumar',    'client@fundflow.in',        'client', 'verified', 'Active',    'Moderate', null,     '2026-04-12', 'ABCDE1234F'],
  ['USR002', 'Vikram CB',      'cb@fundflow.in',            'cb',     'verified', 'Active',    'Low',      null,     '2026-04-15', 'FGHIJ5678K'],
  ['USR003', 'Mugilan AMC',    'amc@fundflow.in',           'amc',    'verified', 'Active',    'Low',      'AMC001', '2026-04-20', 'KLMNO9012P'],
  ['USR004', 'Admin User',     'admin@fundflow.in',         'admin',  'verified', 'Active',    'Low',      null,     '2026-04-01', 'PQRST3456U'],
  ['USR005', 'Ramesh Kumar',   'ramesh.kumar@gmail.com',    'client', 'verified', 'Flagged',   'High',     null,     '2026-05-10', 'UVWXY7890Z'],
  ['USR006', 'Priya Sharma',   'priya.sharma@yahoo.com',    'client', 'verified', 'Active',    'High',     null,     '2026-05-12', 'ZABCD2345E'],
  ['USR007', 'Karan Malhotra', 'karan.m@gmail.com',         'client', 'verified', 'Suspended', 'Moderate', null,     '2026-06-01', 'EFGHI6789J'],
  ['USR008', 'Amit Sharma',    'amit.sharma@gmail.com',     'client', 'verified', 'Active',    'Moderate', null,     '2026-05-20', 'JKLMN0123O'],
  ['USR009', 'Rohan Verma',    'rohan.v@yahoo.com',         'client', 'verified', 'Active',    'Low',      null,     '2026-05-25', 'OPQRS4567T'],
  ['USR010', 'Neha Gupta',     'neha.gupta@outlook.com',    'client', 'verified', 'Active',    'Moderate', null,     '2026-06-05', 'TUVWX8901Y'],
  ['USR011', 'Sneha Patil',    'sneha.patil@rediffmail.com','client', 'verified', 'Active',    'Low',      null,     '2026-06-10', 'YZABC3456D'],
  ['USR012', 'Vikram Singh',   'vikram.s@outlook.com',      'client', 'verified', 'Active',    'High',     null,     '2026-06-15', 'DEFGH7890I'],
  ['USR013', 'Amit Singh',     'amit.singh@gmail.com',      'client', 'verified', 'Active',    'Low',      null,     '2026-05-02', 'HIJKL1234M'],
  ['USR014', 'Ananya Rao',     'ananya.rao@gmail.com',      'client', 'verified', 'Active',    'Low',      null,     '2026-05-06', 'MNOPQ5678R'],
];

// [userId, schemeId, units, invested, sipStatus]
const HOLDINGS = [
  ['USR001', 'SCH001',   32.42,  27561, 'None'],
  ['USR001', 'SCH004',   92.18,  28806, 'None'],
  ['USR001', 'SCH005', 1224.80,  68946, 'Active'],
  ['USR008', 'SCH002',  154.20,  20000, 'Active'],
  ['USR009', 'SCH001',   10.75,   9000, 'None'],
  ['USR010', 'SCH004',   92.18,  28806, 'Active'],
  ['USR007', 'SCH003',  275.40,  18000, 'Paused'],
  ['USR011', 'SCH005',   50.50,   4500, 'None'],
  ['USR012', 'SCH006',  220.15,  15000, 'Active'],
  ['USR013', 'SCH003', 5000.00, 350000, 'Active'],
  ['USR014', 'SCH005', 2000.00, 160000, 'None'],
];

// [id, userId, schemeId, date, type, amount, units, nav, status]
const TRANSACTIONS = [
  ['TXN000001', 'USR001', 'SCH001', '2026-06-28', 'BUY',  5000,  5.38, 928.45, 'success'],
  ['TXN000002', 'USR001', 'SCH005', '2026-06-15', 'SIP',  3000, 31.69,  94.67, 'success'],
  ['TXN000003', 'USR001', 'SCH004', '2026-06-01', 'BUY', 10000, 26.39, 378.91, 'success'],
  ['TXN000004', 'USR001', 'SCH005', '2026-05-15', 'SIP',  3000, 32.14,  93.34, 'success'],
  ['TXN000005', 'USR001', 'SCH006', '2026-05-01', 'BUY',  5000, 57.24,  87.34, 'failed'],
  ['TXN000006', 'USR001', 'SCH001', '2026-04-15', 'SIP',  2000,  2.28, 877.20, 'success'],
  ['TXN000007', 'USR008', 'SCH002', '2026-06-20', 'SIP',  5000, 32.40, 154.32, 'success'],
  ['TXN000008', 'USR010', 'SCH004', '2026-06-22', 'BUY', 15000, 39.59, 378.91, 'success'],
  ['TXN000009', 'USR013', 'SCH003', '2026-06-25', 'BUY', 50000,692.71,  72.18, 'flagged'],
  ['TXN000010', 'USR012', 'SCH006', '2026-06-26', 'SIP',  3000, 34.35,  87.34, 'success'],
];

export async function seed(pool) {
  const passwordHash = bcrypt.hashSync('demo123', 10);

  for (const a of AMCS) {
    await pool.query(
      `INSERT INTO amcs (id, name, email, logo, category, rating, commission, aum_cr, fund_count, status, applied_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO NOTHING`, a);
  }

  for (const s of SCHEMES) {
    await pool.query(
      `INSERT INTO schemes (id, amc_id, name, category, nav, day_change, day_change_pct,
                            returns_1y, returns_3y, returns_5y, risk, min_sip, min_lumpsum, aum_cr, rating)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT (id) DO NOTHING`, s);
  }

  for (const [id, name, email, role, kyc, status, risk, amcId, joined, pan] of USERS) {
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, phone, role, kyc_status, status, risk_profile, amc_id, joined_at, pan)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (email) DO NOTHING`,
      [id, email, passwordHash, name, '+91 98765 43210', role, kyc, status, risk, amcId, joined, pan]);
  }

  for (const h of HOLDINGS) {
    await pool.query(
      `INSERT INTO holdings (user_id, scheme_id, units, invested, sip_status)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id, scheme_id) DO NOTHING`, h);
  }

  for (const t of TRANSACTIONS) {
    await pool.query(
      `INSERT INTO transactions (id, user_id, scheme_id, txn_date, txn_type, amount, units, nav, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id, txn_date) DO NOTHING`, t);
  }

  // 30 days of NAV history per scheme — a plausible walk ending at today's NAV.
  const { rows: existing } = await pool.query('SELECT count(*)::int AS n FROM nav_history');
  if (existing[0].n === 0) {
    for (const s of SCHEMES) {
      const [id, , , , nav] = s;
      const values = [];
      for (let i = 29; i >= 0; i--) {
        const drift = Math.sin(i * 0.4) * nav * 0.015 + i * nav * 0.0012;
        const dayNav = +(nav - drift + (Math.random() - 0.5) * nav * 0.004).toFixed(4);
        values.push(`('${id}', CURRENT_DATE - ${i}, ${i === 0 ? nav : dayNav})`);
      }
      await pool.query(
        `INSERT INTO nav_history (scheme_id, nav_date, nav) VALUES ${values.join(',')}
         ON CONFLICT (scheme_id, nav_date) DO NOTHING`);
    }
  }

  console.log('[seed] demo data ready (demo accounts use password: demo123)');
}
