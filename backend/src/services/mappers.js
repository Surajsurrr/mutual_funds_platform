// Row → JSON mappers producing exactly the shapes the frontend renders
// (the shapes previously mocked in src/utils/mockData.js).

const inr = new Intl.NumberFormat('en-IN');

/** 542300 → '5,42,300' (frontend renders `₹{aum} Cr`) */
export const formatInr = (n) => inr.format(Math.round(n));

/** Compact currency for stat tiles: 842000000 → '₹84.2 Cr' */
export function formatCompactInr(value) {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)} Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)} L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(1)} K`;
  return `₹${Math.round(value)}`;
}

export const mapAmc = (r) => ({
  id: r.id,
  name: r.name,
  logo: r.logo,
  aum: formatInr(r.aum_cr),
  fundCount: r.fund_count,
  rating: Number(r.rating),
  category: r.category,
});

export const mapScheme = (r) => ({
  id: r.id,
  amcId: r.amc_id,
  name: r.name,
  category: r.category,
  nav: Number(r.nav),
  dayChange: Number(r.day_change),
  dayChangePct: Number(r.day_change_pct),
  returns1Y: Number(r.returns_1y),
  returns3Y: Number(r.returns_3y),
  returns5Y: Number(r.returns_5y),
  risk: r.risk,
  minSIP: r.min_sip,
  minLumpsum: r.min_lumpsum,
  aum: formatInr(r.aum_cr),
  rating: r.rating,
});

export const mapUser = (r) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  pan: r.pan,
  kycStatus: r.kyc_status,
  role: r.role,
  joinedAt: r.joined_at,
  avatar: null,
});

export const mapTransaction = (r) => ({
  id: r.id,
  date: r.txn_date,
  schemeName: r.scheme_name,
  type: r.txn_type,
  amount: Number(r.amount),
  units: Number(r.units),
  nav: Number(r.nav),
  status: r.status,
});

export const mapOrder = (r) => ({
  clientRef: r.client_ref,
  status: r.status,
  schemeId: r.scheme_id,
  schemeName: r.scheme_name ?? undefined,
  type: r.order_type,
  amount: Number(r.amount),
  sipDate: r.sip_date,
  nav: r.nav === null ? null : Number(r.nav),
  units: r.units === null ? null : Number(r.units),
  utr: r.utr,
  error: r.error,
  createdAt: r.created_at,
  settledAt: r.settled_at,
});
