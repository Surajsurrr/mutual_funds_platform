export const formatCurrency = (value, compact = false) => {
  if (compact) {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)} K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value) =>
  new Intl.NumberFormat('en-IN').format(value);

export const formatPercent = (value, showSign = true) => {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value?.toFixed(2)}%`;
};

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const getRiskColor = (risk) => {
  const map = {
    'Low': 'badge-success',
    'Moderate': 'badge-warning',
    'High': 'badge-danger',
    'Very High': 'badge-danger',
  };
  return map[risk] || 'badge-neutral';
};

export const getStatusColor = (status) => {
  const map = {
    success: 'badge-success',
    failed: 'badge-danger',
    pending: 'badge-warning',
    processing: 'badge-info',
  };
  return map[status] || 'badge-neutral';
};

export const getRoleLabel = (role) => {
  const map = {
    client: 'Investor',
    cb: 'Corporate Banking',
    amc: 'AMC Manager',
    admin: 'Administrator',
  };
  return map[role] || role;
};

export const getRoleBadgeClass = (role) => {
  const map = {
    client: 'badge-info',
    cb: 'badge-warning',
    amc: 'badge-success',
    admin: 'badge-danger',
  };
  return map[role] || 'badge-neutral';
};
