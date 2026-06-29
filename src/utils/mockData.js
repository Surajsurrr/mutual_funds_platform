// Mock data for development — replace with real API calls when backend is ready

export const MOCK_USER = {
  id: 'USR001',
  name: 'Suraj Kumar',
  email: 'suraj@example.com',
  phone: '+91 98765 43210',
  pan: 'ABCDE1234F',
  kycStatus: 'verified',
  role: 'client',
  joinedAt: '2024-01-15',
  avatar: null,
};

export const MOCK_AMC_LIST = [
  { id: 'AMC001', name: 'HDFC Mutual Fund', logo: '🏦', aum: '5,42,300', fundCount: 142, rating: 4.8, category: 'Large Cap' },
  { id: 'AMC002', name: 'SBI Mutual Fund', logo: '🏛️', aum: '8,91,200', fundCount: 189, rating: 4.7, category: 'Diversified' },
  { id: 'AMC003', name: 'ICICI Prudential', logo: '💎', aum: '6,23,400', fundCount: 167, rating: 4.6, category: 'Multi Cap' },
  { id: 'AMC004', name: 'Axis Mutual Fund', logo: '⚡', aum: '2,87,600', fundCount: 98, rating: 4.5, category: 'Growth' },
  { id: 'AMC005', name: 'Mirae Asset', logo: '🌏', aum: '1,54,200', fundCount: 72, rating: 4.9, category: 'Equity' },
  { id: 'AMC006', name: 'Kotak Mahindra', logo: '🔷', aum: '3,12,800', fundCount: 115, rating: 4.4, category: 'Balanced' },
  { id: 'AMC007', name: 'Nippon India', logo: '🎯', aum: '3,78,900', fundCount: 134, rating: 4.5, category: 'Index' },
  { id: 'AMC008', name: 'DSP Mutual Fund', logo: '📈', aum: '1,23,400', fundCount: 67, rating: 4.3, category: 'Debt' },
];

export const MOCK_SCHEMES = [
  { id: 'SCH001', amcId: 'AMC001', name: 'HDFC Top 100 Fund', category: 'Large Cap', nav: 928.45, dayChange: +2.34, dayChangePct: +0.25, returns1Y: 18.4, returns3Y: 22.1, returns5Y: 19.8, risk: 'Moderate', minSIP: 500, minLumpsum: 5000, aum: '29,431', rating: 5 },
  { id: 'SCH002', amcId: 'AMC001', name: 'HDFC Mid-Cap Opportunities', category: 'Mid Cap', nav: 154.32, dayChange: +1.12, dayChangePct: +0.73, returns1Y: 28.6, returns3Y: 31.4, returns5Y: 24.2, risk: 'High', minSIP: 500, minLumpsum: 5000, aum: '12,890', rating: 4 },
  { id: 'SCH003', amcId: 'AMC002', name: 'SBI Bluechip Fund', category: 'Large Cap', nav: 72.18, dayChange: -0.34, dayChangePct: -0.47, returns1Y: 15.2, returns3Y: 18.9, returns5Y: 17.3, risk: 'Low', minSIP: 500, minLumpsum: 5000, aum: '44,120', rating: 5 },
  { id: 'SCH004', amcId: 'AMC003', name: 'ICICI Pru Value Discovery', category: 'Value', nav: 378.91, dayChange: +4.21, dayChangePct: +1.12, returns1Y: 32.1, returns3Y: 29.8, returns5Y: 26.4, risk: 'Moderate', minSIP: 1000, minLumpsum: 5000, aum: '35,670', rating: 5 },
  { id: 'SCH005', amcId: 'AMC005', name: 'Mirae Asset Large Cap', category: 'Large Cap', nav: 94.67, dayChange: +1.89, dayChangePct: +2.04, returns1Y: 19.8, returns3Y: 24.3, returns5Y: 21.7, risk: 'Low', minSIP: 1000, minLumpsum: 5000, aum: '38,920', rating: 5 },
  { id: 'SCH006', amcId: 'AMC004', name: 'Axis Small Cap Fund', category: 'Small Cap', nav: 87.34, dayChange: -1.23, dayChangePct: -1.39, returns1Y: 42.3, returns3Y: 35.6, returns5Y: 28.9, risk: 'Very High', minSIP: 500, minLumpsum: 5000, aum: '18,340', rating: 4 },
];

export const MOCK_PORTFOLIO = {
  totalInvested: 125000,
  currentValue: 148650,
  totalGain: 23650,
  totalGainPct: 18.92,
  dayChange: +1240,
  dayChangePct: +0.84,
  holdings: [
    { schemeId: 'SCH001', schemeName: 'HDFC Top 100 Fund', amcName: 'HDFC MF', units: 32.42, avgNAV: 850.20, currentNAV: 928.45, invested: 27561, currentValue: 30097, gain: 2536, gainPct: 9.20 },
    { schemeId: 'SCH004', schemeName: 'ICICI Pru Value Discovery', amcName: 'ICICI Prudential', units: 92.18, avgNAV: 312.50, currentNAV: 378.91, invested: 28806, currentValue: 34933, gain: 6127, gainPct: 21.27 },
    { schemeId: 'SCH005', schemeName: 'Mirae Asset Large Cap', amcName: 'Mirae Asset', units: 1224.80, avgNAV: 56.30, currentNAV: 94.67, invested: 68946, currentValue: 115927, gain: 46981, gainPct: 68.14 },
  ],
};

export const MOCK_TRANSACTIONS = [
  { id: 'TXN001', date: '2026-06-28', schemeName: 'HDFC Top 100 Fund', type: 'BUY', amount: 5000, units: 5.38, nav: 928.45, status: 'success' },
  { id: 'TXN002', date: '2026-06-15', schemeName: 'Mirae Asset Large Cap', type: 'SIP', amount: 3000, units: 31.69, nav: 94.67, status: 'success' },
  { id: 'TXN003', date: '2026-06-01', schemeName: 'ICICI Pru Value Discovery', type: 'BUY', amount: 10000, units: 26.39, nav: 378.91, status: 'success' },
  { id: 'TXN004', date: '2026-05-15', schemeName: 'Mirae Asset Large Cap', type: 'SIP', amount: 3000, units: 32.14, nav: 93.34, status: 'success' },
  { id: 'TXN005', date: '2026-05-01', schemeName: 'Axis Small Cap Fund', type: 'BUY', amount: 5000, units: 57.24, nav: 87.34, status: 'failed' },
  { id: 'TXN006', date: '2026-04-15', schemeName: 'HDFC Top 100 Fund', type: 'SIP', amount: 2000, units: 2.28, nav: 877.20, status: 'success' },
];

export const MOCK_NAV_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
  nav: +(880 + Math.sin(i * 0.4) * 30 + i * 1.8 + Math.random() * 10).toFixed(2),
}));

export const MOCK_CB_STATS = {
  totalClients: 18420,
  activeToday: 3241,
  transactionVolume: '₹84.2 Cr',
  flaggedAccounts: 12,
};

export const MOCK_ADMIN_STATS = {
  totalUsers: 312840,
  totalAMCs: 42,
  totalAUM: '₹2,14,300 Cr',
  totalTransactions: 8420193,
  activeUsers: 12430,
  newUsersToday: 342,
};

export const ROLES = {
  CLIENT: 'client',
  CB: 'cb',
  AMC: 'amc',
  ADMIN: 'admin',
};
